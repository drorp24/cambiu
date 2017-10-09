class AddResultsFieldsToSearch < ActiveRecord::Migration[5.0]
  def change
    add_column :searches,     :radius, :float
    add_reference :searches,  :bias_exchange
    add_reference :searches,  :result_exchange
    add_column :searches,     :result_grade, :float
    add_column :searches,     :result_service_type, :integer
    add_column :searches,     :result_payment_method, :integer
    remove_column :searches, :distance
    remove_column :searches, :distance_unit
    remove_column :searches, :sort
    remove_column :searches, :page
    remove_column :searches, :rest
    remove_column :searches, :email
    remove_column :searches, :host
    remove_column :searches, :best_grade
    remove_column :searches, :exchange_id
  end
end
