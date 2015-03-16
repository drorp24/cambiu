class CurrenciesController < ApplicationController 
  before_action :set_currency, only: [:exchange, :rates]
  
  def exchange
    interbank_value = @currency.exchange(params[:pay_cents], params[:pay_currency], params[:buy_currency])
    offer = interbank_value * 1.02
    gain = interbank_value * 0.1
    render json: {offer: edited(offer), gain: edited(gain)}
    puts edited(offer)
  end
  
  def rates
    render json: @currency.rates
  end
  
  private
  
  def edited(money)
    Currency.display(money).to_json
  end

  def set_currency
    @currency ||= Currency.new    
  end

end