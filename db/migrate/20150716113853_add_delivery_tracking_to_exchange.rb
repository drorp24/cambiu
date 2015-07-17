class AddDeliveryTrackingToExchange < ActiveRecord::Migration
  def change
    add_column :exchanges, :delivery_tracking, :string
  end
end
