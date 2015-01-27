class ChangeIndicesInBusinessHour < ActiveRecord::Migration
  def change
    remove_index     :business_hours, name: "index_business_hours_on_id_and_day"
    add_index        :business_hours, [:exchange_id, :day]
  end
end
