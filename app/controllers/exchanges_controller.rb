class ExchangesController < ApplicationController 
  before_action :authenticate_user!
  
  def index
  end

  def exchange_params
    params.require(:exchange).permit!
  end
      
end