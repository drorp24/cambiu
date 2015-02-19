class RatesController < ApplicationController 
  before_action :authenticate_admin_user!
  
  def update
    rate = Rate.find(params[:id])
    respond_to do |format|
      if rate.update(rates_params)
        format.html { redirect_to(rate, :notice => 'Rate was successfully updated.') }
        format.json { respond_with_bip(rate) }
      else
        format.html { render :action => "edit" }
        format.json { respond_with_bip(rate) }
      end
  end  
  end

  def rates_params
    params.require(:rate).permit!
  end
      
end