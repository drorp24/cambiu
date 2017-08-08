class UsersController < ApplicationController 
  respond_to :json

  def create

  end
      
  def users_params
    params.require(:user).permit!
  end

  def search_params
    params.require(:search).permit!
  end



end