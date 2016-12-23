class AddPlaceIdToExchange < ActiveRecord::Migration
  def change
    add_column :'exchanges.js', :place_id, :string
  end
end
