namespace :rates do
  desc "xml release prepare"
  task :xml => :environment do

    Exchange.find_each do |exchange|
      exchange.update(rates_policy: 'individual')
    end

    Chain.find_each do |chain|
      chain.update(rates_source: 'no_rates', currency: 'GBP')
    end

    ace = Chain.where(name: 'Ace-FX').first_or_create
    ace.update(currency: 'GBP', rates_source: 'no_rates')

    [4,5,6].each do |id|
      Exchange.find(id).update(chain_id: ace.id, rates_policy: 'chain')
    end

  end

end