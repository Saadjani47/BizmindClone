require 'rails_helper'

RSpec.describe "Api::V1::UserPreferences", type: :request do
  let(:user) { create(:user) }

  describe "GET /api/v1/user_preference" do
    it "returns preference for authenticated user and creates default if missing" do
      get "/api/v1/user_preference", headers: auth_headers_for(user)

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      # Should have theme and language fields (controller creates defaults if nil)
      expect(json['theme'] || json['language']).to be_present
    end

    it "returns 401 when unauthenticated" do
      get "/api/v1/user_preference"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "PATCH /api/v1/user_preference" do
    it "updates the preference when authenticated" do
      create(:user_preference, user: user, theme: 'light', language: 'en')

      patch "/api/v1/user_preference", params: { user_preference: { theme: 'dark' } }, headers: auth_headers_for(user)

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['theme']).to eq('dark')
    end

    it "returns 401 when not authenticated" do
      patch "/api/v1/user_preference", params: { user_preference: { theme: 'dark' } }
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
