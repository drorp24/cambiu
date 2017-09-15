class AddValuesToSearch < ActiveRecord::Migration[5.0]
  def change
    add_column :searches, :values, :integer
  end
end
