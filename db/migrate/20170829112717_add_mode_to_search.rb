class AddModeToSearch < ActiveRecord::Migration[5.0]
  def change
    add_column :searches, :mode, :integer
  end
end
