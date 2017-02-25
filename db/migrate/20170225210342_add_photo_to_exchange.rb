class AddPhotoToExchange < ActiveRecord::Migration[5.0]
  def change
    add_column :exchanges, :photo, :string
  end
end
