class AddChangeFieldsToSearch < ActiveRecord::Migration[5.0]
  def change
    add_column :searches, :change_field, :string
    add_column :searches, :change_from, :string
    add_column :searches, :change_to, :string
  end
end
