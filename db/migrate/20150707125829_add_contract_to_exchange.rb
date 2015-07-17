class AddContractToExchange < ActiveRecord::Migration
  def change
    add_column :exchanges, :contract, :boolean
  end
end
