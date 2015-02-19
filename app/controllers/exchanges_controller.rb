class ExchangesController < ApplicationController 
  
  def index
  end

  def exchange_params
    params.require(:exchange).permit!
  end
      
end