class AddUserLocationToOrder < ActiveRecord::Migration
  def change
    add_column :orders, :user_location, :string
  end
end
