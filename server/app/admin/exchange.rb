ActiveAdmin.register Exchange do

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
    end
    f.actions
  end

end
