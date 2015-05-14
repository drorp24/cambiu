class CreateOrders < ActiveRecord::Migration
  def change
    create_table :orders do |t|
      t.references :exchange, index: true
      t.references :user, index: true
      t.string :email
      t.datetime :expiry
      t.integer :status, default: 0
      t.integer :pay_cents
      t.string :pay_currency
      t.integer :buy_cents
      t.string :buy_currency

      t.timestamps
    end
  end
end
