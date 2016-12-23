class AddAndRemoveFieldsToExchange < ActiveRecord::Migration
  def change
    add_column    :exchanges, :contact, :string
    add_column    :exchanges, :comment, :text
    add_column    :exchanges, :workday_open, :time
    add_column    :exchanges, :workday_close, :time
    add_column    :exchanges, :saturday_open, :time
    add_column    :exchanges, :saturday_close, :time
    add_column    :exchanges, :sunday_open, :time
    add_column    :exchanges, :sunday_close, :time

    remove_column :exchanges, :opens
    remove_column :exchanges, :closes
    remove_column :exchanges, :note
    remove_column :exchanges, :addr_country
    remove_column :exchanges, :addr_city
    remove_column :exchanges, :addr_street
    remove_column :exchanges, :addr_housename
    remove_column :exchanges, :addr_housenumber
    remove_column :exchanges, :addr_postcode
    remove_column :exchanges, :addr_unit
    remove_column :exchanges, :osm_id
    remove_column :exchanges, :atm
    remove_column :exchanges, :airport
    remove_column :exchanges, :directory
    remove_column :exchanges, :accessible
    remove_column :exchanges, :upload_id
    remove_column :exchanges, :logo
  end
end
