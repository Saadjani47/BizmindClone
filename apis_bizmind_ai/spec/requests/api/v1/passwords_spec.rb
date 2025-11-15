require 'rails_helper'

RSpec.describe "Api::V1::Passwords", type: :request do
  let(:user) { create(:user) }

  describe 'POST /api/v1/forgot_password' do
    it 'sends reset instructions for an existing user' do
      post '/api/v1/forgot_password', params: { user: { email: user.email } }
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['success']).to be true
    end

    it 'returns 422 when email param is missing or invalid' do
      post '/api/v1/forgot_password', params: { user: { email: '' } }
  expect(response).to have_http_status(:unprocessable_content)
      body = JSON.parse(response.body)
      expect(body['success']).to be false
    end

    it 'returns success for a non-existent email to avoid enumeration' do
      post '/api/v1/forgot_password', params: { user: { email: 'noone-should-have-this@example.invalid' } }
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['success']).to be true
      # Message should be the generic Devise send_instructions message
      expect(body['message']).to be_present
    end
  end

  describe 'GET /api/v1/forgot_password/edit' do
    it 'verifies a valid reset token' do
      token = user.send_reset_password_instructions
      get '/api/v1/forgot_password/edit', params: { reset_password_token: token }
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['success']).to be true
      expect(body['email']).to eq(user.email)
    end

    it 'returns 404 for an invalid token' do
      get '/api/v1/forgot_password/edit', params: { reset_password_token: 'invalid' }
      expect(response).to have_http_status(:not_found)
      body = JSON.parse(response.body)
      expect(body['success']).to be false
    end
  end

  describe 'PUT /api/v1/forgot_password' do
    it 'resets the password with a valid token' do
      token = user.send_reset_password_instructions
      put '/api/v1/forgot_password', params: { user: { reset_password_token: token, password: 'newpassword123', password_confirmation: 'newpassword123' } }
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['success']).to be true
      # ensure the password was changed
      expect(user.reload.valid_password?('newpassword123')).to be true
    end

    it 'returns 422 with invalid token or mismatched password confirmation' do
      put '/api/v1/forgot_password', params: { user: { reset_password_token: 'bad', password: 'x', password_confirmation: 'y' } }
  expect(response).to have_http_status(:unprocessable_content)
      body = JSON.parse(response.body)
      expect(body['success']).to be false
    end
  end
end
