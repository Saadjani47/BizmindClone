require 'rails_helper'
require 'ostruct'
require 'faker'

RSpec.describe "Api::V1::OmniauthCallbacks", type: :request do
  describe "POST /api/v1/auth/google" do
    it "returns 422 when token missing" do
      post "/api/v1/auth/google", params: {}
      expect(response).to have_http_status(:unprocessable_content)
      body = JSON.parse(response.body)
      expect(body['error'] || body.dig('status','message')).to be_present
    end

    it "creates or returns a user and sets Authorization header when token is valid" do
      fake_email = Faker::Internet.unique.email
      fake_google_info = OpenStruct.new(
        email: fake_email,
        user_id: 'google-uid-1',
        name: 'Google User'
      )

      # Stub the Google API client creation and its #get_tokeninfo method
      oauth2_double = double('oauth2')
      allow(Google::Apis::Oauth2V2::Oauth2Service).to receive(:new).and_return(oauth2_double)
      allow(oauth2_double).to receive(:get_tokeninfo).and_return(fake_google_info)

      post "/api/v1/auth/google", params: { token: 'valid-google-token' }

      expect(response).to have_http_status(:ok)

      # Authorization header should be set on response
      auth_header = response.get_header('Authorization') || response.headers['Authorization']
      expect(auth_header).to be_present
      expect(auth_header).to match(/Bearer\s+/)

  body = JSON.parse(response.body)
  expect(body.dig('data','user')).to eq(fake_email)
    end

    it "returns 401 when Google client raises a ClientError (invalid token)" do
  oauth2_double = double('oauth2')
  allow(Google::Apis::Oauth2V2::Oauth2Service).to receive(:new).and_return(oauth2_double)
  allow(oauth2_double).to receive(:get_tokeninfo).and_raise(Google::Apis::ClientError.new('Invalid token'))

  post "/api/v1/auth/google", params: { token: 'bad-token' }

      expect(response).to have_http_status(:unauthorized)
      body = JSON.parse(response.body)
      expect(body.dig('status','message') || body['status']).to be_present
    end
  end
end
