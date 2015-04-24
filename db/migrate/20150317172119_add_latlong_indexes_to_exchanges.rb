class AddLatlongIndexesToExchanges < ActiveRecord::Migration
  def change
    add_index :exchanges, :latitude
    add_index :exchanges, :longitude
  end
end
