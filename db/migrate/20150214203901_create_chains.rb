class CreateChains < ActiveRecord::Migration
  def change
    create_table :chains do |t|
      t.text :name
      t.string :email
      t.string :url
      t.integer :plan
      t.string :phone
      t.string :prices_published

      t.timestamps
    end
  end
end
