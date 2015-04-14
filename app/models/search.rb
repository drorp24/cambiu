class Search < ActiveRecord::Base
  
  def exchanges
     
    return if         pay_currency.blank? or buy_currency.blank? or (pay_amount.blank? and buy_amount.blank?)
    pay             = Money.new(Monetize.parse(pay_amount).fractional, pay_currency)   # works whether pay_amount comes with currency symbol or not
    buy             = Money.new(Monetize.parse(buy_amount).fractional, buy_currency)   
    distance      ||=  20    
    distance_unit ||= "km" 
    sort          ||= "amount"
    center          = location.present? ? location : ((user_lat.present? and user_lng.present?) ? [user_lat, user_lng] : 'London')  
    box             = Geocoder::Calculations.bounding_box(center, distance)       # TODO: use requested unit

    # TODO: Important: expire cache key when applicable rate updated_at changes (check if possible: fresh_when @applicable_rate)
    #       If not possible, don't use cache, or rates will be stale
    if Rails.application.config.action_controller.perform_caching
      cache_key = "#{center.to_s}.#{distance} #{distance_unit}.#{pay_amount} #{pay_currency}.#{buy_amount} #{buy_currency}.#{sort}"
      Rails.logger.info("Using cache " + cache_key)
      Rails.cache.fetch("#{cache_key}", expires_in: 30.days) do
        find_exchanges(center, box, pay, buy, sort)
      end
    else
      Rails.logger.info("Not using cache")
      find_exchanges(center, box, pay, buy, sort)  
    end
   
  end
    
  def self.find_exchanges(center, box, pay, buy, sort)      
  
      @exchange_quotes = []
      # TODO: Like open_today, try if possible to define 'applicable_rate' scope that yields *one* rate record according to from & to currencies 
      exchanges = Exchange.geocoded.within_bounding_box(box).where.not(name: nil).includes(:open_today, :rates)
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
        exchange_quote[:distance] = Rails.application.config.use_google_geocoding ?  exchange.distance_from(center) : rand(1.2..17.9) 
        exchange_quote[:bearing] = Rails.application.config.use_google_geocoding ? Geocoder::Calculations.compass_point(exchange.bearing_from(center)) : "NE"  
        quote = Money.new(rand(33000..46000), buy.currency.iso_code) # exchange.quote(pay, buy) TODO: Handle random quotes
        exchange_quote[:edited_quote] = Currency.display(quote)
        exchange_quote[:quote] = quote.fractional / 100.00

        @exchange_quotes << exchange_quote

      end
      
      if sort == "quote"
        @exchange_quotes.sort_by{|e| e[:quote] || 1000000}
      else
        @exchange_quotes.sort_by{|e| e[:distance] }
      end

  end

  
end
