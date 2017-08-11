namespace :rates do
  desc "generate rates for rate-less exchanges"
  task :generate => :environment do

    Rails.logger.info ""
    Rails.logger.info "generate rates process started"
    Rails.logger.info ""

    current_rates       = Currency.rates
    currency_updatable  = Currency.updatable

    Exchange.with_no_real_rates.find_each do |exchange|

      unless exchange.currency.present?
        Rails.logger.info "Exchange #{exchange.id.to_s} has no currency - no rates generated"
        next
      end

      unless exchange.country.present?
        Rails.logger.info "Exchange #{exchange.id.to_s} has no country - no rates generated"
        next
      end

      exchange.update(rates_source: 'test', status: nil)
      exchange.rates.delete_all

      rates = currency_updatable.include?(exchange.currency) ? current_rates[exchange.currency.to_sym] : Currency.rates(exchange.currency)[exchange.currency.to_sym]
      markup = Currency.markup_policy(exchange.country)

      rates.each do |currency, rate|

        currency = currency.to_s
        next unless (currency_updatable.include? currency) && rate.present?
        sell_markup = markup[:sell_markup] + markup[:sell_spread] * rand(-1.0..1.0)
        sell_factor = 1 - (sell_markup / 100)
        sell = rate * sell_factor
        buy_markup = markup[:buy_markup] + markup[:buy_spread] * rand(-1.0..1.0)
        buy_factor = 1 + (buy_markup / 100)
        buy = rate * buy_factor
        exchange.rates.create(source: 'test', currency: currency, buy: buy, sell: sell, last_update: Time.now, last_process: 'rates:generate')

      end

    end


    Chain.with_no_real_rates.find_each do |chain|

      unless chain.currency.present?
        Rails.logger.info "Chain #{chain.id.to_s} has no currency - no rates generated"
        next
      end

      unless chain.exchanges.exists?
        Rails.logger.info "Chain #{chain.id.to_s} has no exchanges - no rates generated"
        next
      end

      chain.update(rates_source: 'test')
      chain.rates.delete_all

      rates = currency_updatable.include?(chain.currency) ? current_rates[chain.currency.to_sym] : Currency.rates(chain.currency)[chain.currency.to_sym]
      markup = Currency.markup_policy(chain.exchanges.first.country)

      rates.each do |currency, rate|

        currency = currency.to_s
        next unless (currency_updatable.include? currency) && rate.present?
        sell_markup = markup[:sell_markup] + markup[:sell_spread] * rand(-1.0..1.0)
        sell_factor = 1 - (sell_markup / 100)
        sell = rate * sell_factor
        buy_markup = markup[:buy_markup] + markup[:buy_spread] * rand(-1.0..1.0)
        buy_factor = 1 + (buy_markup / 100)
        buy = rate * buy_factor
        chain.rates.create(source: 'test', currency: currency, buy: buy, sell: sell, last_update: Time.now, last_process: 'rates:generate')

      end

    end

    Rails.logger.info ""
    Rails.logger.info "generate rates process finished"
    Rails.logger.info ""


  end

end