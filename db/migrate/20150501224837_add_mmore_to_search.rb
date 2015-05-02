class AddMmoreToSearch < ActiveRecord::Migration
  def change
    add_column :searches, :page, :string
    add_column :searches, :hash, :string
  end
end
