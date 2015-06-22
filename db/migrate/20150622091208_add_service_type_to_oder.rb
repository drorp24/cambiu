class AddServiceTypeToOder < ActiveRecord::Migration
  def change
    add_column :orders, :service_type, :integer
  end
end
