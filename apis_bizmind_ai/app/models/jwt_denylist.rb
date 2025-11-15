class JwtDenylist < ApplicationRecord
  include Devise::JWT::RevocationStrategies::Denylist
  # Use the canonical table name created by migrations
  self.table_name = 'jwt_denylists'
end
