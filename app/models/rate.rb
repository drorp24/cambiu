class Rate < ActiveRecord::Base
  belongs_to :ratable, polymorphic: true
  belongs_to :admin_user
  enum service_type: [ :collection, :delivery ]
  enum source: [ :manual, :xml, :scraping, :fake ]
  validates :sell, numericality: true, allow_nil: true
  validates :buy, numericality: true, allow_nil: true
  validates :currency, uniqueness: { scope: [:ratable_type, :ratable_id],
                                 message: "has already been defined" }, allow_nil: true, on: :create
  before_update :currency_is_not_local
#  before_create :initialize_default_values

  def display_name
    split = $request.path.split('/')
    if split[2] == 'exchanges'
      return Exchange.find_by_id(split[3]).name
    elsif split[2] == 'chains'
      return Chain.find_by_id(split[3]).name
    end
  end

  def currency_is_not_local
    if self.currency and self.ratable and self.currency == self.ratable.currency
      errors.add(:currency, "can't be the local currency")
    end
  end

  def source_s
    source.capitalize
  end

  def admin_user_s

    result = 'System'
    if admin_user_id
      if admin_user_rec = AdminUser.find_by_id(admin_user_id)
       result = admin_user_rec.email
      end
    end
    result

  end
  def admin_user_s=(val)
    self.admin_user_id=val
  end

  def buy_s
    ('%.4f' % buy).to_f if buy
  end
  def buy_s=(val)
    self.buy=val
  end

  def sell_s
    ('%.4f' % sell).to_f if sell
  end
  def sell_s=(val)
    self.sell=val
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
