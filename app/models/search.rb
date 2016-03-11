class Search < ActiveRecord::Base
  belongs_to :exchange
#  validates :email, presence: true#, on: :update #allow_nil: true #unless: Proc.new { |a| a.email.blank? }
#  validates :email, uniqueness: { case_sensitive: false }, allow_nil: true
  enum service_type: [ :collection, :delivery ]

  attr_accessor :fetch, :mode, :hash, :distance_slider

  def exchanges

    return if         pay_currency.blank? or buy_currency.blank? or (pay_amount.blank? and buy_amount.blank?)
    return if         location_lat.blank? or location_lng.blank?

    self.distance      ||=  20
    self.distance_unit ||= "km"
    self.sort          ||= "price"
    self.exchange_id = nil if self.mode == 'search'

    pay             = Money.new(Monetize.parse(pay_amount).fractional, pay_currency)   # works whether pay_amount comes with currency symbol or not
    buy             = Money.new(Monetize.parse(buy_amount).fractional, buy_currency)   
    center          = [location_lat, location_lng]
    box             = Rails.application.config.use_google_geocoding ? Geocoder::Calculations.bounding_box(center, distance) : nil      # TODO: overcome failures, return all exchanges from DB # TODO: use requested unit

    # TODO: Important: expire cache key when applicable rate updated_at changes (check if possible: fresh_when @applicable_rate)
    #       If not possible, don't use cache, or rates will be stale
=begin
    if self.exchange_id.blank? and Rails.application.config.action_controller.perform_caching and !Rails.env.production?
      cache_key = "#{center.to_s}.#{distance} #{distance_unit}.#{pay_amount} #{pay_currency}.#{buy_amount} #{buy_currency}.#{sort}"
      Rails.logger.info("Using cache " + cache_key)
      Rails.cache.fetch("#{cache_key}", expires_in: 30.days) do
        exchange_offers(exchange_id, location, center, box, pay, buy, sort, user_location)
      end
    else
      Rails.logger.info("Not using cache")
=end
      exchange_offers(exchange_id, location, center, box, pay, buy, sort, user_location)
#    end
   
  end
    
  def exchange_offers(exchange_id, location, center, box, pay, buy, sort, user_location)
  
      # TODO: Like open_today, try if possible to define 'applicable_rate' scope that yields *one* rate record according to from & to currencies
      if exchange_id
        exchanges = Array(Exchange.find_by_id(exchange_id))
      elsif Rails.application.config.use_google_geocoding
        exchanges = Exchange.with_real_rates.with_contract.geocoded.within_bounding_box(box).where.not(name: nil, address: nil).includes(:open_today, :rates)
      # TODO: The following 2 options are temporary only
      elsif location.downcase.include?("london")
        exchanges = Exchange.geocoded.where.not(name: nil, address: nil).includes(:open_today, :rates).limit(50)
      else
        exchanges = []
      end

      exchanges_offers = []
      exchanges.each do |exchange|
        exchange_offer = exchange.offer(center, pay, buy, user_location)
        exchanges_offers << exchange_offer
      end

      if self.sort == "price"
        exchanges_offers = exchanges_offers.sort_by { |e| e[:quote] || 1000000 }
        exchanges_offers.reverse! if pay.amount > 0
      else
        exchanges_offers = exchanges_offers.sort_by { |e| e[:distance] }
      end

      best_exchanges_offers = Search.best(exchanges_offers, pay, buy)

      {'best': best_exchanges_offers, 'more': exchanges_offers}
  end

  def self.best(exchanges_offers, pay, buy)

    return [] if exchanges_offers.empty?

    transaction = buy.currency.iso_code != "GBP" ? 'sell' : 'buy'
    direction = pay.amount > 0 ? 'max' : 'min'

    exchanges_offers_s = exchanges_offers.select{|exchange_offer| exchange_offer[:rates][transaction.to_sym] != nil}

    exchange_offer = exchanges_offers_s.min_by{|exchange_offer| exchange_offer[:distance]}
    nearest_exchange_offer = exchange_offer.dup
    nearest_exchange_offer[:best_at] = exchange_offer[:best_at] = 'nearest'

    nearest_distance = nearest_exchange_offer[:distance]

    if direction == 'min'

      exchange_offer = exchanges_offers_s.min_by{|exchange_offer| exchange_offer[:rates][transaction.to_sym] || 1000000}
      cheapest_exchange_offer = exchange_offer.dup
      cheapest_exchange_offer[:best_at] = exchange_offer[:best_at] = 'cheapest'

      exchange_offer = exchanges_offers_s.select{|exchange_offer| exchange_offer[:distance] <= nearest_distance + 1}.min_by{|exchange_offer| exchange_offer[:rates][transaction.to_sym] || 1000000}
      best_exchange_offer = exchange_offer.dup
      best_exchange_offer[:best_at] = exchange_offer[:best_at] = 'best'

    elsif direction == 'max'

      exchange_offer = exchanges_offers_s.max_by{|exchange_offer| exchange_offer[:rates][transaction.to_sym] || -1}
      highest_exchange_offer = exchange_offer.dup
      highest_exchange_offer[:best_at] = exchange_offer[:best_at] = 'highest'

      exchange_offer = exchanges_offers_s.select{|exchange_offer| exchange_offer[:distance] <= nearest_distance + 1}.max_by{|exchange_offer| exchange_offer[:rates][transaction.to_sym] || 1000000}
      best_exchange_offer = exchange_offer.dup
      best_exchange_offer[:best_at] = exchange_offer[:best_at] = 'best'

    end

    result = []
    result << best_exchange_offer
    result << nearest_exchange_offer
    result << (direction == 'min' ? cheapest_exchange_offer : highest_exchange_offer)

    result

  end


end
