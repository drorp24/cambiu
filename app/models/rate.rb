class Rate < ActiveRecord::Base
  belongs_to :exchange
  monetize :buy_cents, with_model_currency: :buy_currency  
  monetize :pay_cents, with_model_currency: :pay_currency  
  monetize :up_to_cents, with_model_currency: :up_to_currency 
  enum category: [ :walkin, :pickup, :delivery ] 
  enum source: [ :phone, :api, :scraping ]

  def self.create_template(exchange_id)
    Rate.create(exchange_id: exchange_id, category: 0, source: 0, buy_cents: 100, pay_cents: 0, up_to_cents: 0)
  end
end
