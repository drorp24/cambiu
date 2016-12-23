# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.action_controller.asset_host = ENV["CLOUDFRONT_DIST"]

Rails.application.config.assets.version = '1.0'

# Do not compile on the fly
Rails.application.config.assets.compile = Rails.env.development?

# Instead, pre-compile JavaScripts and CSS.
Rails.application.config.assets.js_compressor = :uglifier
Rails.application.config.assets.css_compressor = :sass

# Use dependencies on manifest.js
Rails.application.config.assets.precompile += %w[application.js application.css sw.js manifest.json]
