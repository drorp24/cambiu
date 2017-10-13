class AddUserRequestFieldsToSearch < ActiveRecord::Migration[5.0]
  def change
    add_column :searches, :user_service_type,   :string
    add_column :searches, :user_payment_method, :string
    add_column :searches, :user_radius,         :float
    add_column :searches, :result_count,        :integer
    add_column :searches, :result_exchange_name, :string
    add_column :searches, :result_radius,       :float

    remove_column :searches, :result_name
  end
end
