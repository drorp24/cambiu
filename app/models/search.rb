class Search < ActiveRecord::Base
#  belongs_to :exchange
  has_many  :orders
  has_many :issues, foreign_key: "search_id", class_name: "Error"
#  validates :email, presence: true#, on: :update #allow_nil: true #unless: Proc.new { |a| a.email.blank? }
#  validates :email, uniqueness: { case_sensitive: false }, allow_nil: true
  enum service_type: [ :pickup, :delivery ]

  attr_accessor :fetch, :mode, :hash, :distance_slider, :payment_method

  validate :valid_input, on: :create

#  scope :negate, ->(scope) { where(scope.where_values.reduce(:and).not) }

  scope :london, -> {where("location like ?", "%London%") }
  scope :telaviv, -> {where("location like ?", "%Tel%Aviv%") }
  scope :other, -> {where.not("location like ? OR location like ?", "%Tel%Aviv%", "%London%") }
  scope :empty, -> {where(location: nil) }

=begin
  scope :notlondon, -> {negate(london)}
  scope :nottelaviv, -> {negate(telaviv)}
  scope :other, -> {notlondon.merge(Search.nottelaviv)}
=end



  def bestRates

    return if           pay_currency.blank? or buy_currency.blank? or (pay_amount.blank? and buy_amount.blank?)
    return if           location_lat.blank? or location_lng.blank?

    self.distance      ||= 2.5
    self.distance_unit ||= "km"
    center               = [location_lat, location_lng]
    box                  = Geocoder::Calculations.bounding_box(center, distance)

    pay_rate             = (pay_currency.downcase + '_rate').to_sym
    buy_rate             = (buy_currency.downcase + '_rate').to_sym

#   exchanges            = Exchange.with_real_rates.within_bounding_box(box).includes(pay_rate, buy_rate).includes(chain: [pay_rate, buy_rate])
#                              .select(:id, :chain_id, :currency, :rates_policy)  # TODO: Discuss
    exchanges            = Exchange.active.geocoded.within_bounding_box(box).includes(pay_rate, buy_rate).includes(chain: [pay_rate, buy_rate])
                               .select(:id, :chain_id, :currency, :rates_policy)  # TODO: Discuss

    if pay_amount.present?
        rated_currency = buy_currency
        base_currency  = pay_currency
    else
        rated_currency = pay_currency
        base_currency  = buy_currency
    end

    best_buy = Float::INFINITY
    best_sell = 0
    best_buy_rate = {}
    best_sell_rate = {}

    exchanges.each do |exchange|

      exchange_rates = exchange.rate(rated_currency, base_currency).merge(id: exchange.id, transaction: buy_currency != exchange.currency ? 'sell' : 'buy')
      if exchange_rates[:buy] < best_buy
        best_buy_rate = exchange_rates
        best_buy = exchange_rates[:buy]
      end
      if exchange_rates[:sell] > best_sell
        best_sell_rate = exchange_rates
        best_sell = exchange_rates[:sell]
      end

    end

    return {
        best_buy_rate: best_buy_rate,
        best_sell_rate: best_sell_rate
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

    return if         pay_currency.blank? or buy_currency.blank? or (pay_amount.blank? and buy_amount.blank?)
    return if         location_lat.blank? or location_lng.blank?

    self.distance      ||= 2.5
    self.distance_unit ||= "km"

    pay             = Money.new(Monetize.parse(pay_amount).fractional, pay_currency)   # works whether pay_amount comes with currency symbol or not
    buy             = Money.new(Monetize.parse(buy_amount).fractional, buy_currency)   
    center          = [location_lat, location_lng]
    box             = Geocoder::Calculations.bounding_box(center, distance)

    exchange_offers(exchange_id, location, center, box, pay, buy, distance)

  end

  def exchange_offers(exchange_id, location, center, box, pay, buy, distance)

    pay_rate  = (pay.currency.iso_code.downcase + '_rate').to_sym
    buy_rate  = (buy.currency.iso_code.downcase + '_rate').to_sym

    exchanges = Exchange.active.geocoded.within_bounding_box(box).where.not(name: nil, address: nil).includes(pay_rate, buy_rate).includes(chain: [pay_rate, buy_rate])

    exchanges_offers = []
    exchanges.each do |exchange|
      offer = exchange.offer(center, pay, buy, distance)
      exchanges_offers << offer #unless (offer[:errors].any? and offer[:errors][0] != 'Out of radius' and !Rails.env.development?)
    end

    geoJsonize(exchanges_offers)

  end

  def geoJsonize(exchanges_offers)

    features = []
    exchanges_offers.each do |exchange_offer|
      features << to_geo(exchange_offer)
    end
    return {search: id, exchanges: {type: 'FeatureCollection', features: features}}.to_json

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

  def indicate_best(exchanges_offers, pay, buy)

    return [] if exchanges_offers.empty?

    transaction = buy.currency.iso_code != "GBP" ? 'sell' : 'buy'
    direction = pay.amount > 0 ? 'max' : 'min'

=begin
    exchanges_offers = exchanges_offers.select{|exchange_offer| exchange_offer[:rates][transaction.to_sym] != nil}

    return [] if exchanges_offers.empty?
=end

    nearest_exchange_offer = exchanges_offers.min_by{|exchange_offer| exchange_offer[:distance]}
    nearest_exchange_offer[:best_at] << 'nearest'

    nearest_distance = nearest_exchange_offer[:distance]

    if direction == 'min'

      cheapest_exchange_offer = exchanges_offers.min_by{|exchange_offer| exchange_offer[:rates][transaction.to_sym] || 1000000}
      cheapest_exchange_offer[:best_at] << 'cheapest'

      best_exchange_offer = exchanges_offers.select{|exchange_offer| exchange_offer[:distance] <= nearest_distance + 1}.min_by{|exchange_offer| exchange_offer[:rates][transaction.to_sym] || 1000000}
      best_exchange_offer[:best_at] << 'best'

    elsif direction == 'max'

      highest_exchange_offer = exchanges_offers.max_by{|exchange_offer| exchange_offer[:rates][transaction.to_sym] || -1}
      highest_exchange_offer[:best_at] << 'highest'

      best_exchange_offer = exchanges_offers.select{|exchange_offer| exchange_offer[:distance] <= nearest_distance + 1}.max_by{|exchange_offer| exchange_offer[:rates][transaction.to_sym] || 1000000}
      best_exchange_offer[:best_at] << 'best'

    end

    return exchanges_offers

  end

  def pane=(pane)
    @rest=pane
  end

  def radius=(radius)
    self.distance = radius
  end

end
