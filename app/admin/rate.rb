ActiveAdmin.register Rate do

  permit_params :buy_cents, :buy_currency, :pay_cents, :pay_currency, :source

  controller do
    def update
      @rate = Rate.find(params[:id])  
      if @rate.update(permitted_params[:rate])
        respond_to do |format|
              format.json 
            end
      else
      end
    end
  end
  
end