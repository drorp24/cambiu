class Chain < ActiveRecord::Base
  has_many :exchanges
  has_many :rates, as: :ratable

end
