class SearchesController < ApplicationController 
  skip_before_filter :verify_authenticity_token

  def unique
    render json: !Search.where(email: search_params[:email]).exists?
  end

  # record the search, return results, no validations
  def create
    @search = Search.create(search_params)
 #   uncomment if error checking would be required
 #   if @search.errors.any?
 #     render json: {errors: @search.errors.full_messages}, status: 422
 #   else
      render json: @search.exchanges
 #   end
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