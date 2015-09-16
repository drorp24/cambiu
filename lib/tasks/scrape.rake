namespace :rates do
  desc "Scrape rates from html websites"
  task :scrape => :environment do

    Scraping.update('BFC', nil, "https://www.bfcexchange.co.uk/en/rates.html")

  end

end