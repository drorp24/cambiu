class AddRatesErrorToExchange < ActiveRecord::Migration[5.0]
  def change
    add_column :exchanges, :rates_error, :text
    add_column :exchanges, :rates_update, :datetime
  end
end
