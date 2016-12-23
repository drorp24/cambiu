class AddManyFieldsToExchange < ActiveRecord::Migration
  def change
    add_column    :exchanges, :business_type, :integer
    add_reference :exchanges, :chain, index:true
    add_column    :exchanges, :city, :string
    add_column    :exchanges, :region, :string
    add_column    :exchanges, :rating, :float
    add_column    :exchanges, :nearest_station, :string
    add_column    :exchanges, :airport, :boolean
    add_column    :exchanges, :directory, :string
    add_column    :exchanges, :accessible, :boolean
    add_reference :exchanges, :upload
    add_reference :exchanges, :admin_user
    remove_column :exchanges, :user_ratings
    remove_column :exchanges, :wheelchair
    remove_column :exchanges, :opening_hours   
  end
end
