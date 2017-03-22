class HomeController < ApplicationController

  # before_action :set_http_cache_headers, only: [:index]     # quicker next rendering  (return 304 instead of page)
#  caches_action :index, expires_in: 2.hours, :race_condition_ttl => 20.seconds                                      # quicker first rendering (pick-up ready page from cache)

  def index
    puts ""
    puts ""
    puts "user-agent: ", request.user_agent
    puts @browser.device.mobile?
    puts ""
    puts ""
    redirect_to ENV['LANDING_URL'] || 'http://join.cambiu.com' #unless Rails.env.development?
  end

  def app
    render :index
  end

end
