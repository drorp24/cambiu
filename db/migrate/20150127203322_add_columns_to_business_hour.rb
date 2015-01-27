class AddColumnsToBusinessHour < ActiveRecord::Migration
  def change
    rename_column :business_hours, :open_time, :open1
    rename_column :business_hours, :close_time, :close1
    add_column    :business_hours, :open2, :time
    add_column    :business_hours, :close2, :time
    add_index     :business_hours, [:id, :day]
  end
end
