class AddBiasToSearch < ActiveRecord::Migration[5.0]
  def change
    add_column :searches, :bias, :string
    add_column :searches, :result_bias, :string
  end
end
