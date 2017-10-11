class AddResultCachedToSearch < ActiveRecord::Migration[5.0]
  def change
    add_column :searches, :result_cached, :boolean
  end
end
