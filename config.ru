# This file is used by Rack-based servers to start the application.
# Allow font files to be loaded from anywhere (for loading webfonts in Firefox)
require ::File.expand_path('../config/environment',  __FILE__)
run Rails.application
=begin
require 'rack/cors' 
use Rack::Cors do 
  allow do 
    origins '*' 
    resource '/fonts/*', :headers => :any, :methods => :get 
  end 
end
=end 
