require 'rails_helper'

RSpec.describe 'Api::V1::Proposals history', type: :request do
  let(:user) { create(:user) }
  let(:other_user) { create(:user) }

  let(:headers) { auth_headers_for(user) }
  let(:other_headers) { auth_headers_for(other_user) }

  before do
    create(:user_preference, user: user)
    create(:user_preference, user: other_user)
  end

  it 'allows a user to see all of their proposals (history)' do
    p1 = create(:proposal, user: user, user_preference: user.user_preference, client_name: 'A')
    p2 = create(:proposal, user: user, user_preference: user.user_preference, client_name: 'B')
    create(:proposal, user: other_user, user_preference: other_user.user_preference, client_name: 'C')

    get '/api/v1/proposals', headers: headers

    expect(response).to have_http_status(:ok)
    json = JSON.parse(response.body)

    ids = json.map { |x| x['id'] }
    expect(ids).to include(p1.id, p2.id)
    expect(json.map { |x| x['client_name'] }).not_to include('C')
  end

  it 'prevents accessing another user proposal by id' do
    other_proposal = create(:proposal, user: other_user, user_preference: other_user.user_preference)

    get "/api/v1/proposals/#{other_proposal.id}", headers: headers

    # current_user.proposals.find(...) should raise ActiveRecord::RecordNotFound
    expect(response).to have_http_status(:not_found)
  end

  it 'index payload includes generated flag and latest_generated_proposal metadata' do
    proposal = create(:proposal, user: user, user_preference: user.user_preference)
    create(:generated_proposal, proposal: proposal, version: 2)

    get '/api/v1/proposals', headers: headers

    expect(response).to have_http_status(:ok)
    json = JSON.parse(response.body)

    item = json.find { |x| x['id'] == proposal.id }
    expect(item['generated']).to eq(true)
    expect(item['latest_generated_proposal']).to be_a(Hash)
    expect(item['latest_generated_proposal']['version']).to eq(2)
  end
end
