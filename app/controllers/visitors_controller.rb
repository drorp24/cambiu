class VisitorsController < ApplicationController 
  
  def create
    return unless visitor_params[:email]
    @visitor = Visitor.find_or_create_by(email: visitor_params[:email])
    @visitor.update(visitor_params) 
    # js response is for the client to invoke mixpanel. That's the only way to include geolocation data in the mixpanel.people.set
    respond_to do |format|
        format.js
    end  
  end

  def visitor_params
    params.require(:visitor).permit!
  end
      
end