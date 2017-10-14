class ExchangesController < ApplicationController
  skip_before_filter :verify_authenticity_token

  def show
    render json: Exchange.find_by(id: params[:id])
  end

  def get
    result = {}
    exchange = Exchange.find(params[:id])
    result[params[:property]] = exchange.send(params[:property])
    render json: result
  end

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