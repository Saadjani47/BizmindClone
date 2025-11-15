# config/initializers/cors.rb

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # Allow both localhost and 127.0.0.1 for the backend (3000) and frontend (5173)
    origins 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'
    resource '*',
      headers: :any,
      expose: %w[Authorization],
      methods: %i[get post put patch delete options head],
      credentials: true
  end
end
