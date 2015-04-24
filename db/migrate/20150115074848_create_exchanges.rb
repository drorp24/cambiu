class CreateExchanges < ActiveRecord::Migration
  def change
    create_table :exchanges do |t|
      t.string :name
      t.string :address

      t.timestamps
    end
  end
end
