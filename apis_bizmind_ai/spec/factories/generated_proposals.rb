FactoryBot.define do
  factory :generated_proposal do
    association :proposal

    content_sections do
      {
        'project_title' => 'BizMind: AI Proposal Automation System',
        'introduction' => 'Background and importance...',
        'objectives' => ['Automate proposal creation', 'Ensure consistency', 'Reduce effort'],
        'problem_statement' => 'Current process is manual and slow...',
        'proposed_system' => 'We propose a web app that...',
        'main_modules' => ['Auth module', 'Proposal module', 'Export module'],
        'expected_outcomes' => 'Faster proposal writing and better quality...',
        'tools_and_technology' => 'Rails, React, PostgreSQL'
      }
    end

    selected_template { 'formal' }
    version { 1 }
  end
end
