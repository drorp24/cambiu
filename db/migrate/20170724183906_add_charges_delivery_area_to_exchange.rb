class AddChargesDeliveryAreaToExchange < ActiveRecord::Migration[5.0]
  def change
    add_column :exchanges, :cc_fee,                 :float
    add_column :exchanges, :delivery_charge,        :float
    add_column :exchanges, :delivery,               :boolean, index: true, default: false
    add_column :exchanges, :card,                   :boolean, index: true, default: false
    add_column :exchanges, :delivery_polygon_a_lat, :float
    add_column :exchanges, :delivery_polygon_a_lng, :float
    add_column :exchanges, :delivery_polygon_b_lat, :float
    add_column :exchanges, :delivery_polygon_b_lng, :float
    add_column :exchanges, :delivery_polygon_c_lat, :float
    add_column :exchanges, :delivery_polygon_c_lng, :float
    add_column :exchanges, :delivery_polygon_d_lat, :float
    add_column :exchanges, :delivery_polygon_d_lng, :float
    remove_column :exchanges, :service_type
    remove_column :exchanges, :payment_method
  end
end
