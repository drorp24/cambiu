class HomeController < ApplicationController

  caches_action :index, cache_path: :action_cache_key               # quicker first rendering (pick-up ready page from cache) - Dramatic effect.
  before_action :set_http_cache_headers, only: [:index]             # quicker next rendering  (if challenged by browser with "If...", it quickly responds with 304 rather than generate a page)

  def index
  end

  def action_cache_key
    "action-#{@release}-#{@locale}"
  end

  def set_http_cache_headers
    expires_in 1.month, public: true
    fresh_when last_modified: @release_date, public: true
  end


end
