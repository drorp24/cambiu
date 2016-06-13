class CreateReviews < ActiveRecord::Migration
  def change
    create_table :reviews do |t|
      t.string :autor_name
      t.text :text
      t.integer :rating
      t.references :exchange, index: true, foreign_key: true

      t.timestamps null: false
    end
  end
end
