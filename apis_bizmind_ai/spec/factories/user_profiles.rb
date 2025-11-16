FactoryBot.define do
  factory :user_profile do
    association :user
    first_name { "John" }
    last_name  { "Doe" }
    headline   { "Software Engineer" }
    job_title  { "Software Engineer" }
    company    { "Acme Inc." }
    location   { "Remote" }
    website    { "https://example.com" }
    linkedin_url { "https://www.linkedin.com/in/johndoe" }
    summary    { "Experienced professional with a focus on building scalable Rails APIs." }
    skills     { ["Ruby", "Rails"] }
  end
end
