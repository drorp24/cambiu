require "application_responder"

class ApplicationController < ActionController::Base
  self.responder = ApplicationResponder
  respond_to :html

  before_action :show_request_headers
#  before_action :require_authentication,:if => Proc.new { |c| c.request.path.include? "/api/"}

  protect_from_forgery with: :exception
  
  before_action :configure_permitted_parameters, if: :devise_controller?
#  before_action :authenticate_user!

  before_action :pass_request

  before_action :detect_browser

  private
  def detect_browser
    @browser = Browser.new(request.user_agent, accept_language: "en-us")
  end


  def pass_request
    $request = request
  end


  private

  def show_request_headers
    puts ""
    puts "request headers:"
    puts ""
  #  request.headers.each {|key, value| puts key, value}
    pp request.headers.env.select{|k, _| k.in?(ActionDispatch::Http::Headers::CGI_VARIABLES) || k =~ /^HTTP_/}
    puts ""
  end

  def require_authentication
    unless request.headers['X-SSL-Auth'] and current_certificate.verify(public_key)
      head :forbidden
    end
  end

  def public_key
    @public_key ||= OpenSSL::PKey::RSA.new(ENV['AUTH_PUBLIC_KEY']||1)
  end

  def current_certificate
    @current_certificate ||= OpenSSL::X509::Certificate.new(request.headers['X-SSL-Auth'])
  end

  def current_client
    current_certificate.issuer.to_a.assoc('OU')[1]
  end

  protected
  
=begin
  def set_http_cache_headers
    expires_in 1.month, public: true
    fresh_when last_modified: Date.new(2015, 1, 1), public: true
  end
=end

  def find_guest_user
    @guest_user = User.find(session[:user_id]) if session[:user_id]
  end
  
  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up) { |u| u.permit(:guest, :username, :email, :password, :password_confirmation, :remember_me, :buy_amount, :pay_amount, :buy_currency, :pay_currency, :latitude, :longitude, :location, :bbox, :landing, :geocoded_location, :location_search) }
    devise_parameter_sanitizer.permit(:sign_in) { |u| u.permit(:buy, :buy_currency, :pay, :pay_currency, :login, :username, :email, :password, :password_confirmation, :buy_cents, :pay_cents, :remember_me) }
    devise_parameter_sanitizer.permit(:account_update) { |u| u.permit(:username, :email, :password, :password_confirmation, :current_password) }
  end
end
