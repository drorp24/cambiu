namespace :rates do
  desc "Update ace rates"
  task :ace => :environment do

    require 'nokogiri'
    require 'open-uri'
    doc = Nokogiri::XML(open("http://www.ace-fx.com/feed/affrates"))

    chain = Chain.find_by(name: 'Ace-FX')
    chain.update(rates_source: 'xml')
    chain.exchanges.each do |exchange|
      exchange.update(rates_source: 'xml')
    end

    doc.css('rate').each do |rate|
      currency  = rate['code']
      buy       = rate['buyrate']
      sell      = rate['sellrate']

      chain.rates.where(currency: currency).first_or_create.update(source: 'xml', currency: currency, buy: buy, sell: sell, last_update: DateTime.current)
    end

  end

end