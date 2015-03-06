class UsersController < ApplicationController 
  
  def create
    puts ""
    puts ""
    puts ""
    puts "arrived!"
    puts ""
    puts ""
    puts ""
    redirect_to landing_path, notice: 'thank you!'
  end
      
end