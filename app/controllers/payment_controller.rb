class PaymentController < ApplicationController
  skip_before_action :verify_authenticity_token

  def url
    render json: Creditguard.url
  end

  def payment_params
#    params.require(:search).permit!
  end
      
end