class UserPreference < ApplicationRecord
  belongs_to :user

  THEMES = %w[light dark system].freeze
  LANGUAGES = %w[en es fr de zh ja ru ar pt hi].freeze
  INDUSTRIES = %w[
    technology healthcare finance education entertainment retail hospitality manufacturing real_estate transportation consulting
    marketing legal non_profit government other
  ].freeze
  NICHES = %w[
    ai_startups ecommerce saas freelancing blogging digital_marketing health_and_wellness personal_finance education_technology
    real_estate_investment travel_and_tourism food_and_beverage fashion_and_beauty gaming environmental_sustainability other
  ].freeze
  TEMPLATE_STYLES = %w[casual professional modern classic minimalist creative elegant bold vibrant sleek simple colorful monochrome].freeze
  TONES = %w[
    professional casual friendly formal humorous concise detailed enthusiastic persuasive informative empathetic authoritative optimistic
  ].freeze
  OUTPUT_FORMATS = %w[pdf docx].freeze

  # String-backed enums to get helpers like theme_light? while storing readable strings.
  enum theme: THEMES.index_with(&:to_s), _prefix: true
  enum language: LANGUAGES.index_with(&:to_s), _prefix: true
  enum industry: INDUSTRIES.index_with(&:to_s), _prefix: true
  enum niche: NICHES.index_with(&:to_s), _prefix: true
  enum template_style: TEMPLATE_STYLES.index_with(&:to_s), _prefix: true
  enum tone_of_voice: TONES.index_with(&:to_s), _prefix: true
  enum default_output_format: OUTPUT_FORMATS.index_with(&:to_s), _prefix: true

  ALLOWED_BRANDING_KEYS = %w[primary secondary logo_url].freeze
  validate :branding_keys_allowlist

  before_validation :normalize_string_enums

  private

  def branding_keys_allowlist
    return if branding.blank?
    keys = branding.is_a?(Hash) ? branding.keys.map(&:to_s) : []
    unknown = keys - ALLOWED_BRANDING_KEYS
    errors.add(:branding, "contains unknown keys: #{unknown.join(', ')}") if unknown.any?
  end

  def normalize_string_enums
    self.theme = theme&.downcase
    self.language = language&.downcase
    self.industry = industry&.downcase&.gsub(' ', '_')
    self.niche = niche&.downcase&.gsub(' ', '_')
    self.template_style = template_style&.downcase
    self.tone_of_voice = tone_of_voice&.downcase
    self.default_output_format = default_output_format&.downcase
  end
end
