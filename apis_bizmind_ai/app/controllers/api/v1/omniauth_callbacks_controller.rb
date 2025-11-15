require 'google/apis/oauth2_v2'
require 'googleauth'

class Api::V1::OmniauthCallbacksController < ApplicationController
  
  # POST /api/v1/auth/google
  # Body: { token: "google_access_token_from_client" }
  def google
    # 1. Get the Google access token from the client's request
    provider_token = params[:token]
    
    if provider_token.nil?
      return render json: { error: "No token provided" }, status: :unprocessable_content
    end

    begin
      # 2. VERIFY THE TOKEN WITH GOOGLE
      # We use the 'google-apis-oauth2_v2' gem to ask Google: "Is this token valid?"
      oauth2 = Google::Apis::Oauth2V2::Oauth2Service.new
      user_info_from_google = oauth2.get_tokeninfo(access_token: provider_token)

      # 3. FIND OR CREATE USER
      # We trust the data from Google. We use the email to find or create our user.
      user_info = {
        email: user_info_from_google.email,
        # You could also store name, uid, etc.
        uid: user_info_from_google.user_id,
        name: user_info_from_google.name
      }
      
      user = User.from_omniauth(user_info)
      
      if user.persisted?
        # 4. GENERATE OUR OWN JWT (as we did in the Devise controller)
        if defined?(Warden::JWT::Auth::Token) && Warden::JWT::Auth::Token.respond_to?(:from_user)
          token = Warden::JWT::Auth::Token.from_user(user)
        else
          secret = Rails.application.credentials.devise_jwt_secret_key || Rails.application.secret_key_base || ENV['SECRET_KEY_BASE'] || 'test_secret_key'
          payload = { sub: user.id.to_s, jti: SecureRandom.uuid, exp: 1.hour.from_now.to_i, scp: 'api_v1_user' }
          token = ::JWT.encode(payload, secret, 'HS256')
        end

        # Manually set the Authorization header for the client
        response.set_header('Authorization', "Bearer #{token}")

        render json: {
          status: { code: 200, message: 'Logged in with Google successfully.' },
          data: { user: user.email, id: user.id }
        }, status: :ok
      else
        render json: {
          status: { message: "User creation failed: #{user.errors.full_messages.to_sentence}" }
        }, status: :unprocessable_content
      end

    rescue Google::Apis::ClientError => e
      # The token was invalid or expired
      render json: { 
        status: { message: "Invalid Google token. #{e.message}" }
      }, status: :unauthorized
    end
  end
end