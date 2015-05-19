if Rails.env.development?
	web: bundle exec rails server thin -p $PORT -e $RACK_ENV
else
	web: bundle exec unicorn -c ./config/unicorn.rb
end
worker: bundle exec rake jobs:work
