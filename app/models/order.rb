class Order < ActiveRecord::Base
  belongs_to :exchange
  belongs_to :user

  monetize :pay_cents, with_model_currency: :pay_currency, :allow_nil => true
  monetize :buy_cents, with_model_currency: :buy_currency, :allow_nil => true

  enum status: [ :produced, :used ]

  # This is the way to include any non-model I want in the JSON response
  def attributes
    super.merge(expiry_s: self.expiry_s, voucher: self.voucher)
  end

  before_create do
    self.expiry = 2.hours.from_now
  end


  def buy=(edited)
    money             = Monetize.parse(edited)
    self.buy_cents    = money.fractional
    self.buy_currency = money.currency.iso_code
  end

  def pay=(edited)
    money             = Monetize.parse(edited)
    self.pay_cents    = money.fractional
    self.pay_currency = money.currency.iso_code
  end

  def expiry_s
    self.expiry.to_s(:short)
  end

  def voucher
    (self.id + 80000).to_s
  end

=begin
  def pay_amount
    @pay.amount
  end

  def buy_amount
    @buy.amount
  end

  def pay_amount=(amount)
    @pay_cents = amount * 100
  end

  def buy_amount=(amount)
    @buy_cents = amount * 100
  end
=end

end
