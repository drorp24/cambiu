class AddRatesSourceToExchange < ActiveRecord::Migration
  def change
    add_column :exchanges, :rates_source, :integer
  end
end
