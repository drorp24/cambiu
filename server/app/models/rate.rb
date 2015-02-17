class Rate < ActiveRecord::Base
  belongs_to :exchange
  monetize :buy_cents, with_model_currency: :buy_currency  
  monetize :pay_cents, with_model_currency: :pay_currency  
  monetize :up_to_cents, with_model_currency: :pay_currency 
  enum category: [ :walkin, :pickup, :delivery ] 

end
