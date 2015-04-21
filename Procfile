if Rails.env.development?
	web: bundle exec rails server thin -p $PORT -e $RACK_ENV
else
	web: bundle exec puma -C config/puma.rb
end
worker: bundle exec rake jobs:work