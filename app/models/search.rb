class Search < ActiveRecord::Base
  belongs_to :exchange
#  validates :email, presence: true#, on: :update #allow_nil: true #unless: Proc.new { |a| a.email.blank? }
#  validates :email, uniqueness: { case_sensitive: false }, allow_nil: true
  enum service_type: [ :collection, :delivery ]

  def exchanges
     
    return if         pay_currency.blank? or buy_currency.blank? or (pay_amount.blank? and buy_amount.blank?)
    return if         location_lat.blank? or location_lng.blank?

    self.distance      ||=  20
    self.distance_unit ||= "km"
    self.sort          ||= "quote"

    pay             = Money.new(Monetize.parse(pay_amount).fractional, pay_currency)   # works whether pay_amount comes with currency symbol or not
    buy             = Money.new(Monetize.parse(buy_amount).fractional, buy_currency)   
    center          = [location_lat, location_lng]
    box             = Rails.application.config.use_google_geocoding ? Geocoder::Calculations.bounding_box(center, distance) : nil      # TODO: overcome failures, return all exchanges from DB # TODO: use requested unit

    # TODO: Important: expire cache key when applicable rate updated_at changes (check if possible: fresh_when @applicable_rate)
    #       If not possible, don't use cache, or rates will be stale
    if exchange_id.blank? and Rails.application.config.action_controller.perform_caching and !Rails.env.production?
      cache_key = "#{center.to_s}.#{distance} #{distance_unit}.#{pay_amount} #{pay_currency}.#{buy_amount} #{buy_currency}.#{sort}"
      Rails.logger.info("Using cache " + cache_key)
      Rails.cache.fetch("#{cache_key}", expires_in: 30.days) do
        exchange_offers(exchange_id, location, center, box, pay, buy, sort, user_location)
      end
    else
      Rails.logger.info("Not using cache")
      exchange_offers(exchange_id, location, center, box, pay, buy, sort, user_location)
    end
   
  end
    
  def exchange_offers(exchange_id, location, center, box, pay, buy, sort, user_location)
  
      # TODO: Like open_today, try if possible to define 'applicable_rate' scope that yields *one* rate record according to from & to currencies
      if exchange_id
        exchanges = Array(Exchange.find_by_id(exchange_id))
      elsif Rails.application.config.use_google_geocoding
        exchanges = Exchange.with_contract.geocoded.within_bounding_box(box).where.not(name: nil, address: nil).includes(:open_today, :rates)
      # TODO: The following 2 options are temporary only
      elsif location.downcase.include?("london")
        exchanges = Exchange.geocoded.where.not(name: nil, address: nil).includes(:open_today, :rates).limit(50)
      else
        exchanges = []
      end

      @exchange_offers = []
      exchanges.each do |exchange|
        exchange_offer = exchange.offer(center, pay, buy, user_location)
        @exchange_offers << exchange_offer #unless exchange_offer[:errors].any?
      end
      
       if self.sort == "quote"
        @exchange_offers = @exchange_offers.sort_by{|e| e[:quote] || 1000000}
      else
        @exchange_offers = @exchange_offers.sort_by{|e| e[:distance] }
      end

      @exchange_offers
  end

  def hash
    self.rest
  end

  def hash=(val)
    self.rest = val
  end

  
end
