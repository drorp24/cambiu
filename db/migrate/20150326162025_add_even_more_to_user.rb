class AddEvenMoreToUser < ActiveRecord::Migration
  def change
    add_column :users, :location_search, :string
    add_column :users, :geocoded_location, :string
  end
end
