class AddCompositeIndexToExchange < ActiveRecord::Migration
  def change
    add_index :exchanges, [:latitude, :longitude]
  end
end
