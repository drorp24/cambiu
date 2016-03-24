class OrdersController < ApplicationController
  skip_before_filter :verify_authenticity_token
  respond_to :json

  def upload
    @order = Order.last
    @order.pictured!
    @order.photo = params[:imageData]
    response = OrderMailer.notify(@order).deliver_now
    logger.info "OrderMailer.notify response:"
    logger.info response
    logger.info ""
    respond_with @order
  end

  def create
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