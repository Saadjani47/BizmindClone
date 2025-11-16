require 'rails_helper'

RSpec.describe "Api::V1::UserProfiles", type: :request do
  let(:user) { create(:user) }

  describe "GET /api/v1/user_profile" do
    it "returns null when the user has no profile yet" do
      get "/api/v1/user_profile", headers: auth_headers_for(user)
      expect(response).to have_http_status(:ok)
      # Rails renders nil as 'null' in JSON
      expect(response.body.strip).to eq('null')
    end

    it "returns 401 when unauthenticated" do
      get "/api/v1/user_profile"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "POST /api/v1/user_profile" do
    it "creates a profile with normalized fields" do
      params = {
        first_name: 'jane',
        last_name: 'doe',
        headline: 'senior backend engineer',
        job_title: 'backend engineer',
        company: 'acme co',
        location: 'new york',
        website: 'example.com',
        linkedin_url: 'linkedin.com/in/jane-doe',
        summary: '  experienced in rails and api design.  ',
        skills: ['ruby', 'Rails', 'ruby', '  ']
      }

      post "/api/v1/user_profile", params: params, headers: auth_headers_for(user)
      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)

      expect(json['first_name']).to eq('Jane')
      expect(json['last_name']).to eq('Doe')
      expect(json['full_name']).to eq('Jane Doe')
      expect(json['headline']).to eq('Senior Backend Engineer')
      expect(json['job_title']).to eq('Backend Engineer')
      expect(json['company']).to eq('Acme Co')
      expect(json['location']).to eq('New York')
      expect(json['website']).to eq('https://example.com')
      expect(json['linkedin_url']).to eq('https://linkedin.com/in/jane-doe').or eq('https://www.linkedin.com/in/jane-doe')
      expect(json['summary']).to eq('experienced in rails and api design.')
      expect(json['skills']).to match_array(['Ruby', 'Rails'])
    end

    it "returns 401 when unauthenticated" do
      post "/api/v1/user_profile", params: { first_name: 'Jane' }
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "PATCH /api/v1/user_profile" do
    before do
      create(:user_profile, user: user, first_name: 'Jane', last_name: 'Doe', website: 'https://old.example.com')
    end

    it "updates attributes and normalizes them" do
      params = {
        job_title: 'principal engineer',
        company: 'beta corp',
        website: 'new.example.com',
        skills: ['ruby', 'APIs']
      }

      patch "/api/v1/user_profile", params: params, headers: auth_headers_for(user)
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['job_title']).to eq('Principal Engineer')
      expect(json['company']).to eq('Beta Corp')
      expect(json['website']).to eq('https://new.example.com')
  expect(json['skills']).to match_array(['Ruby', 'Ap Is'])
    end

    it "returns 401 when unauthenticated" do
      patch "/api/v1/user_profile", params: { job_title: 'Dev' }
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
