class AddCustomerFieldsToOrder < ActiveRecord::Migration
  def change
    add_column    :orders, :customer_email,   :string
    add_column    :orders, :customer_phone,   :string
    add_column    :orders, :customer_address, :string
    remove_column :orders, :email
    remove_column :orders, :phone
  end
end
