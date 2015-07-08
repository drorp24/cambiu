class AddGetFieldsToOrder < ActiveRecord::Migration
  def change
    add_column :orders, :get_cents, :integer
    add_column :orders, :get_currency, :string
  end
end
