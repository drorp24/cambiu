class AddServiceFieldsToExchange < ActiveRecord::Migration[5.0]
  def change
    add_column :exchanges, :service_type, :integer
    add_column :exchanges, :payment_method, :integer
  end
end
