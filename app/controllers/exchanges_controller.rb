class ExchangesController < ApplicationController 
  
  def index
  end
  
  def search          # TODO: Caching!!               
    
    @exchanges = Exchange.search(params)   # TODO: Error checking etc
    render json: @exchanges

  end

  def quote # remember to change to params[:id]
    return unless params[:id] && params[:buy_amount] && params[:buy_currency] && params[:pay_currency]
    exchange = Exchange.find(434)
    pay = exchange.quote(params[:buy_amount], params[:buy_currency], params[:pay_currency])
    render json: pay
  end
  
  def exchange_params
    params.require(:exchange).permit!
  end
      
end