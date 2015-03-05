class ExchangesController < ApplicationController 
  
  def index
  end
  
  def search
    latitude =      params[:latitude] 
    longitude =     params[:longitude] 
    bbox =          params[:bbox]    
    buy_amount =    params[:buy_amount].remove(",")
    buy_currency =  params[:buy_currency]
    pay_currency =  params[:pay_currency]

    @exchange_quotes = []
    exchanges = Exchange.includes(:business_hours).where(city: "London")           # ToDo: change to filter by lat/long and bbox
    exchanges.each do |exchange|       
      exchange_quote = {}
      exchange_quote[:id] = exchange.id
      exchange_quote[:name] = exchange.name
      exchange_quote[:address] = exchange.address
      exchange_quote[:open_today] = exchange.open_today
      exchange_quote[:latitude] = exchange.latitude
      exchange_quote[:longitude] = exchange.longitude   
      exchange_quote[:quote] = nil
      if buy_amount and buy_currency and pay_currency        
        if quote = exchange.quote(buy_amount, buy_currency, pay_currency)
          quote = quote.fractional / 100
          exchange_quote[:quote] = quote
          exchange_quote[:edited_quote] = view_context.humanized_money_with_symbol quote
        end
      end
      @exchange_quotes << exchange_quote
    end
    
    render json: @exchange_quotes.sort_by{|e| e[:quote] || 1000000}

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