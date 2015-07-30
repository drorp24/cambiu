class OrdersController < ApplicationController
  skip_before_filter :verify_authenticity_token
  respond_to :json

  def create
    render json: {} and return if order_params[:status] == 'offer'
    @order = Order.create!(order_params)
    respond_with @order
  end

  def update
    @order = Order.find(order_params[:id])
    @order.update!(order_params)
    respond_with @order
  end

  def order_params
    params.require(:order).permit!
  end

end