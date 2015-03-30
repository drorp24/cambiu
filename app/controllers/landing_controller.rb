class LandingController < ApplicationController 
#  caches_page :index    # removed to allow expires_in to work. delete the gem later
  
  def index
    redirect_to save_money_path if @landing.blank?
    @user = User.new
  end
  
end