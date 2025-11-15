class Api::V1::Users::RegistrationsController < Devise::RegistrationsController

  # Override create to avoid writing to session (API-only). We create the user
  # and issue a JWT header instead of signing in via Devise which writes to session.
  def create
    signup_attrs = params.require(:user).permit(:email, :password, :password_confirmation)
    build_resource(signup_attrs)
    resource.save
    if resource.persisted?
  token = jwt_for(resource)
      response.set_header('Authorization', "Bearer #{token}") if token
      render json: {
        status: { code: 200, message: 'Signed up successfully.' },
        data: { user: resource.email, id: resource.id, token: token }
      }, status: :ok
    else
      render json: {
        status: { message: "User couldn't be created successfully. #{resource.errors.full_messages.to_sentence}" }
      }, status: :unprocessable_content
    end
  end

  private

  def jwt_for(user)
    if defined?(Warden::JWT::Auth::Token) && Warden::JWT::Auth::Token.respond_to?(:from_user)
      Warden::JWT::Auth::Token.from_user(user)
    else
      secret = Rails.application.credentials.devise_jwt_secret_key || Rails.application.secret_key_base || ENV['SECRET_KEY_BASE'] || 'test_secret_key'
        # include scope claim so warden-jwt_auth middleware can revoke correctly
        payload = { sub: user.id.to_s, jti: SecureRandom.uuid, exp: 1.hour.from_now.to_i, scp: 'api_v1_user' }
      ::JWT.encode(payload, secret, 'HS256')
    end
  end
 
end