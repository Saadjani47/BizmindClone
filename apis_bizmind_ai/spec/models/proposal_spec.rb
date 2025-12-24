require 'rails_helper'

RSpec.describe Proposal, type: :model do
  it 'is valid with required fields' do
    proposal = build(:proposal)
    expect(proposal).to be_valid
  end

  it 'requires client_name' do
    proposal = build(:proposal, client_name: nil)
    expect(proposal).not_to be_valid
  end

  it 'requires scope_of_work' do
    proposal = build(:proposal, scope_of_work: nil)
    expect(proposal).not_to be_valid
  end
end
