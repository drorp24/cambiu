class CreateVisitors < ActiveRecord::Migration
  def change
    create_table :visitors do |t|
      t.integer :buy_cents
      t.string :buy_currency
      t.integer :pay_cents
      t.string :pay_currency

      t.timestamps
    end
  end
end
