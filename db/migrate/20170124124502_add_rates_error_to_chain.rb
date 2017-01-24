class AddRatesErrorToChain < ActiveRecord::Migration[5.0]
  def change
    add_column :chains, :rates_error, :text
  end
end