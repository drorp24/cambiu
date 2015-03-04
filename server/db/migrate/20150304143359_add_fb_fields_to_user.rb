class AddFbFieldsToUser < ActiveRecord::Migration
  def change
    add_column :users, :location, :string
    add_column :users, :first_name, :string
    add_column :users, :last_name, :string
    add_column :users, :gender, :string
    add_column :users, :timezone, :string
    add_column :users, :locale, :string
  end
end
