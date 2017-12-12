require_relative 'boot'

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module CurrencyNetMvp
  class Application < Rails::Application
    config.font_assets.origin = '*' 
#    config.middleware.use Rack::Deflater
    config.middleware.insert_before ActionDispatch::Static, Rack::Deflater
#    config.action_controller.page_cache_directory = "#{Rails.root.to_s}/public/deploy"
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
    config.time_zone = 'London'
    config.active_record.time_zone_aware_types = [:datetime, :time]

    # The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
    # config.i18n.load_path += Dir[Rails.root.join('my', 'locales', '*.{rb,yml}').to_s]
    config.i18n.default_locale = :en
    config.assets.version = '1.1'
    config.action_dispatch.default_headers = {
  'X-Frame-Options' => 'ALLOWALL'
}
    config.active_record.raise_in_transactional_callbacks = true
    config.active_job.queue_adapter = :sidekiq
#    config.active_job.queue_name_prefix = "cambiu_#{Rails.env}"
    config.filter_parameters += [:photo]
    config.action_view.logger = nil
    OpenSSL::SSL::SSLContext::DEFAULT_PARAMS[:ciphers] += ':DES-CBC3-SHA'
    config.export_concurrent = false
  end
end
