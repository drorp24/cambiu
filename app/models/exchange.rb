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

  has_many    :rates,                                                               as: :ratable, dependent: :destroy
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

  has_one     :czk_rate,    -> {where(currency: 'CZK')}       ,class_name: "Rate",  as: :ratable
  has_one     :ron_rate,    -> {where(currency: 'RON')}       ,class_name: "Rate",  as: :ratable
  has_one     :pln_rate,    -> {where(currency: 'PLN')}       ,class_name: "Rate",  as: :ratable
  has_one     :chf_rate,    -> {where(currency: 'CHF')}       ,class_name: "Rate",  as: :ratable
  has_one     :thb_rate,    -> {where(currency: 'THB')}       ,class_name: "Rate",  as: :ratable
  has_one     :php_rate,    -> {where(currency: 'PHP')}       ,class_name: "Rate",  as: :ratable
  has_one     :inr_rate,    -> {where(currency: 'INR')}       ,class_name: "Rate",  as: :ratable





  has_many    :reviews,  :dependent => :destroy

  enum business_type:  [ :exchange, :bank, :post_office, :other, :reference ]
  enum rates_source:   [ :no_rates, :test, :manual, :xml, :scraping, :api ]
  enum rates_policy:   [:individual, :chain]

  enum todo:           [:verify, :call, :meet, :sell]
  enum system:         [:remove, :geocode, :error]
  enum status:         [ :removed, :stale]


  accepts_nested_attributes_for :business_hours
  accepts_nested_attributes_for :rates

  geocoded_by :either_address

#  validates :delivery_tracking, allow_blank: true, :format => {:with => URI.regexp}
  validates :rates_url, allow_blank: true, :format => {:with => URI.regexp}

  after_validation :do_geocoding, if: ->(exchange){ (exchange.latitude.blank? or exchange.address_changed?) and exchange.address.present? }
  after_validation :remove, if: ->(exchange){ exchange.remove? }

  before_create do
    puts self.rates_source.nil? ? "before: rates_source is nil" : "before: rates_source is: " + rates_source
    self.rates_source = 'no_rates'    if rates_source.blank?
    puts self.rates_source.nil? ? "after: rates_source is nil" : "after: rates_source is: " + rates_source
    self.rates_policy = 'individual'  if rates_policy.blank?
    self.business_type = 'exchange'   if business_type.blank?
    self.locale = 'en'                if locale.blank?
  end


  scope :online_rates, -> { where("rates_source > 2") }
  scope :real_rates, -> {where("rates_source > 1") }
  scope :any_rates, -> {where("rates_source > 0") }
  scope :no_rates, -> {where("rates_policy = 0 AND rates_source = 0") }
  scope :no_real_rates, -> { where("rates_source < 2") }

  scope :active, -> {where(status: nil)}

  scope :contract, -> { where(contract: true) }
  scope :no_contract, -> { where(contract: false) }
  scope :verified, -> {where.not(todo: 'verify')}
  scope :unverified, -> {where(todo: 'verify')}
  scope :todo, -> {where.not(todo: nil) }
  scope :system, -> {where.not(system: nil) }

  scope :delivery, -> {where(delivery: true)}
  scope :credit, -> {where(credit: true)}
  scope :fix_address, -> {where(business_type: 'exchange', latitude: nil, status: nil)}


  def self.covering(location)
    lat = location[0]
    lng = location[1]
    where("delivery_nw_lng < ? AND delivery_se_lng > ? AND delivery_nw_lat > ? AND delivery_se_lat < ?", lng, lng, lat, lat)
  end

  def covers?(location)
    lat = location[0]
    lng = location[1]
    self.delivery_nw_lng < lng && self.delivery_se_lng > lng && self.delivery_nw_lat > lat && delivery_se_lat < lat
  end

  def self.countries
    countries_count = Exchange.group(:country).count.reject{|key| key.nil?}
    countries_count.each{|key, value| countries_count[key] = key}
  end

  def self.entire_list(params)

    return {errors: {parameters: 'missing'}} unless params[:country].present?

# TODO: Right now these two are just excel fields, some times populated other not. Return when meaningful.

    begin

      exchanges = Exchange.active
                      .select(:country, :id, :chain_id, :name, :nearest_station, :rates_policy, :currency, :address, :phone, :latitude, :longitude,
                              :weekday_open, :weekday_close, :saturday_open, :saturday_close, :sunday_open, :sunday_close)
      exchanges = exchanges.where(country: params[:country])  unless params[:country] == 'ZZZ'
      exchanges = exchanges.where(city: params[:city])        if params[:city].present?

      return exchanges

    rescue => e

      return {errors: {'API error': e}}

    end


  end



  # The newer version of the api, using OXR rather than netdania for reference rates
  def self.rates_list(params)
     params[:type] == 'reference' ? Currency.rates(params[:base]) : rates_list(params)
  end

  def self.old_rates_list(params)

    return {errors: {parameters: 'missing'}} unless params[:country].present? and params[:type].present?

    begin

      exchanges = Exchange.send(params[:type])
                      .select(:id, :name, :rates_policy, :chain_id, :currency)
                      .where(country: params[:country])

      exchanges = exchanges.where(city: params[:city]) if params[:city].present?

      exchanges_list = []

      exchanges.each do |exchange|

        exchange_h = {}
        exchange_h[:exchange_id]    = exchange.id
        exchange_h[:exchange_name]  = exchange.name
        exchange_h[:exchange_currency]  = exchange.currency
        exchange_h[:rates_policy]  = exchange.rates_policy
        exchange_h[:rates] = []

        exchange.rates.each do |rate|

          rate_h = {}

          rate_h[:currency]       = rate.currency
          rate_h[:buy]            = rate.buy
          rate_h[:sell]           = rate.sell
          rate_h[:updated_at]     = rate.updated_at

          exchange_h[:rates] << rate_h

        end

        exchanges_list << exchange_h

      end

      return exchanges_list

    rescue => e

      return {errors: {'API error': e}}

    end

  end

  def self.with_own_rates
    self.any_rates.active
  end

  def self.with_no_real_rates
    self.individual.no_real_rates
  end

  def self.with_real_rates
    self.real_rates.active.geocoded
  end

  def rates_are_stale?
    return false if (self.individual? and has_no_real_rates) or rates.empty? or rates.where(method: 'reference').exists?
    (Date.today - rates.first.updated_at.to_date).to_i > 1
  end

  def clear_status
    self.status = nil
  end

  def do_geocoding
    puts "Exchange #{self.id} - geocoded"
    geocode
    self.system = nil if geocode?
  end

  def remove
    return if removed?
    puts ""
    puts ""
    puts ""
    puts "Exchange #{self.id} - removed"
    puts ""
    puts ""
    puts ""
    removed!
    self.update_columns(system: nil) if remove?
  end

  def system_color
    [:red, :blue, :black][Exchange.systems[system]]
  end

  def todo_color
    [:orange, :blue, :green][Exchange.todos[todo]]
  end

  def status_color
    [:red, :brown][Exchange.statuses[status]]
  end

  def self.unexported_columns
    ["id", "created_at", "updated_at", "latitude", "longitude", "chain_id", "rating", "admin_user_id", "place_id", "error"]
  end

  def self.identify_by_either(id, name, name_he, address, address_he, nearest_station)

    return Exchange.new(error: "Both name and address are missing", system: 'error') unless name.present? and address.present?

    puts ""
    puts ""
    puts id, name, name_he, address, address_he, nearest_station
    puts ""

    exchange = Exchange.find_by(id: id) if id.present? && id != '0'
#    puts "0"
    return exchange if exchange
#    puts "1"

    # Best way is to identify by name + address combination, since nearest_station is not unique
    # Also, if there exists already an exchange with no nearest_station and now nearest_station is present, the record must be identified without nearest_station or else there would be duplicate

    exchange = Exchange.find_by(name: name, address: address)
    return exchange if exchange
#    puts "2"

    exchange = Exchange.find_by(name_he: name_he, address_he: address_he) if name_he.present? and address_he.present?
    return exchange if exchange
#    puts "3"

    exchange = Exchange.find_by(name: name, nearest_station: nearest_station) if nearest_station.present?
    return exchange if exchange
#    puts "4"

    return Exchange.new

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
    !test? && !no_rates?
  end

  def has_no_real_rates
    test? or no_rates?
  end

  def self.bad(country)
    if bad_exchange = self.bank.where(country: country).first
      return bad_exchange
    else
      Error.report(message: 'No bad source defined for country: ' + country, text: 'UK bank used instead', search_id: nil)
      return self.bank.where(country: 'UK').first
    end
  end

  def self.interbank
    @inter ||= self.inter.first
  end

  def self.bad_rate(country, rated_currency, base_currency, trans, pay_currency)
#    puts "self.bad_rate called with: " + country + ', ' + rated_currency + ', ' + base_currency
    return @bad_rate if @bad_rate && @bad_rate_country == country && @bad_rate[:rated_currency] == rated_currency && @bad_rate[:base_currency] == base_currency
#    puts "self.bad_rate did not return but went to calculate it"
    @bad_rate_country = country
    @bad_rate = Exchange.bad(country).rate(rated_currency, base_currency, trans, pay_currency)
  end

  # quote and calculate gain, focusing on exchange rates and ignoring added charges
  def quote(params)

    result = {
        search_id:        params[:search_id],
        pay_amount:       pay_amount    = Monetize.parse(params[:pay_amount]).amount,
        pay_currency:     pay_currency  = params[:pay_currency],
        get_amount:       get_amount    = Monetize.parse(params[:get_amount]).amount,
        get_currency:     get_currency  = params[:get_currency],
        trans:            trans         = params[:trans],
        calculated:       calculated    = params[:calculated],
        rates:            {},
        bad_rates:        {},
        quote:            nil,
        quote_currency:   nil,
        edited_quote:     nil,
        edited_quote_rounded: nil,
        bad_amount:       nil,
        gain:             0,
        gain_amount:      gain_amount   = 0,
        gain_currency:    gain_currency = nil,
        real_rates:       has_real_rates?,
        rounded:          false,
        pay_rounded:      params[:pay_amount].to_money(pay_currency).format,
        get_rounded:      params[:get_amount].to_money(get_currency).format,
        base_rate:        nil,
        errors:           []
    }

    if currency.nil?
      result[:errors]           <<   'No local currency defined for that exchange'
      return result
    end
    if pay_currency == get_currency
      result[:errors]           <<   'Please select two different currencies'
      return result
    end
    if !self.country
      result[:errors]           <<   'Exchange has no country'
      return result
    else
      country = self.country
    end

    if calculated == 'buy_amount'

      rates = result[:rates]          = rate(get_currency, pay_currency, trans, pay_currency)

      if rates[:error]
        result[:errors]           <<   rates[:error]
        return result
      end

      if rates[trans.to_sym] == 0
        result[:errors]               <<   trans + " rate needed but empty - cannot quote"
        return result
      end

      # quote: net of charges. get_amount: including charges.
      result[:quote]                                        = pay_amount * rates[trans.to_sym]
      result[:edited_quote] = result[:edited_quote_rounded] = result[:quote].to_money(get_currency).format
      result[:quote_currency]                               = get_currency

      get_amount                                            = result[:quote]
      result[:get_amount] = result[:get_rounded]            = get_amount.to_money(get_currency).format

      bad_rates = result[:bad_rates]  = Exchange.bad_rate(country,get_currency, pay_currency, trans, pay_currency)
      if bad_rates[:error]
        Error.report(message: bad_rates[:error], text: "", search_id: params[:search_id])
      end
      bank_fee                                              = bad_rates[:bank_fee] || 0
      bad_amount_before_fees                                = (pay_amount * (bad_rates[trans.to_sym] || 0))
      bad_amount                                            = bad_amount_before_fees * (100 - bank_fee) / 100.0

      result[:bad_amount]                                   = bad_amount.to_money(get_currency).format
      result[:gain]                                         = bad_amount != 0 ? result[:quote] - bad_amount : result[:quote]   # the latter is to enable just grade sorting when bad rate isn't there
      result[:gain_amount]                                  = result[:gain].to_money(get_currency).format
      result[:gain_type]                                    = result[:gain] < 0 ? 'your gain' : 'your gain'
      result[:gain_short]                                    = result[:gain] < 0 ? 'gain' : 'gain'
      result[:gain_currency]                                = get_currency

      result[:pay_amount]                                   = pay_amount.to_money(pay_currency).format

      if get_currency != currency and (get_subtract = get_amount.modulo(1)) > 0
        result[:rounded]                                    = true
        pay_subtract                                        = get_subtract / rates[trans.to_sym]
        result[:pay_rounded]                                = (pay_amount - pay_subtract).to_money(pay_currency).format
        result[:get_rounded]                                = (get_amount - get_subtract).to_money(get_currency).format
        result[:edited_quote_rounded]                       = result[:get_rounded]
      end

      result[:base_rate]                                    = Exchange.edit_base_rate(rates, trans)

    else

      rates = result[:rates]          = rate(pay_currency, get_currency, trans, pay_currency)
      if rates[:error]
        result[:errors]               <<   rates[:error]
        return result
      end
      if rates[trans.to_sym] == 0
        result[:errors]               <<   trans + " rate needed but empty - cannot quote"
        return result
      end

      # quote: net of charges. pay_amount: including charges.
      result[:quote]                                        = get_amount * rates[trans.to_sym]
      result[:edited_quote] = result[:edited_quote_rounded] = result[:quote].to_money(pay_currency).format
      result[:quote_currency]                               = pay_currency

      pay_amount                                            = result[:quote]
      result[:pay_amount] = result[:pay_rounded]            = pay_amount.to_money(pay_currency).format

      bad_rates = result[:bad_rates]  = Exchange.bad_rate(country, pay_currency, get_currency, trans, pay_currency)
      if bad_rates[:error]
        Error.report(message: bad_rates[:error], text: "", search_id: params[:search_id])
      end

      bank_fee                                              = bad_rates[:bank_fee] || 0
      bad_amount_before_fees                                = (get_amount * (bad_rates[trans.to_sym] || 0))
      bad_amount                                            = bad_amount_before_fees * (100 + bank_fee) / 100.0
      result[:bad_amount]                                   = bad_amount.to_money(pay_currency).format
      result[:gain]                                         = bad_amount != 0 ? bad_amount - result[:quote] : result[:quote] * -1 # the latter is to enable just grade sorting when bad rate isn't there
      result[:gain_amount]                                  = result[:gain].to_money(pay_currency).format

      result[:gain_currency]                                = pay_currency
      result[:gain_type]                                    = result[:gain] < 0 ? 'you save' : 'you save'
      result[:gain_short]                                    = result[:gain] < 0 ? 'save' : 'save'
      result[:get_amount]                                   = get_amount.to_money(get_currency).format

      if get_currency == currency and pay_currency != currency and (pay_subtract = pay_amount.modulo(1)) > 0
        result[:rounded]                                    = true
        get_subtract                                        = pay_subtract / rates[trans.to_sym]
        result[:get_rounded]                                = (get_amount - get_subtract).to_money(get_currency).format
        result[:pay_rounded]                                = (pay_amount - pay_subtract).to_money(pay_currency).format
        result[:edited_quote_rounded]                       = result[:pay_rounded]
      end

      result[:base_rate]                                    = Exchange.edit_base_rate(rates, trans)

    end

    return result

  end

  # TODO: Important: This is where the cross-rates will take effect. 'quote' method would not be affected
  def rate(rated_currency, base_currency, trans, pay_currency)

    result = {
        rated_currency: rated_currency,
        base_currency: base_currency,
        buy: nil,
        sell: nil,
        cc_fee: self.cc_fee,
        delivery_charge: self.delivery_charge,
        transaction: trans,
        pay_currency: pay_currency,
        error: nil,
        updated: nil,
        source: nil,
        exchange_id: self.id,
        bank_fee: nil
    }

    rated_rates = find_rate(rated_currency, trans)
    if rated_rates[:error]
      result[:error] = rated_rates[:error]
    end

    base_rates = find_rate(base_currency, trans)
    if base_rates[:error]
      result[:error] = base_rates[:error]
    end


    result[:buy]  = !base_rates[:buy] || base_rates[:buy]  == 0 || !rated_rates[:buy] ?   nil :  (rated_rates[:buy]  / base_rates[:buy])
    result[:sell] = !base_rates[:sell] || base_rates[:sell] == 0 || !rated_rates[:sell] ? nil :  (rated_rates[:sell] / base_rates[:sell])
    if trans == 'mixed'
      if rated_currency == pay_currency
        result[:mixed] = rated_rates[:buy] / base_rates[:sell]
      else
        result[:mixed] = rated_rates[:sell] / base_rates[:buy]
      end
    else
      result[:mixed] = nil
    end
    result[:updated] =  [base_rates[:updated], rated_rates[:updated]].min
    result[:source] = rated_rates[:source] || base_rates[:source]
    result[:bank_fee] = self.bank? ? (self.bank_fee || 0) : nil

    return result

  end

  def find_rate(currency, trans)

    result = {
        buy: nil,
        sell: nil,
        error: nil,
        updated: nil,
        source: nil,
        method: 'absolute'
    }

    if currency == self.currency
      result[:buy]  = 1
      result[:sell] = 1
      result[:updated] = Time.zone.now
      return result
    end

#    rec = chain? ? self.chain.send(currency.downcase + '_rate') : self.send(currency.downcase + '_rate')

    currency_method = currency.downcase + '_rate'

    if chain?
      if chain_id.blank?
        result[:error] = "#{self.name} (#{self.id}) - Rates policy is chain but no chain was defined"
        return result
      end
      chain = self.chain
      if chain.respond_to? currency_method
        rec = self.chain.send(currency_method)
      else
        rec = chain.rates.where(currency: currency).first
      end
    else
      if self.respond_to? currency_method
        rec = self.send(currency_method)
      else
        rec = self.rates.where(currency: currency).first
      end
    end

    if rec

      if rec.reference?
        reference_rate    = Money.default_bank.get_rate(self.currency, currency)
        sell_markup       = rec.sell_markup || 0
        buy_markup        = rec.buy_markup || 0
        sell_factor       = 1 - (sell_markup / 100)
        buy_factor        = 1 + (buy_markup / 100)
        result[:sell]     = reference_rate * sell_factor
        result[:buy]      = reference_rate * buy_factor
        result[:method]   = 'reference'
        result[:updated] ||= rec.updated_at
        result[:source] ||= rec.source
        return result
      end

      if (!rec.buy || rec.buy == 0) and (!rec.sell || rec.sell == 0)
        result[:error] = "#{self.name} (#{self.id}) - No buy and sell rates for currency: #{currency}"
        return result
      elsif rec.absolute? and (Date.today - rec.updated_at.to_date).to_i > 1
        result[:error] = "#{self.name} (#{self.id}) - Stale rates for currency: #{rec.currency}"
        return result
      end

      ['buy', 'sell'].each do |kind|
          value = rec.send(kind)
          result[:error] = "#{self.name} (#{self.id}) - Missing #{trans} rate for currency: #{currency}" if !value and kind == trans
          result[kind.to_sym] = value
          result[:updated] ||= rec.updated_at
          result[:source] ||= rec.source
      end


    else
      result[:error] = "#{self.name} (#{self.id}) - Neither buy nor sell rates for currency: #{currency}"
      return result
    end

    return result

  end

  def self.edit_base_rate(rates, trans)
#working    1.to_money(rates[:base_currency]).format(:disambiguate => true) + ' = ' + rates[trans.to_sym].to_money(rates[:rated_currency]).format(:disambiguate => true)
    1.to_money(rates[:base_currency]).format(:disambiguate => true) + ' = ' + (100*rates[trans.to_sym]).to_money(rates[:rated_currency]).format(:disambiguate => true).delete('.').insert(-5, '.')
  end


  def admin_user_s
    'system'
  end

  def offer(center, pay, buy, trans, calculated, delivery, credit, search_id)

    exchange_hash = {}

    exchange_hash[:distance] = self.distance_from(center)
    exchange_hash[:id] = self.id
    exchange_hash[:name] = self.fullname
    exchange_hash[:name_s] = self.name_s
    exchange_hash[:address] = self.address
    exchange_hash[:phone] = self.phone
    exchange_hash[:website] = self.website
    exchange_hash[:latitude] = self.latitude
    exchange_hash[:longitude] = self.longitude
    exchange_hash[:best_at] = []
    exchange_hash[:rating] =  self.rating
    exchange_hash[:reviews] = I18n.t 'offer.no1'
    exchange_hash[:place] = {}
    exchange_hash[:place][:id] = self.place_id
    exchange_hash[:place][:status] = {}
    exchange_hash[:matrix] = {}
    exchange_hash[:contract] = self.contract
    exchange_hash[:photo] = photo_url

    quotes = quote(pay_amount: pay.amount, pay_currency: pay.currency.iso_code, get_amount: buy.amount, get_currency: buy.currency.iso_code, calculated: calculated,
                   trans: trans, delivery: delivery, credit: credit, search_id: search_id)
    exchange_hash = quotes.merge(exchange_hash)

    delivery_charge = delivery ? self.delivery_charge || 0 : 0
    exchange_hash[:delivery_charge_raw] = delivery_charge
    exchange_hash[:delivery_charge] = delivery_charge.to_money(pay.currency.iso_code).format

    cc_fee = credit ? self.cc_fee || 0 : 0

    pay_amount = Monetize.parse(quotes[:pay_amount]).amount
    credit_charge = (pay_amount + delivery_charge) * cc_fee / 100
    exchange_hash[:credit_charge_raw] = credit_charge
    exchange_hash[:credit_charge] = credit_charge.to_money(pay.currency.iso_code).format

    exchange_hash[:total_amount] = (pay_amount + delivery_charge + credit_charge).to_money(pay.currency.iso_code).format

    # grade adds together amounts and distance, and the amounts may not be the same currency. For grading, this is perfectly fine
    # gain must be used and not pay or buy amounts, since one of the latter is always fixed, so each time you want to maximize something else; gain does exactly that
    distance_element = delivery ?  0 : exchange_hash[:distance] * Rails.application.config.distance_factor
    exchange_hash[:grade] = exchange_hash[:gain] * -1   +
                            credit_charge               +
                            delivery_charge             +
                            distance_element

    exchange_hash

  end

  def photo_url

    return nil unless self.photo.present? && ENV["CLOUDFRONT_DIST"]

    if Rails.application.assets_manifest.assets.any? and url = Rails.application.assets_manifest.assets['exchanges/' + self.photo]
      return ENV["CLOUDFRONT_DIST"] + '/assets/' + url
    elsif Rails.application.assets and url = Rails.application.assets.find_asset('exchanges/' + self.photo)
      return ENV["CLOUDFRONT_DIST"] || "" + '/assets/' + url.digest_path
    else
      return nil
    end

  end

  def alt_distance_from(center)

    loc1 = [self.latitude, self.longitude]
    loc2 = center

    rad_per_deg = Math::PI/180  # PI / 180
    rkm = 6371                  # Earth radius in kilometers
    rm = rkm * 1000             # Radius in meters

    dlat_rad = (loc2[0]-loc1[0]) * rad_per_deg  # Delta, converted to rad
    dlon_rad = (loc2[1]-loc1[1]) * rad_per_deg

    lat1_rad, lon1_rad = loc1.map {|i| i * rad_per_deg }
    lat2_rad, lon2_rad = loc2.map {|i| i * rad_per_deg }

    a = Math.sin(dlat_rad/2)**2 + Math.cos(lat1_rad) * Math.cos(lat2_rad) * Math.sin(dlon_rad/2)**2
    c = 2 * Math::atan2(Math::sqrt(a), Math::sqrt(1-a))

    rm * c / 1000 # Delta in Km
  end

  def fullname

    if nearest_station.present?
      return name + ' - ' + nearest_station
    elsif chain and (chain.name != name)
      return chain.name + ' - ' + name
    else
      return name
    end

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
  
=begin
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
=end

  def chain_name
    self.chain.name if self.chain
  end
  def chain_name=(name)
    if name.blank?
      self.update(chain_id: nil)
      return
    end
    chain = Chain.where(name: name).first_or_create
    currency = chain.currency
    rates_source = chain.rates_source || 'no_rates'
    chain.update(currency: currency, rates_source: rates_source)
    self.update(chain_id: chain.id, rates_source: chain? ? chain.rates_source : 'no_rates')
  end

  def rates
    if self.chain? && self.chain_id
      self.chain.rates
    else
      super
    end
  end

  def delete_rates
    Rate.where(ratable_type: 'Exchange', ratable_id: self.id).delete_all
  end

  def name_s
    chain = self.chain
    chain ? chain.name + ' - ' + name : name
  end

  def either_address
    address_he.present? ? address_he : address
  end

  def either_name
    name_he.present? ? name_he : name
  end

  protected


end
