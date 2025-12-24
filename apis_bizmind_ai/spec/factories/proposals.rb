FactoryBot.define do
  factory :proposal do
    association :user
    association :user_preference

    client_name { 'Acme Corp' }
    client_requirements { 'Need a system to automate proposal generation.' }
    scope_of_work { 'Build an AI-assisted proposal generator with structured sections.' }
    timeline { '6 weeks' }
    pricing { 'PKR 150,000' }
    status { 'draft' }
  end
end
