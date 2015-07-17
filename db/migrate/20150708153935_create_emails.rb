class CreateEmails < ActiveRecord::Migration
  def change
    create_table :emails do |t|
      t.references :emailable, polymorphic: true, index: true
      t.string :from
      t.string :to
      t.string :status
      t.string :mandrill_id
      t.string :reject_reason
      t.integer :order_status

      t.timestamps null: false
    end
  end
end
