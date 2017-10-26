class SearchesController < ApplicationController 
  skip_before_action :verify_authenticity_token

  def localRates
    search = Search.create(search_params.merge(mode: 'best'))
    if search.is_valid?
      render json: search.exchanges
    else
      render json: {search: {id: search.id}, error: 'Missing params'}
    end
  end

  def create
    search = Search.create(search_params.merge(mode: 'full'))
    if search.errors.any?
      render json: {errors: search.errors.full_messages}, status: 422
    else
      render json: search.exchanges
    end
  end


  def search_params
    params.require(:search).except(:id).permit!
  end
      
end