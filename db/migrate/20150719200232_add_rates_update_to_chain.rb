class AddRatesUpdateToChain < ActiveRecord::Migration
  def change
    add_column :chains, :rates_update, :datetime
    remove_column :chains, :prices_published
  end
end
