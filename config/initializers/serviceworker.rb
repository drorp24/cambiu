Rails.application.configure do
  config.serviceworker.routes.draw do
    match "/sw.js"
    match "/manifest.json"
  end
end