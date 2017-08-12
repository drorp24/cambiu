class AddIndicesToDeliveryAreaInExchange < ActiveRecord::Migration[5.0]
  def change
    add_index  :exchanges, :delivery_nw_lat
    add_index  :exchanges, :delivery_nw_lng
    add_index  :exchanges, :delivery_se_lat
    add_index  :exchanges, :delivery_se_lng
  end
end
