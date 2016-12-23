class AddFieldsToExchange < ActiveRecord::Migration
  def change
    add_column :'exchanges.js', :website, :string
    add_column :'exchanges.js', :wheelchair, :boolean
    add_column :'exchanges.js', :email, :string
    add_column :'exchanges.js', :note, :text
    add_column :'exchanges.js', :opening_hours, :text
    add_column :'exchanges.js', :phone, :string
    add_column :exchanges, :addr_country, :string
    add_column :exchanges, :addr_city, :string
    add_column :exchanges, :addr_street, :string
    add_column :'exchanges.js', :addr_housename, :string
    add_column :'exchanges.js', :addr_housenumber, :string
    add_column :'exchanges.js', :addr_postcode, :string
    add_column :'exchanges.js', :addr_unit, :string
    add_column :'exchanges.js', :osm_id, :string
    add_column :'exchanges.js', :atm, :boolean
    add_column :exchanges, :source, :string
  end
end
