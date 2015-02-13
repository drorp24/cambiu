class AddDefaultsToUsers < ActiveRecord::Migration
  def change
    change_column :users, :buy_cents, :integer, default: 0
    change_column :users, :pay_cents, :integer, default: 0
  end
end
