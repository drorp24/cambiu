class LandingController < ApplicationController 
#  caches_page :index    # removed to allow expires_in to work. delete the gem later
  
  def index
    redirect_to save_money_path if @landing.blank?
    @user = User.new
    
    
=begin
    @visitor = Visitor.new(buy_cents: 100000, buy_currency: "USD", pay_currency: "GBP", pay_cents: Currency.new.exchange(100000, "USD", "GBP"))
    @user = User.new(buy_cents: 100000, buy_currency: "USD", pay_currency: "GBP", pay_cents: Currency.new.exchange(100000, "USD", "GBP"))
    expires_in 3.hours, :public => true if Rails.env.production?
#    if stale?(etag: @visitor, last_modified: Date.new(2015, 1, 1)) 
      respond_to do |format| 
        format. html {render layout: 'boots'}
      end
#    end
=end    
  end
end