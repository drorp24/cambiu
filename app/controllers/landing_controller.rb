class LandingController < ApplicationController 
  
  def index
    @visitor = Visitor.new(buy_cents: 100000, buy_currency: "USD", pay_currency: "GBP", pay_cents: Currency.new.exchange(100000, "USD", "GBP"))
    render layout: 'boots'
  end
    
end