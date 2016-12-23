class AddLogoToExchange < ActiveRecord::Migration
  def change
    add_column :exchanges, :logo, :string
  end
end
