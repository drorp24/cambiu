class RenameRateColumn < ActiveRecord::Migration
  def change
    rename_column :rates, :for, :category
  end
end
