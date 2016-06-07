class ExchangesController < ApplicationController

  def quote
    exchange = Exchange.find(params[:id])
    render json: exchange.quote(params)
  end

  def update
    exchange = Exchange.find(params[:id])
    if exchange.update(exchange_params)
      render json: {'status': 'ok'}
    else
      render json: {'status': 'failed'}
    end
  end

  protected

  def exchange_params
    params.require(:exchange).permit!
  end

end