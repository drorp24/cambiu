# Be sure to restart your server when you modify this file.

# Enable serving of images, stylesheets, and JavaScripts from an asset server.
Rails.application.config.action_controller.asset_host = ENV["CLOUDFRONT_DIST"]

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.0'

# Compress JavaScripts and CSS.
Rails.application.config.assets.compress = true
Rails.application.config.assets.js_compressor = :uglifier
Rails.application.config.assets.css_compressor = :sass

# Do not fallback to assets pipeline if a precompiled asset is missed.
Rails.application.config.assets.compile = false

# Find precompilation dependencies in manifest.js
Rails.application.config.assets.precompile = ["manifest.js"]