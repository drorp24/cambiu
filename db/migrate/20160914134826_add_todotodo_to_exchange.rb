class AddTodotodoToExchange < ActiveRecord::Migration
  def change
    add_column :exchanges, :todo, :integer
  end
end
