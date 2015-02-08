class Visitor < ActiveRecord::Base
  monetize :buy_cents
  monetize :pay_cents
end
