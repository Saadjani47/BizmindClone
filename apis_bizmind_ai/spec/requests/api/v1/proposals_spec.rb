require 'rails_helper'

RSpec.describe 'Api::V1::Proposals', type: :request do
  let(:user) { create(:user) }
  let(:headers) { auth_headers_for(user) }

  before do
    # ensure user has a preference so generation uses template_style/tone if needed
    create(:user_preference, user: user)
  end

  describe 'POST /api/v1/proposals' do
    it 'creates a proposal' do
      payload = {
        proposal: {
          client_name: 'Client X',
          scope_of_work: 'Build a structured proposal generator',
          client_requirements: 'Must include FYP sections',
          timeline: '4 weeks',
          pricing: '1000 USD',
          status: 'draft'
        }
      }

      post '/api/v1/proposals', params: payload, headers: headers

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json['client_name']).to eq('Client X')
    end
  end

  describe 'POST /api/v1/proposals/:id/generate' do
    it 'returns a generated proposal record (stubbed AI)' do
      proposal = create(:proposal, user: user, user_preference: user.user_preference)

      fake_generated = create(
        :generated_proposal,
        proposal: proposal,
        version: 1,
        selected_template: 'formal'
      )

      allow_any_instance_of(AiProposalGenerator).to receive(:call).and_return(fake_generated)

      post "/api/v1/proposals/#{proposal.id}/generate", headers: headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['generated_proposal']['id']).to eq(fake_generated.id)
      expect(json['generated_proposal']['content_sections']).to be_a(Hash)
      expect(json['proposal']['id']).to eq(proposal.id)
    end
  end
end
