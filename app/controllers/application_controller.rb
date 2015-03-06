class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  
  layout 'boots'
  
  before_action :configure_permitted_parameters, if: :devise_controller?
  before_action :set_landing
#  before_action :authenticate_user!


  
  protected
  
  def set_landing
    @landing = request.original_fullpath.remove("/")
  end

  def find_guest_user
    @guest_user = User.find(session[:user_id]) if session[:user_id]
  end
  
  def configure_permitted_parameters
    devise_parameter_sanitizer.for(:sign_up) { |u| u.permit(:guest, :username, :email, :password, :password_confirmation, :remember_me, :buy_amount, :pay_amount, :buy_currency, :pay_currency, :latitude, :longitude, :bbox, :landing) }
    devise_parameter_sanitizer.for(:sign_in) { |u| u.permit(:buy, :buy_currency, :pay, :pay_currency, :login, :username, :email, :password, :password_confirmation, :buy_cents, :pay_cents, :remember_me) }
    devise_parameter_sanitizer.for(:account_update) { |u| u.permit(:username, :email, :password, :password_confirmation, :current_password) }
  end
end
