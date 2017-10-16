class AddResultFieldsToSearchAsStrings < ActiveRecord::Migration[5.0]
  def change
    add_column :searches, :result_service_type, :string
    add_column :searches, :result_payment_method, :string
  end
end
