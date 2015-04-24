class Rate < ActiveRecord::Base
  belongs_to :exchange
  belongs_to :chain
  monetize :buy_cents, with_model_currency: :buy_currency  
  monetize :pay_cents, with_model_currency: :pay_currency  
  monetize :up_to_cents, with_model_currency: :up_to_currency 
  enum category: [ :walkin, :pickup, :delivery ] 
  enum source: [ :phone, :api, :scraping ]

  before_validation :initialize_default_values

  def self.refresh(chain_id, buy_currency, buy_cents, pay_currency, pay_cents)
    rate = self.find_or_initialize_by(chain_id: chain_id, buy_currency: buy_currency, pay_currency: pay_currency)
    rate.update(buy_cents: buy_cents, pay_cents: pay_cents)
  end

  def self.create_template(exchange_id)     #TODO: Delete
    Rate.create(exchange_id: exchange_id, category: 0, source: 0, buy_cents: 100, pay_cents: 0, up_to_cents: 0)
  end

  protected

  def initialize_default_values
    self.category     ||= 0
    self.source       ||= 0
    self.buy_cents    ||= 100
    self.pay_cents    ||= 0
    self.up_to_cents  ||= 0
  end
end
