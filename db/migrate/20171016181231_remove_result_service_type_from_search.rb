class RemoveResultServiceTypeFromSearch < ActiveRecord::Migration[5.0]
  def change
    remove_column :searches, :result_service_type
    remove_column :searches, :result_payment_method
  end
end
