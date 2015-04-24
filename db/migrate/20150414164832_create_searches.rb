class CreateSearches < ActiveRecord::Migration
  def change
    create_table :searches do |t|
      t.string :pay_currency
      t.string :buy_currency
      t.string :pay_amount
      t.string :buy_amount
      t.string :location
      t.string :user_lat
      t.string :user_lng
      t.string :user_location
      t.decimal :distance
      t.string :distance_unit
      t.string :sort

      t.timestamps
    end
  end
end
