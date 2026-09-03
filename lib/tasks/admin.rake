namespace :admin do
  desc "Grant superadmin access to a user by email: rake admin:grant[you@example.com]"
  task :grant, [ :email ] => :environment do |_, args|
    user = User.find_by(email: args[:email])
    abort "No user with email #{args[:email]}" unless user
    user.update!(admin: true)
    puts "#{user.email} is now a superadmin."
  end
end
