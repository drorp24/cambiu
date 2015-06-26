class AddAdminUserToRate < ActiveRecord::Migration
  def change
    add_reference :rates, :admin_user, index: true
  end
end
