class Search < ActiveRecord::Base
  belongs_to :exchange
#  validates :email, presence: true#, on: :update #allow_nil: true #unless: Proc.new { |a| a.email.blank? }
#  validates :email, uniqueness: { case_sensitive: false }, allow_nil: true
  
  def exchanges
     
    return if         pay_currency.blank? or buy_currency.blank? or (pay_amount.blank? and buy_amount.blank?)
    return if         location_lat.blank? or location_lng.blank?
    pay             = Money.new(Monetize.parse(pay_amount).fractional, pay_currency)   # works whether pay_amount comes with currency symbol or not
    buy             = Money.new(Monetize.parse(buy_amount).fractional, buy_currency)   
    distance      ||=  20
    distance_unit ||= "km" 
    sort          ||= "quote"
    center          = [location_lat, location_lng]
    box             = Rails.application.config.use_google_geocoding ? Geocoder::Calculations.bounding_box(center, distance) : nil      # TODO: overcome failures, return all exchanges from DB # TODO: use requested unit

    # TODO: Important: expire cache key when applicable rate updated_at changes (check if possible: fresh_when @applicable_rate)
    #       If not possible, don't use cache, or rates will be stale
    if Rails.application.config.action_controller.perform_caching
      cache_key = "#{center.to_s}.#{distance} #{distance_unit}.#{pay_amount} #{pay_currency}.#{buy_amount} #{buy_currency}.#{sort}"
      Rails.logger.info("Using cache " + cache_key)
      Rails.cache.fetch("#{cache_key}", expires_in: 30.days) do
        find_exchanges(location, center, box, pay, buy, sort)
      end
    else
      Rails.logger.info("Not using cache")
      find_exchanges(location, center, box, pay, buy, sort)
    end
   
  end
    
  def find_exchanges(location, center, box, pay, buy, sort)
  
      @exchange_quotes = []
      # TODO: Like open_today, try if possible to define 'applicable_rate' scope that yields *one* rate record according to from & to currencies 
      if Rails.application.config.use_google_geocoding
        exchanges = Exchange.geocoded.within_bounding_box(box).where.not(name: nil, address: nil).includes(:open_today, :rates)
      # TODO: The following 2 options are temporary only
      elsif location.downcase.include?("london")
        exchanges = Exchange.geocoded.where.not(name: nil, address: nil).includes(:open_today, :rates).limit(50)
      else
        exchanges = []
      end
      exchanges.each do |exchange|

        exchange_quote = {}

        exchange_quote[:id] = exchange.id
        exchange_quote[:name] = exchange.name
        exchange_quote[:address] = exchange.address
        exchange_quote[:open_today] = exchange.todays_hours
        exchange_quote[:phone] = exchange.phone
        exchange_quote[:website] = exchange.website
        exchange_quote[:latitude] = exchange.latitude
        exchange_quote[:longitude] = exchange.longitude
        exchange_quote[:distance] = Rails.application.config.use_google_geocoding ?  exchange.distance_from(center) : rand(27..2789)
#        exchange_quote[:bearing] = Rails.application.config.use_google_geocoding ? Geocoder::Calculations.compass_point(exchange.bearing_from(center)) : "NE"
        exchange_quote[:pay_amount] = pay.amount > 0 ? pay.format : (Bank.exchange(buy.amount, buy.currency.iso_code, pay.currency.iso_code) * rand(0.67..0.99)).format
        exchange_quote[:pay_currency] = pay.currency.iso_code
        exchange_quote[:buy_amount] = buy.amount > 0 ? buy.format : (Bank.exchange(pay.amount, pay.currency.iso_code, buy.currency.iso_code) * rand(1.03..1.37)).format
        exchange_quote[:buy_currency] = buy.currency.iso_code
        exchange_quote[:edited_quote] = pay.amount > 0 ? exchange_quote[:buy_amount] : exchange_quote[:pay_amount]
        exchange_quote[:quote] = Monetize.parse(exchange_quote[:edited_quote]).amount
        exchange_quote[:gain_amount] =  pay.amount > 0 ? ((exchange_quote[:quote] * 0.127).to_money(buy.currency.iso_code)).format : ((exchange_quote[:quote] * 0.127).to_money(pay.currency.iso_code)).format
        exchange_quote[:gain_currency] = pay.amount > 0 ? buy.currency.iso_code : pay.currency.iso_code

        @exchange_quotes << exchange_quote

      end
      
      if sort == "quote"
        @exchange_quotes.sort_by{|e| e[:quote] || 1000000}
      else
        @exchange_quotes.sort_by{|e| e[:distance] }
      end

  end

  def hash
    self.rest
  end

  def hash=(val)
    self.rest = val
  end

  
end
