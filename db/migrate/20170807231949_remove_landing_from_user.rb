class RemoveLandingFromUser < ActiveRecord::Migration[5.0]
  def change
    remove_column :users, :landing
    remove_column :users, :provider
  end
end
