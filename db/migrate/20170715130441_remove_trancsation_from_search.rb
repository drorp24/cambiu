class RemoveTrancsationFromSearch < ActiveRecord::Migration[5.0]
  def change
    remove_column :searches, :transaction, :string
  end
end
