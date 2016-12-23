class AddAnIndexToExchange < ActiveRecord::Migration
  def change
    add_index :exchanges, [:name, :address]
  end
end
