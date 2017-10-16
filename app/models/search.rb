require 'new_relic/agent/method_tracer'

class Search < ActiveRecord::Base

  include ::NewRelic::Agent::MethodTracer

  belongs_to :user
  belongs_to :bias_exchange,    class_name: "Exchange"
  belongs_to :result_exchange,  class_name: "Exchange"
  belongs_to :cached_search, class_name: "Search", foreign_key: :result_cached_search_id
  has_many :fetched_searches, class_name: "Search", foreign_key: :result_cached_search_id
  has_many  :orders
  has_many :issues, foreign_key: "search_id", class_name: "Error"

  validate :valid_input, on: :create
  enum service_type: [ :pickup, :delivery ]
  enum payment_method: [ :cash, :credit ]
  enum result_service_type: [ :Pickup, :Delivery, :Noservicetype ]
  enum result_payment_method: [ :Cash, :Credit, :Nopaymentmethod ]
  enum mode: [ :best, :full ]

#  scope :negate, ->(scope) { where(scope.where_values.reduce(:and).not) }

  scope :london, -> {where("location like ?", "%London%") }
  scope :telaviv, -> {where("location like ?", "%Tel%Aviv%") }
  scope :other, -> {where.not("location like ? OR location like ?", "%Tel%Aviv%", "%London%") }
  scope :empty, -> {where(location: nil) }


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

#      Exchange.cache_clear

      response = {}
      if location.present?
        response = cached_offers
      else
        response = uncached_offers
      end

      response[:search][:id] = id if mode == 'best'

      if mode == 'best' && response && response[:result]
        self.result_service_type        = response[:result][:service_type].capitalize
        self.result_payment_method      = response[:result][:payment_method].capitalize
        self.result_radius              = response[:result][:radius]
        self.result_exchange_id         = response[:result][:exchange_id]
        self.result_exchange_name       = response[:result][:exchange_name]
        self.result_grade               = response[:result][:grade]
        self.result_distance            = response[:result][:distance]
        self.result_count               = response[:count]
        if response[:search][:cached] && response[:search][:cached] < id
          self.result_cached            = true
          self.result_cached_search_id  = response[:search][:cached]
        end
        self.save
      end

      response

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

  def cached_offers
    Rails.cache.fetch("#{mode}-#{location}-#{pay_amount}-#{pay_currency}-#{buy_amount}-#{buy_currency}-#{trans}-#{calculated}-#{service_type}-#{payment_method}-#{radius}-#{bias_exchange_id || 'no_bias'}", expires_in: 0.5.hour) do
      puts "Not cached yet: inside exchanges for #{mode}-#{location}-#{pay_amount}-#{pay_currency}-#{buy_amount}-#{buy_currency}-#{trans}-#{calculated}-#{service_type}-#{payment_method}-#{radius}-#{bias_exchange_id || 'no_bias'}"
      uncached_offers
    end
  end

  add_method_tracer :cached_offers, 'Custom/cached_offers'

  def uncached_offers

    error             = nil
    message           = nil

    center            = [location_lat, location_lng]
    pickup_radius     = 0.75
    extended_radius   = 10
    delivery_radius   = 100

    box               = Geocoder::Calculations.bounding_box(center, radius)               # the original request
    pickup_box        = Geocoder::Calculations.bounding_box(center, pickup_radius)
    delivery_box      = Geocoder::Calculations.bounding_box(center, delivery_radius)
    extended_box      = Geocoder::Calculations.bounding_box(center, extended_radius)

    pay               = Money.new(Monetize.parse(pay_amount).fractional, pay_currency)    # works whether pay_amount comes with currency symbol or not
    buy               = Money.new(Monetize.parse(buy_amount).fractional, buy_currency)

    pay_rate          = (pay.currency.iso_code.downcase + '_rate').to_sym
    buy_rate          = (buy.currency.iso_code.downcase + '_rate').to_sym

    result_service_type   = service_type.capitalize
    result_payment_method = payment_method.capitalize
    result_radius         = radius


    exchanges = Exchange.active.geocoded.
        within_bounding_box(box).
        includes(pay_rate, buy_rate).includes(chain: [pay_rate, buy_rate])

    exchanges            = exchanges.delivery.covering(center) if service_type == 'delivery'
    exchanges            = exchanges.credit if payment_method == 'credit'


    offers = make_offers(exchanges, center, pay, buy, trans, calculated, service_type, payment_method)

    if offers[:count] == 0

      # 1st proactive attempt - Unless we've just tried delivery, try looking for delivery offers now

      exchanges = service_type != 'delivery' &&
          Exchange.active.delivery.geocoded.
              within_bounding_box(delivery_box).
              covering(center).
              includes(pay_rate, buy_rate).includes(chain: [pay_rate, buy_rate])

      if exchanges && exchanges.any?
        message   = payment_method == 'credit' ? 'noPickupCreditWouldYouLikeDelivery' : 'noPickupCashWouldYouLikeDelivery'
        result_service_type = 'Delivery'
        result_payment_method = 'Credit'
        result_radius = delivery_radius
        puts "1!"
      else

        # 2 attempt - If no delivery offer exists either, and unless we've just tried normal radius pickup, we'll attempt for pick-up now

        exchanges = service_type != 'pickup' &&
            Exchange.active.geocoded.
            within_bounding_box(pickup_box).
            includes(pay_rate, buy_rate).includes(chain: [pay_rate, buy_rate])


        if exchanges && exchanges.any?
          message   = 'bestPickup'
          result_service_type = 'Pickup'
          result_payment_method = 'Cash'
          result_radius = pickup_radius
          puts "2!"
        else

          # 3 - If no pickup offer found either, try looking for a pick-up offer in an extended radius

          exchanges = Exchange.active.geocoded.
              within_bounding_box(extended_box).
              includes(pay_rate, buy_rate).includes(chain: [pay_rate, buy_rate])


          if exchanges && exchanges.any?
            message   = 'bestPickup'
            result_service_type = 'Pickup'
            result_payment_method = 'Cash'
            result_radius = extended_radius
            puts "3!"
          end

        end
      end

      offers = make_offers(exchanges, center, pay, buy, trans, calculated, result_service_type.downcase, result_payment_method.downcase)

      if offers[:count] == 0
        message = 'No result found'
        result_service_type = 'Noservicetype'
        result_payment_method = 'Nopaymentmethod'
        result_radius = 0
      end

    end


    count             = offers[:count]
    exchanges_offers  = offers[:exchanges_offers]
    best_offer        = offers[:best_offer]


    if best_offer
      puts result_service_type
      puts result_payment_method
      result_exchange_id     =      best_offer[:id]
      result_exchange_name    =     best_offer[:name]
      result_exchange_name_he =     best_offer[:name_he]
      result_exchange_address =     best_offer[:address]
      result_exchange_address_he =  best_offer[:address_he]
      result_grade           =      best_offer[:grade]
      result_distance        =      best_offer[:distance]
    end


    if mode == 'best'


       {
          search: {
              cached: id
          },
          request: {
              service_type:         service_type,
              payment_method:       payment_method,
              radius:               radius
          },
          result: {
              service_type:         result_service_type.downcase,
              payment_method:       result_payment_method.downcase,
              radius:               result_radius,
              exchange_id:          result_exchange_id,
              exchange_name:        result_exchange_name,
              exchange_name_he:     result_exchange_name_he,
              exchange_address:     result_exchange_address,
              exchange_address_he:  result_exchange_address_he,
              grade:                result_grade,
              distance:             result_distance
          },
          best:
              best_offer ? best_offer[:rates] : nil,
          worst:
              Exchange.bad_rate(country, buy_currency, pay_currency, trans, pay_currency),
          count: count,
          error: error,
          message: message
      }
    else
       geoJsonize(exchanges_offers, error, message)
    end

  end

  add_method_tracer :uncached_offers, 'Custom/uncached_offers'

  def make_offers(exchanges, center, pay, buy, trans, calculated, service_type, payment_method)

    best_grade = 1000000000
    best_offer = nil
    exchanges_offers = []
    count = 0
    delivery = service_type == 'delivery'
    credit = payment_method == 'credit'

    exchanges.each do |exchange|

      offer = exchange.offer(center, pay, buy, trans, calculated, delivery, credit, self.id)

      unless offer[:errors].any?

        count  += 1          # counts the error-less offers, thus serving as a common way to check if there are any offers regardless of method

        if mode == 'best'
          if offer[:grade] < best_grade
            best_offer = offer
            best_grade = offer[:grade]
          end
        else
          exchanges_offers << offer
        end

      end

    end

    if mode == 'full' and count > 0
      exchanges_offers = exchanges_offers.sort_by{|e| e[:grade]}
      exchanges_offers = bias(exchanges_offers, bias_exchange_id)
      best_offer = exchanges_offers[0]
    end

   {
    exchanges_offers: exchanges_offers.first(10),
    best_offer:       best_offer,
    count:            [count, 10].min
  }

  end



  def bias(exchanges_offers, exchange_id)

    # Swap will be done when the best offer is different than the one already shown in previous localRates call (can happen if both have the same grade)
    if exchanges_offers.any? and exchange_id and (exchanges_offers[0][:id] != exchange_id)
      puts ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
      puts ">>>>>>>>>> S W A P >>>>>>>>>>>>>>>>>"
      puts ""
      puts "exchange_id: " + exchange_id.to_s
      puts ""
      puts "exchanges_offers[0][:id]: " + exchanges_offers[0][:id].to_s
      puts ""
      puts "exchanges_offers,count: " + exchanges_offers.count.to_s
      puts ""
      puts "exchanges_offers[0].inspect:"
      puts exchanges_offers[0].inspect
      puts ""
      puts ""
      exchange_id_index = exchanges_offers.each_index.find{|i| exchanges_offers[i][:id] == exchange_id}
      puts "exchange_id_index: " + exchange_id_index.to_s
      puts ""
      if exchange_id_index
        e_best = exchanges_offers[exchange_id_index]
      else
        puts "exchange_id is not in exchanges_offers. No swap."
      end
      e_0 = exchanges_offers[0]
      if e_best
        if (e_best[:grade] <= e_0[:grade])
          puts "Swapped exchange_id #{e_0[:id]} whose grade is #{e_0[:grade]} with #{e_best[:id]} whose grade is #{e_best[:grade]}"
          e_0, e_best = e_best, e_0
        else
          puts "Didnt swap exchange_id #{e_0[:id]} whose grade is #{e_0[:grade]} with #{e_best[:id]} whose grade is #{e_best[:grade]}"
        end
      end
      puts ""
      puts ">>>>>>>>>> S W A P >>>>>>>>>>>>>>>>>"
      puts ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
    end

    exchanges_offers
  end







  def geoJsonize(exchanges_offers, error, message = nil)

    features = []
    exchanges_offers.each do |exchange_offer|
      features << to_geo(exchange_offer)
    end
    return {search: id, error: error, message: message, exchanges: {type: 'FeatureCollection', features: features}}.to_json

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


  def delivery_ind=(ind)
    self.service_type = 'delivery' if ind == 'on'
  end


end
