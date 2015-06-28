# encoding: UTF-8

require 'tod'

class Exchange < ActiveRecord::Base
  has_many :searches
  has_many :orders
  
  belongs_to  :chain
  has_many    :business_hours
  has_one     :open_today, -> {where(day: Date.today.wday)}, class_name: "BusinessHour"
  accepts_nested_attributes_for :business_hours
  has_many :rates, as: :ratable
  accepts_nested_attributes_for :rates
  belongs_to  :upload
  belongs_to  :admin_user
  enum business_type: [ :exchange, :post_office, :supermarket, :other ]
  
  geocoded_by :address

  # TODO: Currently returns error unless either of the currencies is local. Generalize.
  def quote(params)

    errors = []
    pay_currency        =   params[:pay_currency]
    get_currency        =   params[:get_currency]

    if currency.nil?
      errors           <<   'No local currency defined for that exchange'
    elsif pay_currency == currency and get_currency != pay_currency
      local_currency    =   pay_currency
      foreign_currency  =   get_currency
    elsif get_currency == currency and get_currency != pay_currency
      local_currency    =   get_currency
      foreign_currency  =   pay_currency
    else
      errors           <<  'Either of the currencies must be local (and only one)'
    end

    unless errors.any?
      rate = rates.where(currency: foreign_currency).first
      if rate
        unless rate.buy
          errors         <<   foreign_currency + ' buy rate is missing'
        end
        unless rate.sell
          errors         <<   foreign_currency + ' sell rate is missing'
        end
      else
        errors           <<  'No rate defined for ' + foreign_currency
      end
    end

    unless errors.any?

      pay_amount          =   Monetize.parse(params[:pay_amount]).amount
      get_amount          =   Monetize.parse(params[:get_amount]).amount
      field               =   params[:field]

      calculate           = (field == 'pay_amount' or field == 'pay_currency')  ? 'get'  : 'pay'
      transaction         = pay_currency == local_currency                    ? 'sell' : 'buy'

      if    calculate == 'get' and transaction == 'sell'
        get_amount  =   pay_amount * rate.sell
      elsif calculate == 'get' and transaction == 'buy'
        get_amount  =   pay_amount / rate.buy
      elsif calculate == 'pay' and transaction == 'sell'
        pay_amount  =   get_amount / rate.sell
      elsif calculate == 'pay' and transaction == 'buy'
        pay_amount  =   get_amount / rate.buy
      end

    end

    puts "get_amount is...: " + get_amount.to_s

    result = {
        pay_amount:   pay_amount,
        pay_currency: pay_currency,
        get_amount:   get_amount,
        get_currency: get_currency,
        errors: errors
    }
    result

  end

  def admin_user
    AdminUser.find_by_id(admin_user_id).email if admin_user_id
  end

  def offer(center, pay, buy)

    exchange_hash = {}

    exchange_hash[:id] = self.id
    exchange_hash[:name] = self.name
    exchange_hash[:address] = self.address
    exchange_hash[:open_today] = self.todays_hours
    exchange_hash[:phone] = self.phone
    exchange_hash[:website] = self.website
    exchange_hash[:latitude] = self.latitude
    exchange_hash[:longitude] = self.longitude
    exchange_hash[:distance] = Rails.application.config.use_google_geocoding ?  self.distance_from(center) : rand(27..2789)
    exchange_hash[:pay_amount] = pay.amount > 0 ? pay.format : (Bank.exchange(buy.amount, buy.currency.iso_code, pay.currency.iso_code) * rand(1.03..1.37)).format
    exchange_hash[:pay_currency] = pay.currency.iso_code
    exchange_hash[:buy_amount] = buy.amount > 0 ? buy.format : (Bank.exchange(pay.amount, pay.currency.iso_code, buy.currency.iso_code) * rand(1.03..1.37)).format
    exchange_hash[:buy_currency] = buy.currency.iso_code
    exchange_hash[:edited_quote] = pay.amount > 0 ? exchange_hash[:buy_amount] : exchange_hash[:pay_amount]
    exchange_hash[:quote] = Monetize.parse(exchange_hash[:edited_quote]).amount
    exchange_hash[:gain_amount] =  pay.amount > 0 ? ((exchange_hash[:quote] * 0.127).to_money(buy.currency.iso_code)).format : ((exchange_hash[:quote] * 0.127).to_money(pay.currency.iso_code)).format
    exchange_hash[:gain_currency] = pay.amount > 0 ? buy.currency.iso_code : pay.currency.iso_code
    exchange_hash[:logo] = self.logo ? ActionController::Base.helpers.image_path(self.logo) : nil
    exchange_hash[:logo_ind] = self.logo

    exchange_hash

  end

=begin
  def quote(rate, params, sessionKey)

    pay_amount = Monetize.parse(params[:pay_amount]).amount
    pay_currency = params[:pay_currency]
    buy_amount = Monetize.parse(params[:buy_amount]).amount
    buy_currency = params[:buy_currency]
    field = params[:field]
    if field == 'pay_amount'
      buy_amount = pay_amount * rate
    elsif field == 'buy_amount'
      pay_amount = buy_amount * rate
    end

    gain_amount = field == 'pay_amount' ? buy_amount * 0.13 : pay_amount * 0.13
    gain_currency = field == 'pay_amount' ? buy_currency : pay_currency

    result = {}

    result[:buy_amount] = Monetize.parse(buy_amount, buy_currency).format
    result[:buy_currency] = buy_currency
    result[:pay_amount] = Monetize.parse(pay_amount, pay_currency).format
    result[:pay_currency] = pay_currency
    result[:gain_amount] = Monetize.parse(gain_amount, gain_currency).format
    result[:gain_currency] = gain_currency
    result[:field] = field
    result[:rate] = rate
    result[:sessionKey] = sessionKey

    result

  end
=end

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

=begin
  # TODO: Write anew
  def quote(pay, buy)
    return nil unless rates
    return nil unless 
      (rate = rates.where(pay_currency: pay_currency, buy_currency: buy_currency).first) or
      (rev_rate = rates.where(buy_currency: pay_currency, pay_currency: buy_currency).first) 
    if rate
      return nil unless rate.pay_cents.present? and rate.buy_cents.present?
      buy_cents = pay_amount.to_i * 100 * (rate.buy_cents.to_f / rate.pay_cents.to_f)
    end
    if rev_rate
      return nil unless rev_rate.pay_cents.present? and rev_rate.buy_cents.present?      
      buy_cents = pay_amount.to_i * 100 * (rev_rate.pay_cents.to_f / rev_rate.buy_cents.to_f)  #TODO: Introduce buy vs sell rates
    end
    Money.new(buy_cents, buy_currency)
  end
=end



  def effective_rates
    rates.any? ? rates : (chain ? chain.rates : nil)
  end
  
# TODO: Remove. All search will be handled by Search model
    
  def self.search(params)
     
    return if params[:pay_currency].blank? or params[:buy_currency].blank? or params[:actual_pay_amount].blank?
    location_search = params[:location_search]
    latitude =        params[:latitude] 
    longitude =       params[:longitude]
    distance =        params[:distance].present? ? params[:distance] : 20     

    pay_currency =    params[:pay_currency]
    buy_currency =    params[:buy_currency]
    pay_amount =      params[:actual_pay_amount] # before: Currency.strip(params[:pay_amount])
    sort =            params[:sort] || "amount"
    
    center = location_search.present? ? location_search : ((latitude.present? and longitude.present?) ? [latitude, longitude] : 'London')  
  # center = ['London']    # TODO: Force London. This is to first check it can find exchanges by the user's location
    box = Geocoder::Calculations.bounding_box(center, distance)

    cache_key = "#{location_search}#{latitude}#{longitude}#{distance}#{pay_currency}#{buy_currency}#{pay_amount}#{sort}"
    if Rails.application.config.action_controller.perform_caching
        Rails.logger.info("searched results fetched from cache")
        Rails.cache.fetch("#{cache_key}", expires_in: 30.days) do
          perform_search(center, box, pay_amount, pay_currency, buy_currency, sort)
        end
    else
      Rails.logger.info("searched results *not* fetched from cache")
      perform_search(center, box, pay_amount, pay_currency, buy_currency, sort)  
    end
   
  end
    
  def self.perform_search(center, box, pay_amount, pay_currency, buy_currency, sort)      
  
      @exchange_quotes = []
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
        exchange_quote[:quote] = nil
        if pay_amount  and pay_currency and buy_currency     
          if quote = Money.new(rand(330..460), buy_currency) # exchange.quote(pay_currency, buy_currency, pay_amount) TODO: Handle random quotes
            exchange_quote[:edited_quote] = Currency.display(quote)
            quote = quote.fractional / 100.00
            exchange_quote[:quote] = quote
          end
        end
        @exchange_quotes << exchange_quote
      end
      
      if sort == "quote"
        @exchange_quotes.sort_by{|e| e[:quote] || 1000000}
      else
        @exchange_quotes.sort_by{|e| e[:distance] }
      end

  end

  def old_quote(pay_currency, buy_currency, pay_amount)
    return nil unless rates
    return nil unless 
      (rate = rates.where(pay_currency: pay_currency, buy_currency: buy_currency).first) or
      (rev_rate = rates.where(buy_currency: pay_currency, pay_currency: buy_currency).first) 
    if rate
      return nil unless rate.pay_cents.present? and rate.buy_cents.present?
      buy_cents = pay_amount.to_i * 100 * (rate.buy_cents.to_f / rate.pay_cents.to_f)
    end
    if rev_rate
      return nil unless rev_rate.pay_cents.present? and rev_rate.buy_cents.present?      
      buy_cents = pay_amount.to_i * 100 * (rev_rate.pay_cents.to_f / rev_rate.buy_cents.to_f)  #TODO: Introduce buy vs sell rates
    end
    Money.new(buy_cents, buy_currency)
  end

# TODO: STOPPED WORKING: something to do with BusinessHour serialize by Tod::TimeOfDay
# Landing database works find: open1.class is Tod::TimeOfDay, but staging serialize puts string in there
# The symptom: cannot save a BusinessHour instance record after putting there a tod object in open1

=begin
  def todays_hours
    bh = open_today
        return nil unless bh
        puts self.id  
    open1 = bh.open1 ? bh.open1.strftime("%H:%M") : nil
    close1 = bh.close1 ? bh.close1.strftime("%H:%M") : nil
    open2 = bh.open2 ? bh.open2.strftime("%H:%M") : nil
    close2 = bh.close2 ? bh.close2.strftime("%H:%M") : nil
    if open1 and close1
      result = open1 + " - " + close1
      if open2 and close2
        result += ", " + open2 + " - " + close2
      end
    end
    result
  end 
=end

  def todays_hours 
    @todays_hours ||= make_hour(rand(7..10)) + " - " + make_hour(rand(17..20))
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

=begin
  def open_today
    bh = self.business_hours.where(day: Date.today.wday).first
    return nil unless bh
    open1 = bh.open1 ? bh.open1.strftime("%H:%M") : nil
    close1 = bh.close1 ? bh.close1.strftime("%H:%M") : nil
    open2 = bh.open2 ? bh.open2.strftime("%H:%M") : nil
    close2 = bh.close2 ? bh.close2.strftime("%H:%M") : nil
    if open1 and close1
      result = open1 + " - " + close1
      if open2 and close2
        result += ", " + open2 + " - " + close2
      end
    end
    result
  end
=end  


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

  protected


end
