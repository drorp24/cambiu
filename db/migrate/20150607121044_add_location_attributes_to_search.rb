class AddLocationAttributesToSearch < ActiveRecord::Migration
  def change
    add_column :searches, :location_lat, :float
    add_column :searches, :location_lng, :float
    add_column :searches, :location_type, :string
  end
end
