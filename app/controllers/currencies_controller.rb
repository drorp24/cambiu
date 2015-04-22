class CurrenciesController < ApplicationController 
  before_action :set_currency, only: [:exchange, :rates]
  
  def exchange
    interbank_value = @currency.exchange(params[:pay_cents], params[:pay_currency], params[:buy_currency])
    offer = interbank_value * 1.02
    gain = interbank_value * 0.1
    render json: {offer: offer.format, gain: gain.format}
  end
  
  def rates
    render json: @currency.rates
  end
  
  private
  
  def set_currency
    @currency ||= Currency.new    
  end

end