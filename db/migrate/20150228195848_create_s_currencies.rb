class CreateSCurrencies < ActiveRecord::Migration
  def change
    create_table :s_currencies do |t|
      t.references :source, index: true
      t.string :name
      t.string :iso_code

      t.timestamps
    end
  end
end
