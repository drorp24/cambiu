# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.action_controller.asset_host = ENV["CLOUDFRONT_DIST"]

Rails.application.config.assets.version = '1.0'

# Compress JavaScripts and CSS.

# but precompile, based on manifest.js
Rails.application.config.assets.precompile = ["manifest.js"]