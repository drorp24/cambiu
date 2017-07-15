class AddHeFieldsToExchange < ActiveRecord::Migration[5.0]
  def change
    add_column :exchanges, :name_he, :string
    add_column :exchanges, :address_he, :string
  end
end
