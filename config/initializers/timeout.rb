Rack::Timeout.timeout = 10  # seconds
Rack::Timeout::Logger.disable
#Rack::Timeout.unregister_state_change_observer(:logger) if Rails.env.development?
