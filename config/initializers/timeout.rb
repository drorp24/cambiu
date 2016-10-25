Rack::Timeout.timeout = Rails.env.development? ? 90 : 30  # seconds
Rack::Timeout::Logger.disable
#Rack::Timeout.unregister_state_change_observer(:logger) if Rails.env.development?
