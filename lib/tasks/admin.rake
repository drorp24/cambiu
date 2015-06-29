namespace :rates do
  desc "create admin users"
  task :admin => :environment do

    AdminUser.delete_all
    AdminUser.create!(email: 'drorp24@gmail.com', password: 'cambiurules', password_confirmation: 'cambiurules')
    AdminUser.create!(email: 'admin@cambiu.com', password: 'cambiurules', password_confirmation: 'cambiurules')

  end
end