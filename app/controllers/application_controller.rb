require "application_responder"

class ApplicationController < ActionController::Base
  self.responder = ApplicationResponder
  respond_to :html

  before_action :set_release

  before_action :set_locale

#  before_action :show_request_headers
#  before_action :require_authentication,:if => Proc.new { |c| c.request.path.include? "/api/"}

  protect_from_forgery with: :exception
  
  before_action :configure_permitted_parameters, if: :devise_controller?
#  before_action :authenticate_user!

  before_action :pass_request

#  before_action :detect_browser

  def set_release
    # Important: advance release for *any* deployment to www, or else the old JS/HTML/CSS will be served!
    @release = '0.9.9.2'
    @release_date = Date.new(2018, 4, 8)
  end

  def set_locale
    # It turns out that admin doesn't even go thru application_controller so it doesn't see this code below.
    # What I did was making config.i18n.default_locale = :en (application.rb) which admin controller does see, and here using 'he' as the default controller
    # Could have just define here @local = 'he' but left the old code below just in case the above assumption is wrong.
    @locale = I18n.locale = Rails.env.development? && params[:controller] == 'home' && !(params[:controller] =~ /^admin\//i) ? 'he' : params[:locale] || (params[:controller] =~ /^admin\//i) ? 'en' : 'he'
  end

  def default_url_options(options={})
#    { :locale => I18n.locale }
  end


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
    puts ""
    puts "I18n.local: " + I18n.locale.to_s
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
  

  def find_guest_user
    @guest_user = User.find(session[:user_id]) if session[:user_id]
  end
  
  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up) { |u| u.permit(:guest, :username, :email, :password, :password_confirmation, :remember_me, :buy_amount, :pay_amount, :buy_currency, :pay_currency, :latitude, :longitude, :location, :bbox, :landing, :geocoded_location, :location_search) }
    devise_parameter_sanitizer.permit(:sign_in) { |u| u.permit(:buy, :buy_currency, :pay, :pay_currency, :login, :username, :email, :password, :password_confirmation, :buy_cents, :pay_cents, :remember_me) }
    devise_parameter_sanitizer.permit(:account_update) { |u| u.permit(:username, :email, :password, :password_confirmation, :current_password) }
  end
end
