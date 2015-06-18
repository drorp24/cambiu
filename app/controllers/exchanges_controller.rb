class ExchangesController < ApplicationController

  caches_action :index, expires_in: 2.hours, :race_condition_ttl => 20.seconds    # quicker first rendering (pick-up ready page from cache)
  before_action :set_http_cache_headers, only: [:index]                           # quicker next rendering  (return 304 instead of page)

  # Just return html; client will populate
  def show
    @mode = 'exchange'
  end


  protected

  def exchange_params
    params.require(:exchange).permit!
  end
      
end