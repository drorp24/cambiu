class LandingController < ApplicationController 
  
  def index
    @visitor = Visitor.new(pay_currency: "GBP", buy_currency: "USD", buy_cents: 1000)
  end
    
end