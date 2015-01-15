class AddLatitudeAndLongitudeToExchange < ActiveRecord::Migration
  def change
    add_column :exchanges, :latitude, :float
    add_column :exchanges, :longitude, :float
  end
end
