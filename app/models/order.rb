class Order < ActiveRecord::Base
  belongs_to :exchange
  belongs_to :user

  monetize :pay_cents, with_model_currency: :pay_currency, :allow_nil => true
  monetize :buy_cents, with_model_currency: :buy_currency, :allow_nil => true

  enum status: [ :produced, :used ]

  before_create do
    self.expiry = 2.hours.from_now
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
