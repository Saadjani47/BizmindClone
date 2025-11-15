class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable, :recoverable, :validatable,
    :jwt_authenticatable, jwt_revocation_strategy: JwtDenylist

  has_one :user_preference, dependent: :destroy

  # This method finds an existing user by email or creates a new one
  def self.from_omniauth(auth_hash)
    # Find a user with this email
    user = User.find_by(email: auth_hash[:email])

    if user
      # User exists, just return them
      return user
    else
      # User doesn't exist, create a new one
      # We'll generate a random password since they are using Omniauth
      # and won't be logging in with a password.
      User.create(
        email: auth_hash[:email],
        password: Devise.friendly_token[0, 20]
        # You might want to save other info like 'name' or 'provider'
      )
    end
  end
end
