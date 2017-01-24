namespace :rates do
  desc "Extract live rates from html and xml"
  task :extract => :environment do

    Rails.logger.info " "
    Rails.logger.info "Started periodic extract task"
    Rails.logger.info " "

    Extract.update('Ace-FX', nil, "http://www.ace-fx.com/feed/affrates", 'xml')
    Extract.update('Debenhams', nil, "http://finance.debenhams.com/travel-money/exchange-rates", 'html')
    Extract.update('Travelex', nil, "https://www.travelex.co.uk/currency/exchange-rates", 'html')
    Extract.update('UAE Exchange', nil, "https://www.uaeexchange.com/gbr-foreign-exchange", 'html')
    Extract.update('ICE', nil, "https://www.iceplc.com/travel-money/exchange-rates", 'html')
    Extract.update('Eurochange PLC', nil, "https://www.eurochange.co.uk/travel-money/exchange-rates", 'html')
    Extract.update('Eurochange PLC', nil, "https://www.eurochange.co.uk/travel-money/sell-exchange-rates", 'html')

    Extract.update('BFC', nil, "http://www.bfcexchange.co.uk", 'html')
    Extract.update('Cheque Centre', nil, "http://www.chequecentre.co.uk/foreign-currency", 'html')
    Extract.update('Thomas exchange global', nil, "https://www.thomasexchangeglobal.co.uk/exchange-rates-check-exchange-rates.php", 'html')
    Extract.update('CEC ltd', nil, "https://cecltd.com/?q=exchange-rates", 'html')
    Extract.update(nil, 'Thomas Exchange UK', "https://www.thomasexchange.co.uk/i_banknote_rates.asp", 'html')
    Extract.update(nil, 'Natwest', "http://www.natwest.com/tools/personal/currency_rates", 'html')

    Rails.logger.info " "
    Rails.logger.info "Finished periodic extract task"
    Rails.logger.info " "

  end

end