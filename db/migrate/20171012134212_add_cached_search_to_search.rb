class AddCachedSearchToSearch < ActiveRecord::Migration[5.0]
  def change
    add_column :searches, :result_cached_search_id, :integer
  end
end
