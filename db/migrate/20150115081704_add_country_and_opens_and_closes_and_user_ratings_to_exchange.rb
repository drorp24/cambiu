class AddCountryAndOpensAndClosesAndUserRatingsToExchange < ActiveRecord::Migration
  def change
    add_column :exchanges, :country, :string
    add_column :'exchanges.js', :user_ratings, :float
    add_column :'exchanges.js', :opens, :time
    add_column :exchanges, :closes, :time
  end
end
