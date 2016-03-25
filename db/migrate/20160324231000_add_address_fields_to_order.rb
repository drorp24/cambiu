class AddAddressFieldsToOrder < ActiveRecord::Migration
  def change
    add_column    :orders, :customer_address1,   :string
    add_column    :orders, :customer_address2,   :string
    add_column    :orders, :customer_address3,   :string
    remove_column :orders, :customer_address
  end
end
