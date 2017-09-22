Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # In the development environment your application's code is reloaded on
  # every request. This slows down response time but is perfect for development
  # since you don't have to restart the web server when you make code changes.
  config.cache_classes = false

  # Do not eager load code on boot.
  config.eager_load = false

  # Show full error reports.
  config.consider_all_requests_local = true
  
  # Enable caching
  config.action_controller.perform_caching = true
  config.cache_store = :memory_store
  config.public_file_server.headers = {
      'Cache-Control' => 'public, max-age=172800'
  }

  # Don't care if the mailer can't confirm.
  config.action_mailer.raise_delivery_errors = false
  config.action_mailer.perform_caching = false

  # Print deprecation notices to the Rails logger.
  config.active_support.deprecation = :log

  # Raise an error on page load if there are pending migrations.
  config.active_record.migration_error = :page_load

  # Debug mode disables concatenation and preprocessing of assets.
  # This option may cause significant delays in view rendering with a large
  # number of complex assets.
  config.assets.debug = true

  # Raises error for missing translations
  # config.action_view.raise_on_missing_translations = true
  
  config.action_mailer.default_url_options = { host: 'localhost', port: 3000 }
  config.action_mailer.default_url_options = { host: 'localhost:3000' }
  config.action_mailer.raise_delivery_errors = true

  ENV["REDISTOGO_URL"] = 'redis://localhost:6379/'

  # Suppress logger output for asset requests.
   config.assets.quiet = true

  # Use an evented file watcher to asynchronously detect changes in source code,
  # routes, locales, etc. This feature depends on the listen gem.
  #config.file_watcher = ActiveSupport::EventedFileUpdateChecker

  config.ga_tracking_code = 'UA-91021177-3'
  config.inspectlet_wid = ''

  config.distance_factor = 10

  # Horrible hard-coded string due to Heroku forcing me to precompile assets locally
  config.asset_location = {development: "", staging: "https://d368eop2iyjvb5.cloudfront.net", production: "https://d29wr857bsaesb.cloudfront.net"}



end
Rails.application.routes.default_url_options[:host] = 'localhost:3000'
