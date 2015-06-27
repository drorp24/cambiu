class ExchangesController < ApplicationController

  caches_action :index, expires_in: 2.hours, :race_condition_ttl => 20.seconds    # quicker first rendering (pick-up ready page from cache)
 # before_action :set_http_cache_headers, only: [:show]                           # quicker next rendering  (return 304 instead of page)

  # Just return html; client will populate
  def show
    @mode = 'exchange'
  end

  def quote

    exchange = Exchange.find(params[:id])
    render json: exchange.quote(params)

  end


=begin
  def quote
    @exchange = Exchange.find(params[:id])
    if params[:field] == 'pay_amount'
      amount = Monetize.parse(params[:pay_amount]).amount
      from_currency = params[:pay_currency]
      to_currency = params[:buy_currency]
    elsif params[:field] == 'buy_amount'
      amount = Monetize.parse(params[:buy_amount]).amount
      from_currency = params[:buy_currency]
      to_currency = params[:pay_currency]

    sessionKey = params[:field] + '_' + from_currency + '_' + to_currency
    rate = session[sessionKey] ||= Bank.exchange(1, from_currency, to_currency).amount * rand(1.03..1.15)

    result = @exchange.quote(rate, params,sessionKey)
    session[sessionKey] = result[:rate]
    render json: result
  end
=end

  protected

  def exchange_params
    params.require(:exchange).permit!
  end
      
end