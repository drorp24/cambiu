class BdcController < ApplicationController 
respond_to :json

  def create    
    @exchange = Exchange.new(params)
    @exchange.save
    respond_with @exchange
  end
  
  def index
    render layout: 'bdc'
  end
  
end