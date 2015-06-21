class AddServiceTypeToSearch < ActiveRecord::Migration
  def change
    add_column :searches, :service_type, :integer, default: 0
  end
end
