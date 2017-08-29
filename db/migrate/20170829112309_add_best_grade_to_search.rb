class AddBestGradeToSearch < ActiveRecord::Migration[5.0]
  def change
    add_column :searches, :best_grade, :float
  end
end
