class AddStatusDateToExchange < ActiveRecord::Migration[5.0]
  def change
    add_column :exchanges, :status_date, :date
  end
end
