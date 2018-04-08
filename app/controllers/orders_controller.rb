class OrdersController < ApplicationController
  skip_before_action :verify_authenticity_token, raise: false
  respond_to :json

  def show
    order = Order.find_by(id: params[:id])
    if order
      render json: order.with_user
    else
      render json: {errors: 'Could not find order ' + id.to_s}, status: :unprocessable_entity
    end
  end

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

    if user and user.errors.empty?

      user.update(user_params)

      search = Search.find(search_params[:id])
      search.update(user_id: user.id) if search

      order = Order.find(params[:id])
      if order
        order.update(user_id: user.id, status: 'registered')
        order.notification
        render json: order.with_user
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