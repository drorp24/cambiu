class LandingController < ApplicationController 
  
  def index
    @visitor = Visitor.new(buy_cents: 1000, buy_currency: "USD", pay_currency: "GBP", pay_cents: Currency.new.exchange(1000, "USD", "GBP"))
    render layout: 'boots'
  end
    
end