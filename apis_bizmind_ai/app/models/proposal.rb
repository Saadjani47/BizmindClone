class Proposal < ApplicationRecord
  belongs_to :user
  belongs_to :user_preference, optional: true

  has_many :generated_proposals, dependent: :destroy

  validates :client_name, :scope_of_work, presence: true

  def generated?
    generated_proposals.exists?
  end

  def latest_generated_proposal
    generated_proposals.order(version: :desc, created_at: :desc).first
  end
end
