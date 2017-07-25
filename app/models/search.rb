class Search < ActiveRecord::Base
#  belongs_to :exchange
  has_many  :orders
  has_many :issues, foreign_key: "search_id", class_name: "Error"
#  validates :email, presence: true#, on: :update #allow_nil: true #unless: Proc.new { |a| a.email.blank? }
#  validates :email, uniqueness: { case_sensitive: false }, allow_nil: true

  attr_accessor :fetch, :mode, :hash, :distance_slider

  validate :valid_input, on: :create

#  scope :negate, ->(scope) { where(scope.where_values.reduce(:and).not) }

  scope :london, -> {where("location like ?", "%London%") }
  scope :telaviv, -> {where("location like ?", "%Tel%Aviv%") }
  scope :other, -> {where.not("location like ? OR location like ?", "%Tel%Aviv%", "%London%") }
  scope :empty, -> {where(location: nil) }





  def localRates

    return {error: 'missing params'} if
        pay_currency.blank? or buy_currency.blank? or (pay_amount.blank? and buy_amount.blank?) or
        location_lat.blank? or location_lng.blank? or
        calculated.blank? or trans.blank?

    self.distance_unit ||= "km"
    self.service_type  ||= 'pickup'
    self.distance = self.service_type == 'pickup' ? self.distance || 2.5 : 100

    center               = [location_lat, location_lng]
    box                  = Geocoder::Calculations.bounding_box(center, distance)

    pay_rate             = (pay_currency.downcase + '_rate').to_sym
    buy_rate             = (buy_currency.downcase + '_rate').to_sym

#   exchanges            = Exchange.with_real_rates.within_bounding_box(box).includes(pay_rate, buy_rate).includes(chain: [pay_rate, buy_rate])
#                              .select(:id, :chain_id, :currency, :rates_policy)  # TODO: Discuss
    exchanges            = Exchange.active.geocoded.within_bounding_box(box).includes(pay_rate, buy_rate).includes(chain: [pay_rate, buy_rate])
                               .select(:id, :chain_id, :currency, :rates_policy)  # TODO: Discuss

    exchanges            = exchanges.delivery if self.service_type == 'delivery'
    exchanges            = exchanges.card if self.payment_method == 'card'

    puts "there are " + exchange.count.to_s + "exchanges selected"

    best_buy = Float::INFINITY
    best_sell = 0
    best_buy_rate = {}
    best_sell_rate = {}
    count = 0

    exchanges.each do |exchange|

      exchange_rates = exchange.rate(buy_currency, pay_currency)
      next if exchange_rates[:error]
      if exchange_rates[:buy] && exchange_rates[:buy] < best_buy
        best_buy_rate = exchange_rates
        best_buy = exchange_rates[:buy]
      end
      if exchange_rates[:sell] && exchange_rates[:sell] > best_sell
        best_sell_rate = exchange_rates
        best_sell = exchange_rates[:sell]
      end
      count += 1

    end


    return {
        best: {
            buy: best_buy_rate,
            sell: best_sell_rate
        },
        worst:
            Exchange.bad_rate(country,buy_currency, pay_currency),
        count: count
    }


  end

  def valid_input
     if
        pay_currency.blank? or
        buy_currency.blank? or
        (pay_amount.blank? and buy_amount.blank?) or
        location_lat.blank? or location_lng.blank?

       errors[:base] << "Missing search parameters"
     end
  end

  def exchanges

    begin

      return geoJsonize([], 'missing params') if
          pay_currency.blank? or buy_currency.blank? or (pay_amount.blank? and buy_amount.blank?) or
          location_lat.blank? or location_lng.blank? or
          calculated.blank? or trans.blank?


      self.distance      ||= 2.5
      self.distance_unit ||= "km"

      pay             = Money.new(Monetize.parse(pay_amount).fractional, pay_currency)   # works whether pay_amount comes with currency symbol or not
      buy             = Money.new(Monetize.parse(buy_amount).fractional, buy_currency)
      center          = [location_lat, location_lng]
      box             = Geocoder::Calculations.bounding_box(center, distance)

      exchange_offers(exchange_id, location, center, box, pay, buy, distance, trans, calculated)

    rescue => e

      error_message = 'Search error: '+ e.to_s
      error_text = e.backtrace[0..6].join("\n\t")
      puts ""
      puts "Search error: #{$!}"
      puts ""
      puts "Backtrace:\n\t#{e.backtrace[0..6].join("\n\t")}"
      puts ""
      Error.report({message: error_message, text: error_text, search_id: self.id})
      geoJsonize([], error_message)

    end

  end

  def exchange_offers(exchange_id, location, center, box, pay, buy, distance, trans, calculated)

    pay_rate  = (pay.currency.iso_code.downcase + '_rate').to_sym
    buy_rate  = (buy.currency.iso_code.downcase + '_rate').to_sym

    exchanges = Exchange.active.geocoded.within_bounding_box(box).where.not(name: nil, address: nil).includes(pay_rate, buy_rate).includes(chain: [pay_rate, buy_rate])

    exchanges_offers = []
    exchanges.each do |exchange|
      offer = exchange.offer(center, pay, buy, distance, trans, calculated)
      exchanges_offers << offer #unless (offer[:errors].any? and offer[:errors][0] != 'Out of radius' and !Rails.env.development?)
    end

    geoJsonize(exchanges_offers)

  end

  def geoJsonize(exchanges_offers, error=nil)

    features = []
    exchanges_offers.each do |exchange_offer|
      features << to_geo(exchange_offer)
    end
    return {search: id, error: error, exchanges: {type: 'FeatureCollection', features: features}}.to_json

  end

  def to_geo(exchange_offer)
    { type: 'Feature',
      properties: exchange_offer,
      geometry: {
          type: 'Point',
          coordinates: [exchange_offer[:longitude], exchange_offer[:latitude]]
      },
      id: exchange_offer[:id]
    }
  end


  def pane=(pane)
    @rest=pane
  end

  def radius=(radius)
    self.distance = radius
  end

  def delivery_ind=(ind)
    self.service_type = 'delivery' if ind == 'on'
  end


end
