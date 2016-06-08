class OrdersController < ApplicationController
#  skip_before_filter :verify_authenticity_token
  respond_to :json

  def upload
    @order = Order.last
    @order.verified!
    @order.photo = params[:imageData]
    response = OrderMailer.notify(@order).deliver_now
    respond_with @order
  end

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