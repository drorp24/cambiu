class CurrenciesController < ApplicationController 
  before_action :set_currency, only: [:exchange, :rates]
  
  def exchange
    interbank_value = @currency.exchange(params[:pay_cents], params[:pay_currency], params[:buy_currency])
    factored_value = interbank_value * 1.05
    render json: ActionController::Base.helpers.humanized_money_with_symbol(factored_value).to_s.to_json
  end
  
  def rates
    render json: @currency.rates
  end
  
  private
  
  def set_currency
    @currency ||= Currency.new    
  end

end