namespace :mongo do
  desc "create mongo db"
  task :extract => :environment do

    puts " "
    puts "Started mongo extract"
    puts " "

    updated, skipped = 0, 0

    Exchange.where(country: 'ISR').each do |exchange|

      if Merchant.where(name: exchange.name, address: exchange.address).exists?
        skipped += 1
        next
      end

      merchant = Merchant.new({
         place_id:          exchange.place_id,
         name:              exchange.name,
         name_he:           exchange.name_he,
         address:           exchange.address,
         address_he:        exchange.address_he,
         email:             exchange.email,
         phone:             exchange.phone,
         delivery:          exchange.delivery,
         delivery_charge:   exchange.delivery_charge,
         currency:          exchange.currency
      })

      merchant.build_location(coordinates: [exchange.longitude, exchange.latitude]) if exchange.longitude && exchange.latitude

      exchange.rates.each do |rate|
        merchant.quotations.build({currency: rate.currency, buy: rate.buy, sell: rate.sell})
      end

      merchant.save!
      updated += 1

    end

    puts" "
    puts "Finished mongo extract"
    puts " "
    puts "Updated: #{updated.to_s}"
    puts "Skipped: #{skipped.to_s}"
    puts " "

  end

end