class Upload < ActiveRecord::Base
  belongs_to :admin_user
  has_many   :'exchanges.js'
end
