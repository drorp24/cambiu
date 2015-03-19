# Load the Rails application.
require File.expand_path('../application', __FILE__)
if Rails.env.development?
  Rails.logger = Le.new('e8b9f030-7290-48b3-852b-ee3903e9da2c', debug: true, :local => 'log/development.log')
else
  Rails.logger = Le.new('e8b9f030-7290-48b3-852b-ee3903e9da2c')
end

# Initialize the Rails application.
Rails.application.initialize!
