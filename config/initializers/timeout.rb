Rack::Timeout.timeout = 15  # seconds
Rack::Timeout::Logger.disable
#Rack::Timeout.unregister_state_change_observer(:logger) if Rails.env.development?
