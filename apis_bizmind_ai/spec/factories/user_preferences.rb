FactoryBot.define do
  factory :user_preference do
    theme { 'dark' }
    language { 'en' }
    association :user
  end
end
