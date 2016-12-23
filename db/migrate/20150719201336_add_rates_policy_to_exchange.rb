class AddRatesPolicyToExchange < ActiveRecord::Migration
  def change
    add_column :'exchanges.js', :rates_policy, :integer
  end
end
