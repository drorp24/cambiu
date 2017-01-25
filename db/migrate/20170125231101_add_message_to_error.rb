class AddMessageToError < ActiveRecord::Migration[5.0]
  def change
    add_column :errors, :message, :string
  end
end
