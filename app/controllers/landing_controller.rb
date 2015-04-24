class LandingController < ApplicationController 

  before_action :set_http_cache_headers, only: [:index]     # quicker next rendering  (return 304 instead of page)
  caches_action :index                                      # quicker first rendering (pick-up ready page from cache)
  
  def index
  end

end