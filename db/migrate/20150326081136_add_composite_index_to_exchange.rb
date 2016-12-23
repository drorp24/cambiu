class AddCompositeIndexToExchange < ActiveRecord::Migration
  def change
    add_index :'exchanges.js', [:latitude, :longitude]
  end
end
