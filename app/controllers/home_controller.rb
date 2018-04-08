class HomeController < ApplicationController

#  caches_action :app, cache_path: :action_cache_key,
#                unless: -> {Rails.env.development?}           # quicker first rendering (pick-up ready page from cache) - Dramatic effect. Must be skipped in development
  before_action :set_http_cache_headers, if: "Rails.env.production?"      # quicker next rendering  (if challenged by browser with "If...", it quickly responds with 304 rather than generate a page)

  def index
  end

  def app
    render layout: "application"
  end

  def action_cache_key
    "action-#{@release}-#{@locale}"
  end

  def set_http_cache_headers
    expires_in 1.day, public: true
    # this tells browser/cdn to not attempt to call the server again for the page for the duration of one day
    # it means that if I change anything, it won't be noticed until the next day (which is fine for the homepage)
    fresh_when last_modified: @release_date, public: true
    # when the server *is* called:
    # this sends back with the response another header: 'last-modified', which contains the date of last release
    # the browser stores this date for the page and when calling for the page *again* provides this date to the server
    # if the server then sees that the browser has already got the page, it sends back a header 304 with no page
    # the browser getting this 304 pulls the cached page from its own cache
    # for this response from the server to work, the browser must first call the page with HTTP_IF_MODIFIED_SINCE header (remove the 'no cache' in the Chrome DevTools for it to work)

  end


end
