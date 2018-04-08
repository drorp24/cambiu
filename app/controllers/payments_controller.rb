class PaymentsController < ApplicationController
  skip_before_action :verify_authenticity_token, raise: false

  def url
    render json: Creditguard.redirect(payment_params.merge(base_url: request.base_url))
  end

  def success
    order = Order.find_by_id(payment_params[:id])
    order.paid!
    Payment.record_token(payment_params)
  end

  def error
    puts ""
    puts "Error after calling CreditGuard:"
    puts ""
    puts payment_params.inspect
    puts ""
    @text = payment_params[:'ErrorText']
  end

  def cancel
    puts ""
    puts "Cancel after calling CreditGuard:"
    puts ""
    puts payment_params.inspect
    puts ""
    @text = payment_params[:'ErrorText']
  end


  def payment_params
    params.permit!
  end


end