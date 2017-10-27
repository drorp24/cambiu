class Order < ActiveRecord::Base
  belongs_to :exchange
  belongs_to :user
  belongs_to :search
  has_many   :emails, as: :emailable
  has_many   :payments

  monetize :pay_cents, with_model_currency: :pay_currency, :allow_nil => true
  monetize :buy_cents, with_model_currency: :buy_currency, :allow_nil => true
  monetize :get_cents, with_model_currency: :get_currency, :allow_nil => true
  monetize :credit_charge_cents, with_model_currency: :credit_charge_currency, :allow_nil => true
  monetize :delivery_charge_cents, with_model_currency: :delivery_charge_currency, :allow_nil => true

  enum status: [:ordered, :confirmed, :pictured, :registered, :paid]
  enum service_type: [ :pickup, :delivery ]
  enum payment_method: [ :cash, :credit, :all_payment_methods]


  before_create do
    self.expiry = 4.hours.from_now
    self.service_type = 'pickup' unless self.service_type.present?
  end

  after_commit   :notification

  attr_accessor :photo



  # Overriding 'attributes' adds methods as additional attributes within the JSON response as if they were part of the DB model, enabling controller to respond_with @order
  # except doesn't remove unwanted keys though
  def attributes

    super.merge(total_cents: self.total_cents, total_amount: self.total_amount, pay_amount: self.pay_amount, get_amount: self.get_amount, credit_charge_amount: self.credit_charge_amount, delivery_charge_amount: self.delivery_charge_amount,
                expiry_t: self.expiry_t, expiry_s: self.expiry_s, voucher: self.voucher).
        except('created_at', 'updated_at', 'expiry', 'buy_cents', 'get_cents', 'credit_charge_cents', 'delivery_charge_cents')
  end

  def with_user()

    return {error: 'No user for order'} unless user = User.find(self.user_id)

    self.attributes.
        merge(delivery_address: user.delivery_address, name: user.name).
        merge(user.attributes.except(
            'id', 'created_at', 'updated_at', 'current_sign_in_at', 'current_sign_in_ip', 'encrypted_password', 'last_sign_in_at', 'last_sign_in_ip',
            'remember_created_at', 'reset_password_sent_at', 'reset_password_token', 'sign_in_count', 'first_name', 'last_name')
        )

  end




  def status_color
    [:orange, :brown, :blue, :green, :red][Order.statuses[status]]
  end

  def requires_notification?
    true
  end

  def notification
    requires_notification = self.requires_notification?
    puts requires_notification ? "about to notify" : "will not notify"
    NotifyJob.perform_later(self, self.photo) if requires_notification
  end

  def mandrill_status
  end

  def mandrill_reject_reason
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

  def expiry_t
    self.expiry.to_s(:time)
  end

  def voucher
    (self.id + 80000).to_s
  end

  def pay_amount=(amt_with_currency)
    money             = Monetize.parse(amt_with_currency)
    self.pay_cents    = money.fractional
  end

  def buy_amount=(amt_with_currency)
    money             = Monetize.parse(amt_with_currency)
    self.buy_cents    = money.fractional
  end

  def get_amount=(amt_with_currency)
    money             = Monetize.parse(amt_with_currency)
    self.get_cents    = money.fractional
  end

  def credit_charge=(amt_with_currency)
    money             = Monetize.parse(amt_with_currency)
    self.credit_charge_cents    = money.fractional
    self.credit_charge_currency = self.pay_currency
  end

  def delivery_charge=(amt_with_currency)
    money             = Monetize.parse(amt_with_currency)
    self.delivery_charge_cents    = money.fractional
    self.delivery_charge_currency = self.pay_currency
  end

  def buy_amount
    self.buy.format if self.buy.present?
  end
  def pay_amount
    self.pay.format  if self.pay.present?
  end
  def get_amount
    self.get.format  if self.get.present?
  end
  def credit_charge_amount
    self.credit_charge.format  if self.credit_charge.present?
  end
  def delivery_charge_amount
    self.delivery_charge.format if self.delivery_charge.present?
  end

  def delivery_address
    return nil unless user = self.user
    return nil unless user.house && user.street && user.city
    "#{user.house} #{user.street}, #{user.city}"
  end

  def total_cents
    @total_cents = pay_cents + (credit_charge_cents || 0) + (delivery_charge_cents || 0)
  end

  def total_amount
     (self.total_cents / 100.0).to_money(self.pay_currency).format
  end

end
