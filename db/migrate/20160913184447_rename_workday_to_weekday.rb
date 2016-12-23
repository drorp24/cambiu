class RenameWorkdayToWeekday < ActiveRecord::Migration
  def change
    rename_column :'exchanges.js', :workday_open, :weekday_open
    rename_column :'exchanges.js', :workday_close, :weekday_close
  end
end
