class RemoveUserRequestFieldsFromSearch < ActiveRecord::Migration[5.0]
  def change
    remove_column :searches, :user_service_type
    remove_column :searches, :user_payment_method
    remove_column :searches, :user_radius
  end
end
