class UserProfile < ApplicationRecord
  belongs_to :user, inverse_of: :user_profile

  has_one_attached :profile_image

  # skills stored as jsonb array (default: []) from migration
  # ActiveRecord casts JSON automatically; no need for serialize

  validates :first_name, presence: true
  validates :full_name, presence: true
  validates :user_id, uniqueness: true
  validates :headline, length: { maximum: 120 }, allow_blank: true
  validates :summary, length: { maximum: 2000 }, allow_blank: true

  validate :validate_urls

  before_validation :ensure_full_name

  private

  def ensure_full_name
    if full_name.blank?
      composed = [first_name, last_name].compact.map(&:to_s).map(&:strip).join(' ').strip
      self.full_name = composed.present? ? composed.titleize : composed
    end
  end

  public

  # convenience helper to expose the attachment URL in JSON responses
  def profile_image_url
    return nil unless profile_image.attached?
    Rails.application.routes.url_helpers.rails_blob_url(profile_image, only_path: false)
  end

  # include the image URL when serializing to JSON
  def as_json(options = {})
    super({ methods: [:profile_image_url] }.merge(options || {}))
  end

  private

  URL_FIELDS = %w[website linkedin_url].freeze

  def validate_urls
    URL_FIELDS.each do |attr|
      val = self[attr]
      next if val.blank?
      begin
        uri = URI.parse(val)
        unless uri.is_a?(URI::HTTP) || uri.is_a?(URI::HTTPS)
          errors.add(attr.to_sym, 'must be a valid URL')
        end
      rescue URI::InvalidURIError
        errors.add(attr.to_sym, 'must be a valid URL')
      end
    end
  end
end
