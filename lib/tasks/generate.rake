namespace :rates do
  desc "generate rates for rate-less exchanges"
  task :generate => :environment do

    Rails.logger.info ""
    Rails.logger.info "generate rates process started"
    Rails.logger.info ""

    current_rates = Currency.rates
    markup_policy = Currency.markup

    Exchange.with_no_real_rates.find_each do |exchange|

      unless exchange.currency.present?
        Rails.logger.info "Exchange #{exchange.id.to_s} has no currency - no rates generated"
        next
      end

      unless exchange.country.present?
        Rails.logger.info "Exchange #{exchange.id.to_s} has no country - no rates generated"
        next
      end

      if markup_policy[exchange.country.to_sym].present?
        markup = markup_policy[exchange.country.to_sym]
      else
        markup = markup_policy[:default]
        Rails.logger.info "Define markup policy for country #{exchange.country} - default policy used"
      end

      exchange.update(rates_source: 'test', status: nil)
      exchange.rates.delete_all

      rates = current_rates[exchange.currency.to_sym]

      rates.each do |currency, rate|

        sell_markup = markup[:sell_markup] + markup[:sell_spread] * rand(-1.0..1.0)
        sell_factor = 1 - (sell_markup / 100)
        sell = rate * sell_factor
        buy_markup = markup[:buy_markup] + markup[:buy_spread] * rand(-1.0..1.0)
        buy_factor = 1 + (buy_markup / 100)
        buy = rate * buy_factor
        exchange.rates.create(source: 'test', currency: currency, buy: buy, sell: sell, last_update: Time.now, last_process: 'rates:generate')

      end

    end


    Rails.logger.info ""
    Rails.logger.info "generate rates process finished"
    Rails.logger.info ""


  end

end