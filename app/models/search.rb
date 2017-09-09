class Search < ActiveRecord::Base

  belongs_to :user
  belongs_to :exchange
  has_many  :orders
  has_many :issues, foreign_key: "search_id", class_name: "Error"

  attr_accessor :fetch, :hash, :distance_slider

  validate :valid_input, on: :create
  enum service_type: [ :pickup, :delivery, :all_serivce_types]
  enum payment_method: [ :cash, :credit, :all_payment_methods]
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


      exchange_offers

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

  def exchange_offers

    error             = nil
    message           = nil

    delivery          = service_type == 'delivery'
    credit            = payment_method == 'credit'
    center            = [location_lat, location_lng]
    pickup_radius     = 2.5
    extended_radius   = 50
    delivery_radius   = 100
    pickup_box        = Geocoder::Calculations.bounding_box(center, pickup_radius)
    delivery_box      = Geocoder::Calculations.bounding_box(center, delivery_radius)
    extended_box      = Geocoder::Calculations.bounding_box(center, extended_radius)
    box               = delivery ? delivery_box : pickup_box

    pay               = Money.new(Monetize.parse(pay_amount).fractional, pay_currency)   # works whether pay_amount comes with currency symbol or not
    buy               = Money.new(Monetize.parse(buy_amount).fractional, buy_currency)

    pay_rate          = (pay.currency.iso_code.downcase + '_rate').to_sym
    buy_rate          = (buy.currency.iso_code.downcase + '_rate').to_sym



    exchanges = Exchange.active.geocoded.
        within_bounding_box(box).
        includes(pay_rate, buy_rate).includes(chain: [pay_rate, buy_rate])

    exchanges            = exchanges.delivery.covering(center) if delivery
    exchanges            = exchanges.credit if credit

    if exchanges.count == 0

       # 1st attempt - Unless you've tried delivery already, try looking for delivery offers first
       # (the '!delivery' is meant to skip this trial in case delivery was just tried (the if structure would be herendous otherwise ))

      exchanges = !delivery &&
          Exchange.active.delivery.geocoded.
          within_bounding_box(delivery_box).
          covering(center).
          includes(pay_rate, buy_rate).includes(chain: [pay_rate, buy_rate])

      if exchanges && exchanges.any?
        message = credit ? 'noPickupCreditWouldYouLikeDelivery' : 'noPickupCashWouldYouLikeDelivery'
      else

        # 2 - If no delivery offer exists either, look for the best pick-up offer in the pickup radius

        exchanges = Exchange.active.geocoded.
            within_bounding_box(pickup_box).
            includes(pay_rate, buy_rate).includes(chain: [pay_rate, buy_rate])


        if exchanges && exchanges.any?
          message = 'bestPickup'

        else
          # 3 - If no pickup offer within pickup radius, look for the best pick-up offer in an extended radius
            exchanges = Exchange.active.geocoded.
                within_bounding_box(extended_box).
                includes(pay_rate, buy_rate).includes(chain: [pay_rate, buy_rate])


            if exchanges && exchanges.any?
              message = 'bestPickup'
            end

        end
      end

    end


    best_grade = 1000
    best_offer = nil
    exchanges_offers = []

    exchanges.each do |exchange|

      offer = exchange.offer(center, pay, buy, trans, calculated, delivery, credit)
      if mode == 'best'
        if offer[:grade] < best_grade
          best_offer = offer
          best_grade = offer[:grade]
        end
      else
        exchanges_offers << offer #unless (offer[:errors].any?
      end

    end

    if mode == 'full'

      exchanges_offers = exchanges_offers.sort_by{|e| e[:grade]}

      # Swap will be done when the best offer is different than the one already shown in previous localRates call (can happen if both have the same grade)
      if exchange_id and (exchanges_offers[0][:id] != exchange_id)
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

      best_offer = exchanges_offers[0]

    end

    if best_offer
      self.exchange_id  = best_offer[:id]
      self.best_grade   = best_offer[:grade]
      self.save
    end

    if mode == 'best'

      return {
          best: {
              buy:   best_offer ? best_offer[:rates].merge(name: best_offer[:name], grade: best_offer[:grade]) : nil,    # this structure was left for backward-compatibility with fe only
              sell:  best_offer ? best_offer[:rates].merge(name: best_offer[:name], grade: best_offer[:grade]) : nil,
              mixed: best_offer ? best_offer[:rates].merge(name: best_offer[:name], grade: best_offer[:grade]) : nil
          },
          worst:
              Exchange.bad_rate(country, buy_currency, pay_currency, trans, pay_currency),
          count: exchanges.count,
          error: error,
          message: message
      }
    else
      return geoJsonize(exchanges_offers, error, message)
    end

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

  def radius=(radius)
    self.distance = radius
  end

  def delivery_ind=(ind)
    self.service_type = 'delivery' if ind == 'on'
  end


end
