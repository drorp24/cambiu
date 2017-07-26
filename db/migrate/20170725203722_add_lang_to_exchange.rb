class AddLangToExchange < ActiveRecord::Migration[5.0]
  def change
    add_column :exchanges, :lang, :string
  end
end
