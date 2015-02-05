class CurrenciesController < ApplicationController 
  before_action :set_currency, only: [:exchange, :rates]
  
  def exchange
    render json: @currency.exchange(params[:buy_cents], params[:buy_currency], params[:pay_currency])
  end
  
  def rates
    render json: @currency.rates
  end
  
  private
  
  def set_currency
    @currency ||= Currency.new    
  end

end