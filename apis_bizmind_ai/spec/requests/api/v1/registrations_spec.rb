require 'rails_helper'

RSpec.describe "Api::V1::Registrations", type: :request do
  describe "POST /api/v1/signup" do
    it "creates a new user with valid params" do
      post "/api/v1/signup", params: { user: { email: Faker::Internet.unique.email, password: 'password123', password_confirmation: 'password123' } }
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.dig('data','user')).to be_present
    end

    it "returns 422 with invalid params" do
      post "/api/v1/signup", params: { user: { email: 'invalid', password: 'short', password_confirmation: 'short' } }
      expect(response).to have_http_status(:unprocessable_content)
    end
  end
end
