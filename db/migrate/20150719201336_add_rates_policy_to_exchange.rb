class AddRatesPolicyToExchange < ActiveRecord::Migration
  def change
    add_column :exchanges, :rates_policy, :integer
  end
end
