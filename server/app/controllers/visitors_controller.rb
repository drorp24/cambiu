class VisitorsController < ApplicationController 
  
  def create
    @visitor = Visitor.new(visitor_params)
    @visitor.save
    render layout: false
  end

  def visitor_params
    params.require(:visitor).permit!
  end    
end