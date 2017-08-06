class PaymentController < ApplicationController
  skip_before_action :verify_authenticity_token

  def url
    render json: Creditguard.redirect({amount: 10000})
  end

  def payment_params
#    params.require(:search).permit!
  end
      
end