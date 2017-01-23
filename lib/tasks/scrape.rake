namespace :rates do
  desc "Scrape rates from html websites"
  task :scrape => :environment do

    Rails.logger.info " "
    Rails.logger.info "Started periodic scraping task"
    Rails.logger.info " "

    Scraping.update('Debenhams',              nil, "http://finance.debenhams.com/travel-money/exchange-rates")
    Scraping.update('Travelex',               nil, "https://www.travelex.co.uk/currency/exchange-rates")
    Scraping.update('UAE',                    nil, "https://www.uaeexchange.com/gbr-foreign-exchange")
    Scraping.update('ICE',                    nil, "https://www.iceplc.com/travel-money/exchange-rates")

    Scraping.update('BFC',                    nil, "http://www.bfcexchange.co.uk")
    Scraping.update('Cheque Centre',          nil, "http://www.chequecentre.co.uk/foreign-currency")
    Scraping.update('Eurochange PLC',         nil, "https://www.eurochange.co.uk/exchangerates.aspx")
    Scraping.update('Eurochange PLC',         nil, "https://www.eurochange.co.uk/buybackexchangerates.aspx")
    Scraping.update('Thomas exchange global', nil, "https://www.thomasexchangeglobal.co.uk/exchange-rates-check-exchange-rates.php")
    Scraping.update('CEC ltd',                nil, "https://cecltd.com/?q=exchange-rates")
    Scraping.update(nil, 'Thomas Exchange UK',     "https://www.thomasexchange.co.uk/i_banknote_rates.asp")
    Scraping.update(nil, 'Natwest',                "http://www.natwest.com/tools/personal/currency_rates")

    Rails.logger.info " "
    Rails.logger.info "Finished periodic scraping task"
    Rails.logger.info " "

  end

end