module JwtAuthenticatable
  extend ActiveSupport::Concern

  private

  def authenticate_user!
    header = request.headers['Authorization'] || request.headers['HTTP_AUTHORIZATION']
    token = nil

    if header&.start_with?('Bearer ')
      token = header.split(' ', 2).last
    elsif params[:token].present?
      token = params[:token]
    end

    if token
      secret = Rails.application.credentials.devise_jwt_secret_key || Rails.application.secret_key_base || ENV['SECRET_KEY_BASE'] || 'test_secret_key'
      begin
        payload = ::JWT.decode(token, secret, true, algorithm: 'HS256')[0]
        # Denylist check: if this jti has been revoked, deny access
        if payload && payload['jti'] && JwtDenylist.exists?(jti: payload['jti'])
          return render json: { error: 'Token revoked' }, status: :unauthorized
        end

        @current_user = User.find_by(id: payload['sub'])
        return if @current_user
      rescue StandardError
        # ignore and fall through to unauthorized render below
      end
    end

    render json: { error: 'Not authorized' }, status: :unauthorized
  end

  def current_user
    @current_user
  end
end
