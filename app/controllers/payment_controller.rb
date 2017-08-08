class PaymentController < ApplicationController
  skip_before_action :verify_authenticity_token

  def url
    render json: Creditguard.redirect(payment_params)
  end

  def payment_params
    params.permit!
  end


end