class AddLocationShortToSearch < ActiveRecord::Migration
  def change
    add_column :searches, :location_short, :string
  end
end
