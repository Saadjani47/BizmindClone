Rails.application.routes.draw do

  # Define API routes under /api/v1
  namespace :api do
    namespace :v1 do

      # == Devise Routes ==
      # This sets up /api/v1/login, /api/v1/logout, and /api/v1/signup
      devise_for :users,
                 path: '',
                 path_names: {
                   sign_in: 'login',
                   sign_out: 'logout',
                   password: 'forgot_password',
                   registration: 'signup'
                 },
                 controllers: {
                   sessions: 'api/v1/users/sessions',
                   passwords: 'api/v1/users/passwords',
                   registrations: 'api/v1/users/registrations'
                 }
      
      # == Omniauth Callback Route ==
      # Custom route for handling the Google (or other) token POST
      post 'auth/google', to: 'omniauth_callbacks#google'

      # == Protected Resource Route ==
      # Creates GET, PUT, and PATCH for /api/v1/user_preference
  resource :user_preference, only: [:show, :create, :update, :destroy], controller: 'user_preferences'
  resource :user_profile, only: [:show, :create, :update], controller: 'user_profiles'

  resources :proposals, only: [:index, :show, :create, :update, :destroy] do
    post :generate, on: :member
  end

  resources :generated_proposals, only: [:show, :update]
      
    end
  end

  # root "articles#index"
end