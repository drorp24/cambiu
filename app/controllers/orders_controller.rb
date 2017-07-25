class OrdersController < ApplicationController
  skip_before_action :verify_authenticity_token
  respond_to :json

  def create
    @order = Order.create_and_notify(order_params, session[:lang])
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