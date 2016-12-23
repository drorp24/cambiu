class AddLatlongIndexesToExchanges < ActiveRecord::Migration
  def change
    add_index :exchanges, :latitude
    add_index :'exchanges.js', :longitude
  end
end
