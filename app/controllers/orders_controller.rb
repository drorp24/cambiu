class OrdersController < ApplicationController
#  skip_before_filter :verify_authenticity_token
  respond_to :json

  def create
    @order = Order.create!(order_params)
    respond_with @order
  end

  def update
    order = Order.find(params[:id])
    if order.update(order_params)
      render json: {'status': 'ok'}
    else
      render json: {'status': 'failed'}
    end
  end

  def order_params
    params.require(:order).permit!
  end

end