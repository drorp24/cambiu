class AddNewSerachFieldsToSearch < ActiveRecord::Migration[5.0]
  def change
    add_column :searches, :city, :string
    add_column :searches, :country, :string
    add_column :searches, :transaction, :string
    add_column :searches, :calculated, :string
    add_column :searches, :payment_method, :integer
  end
end
