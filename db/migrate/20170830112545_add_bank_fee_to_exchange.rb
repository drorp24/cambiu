class AddBankFeeToExchange < ActiveRecord::Migration[5.0]
  def change
    add_column :exchanges, :bank_fee, :float
  end
end
