class AddCountryAndOpensAndClosesAndUserRatingsToExchange < ActiveRecord::Migration
  def change
    add_column :exchanges, :country, :string
    add_column :exchanges, :user_ratings, :float
    add_column :exchanges, :opens, :time
    add_column :exchanges, :closes, :time
  end
end
