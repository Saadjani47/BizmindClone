class Api::V1::UserPreferencesController < ApplicationController

  before_action :authenticate_user!
  before_action :wrap_preference_params, only: [:create, :update]
  before_action :normalize_branding_and_other_params, only: [:create, :update]

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
    @preference = current_user.user_preference || current_user.build_user_preference

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

  # Accept both payload styles:
  # 1) Nested: { user_preference: { theme: "dark" } }
  # 2) Flat:   { theme: "dark" }
  # This keeps preference_params implementation intact.
  def wrap_preference_params
    return if params[:user_preference].present?

    keys = %i[
      theme language industry niche template_style tone_of_voice default_output_format branding other
    ]
    extracted = keys.each_with_object({}) do |k, acc|
      acc[k] = params[k] if params.key?(k)
    end
    params[:user_preference] = extracted if extracted.any?
  end

  # Accept more user-friendly inputs and convert them into jsonb:
  # - branding_primary / branding_secondary / branding_logo_url  -> branding { primary, secondary, logo_url }
  # - other_keys[] + other_values[] -> other { key => value }
  def normalize_branding_and_other_params
    pref = params[:user_preference]
    return unless pref.is_a?(ActionController::Parameters) || pref.is_a?(Hash)

    pref = pref.to_unsafe_h if pref.is_a?(ActionController::Parameters)

    # Branding
    branding = (pref['branding'].is_a?(Hash) ? pref['branding'] : {}).dup
    primary = pref['branding_primary']
    secondary = pref['branding_secondary']
    logo_url = pref['branding_logo_url']
    branding['primary'] = primary.to_s.strip if primary.present?
    branding['secondary'] = secondary.to_s.strip if secondary.present?
    branding['logo_url'] = logo_url.to_s.strip if logo_url.present?
    branding.compact!
    pref['branding'] = branding if primary.present? || secondary.present? || logo_url.present? || pref['branding'].present?

    # Other (key/value rows)
    keys = pref['other_keys']
    values = pref['other_values']
    if keys.is_a?(Array) && values.is_a?(Array)
      other = {}
      keys.zip(values).each do |k, v|
        k = k.to_s.strip
        v = v.to_s.strip
        next if k.blank?
        other[k] = v
      end
      pref['other'] = other
    end

    # Remove helper fields so they don't show up as unpermitted
    pref.delete('branding_primary')
    pref.delete('branding_secondary')
    pref.delete('branding_logo_url')
    pref.delete('other_keys')
    pref.delete('other_values')

    params[:user_preference] = pref
  end

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
