namespace :rates do
  desc "update reference rates"
  task :reference => :environment do


    Rails.logger.info ""
    Rails.logger.info "reference rates update process started"
    Rails.logger.info ""

    current_rates = Currency.rates
    Rate.reference.find_each do |rate|

      updated_currency  = rate.currency
      base_currency     = rate.ratable.currency
      current_rate      = current_rates[base_currency.to_sym][updated_currency.to_sym]
      sell_factor       = 1 - (rate.sell_markup.to_f / 100)
      buy_factor        = 1 + (rate.buy_markup.to_f / 100)
      sell              = current_rate * sell_factor
      buy               = current_rate * buy_factor

      rate.update(buy: buy, sell: sell, last_update: Time.now, last_process: 'rates:reference')

    end

    Rails.logger.info ""
    Rails.logger.info "reference rates update process finished"
    Rails.logger.info ""

  end

end


=begin
  Exchange.all.group_by(&:currency).each do |currency, exchanges|

    reference[currency.to_sym] = {}

    exchanges.each do |exchange|

      Rails.logger.info exchange.id.to_s + ' ' + exchange.currency if currency == ""
      exchange.rates.reference.each do |rate|

      end
    end
  end
=end
