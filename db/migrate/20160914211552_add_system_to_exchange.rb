class AddSystemToExchange < ActiveRecord::Migration
  def change
    add_column :'exchanges.js', :system, :integer
  end
end
