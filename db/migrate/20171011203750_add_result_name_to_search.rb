class AddResultNameToSearch < ActiveRecord::Migration[5.0]
  def change
    add_column :searches, :result_name, :string
  end
end
