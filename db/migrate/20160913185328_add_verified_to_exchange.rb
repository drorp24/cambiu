class AddVerifiedToExchange < ActiveRecord::Migration
  def change
    add_column :exchanges, :verified, :boolean
  end
end
