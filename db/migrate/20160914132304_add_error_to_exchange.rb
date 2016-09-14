class AddErrorToExchange < ActiveRecord::Migration
  def change
    add_column :exchanges, :error, :string
  end
end
