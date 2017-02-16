namespace :rates do
  desc "populate test rates"
  task :populate => :environment do


    currencies = %w[EUR USD AUD CAD JPY]
    factors = {'buy' => {'low' => 1.02, 'high' => 1.15}, 'sell' => {'low' => 0.95, 'high' => 0.98}}

    benchmark_rates = Chain.where(name: 'Debenhams').first.rates
    benchmark = {}
    currencies.each do |currency|
      next unless rate = benchmark_rates.where(currency: currency).first
      benchmark[currency] = {'buy' => rate.buy, 'sell' => rate.sell}
    end

    Exchange.no_rates.find_each do |exchange|

      exchange.update(rates_source: 'test', status: nil)
      exchange.rates.delete_all

      benchmark.keys.each do |currency|
        e_rate = {}
        ['buy', 'sell'].each { |kind| e_rate[kind] = benchmark[currency][kind] * rand(factors[kind]['low']..factors[kind]['high'])}
        exchange.rates.where(currency: currency).first_or_create.update(source: 'test', buy: e_rate['buy'], sell: e_rate['sell'])
      end

     end

  end

end