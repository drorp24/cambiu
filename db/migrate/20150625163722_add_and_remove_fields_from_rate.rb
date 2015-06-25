class AddAndRemoveFieldsFromRate < ActiveRecord::Migration
  def change
    remove_column :rates, :exchange_id, :integer
    remove_column :rates, :chain_id, :integer
    add_reference :rates, :ratable, polymorphic: true, index: true
    remove_column :rates, :buy_cents, :integer
    remove_column :rates, :buy_currency, :string
    remove_column :rates, :pay_cents, :integer
    remove_column :rates, :pay_currency, :string
    remove_column :rates, :category, :integer
    remove_column :rates, :up_to_cents, :integer
    remove_column :rates, :up_to_currency, :string
    add_column    :rates, :service_type, :integer
    add_column    :rates, :currency, :string
    add_column    :rates, :buy, :float
    add_column    :rates, :sell, :float
  end
end
