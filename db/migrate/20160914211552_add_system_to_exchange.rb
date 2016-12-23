class AddSystemToExchange < ActiveRecord::Migration
  def change
    add_column :exchanges, :system, :integer
  end
end
