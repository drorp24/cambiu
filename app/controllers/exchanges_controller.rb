class ExchangesController < ApplicationController 
  
  def index
    city =          params[:city] ||      "London"
    latitude =      params[:latitude] ||  51.507351
    longitude =     params[:longitude] || -0.127758
    # extract exchanges by lat/long
    buy_amount =    params[:buy_amount]
    buy_currency =  params[:buy_currency]
    pay_currency =  params[:pay_currency]
    
    
    respond_to do |format| 
      format.html {render layout: 'boots'}
      format.json {render json: @exchanges_quotes}
    end

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