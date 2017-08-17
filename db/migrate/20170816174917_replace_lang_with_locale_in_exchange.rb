class ReplaceLangWithLocaleInExchange < ActiveRecord::Migration[5.0]
  def change
    add_column :exchanges, :locale, :string
    remove_column :exchanges, :lang
  end
end