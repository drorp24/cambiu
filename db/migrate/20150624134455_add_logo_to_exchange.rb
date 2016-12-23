class AddLogoToExchange < ActiveRecord::Migration
  def change
    add_column :'exchanges.js', :logo, :string
  end
end
