class AddLocationReasonToSearch < ActiveRecord::Migration
  def change
    add_column :searches, :location_reason, :string
  end
end
