class ReplaceDeliveryFieldsInExchange < ActiveRecord::Migration[5.0]
  def change
    add_column    :exchanges, :delivery_nw_lat, :float
    add_column    :exchanges, :delivery_nw_lng, :float
    add_column    :exchanges, :delivery_se_lat, :float
    add_column    :exchanges, :delivery_se_lng, :float
    remove_column :exchanges, :delivery_polygon_a_lat
    remove_column :exchanges, :delivery_polygon_a_lng
    remove_column :exchanges, :delivery_polygon_b_lat
    remove_column :exchanges, :delivery_polygon_b_lng
    remove_column :exchanges, :delivery_polygon_c_lat
    remove_column :exchanges, :delivery_polygon_c_lng
    remove_column :exchanges, :delivery_polygon_d_lat
    remove_column :exchanges, :delivery_polygon_d_lng
    
  end
end
