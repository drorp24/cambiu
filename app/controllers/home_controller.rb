class HomeController < ApplicationController 
#  caches_page :index    # removed to allow expires_in to work. delete the gem later
  
  def index
    @user = User.new
  end
  
end