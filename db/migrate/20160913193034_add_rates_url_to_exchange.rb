class AddRatesUrlToExchange < ActiveRecord::Migration
  def change
    add_column :exchanges, :rates_url, :string
  end
end
