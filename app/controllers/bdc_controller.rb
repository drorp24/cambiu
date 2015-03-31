class BdcController < ApplicationController 
#  caches_page :index    # removed to allow expires_in to work. delete the gem later
  
  def index
    render layout: 'bdc'
  end
  
end