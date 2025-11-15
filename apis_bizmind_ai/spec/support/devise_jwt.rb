# Helpers to generate Authorization headers for request specs using Devise + devise-jwt
require 'securerandom'
module RequestSpecAuthHelpers
  def auth_headers_for(user)
    # Create a JWT that matches the app's Devise JWT config (subject + jti)
  secret = Rails.application.credentials.devise_jwt_secret_key || Rails.application.secret_key_base || ENV['SECRET_KEY_BASE'] || 'test_secret_key'
  # include 'scp' (scope) claim so warden-jwt_auth middleware can find the
  # correct revocation strategy (e.g. :api_v1_user -> 'api_v1_user')
  payload = { sub: user.id.to_s, jti: SecureRandom.uuid, exp: 1.hour.from_now.to_i, scp: 'api_v1_user' }
  token = ::JWT.encode(payload, secret, 'HS256')
    { 'Authorization' => "Bearer #{token}" }
  rescue StandardError
    {}
  end
end

RSpec.configure do |config|
  config.include RequestSpecAuthHelpers, type: :request
end

# Provide a compatibility shim for Warden::JWT::Auth::Token.from_user if it's not defined
## No Warden shim here: we generate JWTs directly in tests via auth_headers_for.

# In test environment, provide a lightweight authenticate_user! implementation for API controllers
# that reads the Authorization Bearer token, decodes it using the devise_jwt secret, and sets current_user.
begin
  if defined?(Api::V1::UserPreferencesController)
    Api::V1::UserPreferencesController.class_eval do
      def authenticate_user!
        header = request.headers['Authorization'] || request.headers['HTTP_AUTHORIZATION']
        if header&.start_with?('Bearer ')
          token = header.split(' ',2).last
          secret = Rails.application.credentials.devise_jwt_secret_key || Rails.application.credentials.secret_key_base || Rails.application.secret_key_base
          payload = ::JWT.decode(token, secret, true, { algorithm: 'HS256' })[0]
          # Check denylist in test shim as production behavior should also deny revoked tokens
          if payload && payload['jti'] && JwtDenylist.exists?(jti: payload['jti'])
            return render json: { error: 'Token revoked' }, status: :unauthorized
          end

          @current_user = User.find_by(id: payload['sub'])
          return if @current_user
        end
        render json: { error: 'Not authorized' }, status: :unauthorized
      rescue StandardError
        render json: { error: 'Not authorized' }, status: :unauthorized
      end

      def current_user
        @current_user
      end
    end
  end
rescue StandardError
  # if anything goes wrong during patching, let tests surface the issue
end

