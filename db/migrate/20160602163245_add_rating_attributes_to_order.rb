class AddRatingAttributesToOrder < ActiveRecord::Migration
  def change
    add_column :orders, :base_currency, :string
    add_column :orders, :rated_currency, :string
    add_column :orders, :buy_rate, :float
    add_column :orders, :sell_rate, :float
  end
end
