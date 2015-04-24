class Chain < ActiveRecord::Base
  has_many :exchanges
  has_many :rates
end
