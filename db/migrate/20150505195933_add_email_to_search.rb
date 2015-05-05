class AddEmailToSearch < ActiveRecord::Migration
  def change
    add_column :searches, :email, :string
    add_column :searches, :host, :string
  end
end
