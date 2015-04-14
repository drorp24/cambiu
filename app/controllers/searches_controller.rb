class SearchesController < ApplicationController 
 
  def new
    @search = Search.new
  end
    
  def create
    @search = Search.create!(search_params)  
    render json: @search.exchanges                                                
  end
  
 
  def search_params
    params.require(:search).permit!
  end
      
end