class Api::V1::ExchangesController < Api::V1::BaseController
  def index
    @exchanges = Exchange.all
    render json: @exchanges, :callback => params['callback']
  end

  def show
    @exchange = Exchange.find_by_id params[:id]
    render json: @exchange, :callback => params['callback']
  end
end