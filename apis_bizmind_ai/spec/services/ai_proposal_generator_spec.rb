require 'rails_helper'

RSpec.describe AiProposalGenerator do
  let(:user) { create(:user) }
  let(:preference) { create(:user_preference, user: user) }
  let(:proposal) { create(:proposal, user: user, user_preference: preference) }

  it 'returns latest generated proposal when fingerprint matches and force=false' do
    gp = create(:generated_proposal, proposal: proposal, version: 1)
    # Store fingerprint in meta, mimicking generator behavior
    gp.content_sections['_meta'] = { 'fingerprint' => Digest::SHA256.hexdigest({ test: 'fake' }.to_json) }
    gp.update_column(:content_sections, gp.content_sections)

    generator = described_class.new(proposal)
    allow(generator).to receive(:generation_fingerprint).and_return(gp.content_sections['_meta']['fingerprint'])

    expect(generator).not_to receive(:post_json!)
    expect(generator.call(force: false)).to eq(gp)
  end

  it 'extracts json object when ai returns wrapper text' do
    generator = described_class.new(proposal)
    text = "Here you go:\n{\"project_title\":\"T\",\"introduction\":\"I\",\"objectives\":[\"O1\",\"O2\",\"O3\"],\"problem_statement\":\"P\",\"proposed_system\":\"S\",\"main_modules\":[\"M1: x\"],\"expected_outcomes\":\"E\",\"tools_and_technology\":\"Rails\"}\nThanks"

    json = generator.send(:parse_json_strict, text)
    expect(json['project_title']).to eq('T')
  end
end
