class Exchange < ActiveRecord::Base
  
  belongs_to  :chain
  has_many    :business_hours
  accepts_nested_attributes_for :business_hours
  has_many    :rates
  accepts_nested_attributes_for :rates
  belongs_to  :upload
  belongs_to  :admin_user
  enum business_type: [ :exchange, :post_office, :supermarket, :other ]
  

  def quote(buy_amount, buy_currency, pay_currency)
    return nil unless rates
    return nil unless 
      (rate = rates.where(buy_currency: buy_currency, pay_currency: pay_currency).first) or
      (rev_rate = rates.where(buy_currency: pay_currency, pay_currency: buy_currency).first) 
    if rate
      return nil unless rate.pay_cents.present? and rate.buy_cents.present?
      pay_cents = buy_amount.to_i * 100 * (rate.pay_cents.to_f / rate.buy_cents.to_f)
    end
    if rev_rate
      return nil unless rev_rate.pay_cents.present? and rev_rate.buy_cents.present?      
      pay_cents = buy_amount.to_i * 100 * (rev_rate.buy_cents.to_f / rev_rate.pay_cents.to_f)
    end
    Money.new(pay_cents, pay_currency)
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
        bh.open1 =  TimeOfDay(hours1[0])
        bh.close1 = TimeOfDay(hours1[2])
      end
      if !hours[2].blank?
        hours2 = hours[2].partition("-")
        bh.open2 =  TimeOfDay(hours2[0])
        bh.close2 = TimeOfDay(hours2[2])
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
        b.send "#{col}=", TimeOfDay.parse(tod)
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
   

end
