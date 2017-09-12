class Rate < ActiveRecord::Base

  belongs_to :ratable, polymorphic: true
  belongs_to :admin_user

  enum service_type: [ :pickup, :delivery ]
  enum source: [ :manual, :xml, :scraping, :test, :ratefeed, :api ]
  enum method: [ :absolute, :reference ]

  validates :sell, numericality: true, allow_nil: true
  validates :buy, numericality: true, allow_nil: true

=begin
  validates :currency, uniqueness: { scope: [:ratable_type, :ratable_id],
                                 message: "has already been defined" }, allow_nil: true, on: :create
=end

  before_update :currency_is_not_local
  before_update :change_to_reference_if_needed, if: ->(rate){ (rate.buy_markup_changed? && buy_markup.present?) or (rate.sell_markup_changed? && sell_markup.present?)  }
#  before_create :initialize_default_values

  def change_to_reference_if_needed
    if (self.buy_markup.present? and self.buy_markup > 0) or (self.sell_markup.present? and self.sell_markup > 0)
      self.method = 'reference'
    end
  end

  def method_color
    :orange if self.reference?
  end

  def update_by_params(params)

    return false unless self.ratable && (params[:buy] || params[:sell])

    updated_currency   = params[:currency]
    base_currency      = self.ratable.currency
    sell_param         = params[:sell].to_f
    buy_param          = params[:buy].to_f

    if params[:type].present? and params[:type] == 'reference'

      self.method      = 'reference'
      self.sell_markup = sell_param
      self.buy_markup  = buy_param

      reference_rate   = Money.default_bank.get_rate(base_currency, updated_currency)
      sell_factor      = 1 - (sell_param / 100)
      buy_factor       = 1 + (buy_param / 100)
      sell             = reference_rate * sell_factor
      buy              = reference_rate * buy_factor

    else

      self.method      = 'absolute'
      self.sell_markup = nil
      self.buy_markup  = nil

      sell             = !Currency.inverse?(base_currency) ? sell_param : (sell_param.to_i > 0 ? (1.0 / sell_param) : 0)
      buy              = !Currency.inverse?(base_currency) ? buy_param : (buy_param.to_i > 0 ? (1.0 / buy_param) : 0)

    end

    self.buy           = buy if params[:buy]  # if it's empty leave the current value intact
    self.sell          = sell if params[:sell]
    self.source        = 'api'
    self.last_update   = Time.now
    self.last_process  = 'api'
    self.save
    self.ratable.update(rates_source: 'api')
    true

  end

  def old_update_by_params(params)

    return false unless self.ratable && (params[:buy] || params[:sell])

    if params[:type].present? and params[:type] == 'reference'
      updated_currency = params[:currency]
      base_currency    = self.ratable.currency
      reference_rate   = Money.default_bank.get_rate(updated_currency, base_currency)
      sell_markup      = 1 + (params[:sell] / 100)
      buy_markdown     = 1 - (params[:buy] / 100)
      sell             = reference_rate * sell_markup
      buy              = reference_rate * buy_markdown
    else
      sell             = params[:sell]
      buy              = params[:buy]
    end

    self.buy = buy
    self.sell = sell
    self.source = 'ratefeed1'
    self.save
    self.ratable.update(rates_source: 'ratefeed')

  end

  def self.with(property, error)
    rate = Rate.new
    rate.errors.add(property, error)
    return rate
  end

  # If the referred chain/exchange doesnt already have a rate for the referred currency, it will be accepted iff there are other currencies with rates in our system
  def self.identify_by_either(params)

    return with 'parameters', 'missing' unless
          params[:currency].present?                            and
         (params[:buy].present? or params[:sell].present?)      and
         (params[:chain].present? or params[:name].present? or params[:id].present?)

    if params[:id]

      if chain = Chain.find_by(id: params[:id])
        rate = Rate.find_by(ratable_type: 'Chain', ratable_id: chain.id, currency: params[:currency])
        if rate
          return rate
        elsif Rate.find_by(ratable_type: 'Chain', ratable_id: chain.id)
          return Rate.new(ratable_type: 'Chain', ratable_id: chain.id, currency: params[:currency])
        else
          return with 'chain', 'no rates defined for that chain'
        end

      elsif exchange = Exchange.find_by(id: params[:id])
        rate = Rate.find_by(ratable_type: 'Exchange', ratable_id: exchange.id, currency: params[:currency])
        if rate
          return rate
        elsif Rate.find_by(ratable_type: 'Exchange', ratable_id: exchange.id)
          return Rate.new(ratable_type: 'Exchange', ratable_id: exchange.id, currency: params[:currency])
        else
          return with 'exchange', 'no rates defined for that exchange'
        end

      else
          return with 'id', 'no chain nor exchange exist with that id'
      end

    elsif params[:chain]

      if chain = Chain.find_by(name: params[:chain])
        rate = Rate.find_by(ratable_type: 'Chain', ratable_id: chain.id, currency: params[:currency])
        if rate
          return rate
        elsif Rate.find_by(ratable_type: 'Chain', ratable_id: chain.id)
          return Rate.new(ratable_type: 'Chain', ratable_id: chain.id, currency: params[:currency])
        else
          return with 'chain', 'no rates defined for that chain'
        end
      else
        return with 'chain', 'no sucn chain'
      end

    elsif params[:name]

      exchange = params[:nearest_station] ? Exchange.find_by(name: params[:name], nearest_station: params[:nearest_stration]) : Exchange.find_by(name: params[:name])

      if exchange
        rate = Rate.find_by(ratable_type: 'Exchange', ratable_id: exchange.id, currency: params[:currency])
        if rate
          return rate
        elsif Rate.find_by(ratable_type: 'Exchange', ratable_id: exchange.id)
          return Rate.new(ratable_type: 'Exchange', ratable_id: exchange.id, currency: params[:currency])
        else
          return with 'exchange', 'no rates defined for that exchange'
        end
      else
        return with 'exchange', 'no such exchange'
      end

    end

  end

  def display_name
    split = $request.path.split('/')
    if split[2] == 'exchanges' and split[3]
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
