web: bundle exec puma -C config/puma.rb
worker: bundle exec rake jobs:work
worker: bundle exec sidekiq  -C config/sidekiq.yml
