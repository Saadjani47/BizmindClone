class Api::V1::GeneratedProposalsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_generated_proposal, only: [:show, :update]

  # GET /api/v1/generated_proposals/:id
  def show
    render json: @generated_proposal, status: :ok
  end

  # PATCH/PUT /api/v1/generated_proposals/:id
  # Accepts either a JSON object or a JSON string for content_sections.
  def update
    content_sections = extracted_content_sections

    if @generated_proposal.update(content_sections: content_sections)
      render json: @generated_proposal, status: :ok
    else
      render json: { errors: @generated_proposal.errors.full_messages }, status: :unprocessable_entity
    end
  rescue JSON::ParserError => e
    render json: { error: 'Invalid JSON for content_sections', details: e.message }, status: :unprocessable_entity
  end

  private

  def set_generated_proposal
    # Secure lookup: ensure current_user owns the parent Proposal.
    @generated_proposal = GeneratedProposal
      .joins(:proposal)
      .where(proposals: { user_id: current_user.id })
      .find(params[:id])
  end

  def extracted_content_sections
    raw = params[:content_sections]

    # allow: { generated_proposal: { content_sections: ... } }
    raw = params.dig(:generated_proposal, :content_sections) if raw.nil?

    if raw.is_a?(String)
      JSON.parse(raw)
    else
      raw
    end
  end
end
