namespace :rates do
  desc "pupdate ace rates"
  task :ace => :environment do

    require 'nokogiri'
    require 'open-uri'
    doc = Nokogiri::XML(open("http://www.ace-fx.com/feed/affrates"))

    exchange = Exchange.find(5)
    exchange.update(rates_source: 'xml')

    doc.css('rate').each do |rate|
      currency  = rate['code']
      buy       = rate['buyrate']
      sell      = rate['sellrate']
      exchange.rates.where(currency: currency).first_or_create.update(source: 'xml', currency: currency, buy: buy, sell: sell)
    end

  end

end