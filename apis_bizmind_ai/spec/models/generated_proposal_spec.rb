require 'rails_helper'

RSpec.describe GeneratedProposal, type: :model do
  it 'exposes structured helpers' do
    gp = build(:generated_proposal)
    expect(gp.project_title).to be_present
    expect(gp.objectives).to be_an(Array)
    expect(gp.main_modules).to be_an(Array)
  end
end
