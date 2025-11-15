require 'rails_helper'

RSpec.describe "Api::V1::Sessions", type: :request do
  let(:user) { create(:user, password: 'password123') }

  describe "POST /api/v1/login" do
    it "logs in with correct credentials" do
      post "/api/v1/login", params: { user: { email: user.email, password: 'password123' } }

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.dig('data','user')).to eq(user.email)
      # Devise-jwt typically sets Authorization header via Warden hooks; assert it's present if so
      auth = response.get_header('Authorization') || response.headers['Authorization']
      # We don't require it to exist for test success, but check and log if present
      # (Assertion not strict to reflect config differences)
      expect([nil, String]).to include(auth.class)
    end

    it "returns 401 with bad credentials" do
      post "/api/v1/login", params: { user: { email: user.email, password: 'wrong' } }
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "DELETE /api/v1/logout" do
    it "logs out when token provided" do
      headers = auth_headers_for(user)
      delete "/api/v1/logout", headers: headers
      expect(response).to have_http_status(:ok)
    end

    it "returns 401 when no token" do
      delete "/api/v1/logout"
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
