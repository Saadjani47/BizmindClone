class Api::V1::ProposalsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_proposal, only: [:show, :update, :destroy, :generate]

  # GET /api/v1/proposals
  def index
    proposals = current_user.proposals.order(created_at: :desc)
    render json: proposals.map { |p| proposal_summary_payload(p) }, status: :ok
  end

  # GET /api/v1/proposals/:id
  def show
    render json: proposal_payload(@proposal), status: :ok
  end

  # POST /api/v1/proposals
  def create
    @proposal = current_user.proposals.build(proposal_params)

    if @proposal.save
      render json: proposal_payload(@proposal), status: :created
    else
      render json: { errors: @proposal.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/proposals/:id
  def update
    if @proposal.update(proposal_params)
      render json: proposal_payload(@proposal), status: :ok
    else
      render json: { errors: @proposal.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/proposals/:id
  def destroy
    @proposal.destroy
    head :no_content
  end

  # POST /api/v1/proposals/:id/generate
  def generate
    force = ActiveModel::Type::Boolean.new.cast(params[:force])
    generated = AiProposalGenerator.new(@proposal).call(force: force)
    render json: { proposal: proposal_payload(@proposal), generated_proposal: generated }, status: :ok
  rescue StandardError => e
    Rails.logger.error("Proposal generation failed: #{e.class}: #{e.message}")
    render json: { error: 'AI Generation Failed', details: e.message }, status: :unprocessable_entity
  end

  private

  def set_proposal
    @proposal = current_user.proposals.find(params[:id])
  end

  def proposal_params
    params.require(:proposal).permit(
      :client_name,
      :client_requirements,
      :scope_of_work,
      :timeline,
      :pricing,
      :status,
      :user_preference_id
    )
  rescue ActionController::ParameterMissing
    # allow flat payloads too (similar to your other controllers)
    params.permit(
      :client_name,
      :client_requirements,
      :scope_of_work,
      :timeline,
      :pricing,
      :status,
      :user_preference_id
    )
  end

  def proposal_payload(proposal)
    proposal.as_json(
      include: {
        user_preference: {},
        latest_generated_proposal: {}
      }
    )
  end

  def proposal_summary_payload(proposal)
    latest = proposal.latest_generated_proposal
    proposal.as_json(only: [:id, :client_name, :scope_of_work, :timeline, :pricing, :status, :created_at, :updated_at]).merge(
      generated: latest.present?,
      latest_generated_proposal: latest&.as_json(only: [:id, :version, :selected_template, :created_at])
    )
  end
end
