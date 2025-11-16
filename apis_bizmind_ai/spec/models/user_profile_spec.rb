require 'rails_helper'

RSpec.describe UserProfile, type: :model do
  let(:user) { create(:user) }

  it 'generates full_name from first and last name when missing' do
    profile = described_class.new(user: user, first_name: 'jane', last_name: 'doe')
    expect(profile.valid?).to be true
    expect(profile.full_name).to eq('Jane Doe')
  end

  it 'enforces one profile per user' do
    create(:user_profile, user: user)
    dup = build(:user_profile, user: user)
    expect(dup).not_to be_valid
    expect(dup.errors[:user_id]).to include('has already been taken')
  end
end
