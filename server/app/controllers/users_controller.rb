class UsersController < ApplicationController 
  respond_to :json

  def create
    
    # user hit the button again in the same session
    return if session[:user_id] and users_params[:email].blank?
    
  # user has already provided his email once
    return if User.where(email: users_params[:email]).exists? 

    # new guest user
    @user = User.new_guest(users_params)
    @user.save
    respond_with @user

  end
      
  def users_params
    params.require(:user).permit!
  end


end