class AddMoreColumnsToExchange < ActiveRecord::Migration
  def change
    add_column :exchanges, :status, :string
    add_column :exchanges, :message, :text
  end
end
