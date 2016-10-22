source 'https://rubygems.org'
ruby '2.3.1'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '~> 5.0.0'

#gem 'sprockets', '~> 4.0.0.beta4'
gem 'sprockets', github: "rails/sprockets"
gem 'babel-transpiler'

# Use postgresql as the database for Active Record
gem 'pg'
# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'
# Use CoffeeScript for .js.coffee assets and views
gem 'coffee-rails', '~> 4.2'
# See https://github.com/sstephenson/execjs#readme for more supported runtimes
# gem 'therubyracer',  platforms: :ruby

# Use jquery as the JavaScript library
gem 'jquery-rails'
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 2.5'
# bundle exec rake doc:rails generates the API under doc/api.

group :test, :staging, :production do
  gem "rails_12factor"
end

gem 'activeadmin', github: 'activeadmin'
gem 'inherited_resources', github: 'activeadmin/inherited_resources'
gem 'devise'
gem 'activerecord-postgis-adapter'
gem 'geocoder'
gem 'country-select'
gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw]
gem 'delayed_job_active_record'
gem 'httpi', "~> 1.1.0"
gem 'nokogiri'
gem 'diskcached'
gem 'active_admin_importable'
gem 'tod'
gem 'simple_form'
gem 'jquery-validation-rails'
#gem 'client_side_validations', github: 'DavyJonesLocker/client_side_validations'
#gem 'client_side_validations-simple_form', github: 'DavyJonesLocker/client_side_validations-simple_form'
gem 'backstretch-rails'
gem 'money'
#gem 'eu_central_bank'
gem 'thin'
gem 'money-rails'
#gem 'autonumeric-rails'
gem 'font_assets'
gem 'newrelic_rpm'
#gem 'actionpack-page_caching'
gem 'omniauth-facebook'
gem 'best_in_place', github: 'bernat/best_in_place'
group :test, :staging, :production do
  gem 'le'
end
gem "bootstrap-switch-rails"
#gem 'actionpack-action_caching'
gem 'dalli'
gem 'memcachier'
gem 'responders', '~> 2.1.0'
gem 'monetize'

#gem 'twitter-bootstrap-rails'      # dont use it
gem 'bootstrap-sass', '~> 3.3.3'    # use this: enables to include just the needed modules, gives access to twbs mixins
gem 'sass', '~> 3.4', '>= 3.4.22'
gem 'sass-rails', '~> 5.0', '>= 5.0.6'
gem 'font-awesome-rails'
gem "rack-timeout"
gem 'google_currency'
#gem 'google_currency_rails_cache', '~> 1.2' # TODO: How to install
gem 'tooltipster-rails'
gem 'ransack', '~> 1.6.6'
gem 'i18n', '~> 0.7.0'
gem 'mandrill-api', '~> 1.0.53', require: "mandrill"
gem 'redis', '~> 3.0'
gem 'sidekiq'
gem 'sinatra', github: 'sinatra'
gem 'serviceworker-rails'

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug', platform: :mri
end
group :development do
  # Access an IRB console on exception pages or by using <%= console %> anywhere in the code.
  gem 'web-console'
  gem 'listen', '~> 3.0.5'
  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'
end
# Use Puma as the app server
gem 'puma', '~> 3.0'