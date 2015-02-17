class AddFields1ToRate < ActiveRecord::Migration
  def change
    add_column :rates, :for, :integer
    add_column :rates, :up_to_cents, :integer
    add_column :rates, :up_to_currency, :string
  end
end
