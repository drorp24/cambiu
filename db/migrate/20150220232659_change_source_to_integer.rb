class ChangeSourceToInteger < ActiveRecord::Migration
  def change
    change_column :rates, :source, 'integer USING CAST("source" AS integer)' 
  end
end
