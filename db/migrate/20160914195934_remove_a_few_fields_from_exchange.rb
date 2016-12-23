class RemoveAFewFieldsFromExchange < ActiveRecord::Migration
  def change
    remove_column :exchanges, :caption
    remove_column :exchanges, :verified
    remove_column :exchanges, :delivery_tracking
    remove_column :exchanges, :source
  end
end
