class AddChainToRate < ActiveRecord::Migration
  def change
    add_reference :rates, :chain, index: true
  end
end
