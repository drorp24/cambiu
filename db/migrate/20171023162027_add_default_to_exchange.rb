class AddDefaultToExchange < ActiveRecord::Migration[5.0]
  def change
    add_column :exchanges, :default, :boolean
    add_index :exchanges, :default
  end
end
