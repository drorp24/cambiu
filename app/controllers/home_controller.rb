class HomeController < ApplicationController

#  caches_action :app, cache_path: :action_cache_key,
#                unless: -> {Rails.env.development?}           # quicker first rendering (pick-up ready page from cache) - Dramatic effect. Must be skipped in development
  before_action :set_http_cache_headers, only: [:app], if: "Rails.env.production?"       # quicker next rendering  (if challenged by browser with "If...", it quickly responds with 304 rather than generate a page)

  def index
  end

  def app
    unless Rails.env.development?
      expires_in 1.day, :public => true
    end
    render layout: "application"
  end

  def action_cache_key
    "action-#{@release}-#{@locale}"
  end

  def set_http_cache_headers
#    expires_in 1.month, public: true
    fresh_when last_modified: @release_date, public: true
  end


end
