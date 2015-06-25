class AddCurrencyToExchange < ActiveRecord::Migration
  def change
    add_column :exchanges, :currency, :string
  end
end
