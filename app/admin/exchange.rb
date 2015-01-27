ActiveAdmin.register Exchange do
  active_admin_importable

  # See permitted parameters documentation:
  # https://github.com/activeadmin/activeadmin/blob/master/docs/2-resource-customization.md#setting-up-strong-parameters
  #
  permit_params :name, :address, :latitude, :longitude, :country, :user_ratings, :opens, :closes
  #
  # or
  #
  # permit_params do
  #   permitted = [:permitted, :attributes]
  #   permitted << :other if resource.something?
  #   permitted
  # end
  form do |f|
    f.inputs 'Details' do
      f.input :name
      f.input :address
      f.input :latitude
      f.input :longitude
      f.input :user_ratings
      f.input :opens
      f.input :closes
      f.input :country, :as => :select, collection: country_dropdown
      f.inputs "Business Hours" do
        7.times do
            f.object.business_hours.build
        end 
        f.fields_for :business_hours do |b|
          b.inputs do         
            b.input :day
            b.input :open_time
            b.input :close_time
          end
        end
      end
    end
    f.actions
  end

end
