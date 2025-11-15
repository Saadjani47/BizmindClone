class Api::V1::Users::PasswordsController < Devise::PasswordsController
        respond_to :json

        # POST /api/v1/password (send reset instructions)
        def create
          user = resource_class.send_reset_password_instructions(resource_params)

          if user.errors.empty?
            render json: { success: true, message: I18n.t('devise.passwords.send_instructions') }, status: :ok
          else
            # Don't leak whether an email exists in the system. Devise adds
            # :not_found_in_database to errors.details when the email isn't present.
            # Devise may use different symbols depending on version/locale. Match
            # both :not_found and :not_found_in_database to be safe.
            not_found = user.errors.details[:email]&.any? do |d|
              [:not_found, :not_found_in_database].include?(d[:error])
            end

            if not_found
              # Return a generic success response so clients can't enumerate users.
              render json: { success: true, message: I18n.t('devise.passwords.send_instructions') }, status: :ok
            else
              render json: { success: false, errors: clean_errors(user) }, status: :unprocessable_content
            end
          end
        end

        # GET /api/v1/password/edit?reset_password_token=abcdef
        # Used by clients to verify token validity before showing a reset form
        def edit
          token = params[:reset_password_token]
          resource = resource_class.with_reset_password_token(token)

          if resource.present?
            # Refresh the reset timestamp so the user has the full
            # `reset_password_within` window after opening the link.
            # Use update_column to avoid running validations and callbacks.
            begin
              resource.update_column(:reset_password_sent_at, Time.current)
            rescue => e
              Rails.logger.warn "Could not refresh reset_password_sent_at: \\#{e.message}"
            end

            render json: { success: true, email: resource.email }, status: :ok
          else
            render json: { success: false, errors: ['invalid or expired token'] }, status: :not_found
          end
        end

        # PUT/PATCH /api/v1/password (reset the password)
        def update
          # Devise method: reset_password_by_token
          user = resource_class.reset_password_by_token(resource_params)

          if user.errors.empty?
            # Optionally sign in the user after reset: sign_in(user)
            render json: { success: true, message: I18n.t('devise.passwords.updated') }, status: :ok
          else
            render json: { success: false, errors: clean_errors(user) }, status: :unprocessable_content
          end
        end

        private

        def resource_params
          allowed = [:email, :password, :password_confirmation, :reset_password_token]

          if params[:user].present?
            params.require(:user).permit(*allowed)
          else
            params.permit(*allowed)
          end
        end

        def clean_errors(resource)
          if resource.respond_to?(:errors) && resource.errors.any?
            resource.errors.full_messages
          else
            Array(resource)
          end
        end
end