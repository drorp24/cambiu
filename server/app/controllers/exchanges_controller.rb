class ExchangesController < ApplicationController 
  
  def index
  end
  
  def search
    latitude =      params[:latitude] 
    longitude =     params[:longitude] 
    bbox =          params[:bbox]    
    buy_amount =    params[:buy_amount]
    buy_currency =  params[:buy_currency]
    pay_currency =  params[:pay_currency]

    @exchange_quotes = []
    exchanges = Exchange.where(city: "London")           # ToDo: change to filter by lat/long and bbox
    exchanges.each do |exchange|       
      exchange_quote = {}
      exchange_quote[:id] = exchange.id
      exchange_quote[:name] = exchange.name
      exchange_quote[:latitude] = exchange.latitude
      exchange_quote[:longitude] = exchange.longitude   
      exchange_quote[:quote] = nil
      if buy_amount and buy_currency and pay_currency        
        if quote = exchange.quote(buy_amount, buy_currency, pay_currency)
          quote = quote.fractional / 100
          exchange_quote[:quote] = quote
        end
      end
      @exchange_quotes << exchange_quote
    end
    
    render json: @exchange_quotes

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