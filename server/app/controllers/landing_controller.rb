class LandingController < ApplicationController 
  
  def index
    @rate = Rate.new   
    @rates = Rate.all
  end
  
  def new
    @rate = Rate.new   
  end
  
end