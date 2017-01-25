class AddSearchIdToError < ActiveRecord::Migration[5.0]
  def change
    add_reference :errors, :search, foreign_key: true
  end
end
