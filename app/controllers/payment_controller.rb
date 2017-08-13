class PaymentController < ApplicationController
  skip_before_action :verify_authenticity_token

  def url
    render json: Creditguard.redirect(payment_params.merge(base_url: request.base_url))
  end

  def payment_params
    params.permit!
  end


end