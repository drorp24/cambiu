class AddSearchRefToOrder < ActiveRecord::Migration
  def change
    add_reference :orders, :search, index: true, foreign_key: true
  end
end
