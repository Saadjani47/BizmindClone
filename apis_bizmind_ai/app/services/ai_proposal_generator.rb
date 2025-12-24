require 'json'
require 'net/http'
require 'digest'

class AiProposalGenerator
  GEMINI_BASE = 'https://generativelanguage.googleapis.com'.freeze

  REQUIRED_KEYS = %w[
    project_title
    introduction
    objectives
    problem_statement
    proposed_system
    main_modules
    expected_outcomes
    tools_and_technology
  ].freeze

  # Gemini model availability changes over time; use a modern default.
  # You can override via GEMINI_MODEL (e.g. gemini-2.5-flash).
  def initialize(proposal, model: ENV.fetch('GEMINI_MODEL', 'gemini-2.5-flash'))
    @proposal = proposal
    @user_preference = proposal.user_preference || proposal.user&.user_preference
    @model = normalize_model_name(model)
  end

  def call(force: false)
    raise ArgumentError, 'proposal must be persisted' unless @proposal.persisted?

    # Efficiency: don't regenerate if we already have a generated proposal and inputs haven't changed.
    return @proposal.latest_generated_proposal if !force && generation_fingerprint_matches_latest?

    api_key = ENV['GOOGLE_GEMINI_KEY']
    raise 'Missing GOOGLE_GEMINI_KEY' if api_key.blank?

    # Gemini v1 API expects a simpler payload shape.
    # We embed the system instruction into the user prompt to keep compatibility.
    payload = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: "#{system_instruction}\n\n---\n\n#{user_prompt}"
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.45,
        topP: 0.9,
        maxOutputTokens: 4000
      }
    }

    response_json = post_json!(
      path: "/v1/models/#{@model}:generateContent",
      api_key: api_key,
      payload: payload
    )

    content = response_json.dig('candidates', 0, 'content', 'parts', 0, 'text')
    raise 'AI returned empty content' if content.blank?

    content_sections = parse_json_strict(content)
    validate_sections!(content_sections)

    persist!(content_sections)
  rescue JSON::ParserError => e
    Rails.logger.error("AI JSON parse error: #{e.message}")
    Rails.logger.error("AI raw content: #{content.inspect}") if defined?(content)

    # One retry: sometimes the model returns truncated JSON. Ask again with a stronger constraint.
    retry_content = retry_json_only
    content_sections = parse_json_strict(retry_content)
    validate_sections!(content_sections)
    persist!(content_sections)
  end

  private

  def retry_json_only
    api_key = ENV['GOOGLE_GEMINI_KEY']
    raise 'Missing GOOGLE_GEMINI_KEY' if api_key.blank?

    retry_payload = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: <<~TXT
                #{system_instruction}

                IMPORTANT: Your previous response was invalid or truncated JSON.
                Return ONLY a single valid JSON object that matches the exact schema.
                Do not include markdown. Do not include extra text.

                ---

                #{user_prompt}
              TXT
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.9,
        maxOutputTokens: 2200
      }
    }

    retry_json = post_json!(
      path: "/v1/models/#{@model}:generateContent",
      api_key: api_key,
      payload: retry_payload
    )

    text = retry_json.dig('candidates', 0, 'content', 'parts', 0, 'text')
    raise 'AI returned empty content (retry)' if text.blank?
    text
  end

  def normalize_model_name(model)
    m = model.to_s.strip
    return 'gemini-2.5-flash' if m.empty?
    # Accept either "gemini-2.5-flash" or "models/gemini-2.5-flash" in env.
    m.start_with?('models/') ? m.sub(/^models\//, '') : m
  end

  def system_instruction
    <<~INSTRUCTION
      You are an expert academic proposal writer.
      Output VALID JSON ONLY (no markdown, no code fences, no commentary).
      Do NOT include keys outside the required schema.
      Keep language formal, concise, and university-appropriate.

      Return exactly this structure:
      {
        "project_title": "...",
        "introduction": "...",
        "objectives": ["..."],
        "problem_statement": "...",
        "proposed_system": "...",
        "main_modules": ["..."],
        "expected_outcomes": "...",
        "tools_and_technology": "..."
      }

      Rules:
      - project_title: <= 12 words.
      - introduction: 120-200 words.
      - objectives: array of 3-5 items, each <= 18 words, start with a verb.
      - problem_statement: 90-150 words.
      - proposed_system: 120-220 words.
      - main_modules: array of 4-7 items; each item is "Module Name: 1 sentence function".
      - expected_outcomes: 80-140 words.
      - tools_and_technology: 1 paragraph OR a comma-separated list.
      - Keep it formal and aligned with a university FYP proposal template.
    INSTRUCTION
  end

  def user_prompt
    tone = @user_preference&.tone_of_voice&.to_s&.humanize || 'Professional'
    niche = @user_preference&.niche&.to_s&.humanize || 'General Development'
    template = @user_preference&.template_style&.to_s&.humanize || 'Formal'

    brand_context = []
    if @user_preference&.branding.is_a?(Hash)
      primary = @user_preference.branding['primary']
      secondary = @user_preference.branding['secondary']
      brand_context << "Brand Colors: primary=#{primary}, secondary=#{secondary}" if primary.present? || secondary.present?
      logo = @user_preference.branding['logo_url']
      brand_context << "Logo URL: #{logo}" if logo.present?
    end

    <<~PROMPT
      Generate a formal university-style project proposal using the required JSON schema.

      Client Name: #{@proposal.client_name}
      Project Requirements: #{@proposal.client_requirements}
      Scope of Work: #{@proposal.scope_of_work}
      Timeline: #{@proposal.timeline}
      Pricing/Budget: #{@proposal.pricing}

      Writer Settings:
      - Tone: #{tone}
      - Niche: #{niche}
      - Template Style: #{template}
      #{brand_context.any? ? "- #{brand_context.join("\n- ")}" : ''}

      Quality checklist (must satisfy):
      - Mention the client name in Introduction.
      - Objectives must be measurable and action-oriented.
      - Main Modules must look like a software architecture breakdown.
      - Tools & Technology should match Rails + React + PostgreSQL unless client constraints suggest otherwise.
    PROMPT
  end

  def persist!(content_sections)
    template = @user_preference&.template_style || 'formal'
    latest = @proposal.generated_proposals.maximum(:version)
    next_version = (latest || 0) + 1

    record = @proposal.generated_proposals.create!(
      content_sections: content_sections,
      selected_template: template,
      version: next_version
    )

    # Store fingerprint alongside content for idempotence (without schema change)
    # We keep it in the json itself to avoid a migration.
    if record.content_sections.is_a?(Hash)
      record.content_sections['_meta'] ||= {}
      record.content_sections['_meta']['fingerprint'] = generation_fingerprint
      record.update_column(:content_sections, record.content_sections)
    end

    record
  end

  def parse_json_strict(text)
    JSON.parse(text)
  rescue JSON::ParserError
    # Common Gemini failure: extra text around JSON. Attempt a safe extraction.
    extracted = extract_json_object(text)
    JSON.parse(extracted)
  end

  def extract_json_object(text)
    first = text.index('{')
    last = text.rindex('}')
    raise JSON::ParserError, 'No JSON object found' if first.nil? || last.nil? || last <= first
    text[first..last]
  end

  def validate_sections!(sections)
    unless sections.is_a?(Hash)
      raise ArgumentError, 'AI response must be a JSON object'
    end

    missing = REQUIRED_KEYS - sections.keys.map(&:to_s)
    raise ArgumentError, "AI response missing keys: #{missing.join(', ')}" if missing.any?

    unless sections['objectives'].is_a?(Array)
      raise ArgumentError, 'objectives must be an array'
    end

    unless sections['main_modules'].is_a?(Array)
      raise ArgumentError, 'main_modules must be an array'
    end
  end

  def generation_fingerprint
    pref = @user_preference
    payload = {
      client_name: @proposal.client_name,
      client_requirements: @proposal.client_requirements,
      scope_of_work: @proposal.scope_of_work,
      timeline: @proposal.timeline,
      pricing: @proposal.pricing,
      tone: pref&.tone_of_voice,
      niche: pref&.niche,
      template_style: pref&.template_style
    }

    Digest::SHA256.hexdigest(payload.to_json)
  end

  def generation_fingerprint_matches_latest?
    latest = @proposal.latest_generated_proposal
    return false unless latest&.content_sections.is_a?(Hash)

    meta = latest.content_sections['_meta']
    meta.is_a?(Hash) && meta['fingerprint'].to_s == generation_fingerprint
  end

  def post_json!(path:, api_key:, payload:)
    uri = URI.join(GEMINI_BASE, path)
    uri.query = URI.encode_www_form(key: api_key)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true

    req = Net::HTTP::Post.new(uri)
    req['Content-Type'] = 'application/json'
    req.body = payload.to_json

    res = http.request(req)
    body = res.body.to_s

    unless res.is_a?(Net::HTTPSuccess)
      Rails.logger.error("Gemini error status=#{res.code} body=#{body}")
      # Bubble up the provider error (redacts key automatically since it's only in the query string).
      raise "AI Generation Failed (HTTP #{res.code}): #{body}"
    end

    JSON.parse(body)
  end
end
