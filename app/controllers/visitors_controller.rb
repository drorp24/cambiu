class VisitorsController < ApplicationController 
  
  def create
    @visitor = Visitor.new(visitor_params)
    @visitor.save
    redirect_to root_path, notice: "Thank you for your interest!"
  end

  def visitor_params
    params.require(:visitor).permit!
  end    
end