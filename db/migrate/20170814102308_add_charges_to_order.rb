class AddChargesToOrder < ActiveRecord::Migration[5.0]
  def change
    add_column :orders, :credit_charge_cents, :integer
    add_column :orders, :credit_charge_currency, :string
    add_column :orders, :delivery_charge_cents, :integer
    add_column :orders, :delivery_charge_currency, :string
    add_column :orders, :cc_fee, :float
    add_column :orders, :rates_source, :string
    remove_column :orders, :user_location
    remove_column :orders, :customer_email
    remove_column :orders, :customer_phone
    remove_column :orders, :customer_address1
    remove_column :orders, :customer_address2
    remove_column :orders, :customer_address3
  end
end
