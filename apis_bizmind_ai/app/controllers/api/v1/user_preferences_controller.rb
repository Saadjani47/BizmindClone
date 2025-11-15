class Api::V1::UserPreferencesController < ApplicationController
  # This is the Devise-JWT magic.
  # It will check for a valid JWT in the Authorization header.
  before_action :authenticate_user!

  def create
    @preference = current_user.build_user_preference(preference_params)
    if @preference.save
      render json: @preference, status: :created
    else
      render json: { errors: @preference.errors.full_messages }, status: :unprocessable_content
    end
  end

  def show
    # Ensure a default preference exists for the user and return it.
    @preference = current_user.user_preference || current_user.create_user_preference(theme: 'light', language: 'en')
    if @preference
      render json: @preference
    else
      render json: { error: 'Preferences not found' }, status: :not_found
    end
  end

  def update
    @preference = current_user.user_preference
    if @preference.update(preference_params)
      render json: @preference
    else
      render json: { errors: @preference.errors.full_messages }, status: :unprocessable_content
    end
  end

  def destroy
    @preference = current_user.user_preference
    if @preference
      @preference.destroy
      head :no_content
    else
      render json: { error: 'Preferences not found' }, status: :not_found
    end
  end

  private

  def preference_params
    params.require(:user_preference).permit(:theme, :language)
  end
end
