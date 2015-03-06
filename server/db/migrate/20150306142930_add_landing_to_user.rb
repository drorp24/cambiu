class AddLandingToUser < ActiveRecord::Migration
  def change
    add_column :users, :landing, :string
  end
end
