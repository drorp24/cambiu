class RenameHashInSearch < ActiveRecord::Migration
  def change
    rename_column :searches, :hash, :rest
  end
end
