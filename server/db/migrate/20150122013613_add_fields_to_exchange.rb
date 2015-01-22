class AddFieldsToExchange < ActiveRecord::Migration
  def change
    add_column :exchanges, :website, :string
    add_column :exchanges, :wheelchair, :boolean
    add_column :exchanges, :email, :string
    add_column :exchanges, :note, :text
    add_column :exchanges, :opening_hours, :text
    add_column :exchanges, :phone, :string
    add_column :exchanges, :addr_country, :string
    add_column :exchanges, :addr_city, :string
    add_column :exchanges, :addr_street, :string
    add_column :exchanges, :addr_housename, :string
    add_column :exchanges, :addr_housenumber, :string
    add_column :exchanges, :addr_postcode, :string
    add_column :exchanges, :addr_unit, :string
    add_column :exchanges, :osm_id, :string
    add_column :exchanges, :atm, :boolean
    add_column :exchanges, :source, :string
  end
end
