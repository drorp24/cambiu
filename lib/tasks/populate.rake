namespace :rates do
  desc "populate rates"
  task :populate => :environment do

    sell_low  = 0.85
    sell_high = 0.90
    buy_low   = 1.05
    buy_high  = 1.10
    eur = Bank.exchange(1, 'GBP', 'EUR').amount
    usd = Bank.exchange(1, 'GBP', 'USD').amount
    aud = Bank.exchange(1, 'GBP', 'AUD').amount
    cad = Bank.exchange(1, 'GBP', 'CAD').amount
    jpy = Bank.exchange(1, 'GBP', 'JPY').amount

    Exchange.find_each do |exchange|
      next if exchange.has_real_rates?
      e_eur_sell  = eur * rand(sell_low..sell_high)
      e_eur_buy   = eur * rand(buy_low..buy_high)
      e_usd_sell  = usd * rand(sell_low..sell_high)
      e_usd_buy   = usd * rand(buy_low..buy_high)
      e_aud_sell  = aud * rand(sell_low..sell_high)
      e_aud_buy   = aud * rand(buy_low..buy_high)
      e_cad_sell  = cad * rand(sell_low..sell_high)
      e_cad_buy   = cad * rand(buy_low..buy_high)
      e_jpy_sell  = jpy * rand(sell_low..sell_high)
      e_jpy_buy   = jpy * rand(buy_low..buy_high)
      exchange.update(rates_source: 'fake')
      exchange.rates.where(currency: 'EUR').first_or_create.update(source: 'fake', service_type: 0, currency: 'EUR', buy: e_eur_buy, sell: e_eur_sell)
      exchange.rates.where(currency: 'USD').first_or_create.update(source: 'fake', service_type: 0, currency: 'USD', buy: e_usd_buy, sell: e_usd_sell)
      exchange.rates.where(currency: 'AUD').first_or_create.update(source: 'fake', service_type: 0, currency: 'AUD', buy: e_aud_buy, sell: e_aud_sell)
      exchange.rates.where(currency: 'CAD').first_or_create.update(source: 'fake', service_type: 0, currency: 'CAD', buy: e_cad_buy, sell: e_cad_sell)
      exchange.rates.where(currency: 'JPY').first_or_create.update(source: 'fake', service_type: 0, currency: 'JPY', buy: e_jpy_buy, sell: e_jpy_sell)
    end

  end
end