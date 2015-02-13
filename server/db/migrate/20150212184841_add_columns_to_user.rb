class AddColumnsToUser < ActiveRecord::Migration
  def change
    add_column :users, :buy_cents, :integer
    add_column :users, :buy_currency, :string
    add_column :users, :pay_cents, :integer
    add_column :users, :pay_currency, :string
  end
end
