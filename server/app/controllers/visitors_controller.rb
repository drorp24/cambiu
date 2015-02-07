class VisitorsController < ApplicationController 
  
  def create
    return unless visitor_params[:email]
    @visitor = Visitor.find_or_create_by(email: visitor_params[:email])
    @visitor.update(visitor_params) 
    respond_to do |format|
        format.js
    end  
  end

  def visitor_params
    params.require(:visitor).permit!
  end
      
end