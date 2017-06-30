class SearchesController < ApplicationController 
  skip_before_action :verify_authenticity_token

  def localRates
    render json: Search.new(search_params).localRates
  end

  def unique
    render json: !Search.where(email: search_params[:email]).exists?
  end

  # record the search, return results, no validations
  def create
    @search = Search.create(search_params)
    if @search.errors.any?
      render json: {errors: @search.errors.full_messages}, status: 422
    else
      render json: @search.exchanges
    end
  end

  # record the search, dont return results, check validations
  def record

   @search = Search.create(search_params)

   if @search.errors.any?
     render json: {errors: @search.errors.full_messages}, status: 422
   else
    render json: @search
   end

  end

  def search_params
    params.require(:search).permit!
  end
      
end