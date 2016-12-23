class AddRatesSourceToExchange < ActiveRecord::Migration
  def change
    add_column :'exchanges.js', :rates_source, :integer
  end
end
