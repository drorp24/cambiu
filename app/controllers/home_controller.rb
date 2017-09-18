class HomeController < ApplicationController

# before_action :set_http_cache_headers, only: [:index]     # quicker next rendering  (return 304 instead of page)
# caches_action :app, cache_path: '0.9.8'                   # quicker first rendering (pick-up ready page from cache) - I use fragment caching, which requires no further gem and is quite identicak

  def index
    render :index
  end

end
