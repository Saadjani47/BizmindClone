namespace :jwt do
  desc 'Garbage collect expired entries from jwt_denylists'
  task gc: :environment do
    require 'active_support/core_ext/numeric/time'
    now = Time.current
    expired = JwtDenylist.where('exp < ?', now)
    count = expired.count
    if count > 0
      expired.delete_all
      puts "jwt: removed #{count} expired denylist entries"
    else
      puts 'jwt: no expired denylist entries to remove'
    end
  end
end
