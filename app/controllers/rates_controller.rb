class RatesController < ApplicationController
  before_action :authenticate_admin_user!

  def update
    rate = Rate.find(params[:id])
    if rate.update(rates_params.merge(admin_user_id: current_admin_user.id))
      render json: rate.as_json.merge(updated_at_s: I18n.l(Time.now, format: :short), admin_user_s: rate.admin_user_s)
    else
      render json: rate.errors.full_messages, status: :unprocessable_entity
    end
  end


  def rates_params
    params.require(:rate).permit!
  end
      
end