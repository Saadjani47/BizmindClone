require 'rails_helper'

RSpec.describe "Api::V1::UserPreferences", type: :request do
  let(:user) { create(:user) }

  describe "GET /api/v1/user_preference" do
    it "returns 404 when user has no preferences" do
      get "/api/v1/user_preference", headers: auth_headers_for(user)
      expect(response).to have_http_status(:not_found)
    end

    it "returns preference for authenticated user when exists" do
      pref = create(:user_preference, user: user, theme: 'light', language: 'en')

      get "/api/v1/user_preference", headers: auth_headers_for(user)

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['id']).to eq(pref.id)
      expect(json['theme']).to eq('light')
      expect(json['language']).to eq('en')
    end

    it "returns 401 when unauthenticated" do
      get "/api/v1/user_preference"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "POST /api/v1/user_preference" do
    it "creates preferences for the user when none exist" do
      params = {
        user_preference: {
          theme: 'Dark',
          language: 'EN',
          industry: 'Marketing',
          niche: 'SaaS',
          template_style: 'Modern',
          tone_of_voice: 'Professional',
          default_output_format: 'PDF',
          branding: { primary: '#000', secondary: '#fff', logo_url: 'https://logo.example.com' },
          other: { timezone: 'UTC' }
        }
      }

      post "/api/v1/user_preference", params: params, headers: auth_headers_for(user)
      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json['theme']).to eq('dark')
      expect(json['language']).to eq('en')
  expect(json['industry']).to eq('marketing')
  expect(json['niche']).to eq('saas')
      expect(json['template_style']).to eq('modern')
      expect(json['tone_of_voice']).to eq('professional')
  expect(json['default_output_format']).to eq('pdf')
    end

    it "returns 409 conflict if preferences already exist" do
      create(:user_preference, user: user)
      post "/api/v1/user_preference", params: { user_preference: { theme: 'dark' } }, headers: auth_headers_for(user)
      expect(response).to have_http_status(:conflict)
    end

    it "returns 401 when unauthenticated" do
      post "/api/v1/user_preference", params: { user_preference: { theme: 'dark' } }
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "PATCH /api/v1/user_preference" do
    it "updates the preference when authenticated" do
      create(:user_preference, user: user, theme: 'light', language: 'en')

      patch "/api/v1/user_preference", params: { user_preference: { theme: 'DARK', language: 'ES' } }, headers: auth_headers_for(user)

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['theme']).to eq('dark')
      expect(json['language']).to eq('es')
    end

    it "returns 404 when no preferences exist for the user" do
      patch "/api/v1/user_preference", params: { user_preference: { theme: 'dark' } }, headers: auth_headers_for(user)
      expect(response).to have_http_status(:not_found)
    end

    it "returns 401 when not authenticated" do
      patch "/api/v1/user_preference", params: { user_preference: { theme: 'dark' } }
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "DELETE /api/v1/user_preference" do
    it "destroys preferences when they exist" do
      create(:user_preference, user: user)
      delete "/api/v1/user_preference", headers: auth_headers_for(user)
      expect(response).to have_http_status(:no_content)
    end

    it "returns 404 when no preferences to destroy" do
      delete "/api/v1/user_preference", headers: auth_headers_for(user)
      expect(response).to have_http_status(:not_found)
    end

    it "returns 401 when unauthenticated" do
      delete "/api/v1/user_preference"
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
