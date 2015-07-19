class AddRatesSourceToChain < ActiveRecord::Migration
  def change
    add_column :chains, :rates_source, :integer
  end
end
