class RemoveAFewFieldsFromExchange < ActiveRecord::Migration
  def change
    remove_column :'exchanges.js', :caption
    remove_column :'exchanges.js', :verified
    remove_column :'exchanges.js', :delivery_tracking
    remove_column :'exchanges.js', :source
  end
end
