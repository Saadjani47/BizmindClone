class Api::V1::Users::SessionsController < Devise::SessionsController

  # POST /api/v1/login
  # Implement authentication without relying on session writes so this controller
  # is API-friendly. We validate credentials and issue a JWT in the Authorization header.
  def create
    user = User.find_by(email: params.dig(:user, :email))
    if user&.valid_password?(params.dig(:user, :password))
      token = jwt_for(user)
      response.set_header('Authorization', "Bearer #{token}") if token
      render json: {
        status: { code: 200, message: 'Logged in successfully.' },
        data: { user: user.email, id: user.id, token: token }
      }, status: :ok
    else
      render json: { error: 'Invalid email or password' }, status: :unauthorized
    end
  end

  # DELETE /api/v1/logout
  # Revoke token by adding its jti to the denylist (JwtDenylist).
  def destroy
    header = request.headers['Authorization'] || request.headers['HTTP_AUTHORIZATION']
    if header&.start_with?('Bearer ')
      token = header.split(' ', 2).last
  secret = Rails.application.credentials.devise_jwt_secret_key || Rails.application.secret_key_base || ENV['SECRET_KEY_BASE'] || 'test_secret_key'
      begin
        payload = ::JWT.decode(token, secret, true, algorithm: 'HS256')[0]
        if payload && payload['jti']
          JwtDenylist.create!(jti: payload['jti'])
        end
        render json: { status: 200, message: 'Logged out successfully' }, status: :ok
      rescue StandardError => e
        render json: { error: "Invalid token: #{e.message}" }, status: :unauthorized
      end
    else
      render json: { error: 'Not authenticated' }, status: :unauthorized
    end
  end

  # Avoid Devise calling `respond_to` (not available in API-only controllers)
  def respond_to_on_destroy
    head :no_content
  end

  # Prevent Devise's default before_action from short-circuiting destroy in API mode
  def verify_signed_out_user
    # no-op: let our #destroy handle token presence and revocation
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