class AddCreditToExchange < ActiveRecord::Migration[5.0]
  def change
    add_column :exchanges, :credit, :boolean, index: true, default: false
    remove_column :exchanges, :card
  end
end
