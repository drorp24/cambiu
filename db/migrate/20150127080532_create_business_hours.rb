class CreateBusinessHours < ActiveRecord::Migration
  def change
    create_table :business_hours do |t|
      t.references :exchange, index: true
      t.integer :day
      t.time :open_time
      t.time :close_time

      t.timestamps
    end
  end
end
