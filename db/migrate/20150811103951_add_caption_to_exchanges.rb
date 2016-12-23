class AddCaptionToExchanges < ActiveRecord::Migration
  def change
    add_column :'exchanges.js', :caption, :string
  end
end
