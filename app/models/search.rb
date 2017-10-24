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

#     Exchange.cache_clear

      response = {}

      if location.present?
        response = cached_offers
      else
        response = uncached_offers
      end

      response[:search][:id] = id

      if response[:result]
        self.result_service_type        = response[:result][:service_type]
        self.result_payment_method      = response[:result][:payment_method]
        self.result_radius              = response[:result][:radius]
        self.result_exchange_id         = response[:result][:exchange_id]
        self.result_exchange_name       = response[:result][:exchange_name]
        self.result_grade               = response[:result][:grade]
        self.result_distance            = response[:result][:distance]
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
      response[:error] = e.to_s

      response

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

    best_offer              = nil
    error                   = nil
    attempt                 = {}
    request = {
        service_type:         service_type,
        payment_method:       payment_method,
        radius:               radius
    }
    result = {
        service_type:         nil,
        payment_method:       nil,
        radius:               nil,
        exchange_id:          nil,
        exchange_name:        nil,
        exchange_name_he:     nil,
        exchange_address:     nil,
        exchange_address_he:  nil,
        grade:                nil,
        distance:             nil
    }

    center                  = [location_lat, location_lng]

    pay                     = Money.new(Monetize.parse(pay_amount).fractional, pay_currency)    # works whether pay_amount comes with currency symbol or not
    buy                     = Money.new(Monetize.parse(buy_amount).fractional, buy_currency)

    pay_rate                = (pay.currency.iso_code.downcase + '_rate').to_sym
    buy_rate                = (buy.currency.iso_code.downcase + '_rate').to_sym


    # 0 - original user request

    attempt[:center]          = center

    attempt.merge!(request)

    exchanges   = Exchange.retrieve(attempt)
    exchanges   = exchanges.includes(pay_rate, buy_rate).includes(chain: [pay_rate, buy_rate]) if exchanges.any?
    best_offer  = find_best_offer(exchanges, center, pay, buy, trans, calculated, attempt[:service_type], attempt[:payment_method]) if exchanges.any?

    if best_offer
      result.merge!(attempt)
    else

      # 1st proactive attempt - Unless we've just tried delivery, try looking for delivery offers now

      attempt[:service_type]    = 'delivery'
      attempt[:payment_method]  = 'credit'
      attempt[:radius]          = 100

      exchanges   = service_type != 'delivery' && Exchange.retrieve(attempt)
      exchanges   = exchanges.includes(pay_rate, buy_rate).includes(chain: [pay_rate, buy_rate]) if exchanges && exchanges.any?
      best_offer  = find_best_offer(exchanges, center, pay, buy, trans, calculated, attempt[:service_type], attempt[:payment_method]) if exchanges && exchanges.any?

      if best_offer
        result.merge!(attempt)
      else

        # 2 attempt - If no delivery offer exists either, and unless we've just tried normal radius pickup, we'll attempt for pick-up now

        attempt[:service_type]    = 'pickup'
        attempt[:payment_method]  = 'cash'
        attempt[:radius]          = 0.75

        exchanges   = service_type != 'pickup' && Exchange.retrieve(attempt)
        exchanges   = exchanges.includes(pay_rate, buy_rate).includes(chain: [pay_rate, buy_rate]) if exchanges && exchanges.any?
        best_offer  = find_best_offer(exchanges, center, pay, buy, trans, calculated, attempt[:service_type], attempt[:payment_method]) if exchanges && exchanges.any?

        if best_offer
          result.merge!(attempt)
        else

          # 3 - If no pickup offer found either, try looking for a pick-up offer in an extended radius

          attempt[:service_type]    = 'pickup'
          attempt[:payment_method]  = 'cash'
          attempt[:radius]          = 10

          exchanges   = Exchange.retrieve(attempt)
          exchanges   = exchanges.includes(pay_rate, buy_rate).includes(chain: [pay_rate, buy_rate]) if exchanges && exchanges.any?
          best_offer  = find_best_offer(exchanges, center, pay, buy, trans, calculated, attempt[:service_type], attempt[:payment_method]) if exchanges && exchanges.any?

          if best_offer
            result.merge!(attempt)
          else

            # 4 - No hope

            result = {
                service_type:   nil,
                payment_method: nil,
                radius:         nil
            }
          end

        end

      end

    end


    result.merge!(best_offer.slice(:exchange_id, :exchange_name, :exchange_name_he, :exchange_address, :exchange_address_he, :grade, :distance)) if best_offer
    best = best_offer ? best_offer[:rates] : nil
    worst = Exchange.bad_rate(country, buy_currency, pay_currency, trans, pay_currency)


    {
      search:   {cached: id},
      request:  request,
      result:   result,
      best:     best,
      worst:    worst,
      error:    error
    }

  end

  add_method_tracer :uncached_offers, 'Custom/uncached_offers'

  def find_best_offer(exchanges, center, pay, buy, trans, calculated, service_type, payment_method)

    best_offer    = nil
    best_grade    = 1000000000
    delivery      = service_type == 'delivery'
    credit        = payment_method == 'credit'

    exchanges.each do |exchange|

      # TODO: Change to array map/reduce
      offer = exchange.offer(center, pay, buy, trans, calculated, delivery, credit, self.id)

      unless offer[:errors].any?

        if offer[:grade] < best_grade
          best_offer = offer
          best_grade = offer[:grade]
        end

      end

    end

    best_offer

  end


end
