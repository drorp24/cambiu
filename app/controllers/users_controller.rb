class UsersController < ApplicationController 
  respond_to :json

  def create
    
    return if users_params[:email].blank? or User.where(email: users_params[:email]).exists? 
    
    # new guest user
    @user = User.new_guest(users_params)
    if @user.save
      respond_with @user
    else
      render nothing: true
    end

  end
      
  def users_params
    params.require(:user).permit!
  end


end