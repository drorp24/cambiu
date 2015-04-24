class VisitorsController < ApplicationController 
  


  def create
    @visitor = Visitor.create(visitor_params)
    redirect_to exchanges_path 


=begin
    # mixpanel.set will be done in the next page
    # js response is for the client to invoke mixpanel. That's the only way to include geolocation data in the mixpanel.people.set
    respond_to do |format|
        format.js
    end
=end  
  end

  def visitor_params
    params.require(:visitor).permit!
  end
      
end