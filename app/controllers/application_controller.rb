require "application_responder"

class ApplicationController < ActionController::Base
  self.responder = ApplicationResponder
  respond_to :html

  protect_from_forgery with: :exception
  
  before_action :configure_permitted_parameters, if: :devise_controller?
#  before_action :authenticate_user!

  before_action :pass_request

  before_action :detect_browser

  private
  def detect_browser
    case request.user_agent
      when /iPad/i
        request.variant = :tablet
      when /iPhone/i
        request.variant = :phone
      when /Android/i && /mobile/i
        request.variant = :phone
      when /Android/i
        request.variant = :tablet
      when /Windows Phone/i
        request.variant = :phone
      else
        request.variant = :desktop
    end
  end


  def pass_request
    $request = request
  end

  protected
  
  def set_http_cache_headers
    expires_in 1.month, public: true
    fresh_when last_modified: Date.new(2015, 1, 1), public: true
  end

  def find_guest_user
    @guest_user = User.find(session[:user_id]) if session[:user_id]
  end
  
  def configure_permitted_parameters
    devise_parameter_sanitizer.for(:sign_up) { |u| u.permit(:guest, :username, :email, :password, :password_confirmation, :remember_me, :buy_amount, :pay_amount, :buy_currency, :pay_currency, :latitude, :longitude, :location, :bbox, :landing, :geocoded_location, :location_search) }
    devise_parameter_sanitizer.for(:sign_in) { |u| u.permit(:buy, :buy_currency, :pay, :pay_currency, :login, :username, :email, :password, :password_confirmation, :buy_cents, :pay_cents, :remember_me) }
    devise_parameter_sanitizer.for(:account_update) { |u| u.permit(:username, :email, :password, :password_confirmation, :current_password) }
  end
end
