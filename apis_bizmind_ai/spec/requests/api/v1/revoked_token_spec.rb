require 'rails_helper'

RSpec.describe 'Revoked JWTs', type: :request do
  let(:user) { create(:user) }
  let(:headers) { auth_headers_for(user) }

  it 'blocks access to protected endpoints after token is revoked' do
    # initial access with a valid token should succeed
    get '/api/v1/user_preference', headers: headers
    expect(response.status).to be_between(200, 299).inclusive

    # revoke the token via logout
    delete '/api/v1/logout', headers: headers
    expect(response).to have_http_status(:ok)

    # same token should now be rejected
    get '/api/v1/user_preference', headers: headers
    expect(response).to have_http_status(:unauthorized)
  end
end
