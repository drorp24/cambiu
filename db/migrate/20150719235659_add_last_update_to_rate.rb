class AddLastUpdateToRate < ActiveRecord::Migration
  def change
    add_column :rates, :last_update, :datetime
  end
end
