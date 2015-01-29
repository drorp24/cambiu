class CreateRates < ActiveRecord::Migration
  def change
    create_table :rates do |t|
      t.references :exchange, index: true
      t.integer :buy_cents
      t.string :buy_currency
      t.integer :pay_cents
      t.string :pay_currency
      t.string :source

      t.timestamps
    end
  end
end
