class AddMarkupFieldsToRate < ActiveRecord::Migration[5.0]
  def change
    add_column :rates, :sell_markup, :float
    add_column :rates, :buy_markup, :float
    add_column :rates, :method, :integer
    add_index  :rates, :method
  end
end