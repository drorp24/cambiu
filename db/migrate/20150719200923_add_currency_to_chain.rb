class AddCurrencyToChain < ActiveRecord::Migration
  def change
    add_column :chains, :currency, :string
  end
end
