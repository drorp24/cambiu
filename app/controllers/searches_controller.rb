class SearchesController < ApplicationController 
  skip_before_filter :verify_authenticity_token 

  def create
    @search = Search.create!(search_params)  
    render json: @search.exchanges                                                
  end
  
 
  def search_params
    params.require(:search).permit!
  end
      
end