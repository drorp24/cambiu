class AddPlaceIdToExchange < ActiveRecord::Migration
  def change
    add_column :exchanges, :place_id, :string
  end
end
