# Ensure url helpers and Devise mailer have a host set in test environment
Rails.application.routes.default_url_options[:host] = 'test.host'
ActionMailer::Base.default_url_options[:host] = 'test.host'

RSpec.configure do |config|
  # also make sure Devise mailer has host when used directly in tests
  config.before(:each) do
    ActionMailer::Base.default_url_options[:host] = 'test.host'
    Rails.application.routes.default_url_options[:host] = 'test.host'
  end
end
