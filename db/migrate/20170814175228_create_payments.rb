class CreatePayments < ActiveRecord::Migration[5.0]
  def change
    create_table :payments do |t|
      t.string :authNumber
      t.string :cardToken
      t.string :cardMask
      t.string :cardExp
      t.string :txId
      t.string :uniqueID
      t.references :order, foreign_key: true

      t.timestamps
    end
  end
end
