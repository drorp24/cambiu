# encoding: UTF-8

require 'tod'

class Exchange < ActiveRecord::Base
  has_many :searches
  has_many :orders
#  has_many :rates, through: :chain, as: :ratable

  belongs_to  :chain
  belongs_to  :admin_user

  has_many    :business_hours
  has_one     :open_today,  ->(date) {where(day: Date.today.wday)}  ,class_name: "BusinessHour"

  has_many    :rates,                                                               as: :ratable
  has_one     :gbp_rate,    -> {where(currency: 'GBP')}       ,class_name: "Rate",  as: :ratable
  has_one     :eur_rate,    -> {where(currency: 'EUR')}       ,class_name: "Rate",  as: :ratable
  has_one     :usd_rate,    -> {where(currency: 'USD')}       ,class_name: "Rate",  as: :ratable
  has_one     :aud_rate,    -> {where(currency: 'AUD')}       ,class_name: "Rate",  as: :ratable
  has_one     :cad_rate,    -> {where(currency: 'CAD')}       ,class_name: "Rate",  as: :ratable
  has_one     :jpy_rate,    -> {where(currency: 'JPY')}       ,class_name: "Rate",  as: :ratable
  has_one     :cny_rate,    -> {where(currency: 'CNY')}       ,class_name: "Rate",  as: :ratable
  has_one     :hkd_rate,    -> {where(currency: 'HKD')}       ,class_name: "Rate",  as: :ratable
  has_one     :ils_rate,    -> {where(currency: 'ILS')}       ,class_name: "Rate",  as: :ratable
  has_one     :nok_rate,    -> {where(currency: 'NOK')}       ,class_name: "Rate",  as: :ratable

  has_many    :reviews

  enum business_type: [ :exchange, :bank, :post_office, :other ]
  enum rates_source:  [ :no_rates, :test, :manual, :xml, :scraping ]
  enum rates_policy:  [:individual, :chain]
  enum todo:          [:verify, :call, :meet]
  enum system:        [:remove, :geocode, :error]
  enum status:        [:active, :removed]

  accepts_nested_attributes_for :business_hours
  accepts_nested_attributes_for :rates

  geocoded_by :address

#  validates :delivery_tracking, allow_blank: true, :format => {:with => URI.regexp}
  validates :rates_url, allow_blank: true, :format => {:with => URI.regexp}

  after_validation :do_geocoding, if: ->(exchange){ (exchange.latitude.blank? or exchange.address_changed?) and exchange.address.present? }

  scope :contract, -> { where(contract: true) }
  scope :no_contract, -> { where(contract: false) }
  scope :with_real_rates, -> { where("rates_source > 2") }
  scope :verified, -> {where.not(todo: 'verify')}
  scope :unverified, -> {where(todo: 'verify')}
  scope :rates, -> {where("rates_source > 2") }
  scope :no_rates, -> {where("rates_source <= 2") }
  scope :todo, -> {where.not(todo: nil) }
  scope :system, -> {where.not(system: nil) }


  def do_geocoding
    geocode
    self.system = nil if geocode?
  end

  def remove
    todo = nil if remove?
    removed!
  end

  def system_color
    [:grey, :black, :red][Exchange.systems[system]]
  end

  def todo_color
    [:orange, :blue, :green][Exchange.todos[todo]]
  end

  def status_color
    :black if removed?
  end

  def self.unexported_columns
    ["id", "created_at", "updated_at", "latitude", "longitude", "chain_id", "rating", "admin_user_id", "place_id", "error"]
  end

  def self.find_by_either(id, name)
    if id.present? && id != '0'
      return Exchange.find_by_id(id) || Exchange.new(error: "Exchange with id #{id} doesnt exist", system: 'error')
    elsif name
      return Exchange.find_by(name: name) || Exchange.create(name: name)
    end
  end

  def self.days
    ['weekday', 'saturday', 'sunday']
  end


  def rating=(rate)
    return if self.new_record?
    reviews.create(rating: rate)
    write_attribute(:rating, reviews.average(:rating))
  end

  def has_real_rates?
    !test? && !manual? && !no_rates?
  end

  def self.bad
    @bank ||= self.bank.first
  end

  def self.bad_rate(pay_currency, get_currency)
    if (@bad_rate and @pay_currency == pay_currency and @get_currency == get_currency)
      return @bad_rate
    else
      @pay_currency = pay_currency
      @get_currency = get_currency
      @bad_rate = Exchange.bad.rate(pay_currency, get_currency)
    end
  end

  def quote(params)

    result = {
        pay_amount:       pay_amount    = Monetize.parse(params[:pay_amount]).amount,
        pay_currency:     pay_currency  = params[:pay_currency],
        get_amount:       get_amount    = Monetize.parse(params[:get_amount]).amount,
        get_currency:     get_currency  = params[:get_currency],
        field:            field         = params[:field],
        transaction:      transaction   = get_currency != currency ? 'sell' : 'buy',
        rates:            {},
        bad_rates:        {},
        quote:            nil,
        quote_currency:   nil,
        edited_quote:     nil,
        edited_quote_rounded: nil,
        bad_amount:       nil,
        gain_amount:      gain_amount   = 0,
        gain_currency:    gain_currency = nil,
        real_rates:       has_real_rates?,
        rounded:          false,
        pay_rounded:      params[:pay_amount].to_money(pay_currency).format,
        get_rounded:      params[:get_amount].to_money(get_currency).format,
        base_rate:        nil,
        errors:           []
    }

=begin
    unless rates.any?
      result[:errors]           <<   'No rates defined for that exchange'
      return result
    end
=end

    if currency.nil?
      result[:errors]           <<   'No local currency defined for that exchange'
      return result
    end
    if pay_currency == get_currency
      result[:errors]           <<   'Please select two different currencies'
      return result
    end

    if field == 'pay_amount' or field == 'pay_currency'
      rates = result[:rates]          = rate(get_currency, pay_currency)
      if rates[:error]
        result[:errors]           <<   rates[:error]
        return result
      end
      get_amount =   result[:quote]                         = pay_amount * rates[transaction.to_sym]
      result[:get_amount] = result[:get_rounded]            = get_amount.to_money(get_currency).format
      result[:edited_quote] = result[:edited_quote_rounded] = result[:get_amount]
      result[:quote_currency]                               = get_currency

      bad_rates = result[:bad_rates]  = Exchange.bad_rate(get_currency, pay_currency)
      if bad_rates[:error]
        result[:errors]               <<   bad_rates[:error]
        return result
      end
      bad_amount                                            = pay_amount * bad_rates[transaction.to_sym]
      result[:bad_amount]                                   = bad_amount.to_money(get_currency).format
      gain                                                  = get_amount - bad_amount
      result[:gain_percent]                                 = ((gain.abs / bad_amount) * 100).round
      result[:gain_amount]                                  = gain.abs.to_money(get_currency).format
      result[:gain_type]                                    = gain < 0 ? 'off' : 'more'
      result[:gain_currency]                                = get_currency

      result[:pay_amount]                                   = pay_amount.to_money(pay_currency).format

      if get_currency != currency and (get_subtract = get_amount.modulo(1)) > 0
        result[:rounded]                                    = true
        pay_subtract                                        = get_subtract / rates[transaction.to_sym]
        result[:pay_rounded]                                = (pay_amount - pay_subtract).to_money(pay_currency).format
        result[:get_rounded]                                = (get_amount - get_subtract).to_money(get_currency).format
        result[:edited_quote_rounded]                       = result[:get_rounded]
      end

      result[:base_rate]                                    = Exchange.edit_base_rate(rates, transaction)

    else

      rates = result[:rates]          = rate(pay_currency, get_currency)
      if rates[:error]
        result[:errors]               <<   rates[:error]
        return result
      end
      pay_amount                      =   result[:quote]            = get_amount * rates[transaction.to_sym]
      result[:pay_amount] = result[:pay_rounded]            = pay_amount.to_money(pay_currency).format(:disambiguate => true)
      result[:edited_quote] = result[:edited_quote_rounded] = result[:pay_amount]
      result[:quote_currency]                               = pay_currency

      bad_rates = result[:bad_rates]  = Exchange.bad_rate(pay_currency, get_currency)
      if bad_rates[:error]
        result[:errors]               <<   bad_rates[:error]
        return result
      end

      bad_amount                                            = get_amount * bad_rates[transaction.to_sym]
      result[:bad_amount]                                   = bad_amount.to_money(pay_currency).format
      gain                                                  = pay_amount - bad_amount
      result[:gain_percent]                                 = ((gain.abs / bad_amount) * 100).round
      result[:gain_amount]                                  = gain.abs.to_money(pay_currency).format

      result[:gain_currency]                                = pay_currency
      result[:gain_type]                                    = gain < 0 ? 'off' : 'more'
      result[:get_amount]                                   = get_amount.to_money(get_currency).format(:disambiguate => true)

      if get_currency == currency and pay_currency != currency and (pay_subtract = pay_amount.modulo(1)) > 0
        result[:rounded]                                    = true
        get_subtract                                        = pay_subtract / rates[transaction.to_sym]
        result[:get_rounded]                                = (get_amount - get_subtract).to_money(get_currency).format
        result[:pay_rounded]                                = (pay_amount - pay_subtract).to_money(pay_currency).format
        result[:edited_quote_rounded]                       = result[:pay_rounded]
      end

      result[:base_rate]                                    = Exchange.edit_base_rate(rates, transaction)

    end

    return result

  end

  # TODO: Important: This is where the cross-rates will take effect. 'quote' method would not be affected
  def rate(rated_currency, base_currency)

    result = {
        rated_currency: rated_currency,
        base_currency: base_currency,
        buy: nil,
        sell: nil,
        error: nil
    }

    rated_rates = find_rate(rated_currency)
    if rated_rates[:error]
      result[:error] = rated_rates[:error]
      return result
    end

    base_rates = find_rate(base_currency)
    if base_rates[:error]
      result[:error] = base_rates[:error]
      return result
    end

    result[:buy]  = rated_rates[:buy]   /   base_rates[:buy]
    result[:sell] = rated_rates[:sell]  /   base_rates[:sell]

    return result

  end

  def find_rate(currency)

    result = {
        buy: nil,
        sell: nil,
        error: nil
    }
    if currency == self.currency
      result[:buy]  = 1
      result[:sell] = 1
      return result
    end

    rec = chain? ? self.chain.send(currency.downcase + '_rate') : self.send(currency.downcase + '_rate')

    if rec
      ['buy', 'sell'].each do |kind|
        value = rec.send(kind)
        if value
          result[kind.to_sym] = value
        else
          result[:error] = currency + ' ' + kind + ' rate is missing'
          return result
        end
      end
    else
      result[:error] = 'Sorry, no offers for ' + currency + ' currently'
      return result
    end

    return result

  end

  def self.edit_base_rate(rates, transaction)
#working    1.to_money(rates[:base_currency]).format(:disambiguate => true) + ' = ' + rates[transaction.to_sym].to_money(rates[:rated_currency]).format(:disambiguate => true)
    1.to_money(rates[:base_currency]).format(:disambiguate => true) + ' = ' + (100*rates[transaction.to_sym]).to_money(rates[:rated_currency]).format(:disambiguate => true).delete('.').insert(-5, '.')
  end


  def admin_user_s
    'system'
  end

  def offer(center, pay, buy)

    exchange_hash = {}

    exchange_hash[:id] = self.id
    exchange_hash[:name] = self.name
    exchange_hash[:name] += (" - " + self.nearest_station) if self.nearest_station.present?
    exchange_hash[:name_s] = self.name_s
    exchange_hash[:address] = self.address
    exchange_hash[:open_today] = self.todays_hours
    exchange_hash[:phone] = self.phone
    exchange_hash[:website] = self.website
    exchange_hash[:latitude] = self.latitude
    exchange_hash[:longitude] = self.longitude

    quotes = quote(pay_amount: pay.amount, pay_currency: pay.currency.iso_code, get_amount: buy.amount, get_currency: buy.currency.iso_code, field: pay.amount > 0 ? 'pay_amount' : 'get_amount')
    exchange_hash[:pay_amount] = quotes[:pay_amount]
    exchange_hash[:pay_currency] = quotes[:pay_currency]
    exchange_hash[:buy_amount] = quotes[:get_amount]
    exchange_hash[:buy_currency] = quotes[:get_currency]
    exchange_hash[:bad_amount] = quotes[:bad_amount]
    exchange_hash[:gain_amount] = quotes[:gain_amount]
    exchange_hash[:gain_percent] = quotes[:gain_percent]
    exchange_hash[:gain_type] = quotes[:gain_type]
    exchange_hash[:gain_currency] = quotes[:gain_currency]
    exchange_hash[:quote] = quotes[:quote]
    exchange_hash[:edited_quote] = quotes[:edited_quote] || 'No rates'
    exchange_hash[:real_rates] = quotes[:real_rates]
    exchange_hash[:pay_rounded] = quotes[:pay_rounded]
    exchange_hash[:get_rounded] = quotes[:get_rounded]
    exchange_hash[:edited_quote_rounded] = quotes[:edited_quote_rounded]
    exchange_hash[:quote_currency] = quotes[:quote_currency]
    exchange_hash[:errors] = quotes[:errors]
    exchange_hash[:rounded] = quotes[:rounded]
    exchange_hash[:base_rate] = quotes[:base_rate]
    exchange_hash[:service_type] = service_type
    exchange_hash[:best_at] = []
    exchange_hash[:rates] = quotes[:rates]
    exchange_hash[:rating] =  self.rating
    exchange_hash[:reviews] = 'No'
    exchange_hash[:place] = {}
    exchange_hash[:place][:id] = self.place_id
    exchange_hash[:place][:status] = {}
    exchange_hash[:matrix] = {}
#    exchange_hash[:distance] = self.distance_from(center) # remove if not required!
    exchange_hash[:contract] = self.contract


    exchange_hash

  end


  def direct_link
    Rails.application.routes.url_helpers.exchange_url(self.id) if self.id
  end

  def direct_link=(link)
  end

  # TODO: Maintain a true source
  def tmp_source
    if admin_user
      @source = admin_user.email || 'Manual keying'
    else
      @source = 'Excell feed'
    end
    @source
  end

  def tmp_source=(email)
  end


  def effective_rates
    rates.any? ? rates : (chain ? chain.rates : nil)
  end
  

  def todays_hours
    t = Time.now
    if t.sunday?
      day = 'sunday'
    elsif t.saturday?
      day = 'saturday'
    else
      day = 'weekday'
    end
    open = self.send(day + '_open')
    close = self.send(day + '_close')
    open.strftime("%H:%M") + ' - ' + close.strftime("%H:%M") if open and close
  end
  
  def make_hour(int)
    hour = int.to_s + ":00"
    hour = "0" + hour if int < 10
    hour
  end

  def update_csv_business_hours(csv_busines_hours, day)

    bh = self.business_hours.where(day: day).first_or_initialize
    bh.exchange_id = self.id

    if csv_busines_hours.nil? or csv_busines_hours == "Closed"
      bh.open1 = bh.close1 = bh.open2 = bh.close2 = nil
    else
      hours = csv_busines_hours.gsub(/\s+/, "").partition(",")
      if !hours[0].blank?
        hours1 = hours[0].partition("-")
        bh.open1 =  Tod::TimeOfDay(hours1[0])
        bh.close1 = Tod::TimeOfDay(hours1[2])
      end
      if !hours[2].blank?
        hours2 = hours[2].partition("-")
        bh.open2 =  Tod::TimeOfDay(hours2[0])
        bh.close2 = Tod::TimeOfDay(hours2[2])
      end      
    end

    bh.save

  end

  0.upto(6) do |day|
    day_name = Date::DAYNAMES[day][0..2].downcase
    ["open1", "close1", "open2", "close2"].each do |col|
      define_method "#{day_name}_#{col}" do
        b = BusinessHour.where(exchange_id: self.id, day: day).first
        b.send "#{col}" if b
       end
      define_method "#{day_name}_#{col}=" do |tod|
        b = BusinessHour.find_or_initialize_by(exchange_id: self.id, day: day)
        b.send "#{col}=", Tod::TimeOfDay.parse(tod)
        b.save  
      end
    end     
  end


  def self.list(amenity, area)
    options={amenity:       amenity,
             area:          area,
            timeout:       900,
             element_limit: 1073741824,
             json:          true}
    
    overpass = Overpass.new(options)
    list = overpass.query
  end
  
  def self.import(amenity="bdc", area="London")
    return unless list = self.list(amenity, area)
    
    list.each do |osm_rec| 
      Exchange.find_or_create_by(osm_id: osm_rec[:id].to_s) do |exchange|
        exchange.latitude           = osm_rec[:lat]
        exchange.longitude          = osm_rec[:lon]
        exchange.name               = osm_rec[:tags][:name]
        exchange.website            = osm_rec[:tags][:website]
        exchange.wheelchair         = osm_rec[:tags][:wheelchair]
        exchange.email              = osm_rec[:tags][:email]
        exchange.note               = osm_rec[:tags][:note]
        exchange.opening_hours      = osm_rec[:tags][:opening_hours]
        exchange.phone              = osm_rec[:tags][:phone]
        exchange.addr_country       = osm_rec[:tags][:"addr:country"]
        exchange.addr_city          = osm_rec[:tags][:"addr:city"]
        exchange.addr_street        = osm_rec[:tags][:"addr:street"]
        exchange.addr_housename     = osm_rec[:tags][:"addr:housename"]
        exchange.addr_housenumber   = osm_rec[:tags][:"addr:housenumber"]
        exchange.addr_postcode      = osm_rec[:tags][:"addr:postcode"]
        exchange.addr_unit          = osm_rec[:tags][:"addr:unit"]
        exchange.atm                = osm_rec[:tags][:atm]
        exchange.source             = osm_rec[:source]
      end 
    end
  end

  def collection?
    true
  end

  def service_type
    'collection'
  end


  def chain_name
    self.chain.name if self.chain
  end
  def chain_name=(name)
    if name.blank?
      self.update(chain_id: nil)
      return
    end
    chain = Chain.where(name: name).first_or_create
    currency = chain.currency || 'GBP'
    rates_source = chain.rates_source || 'no_rates'
    chain.update(currency: currency, rates_source: rates_source)
    self.update(chain_id: chain.id)
  end

  def rates
    if self.chain?
      self.chain.rates
    else
      super
    end
   end

  def name_s
    chain = self.chain
    chain ? chain.name + ' - ' + name : name
  end

  protected


end
