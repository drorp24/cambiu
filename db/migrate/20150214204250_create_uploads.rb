class CreateUploads < ActiveRecord::Migration
  def change
    create_table :uploads do |t|
      t.integer :source_type
      t.string :file_location
      t.string :file_name
      t.integer :records_created
      t.integer :records_updated
      t.references :admin_user, index: true
      t.datetime :upload_start
      t.datetime :upload_finished
      t.integer :upload_status

      t.timestamps
    end
  end
end
