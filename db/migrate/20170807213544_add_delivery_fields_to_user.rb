class AddDeliveryFieldsToUser < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :phone, :string
    add_column :users, :company, :string
    add_column :users, :city, :string
    add_column :users, :street, :string
    add_column :users, :house, :string
    add_column :users, :entry, :string
    add_column :users, :floor, :string
    add_column :users, :apartment, :string
    remove_column :users, :buy_currency
    remove_column :users, :pay_currency
    remove_column :users, :uid
    remove_column :users, :name
    remove_column :users, :image
    remove_column :users, :gender
    remove_column :users, :timezone
    remove_column :users, :guest
    remove_column :users, :buy_amount
    remove_column :users, :pay_amount
    remove_column :users, :latitude
    remove_column :users, :longitude
    remove_column :users, :bbox
    remove_column :users, :location_search
    remove_column :users, :location
    remove_column :users, :geocoded_location
  end
end
