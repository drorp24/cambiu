class Rate < ActiveRecord::Base
  belongs_to :exchange
  monetize :buy_cents, with_model_currency: :buy_currency  
  monetize :pay_cents, with_model_currency: :pay_currency  
  monetize :up_to_cents, with_model_currency: :up_to_currency 
  enum category: [ :walkin, :pickup, :delivery ] 
  enum source: [ :phone, :api, :scraping ]
  
  def category=(c)
    c_i = c.to_i
    @category=c.to_i if c_i.is_a? Integer and c_i != 0
    super(@category)
  end 

  def source=(s)
    s_i = s.to_i
    @source = s.to_i if s_i.is_a? Integer and s_i != 0
    super(@category)
  end
end
