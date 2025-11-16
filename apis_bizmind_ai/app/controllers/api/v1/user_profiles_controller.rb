class Api::V1::UserProfilesController < ApplicationController
  before_action :authenticate_user!
  before_action :normalize_profile_params, only: [:create, :update]

  # GET /api/v1/user_profile
  def show
    render json: current_user.user_profile, status: :ok
  end

  # POST /api/v1/user_profile
  def create
    attrs = profile_params.except(:profile_image)
    profile = current_user.build_user_profile(attrs)

    # Attach profile image if provided
    if profile_params[:profile_image].present?
      profile.profile_image.attach(profile_params[:profile_image])
    end

    if profile.save
      render json: profile, status: :created
    else
      render json: profile.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/user_profile
  def update
    profile = current_user.user_profile

    # Apply attribute updates except the file
    attrs = profile_params.except(:profile_image)
    profile.assign_attributes(attrs)

    # Attach/replace profile image if provided
    if profile_params[:profile_image].present?
      profile.profile_image.attach(profile_params[:profile_image])
    end

    if profile.save
      render json: profile, status: :ok
    else
      render json: profile.errors, status: :unprocessable_entity
    end
  end

  private

  # Strong params for a more professional profile
  def profile_params
    params.permit(
      :first_name,
      :last_name,
      :full_name,
      :headline,          # short professional title
      :job_title,
      :company,
      :location,
      :website,
      :linkedin_url,
      :summary,           # longer professional summary / bio
      :profile_image,     # ActiveStorage attachment
      skills: []          # Array of skills
    )
  end

  # Normalize and polish incoming profile fields to keep profiles professional
  def normalize_profile_params
    # Normalize names
    if params[:first_name].present?
      params[:first_name] = params[:first_name].to_s.strip.titleize
    end

    if params[:last_name].present?
      params[:last_name] = params[:last_name].to_s.strip.titleize
    end

    # Ensure full_name exists and is consistent
    if params[:full_name].blank? && (params[:first_name].present? || params[:last_name].present?)
      params[:full_name] = "#{params[:first_name].to_s} #{params[:last_name].to_s}".strip
    else
      params[:full_name] = params[:full_name].to_s.strip.titleize if params[:full_name].present?
    end

    # Normalize headline, job_title, company, location
    %i[headline job_title company location].each do |key|
      params[key] = params[key].to_s.strip.titleize if params[key].present?
    end

    # Normalize website and linkedin_url (basic)
    if params[:website].present?
      params[:website] = normalize_url(params[:website].to_s)
    end

    if params[:linkedin_url].present?
      params[:linkedin_url] = normalize_url(params[:linkedin_url].to_s)
    end

    # Trim and sanitize summary/bio
    if params[:summary].present?
      params[:summary] = params[:summary].to_s.strip
    elsif params[:bio].present?
      # accept older 'bio' key by migrating it to summary
      params[:summary] = params.delete(:bio).to_s.strip
    end

    # Normalize skills: titleize, dedupe, remove empties
    if params[:skills].is_a?(Array)
      normalized = params[:skills].map { |s| s.to_s.strip }.reject(&:blank?).map { |s| s.titleize }.uniq
      params[:skills] = normalized
    end
  end

  def normalize_url(url)
    url = url.strip
    return url if url.blank?
    uri = URI.parse(url) rescue nil
    if uri && uri.scheme.present?
      url
    else
      "https://#{url}"
    end
  end
end
