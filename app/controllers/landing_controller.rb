class LandingController < ApplicationController 
  caches_page :index
  
  def index
    @visitor = Visitor.new(buy_cents: 100000, buy_currency: "USD", pay_currency: "GBP", pay_cents: Currency.new.exchange(100000, "USD", "GBP"))
    expires_in 3.days, :public => true
    render layout: 'boots'
=begin
    if stale?(etag: @visitor, last_modified: Date.today)
      respond_to do |format| 
        format. html {render layout: 'boots'}
      end
    end
=end
  end
    
end