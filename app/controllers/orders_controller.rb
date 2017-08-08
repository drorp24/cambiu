class OrdersController < ApplicationController
  skip_before_action :verify_authenticity_token
  respond_to :json

  def create
    order = Order.create(order_params)
    if order
        respond_with order
    else
      render json: {errors: order.errors.full_messages}, status: :unprocessable_entity
    end
  end

  def update
    order = Order.find(params[:id])
    if order.update(order_params)
      render json: {'status': 'ok'}
    else
      render json: {'status': 'failed'}
    end
  end

  def user

    user = User.find_or_create_by(email: user_params[:email])
    detailsChanged = user.detailsChanged?(user_params)
    user.update(user_params)

    if user and user.errors.empty?

      search = Search.find(search_params[:id])
      search.update(user_id: user.id) if search

      order = Order.find(params[:id])
      if order
        order.update(user_id: user.id)
        render json: order.with_user(detailsChanged)
      else
        render json: {errors: 'No order id'}, status: :unprocessable_entity
      end

    elsif user and user.errors.any?
      render json: {errors: user.errors.full_messages}
    else
      render json: {errors: 'User cannot be created'}, status: :unprocessable_entity
    end

  end

  def order_params
    params.require(:order).permit!
  end

  def user_params
    params.require(:user).permit!
  end

  def search_params
    params.require(:search).permit!
  end

end