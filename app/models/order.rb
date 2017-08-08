class Order < ActiveRecord::Base
  belongs_to :exchange
  belongs_to :user
  belongs_to :search
  has_many   :emails, as: :emailable

  monetize :pay_cents, with_model_currency: :pay_currency, :allow_nil => true
  monetize :buy_cents, with_model_currency: :buy_currency, :allow_nil => true
  monetize :get_cents, with_model_currency: :get_currency, :allow_nil => true

  enum status: [:ordered, :confirmed, :pictured]
  enum service_type: [ :pickup, :delivery ]
  enum payment_method: [ :cash, :credit, :all_payment_methods]


  before_create do
    self.expiry = 4.hours.from_now
    self.service_type = 'pickup' unless self.service_type.present?
  end

  after_commit   :notification

  attr_accessor :photo


  def with_user

    return {error: 'No user for order'} unless user = User.find(self.user_id)

    self.slice('id', 'exchange_id', 'voucher', 'pay_cents', 'pay_currency', 'payment_method', 'service_type', 'search_id', 'user_id', ).
         merge(user.attributes.except(
            'id', 'created_at', 'updated_at', 'current_sign_in_at', 'current_sign_in_ip', 'encrypted_password', 'last_sign_in_at', 'last_sign_in_ip',
            'remember_created_at', 'reset_password_sent_at', 'reset_password_token', 'sign_in_count')
        )
  end

  def status_color
    [:orange, :green, :blue][Order.statuses[status]]
  end

  def requires_notification?
    Rails.env.production? || pictured?
  end

  def notification
    puts "about to notify"
    NotifyJob.perform_later(self, self.photo) #if self.requires_notification?
  end

  # Overriding 'attributes' adds methods as additional attributes within the JSON response as if they were part of the DB model, enabling controller to respond_with @order
  # except doesn't remove unwanted keys though
  def attributes
    super.merge(expiry_t: self.expiry_t, expiry_s: self.expiry_s, voucher: self.voucher, mandrill_status: self.mandrill_status, mandrill_reject_reason: self.mandrill_reject_reason).except(:order_created_at, :order_updated_at, :order_expiry)
  end

  def mandrill_status
    @last_email ||= emails.last
    @last_email.status if @last_email
  end

  def mandrill_reject_reason
    @last_email ||= emails.last
    @last_email.reject_reason if @last_email
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

end
