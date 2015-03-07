class UsersController < ApplicationController 

  def create
    
    # user hit the button again in the same session
    redirect_to landing_path and return if session[:user_id] and users_params[:email].blank?
    
  # user has already provided his email once
    redirect_to landing_path and return if User.where(email: users_params[:email]).exists? 

    # new guest user
    @user = User.new_guest(users_params)
    puts ""
    puts ""
    puts ""
    puts "@user:"
    puts ""
    puts @user.inspect
    puts ""
    puts ""
    puts ""
    if @user.save
      puts ""
      puts ""
      puts ""
      puts "saved"
      puts ""
      puts ""
      puts ""
      session[:user_id] = @user.id
      redirect_to landing_path
    else
      puts ""
      puts ""
      puts ""
      puts "not saved"
      puts ""
      puts ""
      puts ""
      redirect_to landing_path, alert: "user was not saved"
    end

  end
      
  def users_params
    params.require(:user).permit!
  end


end