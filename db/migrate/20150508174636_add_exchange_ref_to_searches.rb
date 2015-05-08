class AddExchangeRefToSearches < ActiveRecord::Migration
  def change
    add_reference :searches, :exchange, index: true
  end
end
