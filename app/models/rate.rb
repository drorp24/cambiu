class Rate < ActiveRecord::Base
  belongs_to :ratable, polymorphic: true
  belongs_to :admin_user
  enum service_type: [ :collection, :delivery ]
  enum source: [ :phone, :api, :scraping ]
  validates :sell, numericality: true, allow_nil: true
  validates :buy, numericality: true, allow_nil: true
  validates :currency, uniqueness: { scope: :ratable_id,
                                 message: "has already been defined" }
  validate :currency_is_not_local
#  before_create :initialize_default_values

  def currency_is_not_local
    if currency == ratable.currency
      errors.add(:currency, "can't be the exchange's local currency")
    end
  end

=begin
  def self.refresh(chain_id, buy_currency, buy_cents, pay_currency, pay_cents)
    rate = self.find_or_initialize_by(chain_id: chain_id, buy_currency: buy_currency, pay_currency: pay_currency)
    rate.update(buy_cents: buy_cents, pay_cents: pay_cents)
  end
=end

=begin
  def self.create_template(exchange_id)     #TODO: Delete
    Rate.create(exchange_id: exchange_id, category: 0, source: 0, buy_cents: 100, pay_cents: 0, up_to_cents: 0)
  end
=end

  protected

=begin
  def initialize_default_values
    self.service_type     ||= 0
    self.source           ||= 0
#    self.admin_user = current_admin_user if current_admin_user
  end
=end
end
