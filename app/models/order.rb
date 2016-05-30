class Order < ActiveRecord::Base
  belongs_to :exchange
  belongs_to :user
  belongs_to :search
  has_many   :emails, as: :emailable

  monetize :pay_cents, with_model_currency: :pay_currency, :allow_nil => true
  monetize :buy_cents, with_model_currency: :buy_currency, :allow_nil => true
  monetize :get_cents, with_model_currency: :get_currency, :allow_nil => true

  enum status: [:offer, :produced, :used, :pictured ]
  enum service_type: [ :collection, :delivery ]

  attr_accessor :photo

  before_create do
    self.expiry = 4.hours.from_now
  end


  after_commit   :order_notification

  def order_notification
    return unless Rails.application.config.email_required
    response = OrderMailer.notify(self).deliver_now #if self.status_changed?       # without .deliver_now, OrderMailer.notify is not invoked but on the second call
    logger.info "order.rb - OrderMailer.notify response:"
    logger.info response
    logger.info ""
   end

  # Overriding 'attributes' adds methods as additional attributes within the JSON response as if they were part of the DB model, enabling controller to respond_with @order
  # except doesn't remove unwanted keys though
  def attributes
    super.merge(expiry_s: self.expiry_s, voucher: self.voucher, mandrill_status: self.mandrill_status, mandrill_reject_reason: self.mandrill_reject_reason).except(:order_created_at, :order_updated_at, :order_expiry)
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

  def voucher
    (self.id + 80000).to_s
  end



end
