class AddCaptionToExchanges < ActiveRecord::Migration
  def change
    add_column :exchanges, :caption, :string
  end
end
