class AddTransToSearch < ActiveRecord::Migration[5.0]
  def change
    add_column :searches, :trans, :string
  end
end
