class ApplicationController < ActionController::API
	# Include Devise controller helpers so methods like `authenticate_user!` are available
	include Devise::Controllers::Helpers
	# Include our JWT auth concern so API controllers have a consistent auth method
	include JwtAuthenticatable
end
