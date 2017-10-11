class AddResultDistanceToSearch < ActiveRecord::Migration[5.0]
  def change
    add_column :searches, :result_distance, :float
  end
end
