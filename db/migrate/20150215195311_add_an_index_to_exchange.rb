class AddAnIndexToExchange < ActiveRecord::Migration
  def change
    add_index :'exchanges.js', [:name, :address]
  end
end
