Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # In the development environment your application's code is reloaded on
  # every request. This slows down response time but is perfect for development
  # since you don't have to restart the web server when you make code changes.
  config.cache_classes = false

  # Do not eager load code on boot.
  config.eager_load = false

  # Show full error reports and disable caching.
  config.consider_all_requests_local       = true
  config.action_controller.perform_caching = false
  config.cache_store = :null_store
  config.static_cache_control = "public, s-maxage=31536000, max-age=31536000"   

  # Don't care if the mailer can't send.
  config.action_mailer.raise_delivery_errors = false

  # Print deprecation notices to the Rails logger.
  config.active_support.deprecation = :log

  # Raise an error on page load if there are pending migrations.
  config.active_record.migration_error = :page_load

  # Debug mode disables concatenation and preprocessing of assets.
  # This option may cause significant delays in view rendering with a large
  # number of complex assets.
  config.assets.debug = true

  # Adds additional error checking when serving assets at runtime.
  # Checks for improperly declared sprockets dependencies.
  # Raises helpful error messages.
  config.assets.raise_runtime_errors = true

  # Raises error for missing translations
  # config.action_view.raise_on_missing_translations = true
  
  config.action_mailer.default_url_options = { host: 'localhost', port: 3000 }
  
  config.fb_app_id = '1553546578234138'
  config.fb_app_secret = '90ce76e38c01f6a7eae41c6f37a1bb9a' 
  
  config.use_google_geocoding = true

  config.action_mailer.default_url_options = { host: 'localhost:3000' }
  config.action_mailer.raise_delivery_errors = true

  ## TODO: Control with AB Testing
  config.exchange_search_inactive = true

end
Rails.application.routes.default_url_options[:host] = 'localhost:3000'
