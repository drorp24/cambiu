class AddTodotodoToExchange < ActiveRecord::Migration
  def change
    add_column :'exchanges.js', :todo, :integer
  end
end
