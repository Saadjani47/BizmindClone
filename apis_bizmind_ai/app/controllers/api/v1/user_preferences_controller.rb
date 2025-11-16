class Api::V1::UserPreferencesController < ApplicationController

  before_action :authenticate_user!

  def create
    if current_user.user_preference.present?
      render json: { error: 'Preferences already exist' }, status: :conflict
      return
    end

    @preference = current_user.build_user_preference(preference_params)
    if @preference.save
      render json: @preference, status: :created
    else
      render json: { errors: @preference.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def show
    @preference = current_user.user_preference
    if @preference
      render json: @preference
    else
      render json: { error: 'Preferences not found' }, status: :not_found
    end
  end

  def update
    @preference = current_user.user_preference
    unless @preference
      render json: { error: 'Preferences not found' }, status: :not_found
      return
    end

    if @preference.update(preference_params)
      render json: @preference
    else
      render json: { errors: @preference.errors.full_messages }, status: :unprocessable_entity
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
    # Strong parameters only declare which keys are permitted.
    permitted = params.require(:user_preference).permit(
      :theme,
      :language,
      :industry,
      :niche,
      :template_style,
      :tone_of_voice,
      :default_output_format,
      branding: [:primary, :secondary, :logo_url],
      other: {}
    )

    # Normalize values so enums accept them (downcase, underscores where needed)
    permitted[:theme] = permitted[:theme]&.to_s&.downcase
    permitted[:language] = permitted[:language]&.to_s&.downcase
    permitted[:industry] = permitted[:industry]&.to_s&.downcase&.tr(' ', '_')
    permitted[:niche] = permitted[:niche]&.to_s&.downcase&.tr(' ', '_')
    permitted[:template_style] = permitted[:template_style]&.to_s&.downcase
    permitted[:tone_of_voice] = permitted[:tone_of_voice]&.to_s&.downcase
    permitted[:default_output_format] = permitted[:default_output_format]&.to_s&.downcase

    permitted
  end
end
