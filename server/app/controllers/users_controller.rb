class UsersController < ApplicationController 

  def create
    
    # user hit the button again in the same session
    redirect_to landing_path and return if session[:user_id]
    
    # new guest user
    @user = User.new_guest(users_params)
    if @user.save
      session[:user_id] = @user.id
      redirect_to landing_path
    else
      redirect_to landing_path, alert: "user was not saved"
    end

  end
      
  def users_params
    params.require(:user).permit!
  end


end