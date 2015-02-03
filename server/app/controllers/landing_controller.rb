class LandingController < ApplicationController 
  
  def index
    @visitor = Visitor.new(pay_currency: "GBP", buy_currency: "USD")
  end
    
end