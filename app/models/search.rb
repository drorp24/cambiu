class Search < ActiveRecord::Base
#  belongs_to :exchange
  has_many  :orders
  has_many :issues, foreign_key: "search_id", class_name: "Error"
#  validates :email, presence: true#, on: :update #allow_nil: true #unless: Proc.new { |a| a.email.blank? }
#  validates :email, uniqueness: { case_sensitive: false }, allow_nil: true
  enum service_type: [ :collection, :delivery ]

  attr_accessor :fetch, :mode, :hash, :distance_slider

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

    self.distance      ||=  20
    self.distance_unit ||= "km"

    pay             = Money.new(Monetize.parse(pay_amount).fractional, pay_currency)   # works whether pay_amount comes with currency symbol or not
    buy             = Money.new(Monetize.parse(buy_amount).fractional, buy_currency)   
    center          = [location_lat, location_lng]
    box             = Geocoder::Calculations.bounding_box(center, distance)

    exchange_offers(exchange_id, location, center, box, pay, buy)

  end

  def exchange_offers(exchange_id, location, center, box, pay, buy)

    exchanges_offers = []
    pay_rate  = (pay.currency.iso_code.downcase + '_rate').to_sym
    buy_rate  = (buy.currency.iso_code.downcase + '_rate').to_sym

    exchanges = Exchange.with_rates.geocoded.within_bounding_box(box).where.not(name: nil, address: nil).includes(pay_rate, buy_rate).includes(chain: [pay_rate, buy_rate])

    exchanges.each do |exchange|
      offer = exchange.offer(center, pay, buy)
      exchanges_offers << offer unless (offer[:errors].any? and !Rails.env.development?)
    end

#    exchanges_offers = indicate_best(exchanges_offers, pay, buy) if exchanges.any?

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
