require 'rubygems'
require 'nokogiri'
require 'open-uri'
require "erb"
include ERB::Util
#require 'openssl'
#OpenSSL::SSL::VERIFY_PEER = OpenSSL::SSL::VERIFY_NONE

class Scraping


  # Generic envelope. Works for all html pages whose rates are in 'table tbody tr' elements
  def self.update(chain_name=nil, exchange_name=nil, url)

    begin


      if chain_name
        raise "No such chain: #{chain_name}" unless chain = Chain.find_by(name: chain_name)
        chain.update(currency: 'GBP', rates_source: 'scraping', rates_update: DateTime.now)
        chain.exchanges.each do |exchange|
          exchange.update(rates_policy: 'chain', rates_source: 'scraping')
        end
      elsif exchange_name
        raise "No such exchange: #{exchange_name}" unless exchange = Exchange.find_by(name: exchange_name)
        exchange.update(rates_policy: 'individual', rates_source: 'scraping')
      else
        raise "Neither chain nor exchange were passed in"
      end

      raise "No such url: #{url}" unless doc = Nokogiri::HTML(open(url))

      parse_rates(url, doc, chain, exchange)

    rescue => e

      Rails.logger.info "parsing " + url + " failed:"
      Rails.logger.info e

    else

      Rails.logger.info "parsing " + url + " succeeded"

    end


    end

  def self.parse_rates(url, doc, chain, exchange)

    if url == "http://finance.debenhams.com/travel-money/exchange-rates"

      doc.css('table tbody tr:not(:first-child):not(.hiddenrow)').each do |li|
        currency_name = li.css('td')[0].text.strip
        currency   =
            case currency_name
              when 'Japanese Yen'
                'JPY'
              when 'Canadian Dollar'
                'CAD'
              when 'Australian Dollar'
                'AUD'
              when 'US Dollar'
                'USD'
              when 'Euro'
                'EUR'
              when 'Norwegian Kroner'
                'NOK'
              else
                nil
            end
        next unless Currency.updatable.include? currency
        sell = li.css('td')[1].text.strip
        buy = li.css('td')[2].text.strip
        rate_update(currency, buy, sell, chain, exchange)
      end

    elsif url == "https://www.travelex.co.uk/currency/exchange-rates"

      doc.css('.currency-holder .row:not(.title)').each do |li|
        currency = li.css('span')[1][/\(.*?\)/]
        next unless Currency.updatable.include? currency
        buy = li.css('span')[2]
        sell = nil
        rate_update(currency, buy, sell, chain, exchange)
      end

    elsif url == "https://www.uaeexchange.com/gbr-foreign-exchange"

      doc.css('table tr[class]').each do |li|
        currency = li.css('td')[1].text
        next unless Currency.updatable.include? currency
        buy = li.css('td')[2].text
        sell = li.css('td')[3].text
        rate_update(currency, buy, sell, chain, exchange)
      end

    elsif url == "https://www.iceplc.com/travel-money/exchange-rates"

      doc.css('#fullCurrencyList .ProductCell').each do |li|
        currency_name = li.css('td')[1].text.strip
        currency   =
        case currency_name
          when 'Japanese Yen'
            'JPY'
          when 'Canadian Dollar'
            'CAD'
          when 'Australian Dollar'
            'AUD'
          when 'US Dollar'
            'USD'
          when 'Euro'
            'EUR'
          when 'Norwegian Krone'
            'NOK'
          else
            nil
        end
        next unless Currency.updatable.include? currency
        buy = li.css('td')[2].text.strip
        sell = nil
        rate_update(currency, buy, sell, chain, exchange)
      end

    elsif url == "http://www.bfcexchange.co.uk"

      doc.css('#tabs-1 ul li').each do |li|
        currency    = li.css('span')[0].text.strip
        next unless Currency.updatable.include? currency
        buy         = li.css('span')[1].text.strip
        sell        = li.css('span')[2].text.strip
        rate_update(currency, buy, sell, chain, exchange)
      end

    elsif url == "http://www.chequecentre.co.uk/foreign-currency"
      doc.css('table tbody tr').each do |tr|
        currency_name       =  tr.css('td')[0].text.strip
        currency   =
            case currency_name
              when 'Japanese Yen'
                'JPY'
              when 'Canadian Dollar'
                'CAD'
              when 'Australian Dollar'
                'AUD'
              when 'US Dollar'
                'USD'
              when 'Euro'
                'EUR'
              when 'Norwegian Kroner'
                'NOK'
              else
                nil
            end
        next unless currency
        buy        =  tr.css('td')[1].text.strip
        sell       =  tr.css('td')[2].text.strip
        rate_update(currency, buy, sell, chain, exchange)
      end

    elsif url == "https://www.eurochange.co.uk/exchangerates.aspx"

      doc.css('table.ERTable tr').each do |tr|
        next unless tr.css('td span').count > 0
        currency_name =  tr.css('td span')[0].text.strip
        currency      =
            case currency_name
              when 'Japanese Yen'
                'JPY'
              when 'Canadian Dollar'
                'CAD'
              when 'Australian Dollar'
                'AUD'
              when 'US Dollar'
                'USD'
              when 'Euro'
                'EUR'
              when 'Israeli Shekels'
                'ILS'
              when 'Hong Kong Dollar'
                'HKD'
              when 'Chinese Yuan'
                'CNY'
              when 'Norwegian Krone'
                'NOK'
              else
                nil
            end
        next unless currency
        sell        =  tr.css('td')[1].text.strip
        buy       =  nil
        rate_update(currency, buy, sell, chain, exchange)
      end

    elsif url == "https://www.eurochange.co.uk/buybackexchangerates.aspx"

      doc.css('table.ERTable tr').each do |tr|
        next unless tr.css('td span').count > 0
        currency_name =  tr.css('td span')[0].text.strip
        currency      =
            case currency_name
              when 'Japanese Yen'
                'JPY'
              when 'Canadian Dollar'
                'CAD'
              when 'Australian Dollar'
                'AUD'
              when 'US Dollar'
                'USD'
              when 'Euro'
                'EUR'
              when 'Israeli Shekels'
                'ILS'
              when 'Hong Kong Dollar'
                'HKD'
              when 'Chinese Yuan'
                'CNY'
              when 'Norwegian Krone'
                'NOK'
              else
                nil
            end
        next unless currency
        sell        =  nil
        buy       =  tr.css('td')[1].text.strip
        rate_update(currency, buy, sell, chain, exchange)
      end

    elsif url == "https://www.thomasexchangeglobal.co.uk/exchange-rates-check-exchange-rates.php"

      doc.css('table#contentTable')[1].css('tr').each do |tr|
        next if     tr.css('td').count == 1
        next if     tr.css('td')[0]['class'] == 'thtext'
        currency_name =  tr.css('td')[1].text
        currency      =
            case currency_name
              when 'Yen - Japan'
                'JPY'
              when 'Dollars - Canada'
                'CAD'
              when 'Dollars - Australia'
                'AUD'
              when 'Dollars - USA'
                'USD'
              when 'Euro - Europe'
                'EUR'
              when 'Sheqel - Israel'
                'ILS'
              when 'Dollars - Hongkong'
                'HKD'
              when 'Yuan - China'
                'CNY'
              when 'Kroner - Norway'
                'NOK'
              else
                nil
            end
        next unless currency
        buy        =  tr.css('td')[2].text
        sell       =  tr.css('td')[3].text
        rate_update(currency, buy, sell, chain, exchange)
      end

    elsif url == "https://cecltd.com/?q=exchange-rates"

      doc.css('table tbody tr').each do |tr|
        currency   = tr.css('td')[1].text.strip
        next unless Currency.updatable.include? currency
        buy        =  tr.css('td')[5].text.strip
        sell       =  tr.css('td')[6].text.strip
        rate_update(currency, buy, sell, chain, exchange)
      end

    elsif url == "https://www.thomasexchange.co.uk/i_banknote_rates.asp"

      doc.css('table tr').each do |tr|
        next if     tr.css('td')[0].text == "Currency"
        currency_name =  tr.css('td')[0].text
        currency      =
            case currency_name
              when 'Japan Jpy'
                'JPY'
              when 'Canada Dollar'
                'CAD'
              when 'Australia Dollar'
                'AUD'
              when 'U.S.A Dollar'
                'USD'
              when 'EURO Euro'
                'EUR'
              when 'Israel Shekel'
                'ILS'
              when 'Hong Kong Dollar'
                'HKD'
              when 'China Yuan'
                'CNY'
              when 'Norway Kroner'
                'NOK'
              else
                nil
            end
        next unless currency
        buy        =  tr.css('td')[1].text
        sell       =  tr.css('td')[2].text
        rate_update(currency, buy, sell, chain, exchange)
      end

    elsif url == "http://www.natwest.com/tools/personal/currency_rates"

      doc.css('table')[0].css('tr').each do |tr|
        next unless     tr.css('td').count == 3
        currency_name =  tr.css('td')[0].text
        currency      =
            case currency_name
              when 'JAPANESE YEN'
                'JPY'
              when 'CANADIAN DOLLARS'
                'CAD'
              when 'AUSTRALIAN DOLLARS'
                'AUD'
              when 'US DOLLARS'
                'USD'
              when 'EURO'
                'EUR'
              when 'ISRAELI NEW SHEQELS'
                'ILS'
              when 'HONG KONG DOLLARS'
                'HKD'
              when 'CHINESE YUAN'
                'CNY'
              when 'NORWEGIAN KRONER'
                'NOK'
              else
                nil
            end
        next unless currency
        sell        =  tr.css('td')[1].text
        buy         =  tr.css('td')[2].text
        rate_update(currency, buy, sell, chain, exchange)
      end

    else

      raise "Dont know how to parse that url"

    end


  end

  def self.rate_update(currency, buy, sell, chain, exchange)
    return nil unless Currency.updatable.include? currency
    rate = chain ? chain.rates.where(currency: currency).first_or_create! : exchange.rates.where(currency: currency).first_or_create!
    buy   ||=   rate.buy
    sell  ||=   rate.sell
    rate.update(source: 'scraping', currency: currency, buy: buy, sell: sell, last_update: DateTime.now, admin_user_id: nil)
  end


end