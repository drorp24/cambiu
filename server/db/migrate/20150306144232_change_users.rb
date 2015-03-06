class ChangeUsers < ActiveRecord::Migration
  def change
    remove_column :users, :buy_cents
    remove_column :users, :pay_cents
    add_column :users, :buy_amount, :string
    add_column :users, :pay_amount, :string
  end
end
