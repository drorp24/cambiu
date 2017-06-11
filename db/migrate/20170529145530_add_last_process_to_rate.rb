class AddLastProcessToRate < ActiveRecord::Migration[5.0]
  def change
    add_column :rates, :last_process, :string
  end
end
