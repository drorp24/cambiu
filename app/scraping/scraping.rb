require 'rubygems'
require 'nokogiri'
require 'open-uri'
require "erb"
include ERB::Util

class Scraping


=begin
  def self.thomas
    chain_id = Chain.find_by(name: 'Thomas exchange global').id
    url = "https://www.thomasexchange.co.uk/i_banknote_rates.asp"
        # TODO: insists not to work: return unless source = Source.find_by(url: url_encode(url))
        source = Source.first
    currency_array  = source.s_currencies.pluck(:name, :iso_code)
    currency_hash   = Hash[*currency_array.flatten]
    doc = Nokogiri::HTML(open(url))
    doc.css('tr').each do |node|
      next if node.css('td')[0].text == 'Currency'
      next unless currency_iso_code = currency_hash[node.css('td')[0].text]
      buy_currency =  currency_iso_code
      buy_cents     = 100
      pay_currency  = "GBP"
      pay_cents     = (1.0/(node.css('td')[2].text.remove(',').to_f)) * 100.0
      Rate.refresh(chain_id, buy_currency, buy_cents, pay_currency, pay_cents)
    end
  end
=end


  # Generic envelope. Works for all html pages whose rates are in 'table tbody tr' elements
  def self.update(chain_name=nil, exchange_name=nil, url)

    if chain_name
      raise "No such chain: #{chain_name}" unless chain = Chain.find_by(name: chain_name)
      chain.update(rates_source: 'scraping', rates_update: DateTime.now)
      chain.exchanges.each do |exchange|
        exchange.update(rates_source: 'scraping')
      end
    elsif exchange_name
      raise "No such exchange: #{exchange_name}" unless exchange = Exchange.find_by(name: exchange_name)
      exchange.update(rates_source: 'scraping')
    else
      raise "Neither chain nor exchange were passed in"
    end

    raise "No such url: #{url}" unless doc = Nokogiri::HTML(open(url))

    raise "No tbody element" unless tbody = doc.css('table tbody')

    tbody.css('tr').each do |tr|
      line = parse_rates(url, tr)
      if Currency.updatable.include? currency =  line[:currency]
        buy =  line[:buy]
        sell = line[:sell]
        rate = chain_name ? chain.rates.where(currency: currency).first_or_create! : exchange.rates.where(currency: currency).first_or_create!
        rate.update(source: 'scraping', currency: currency, buy: buy, sell: sell, last_update: DateTime.now, admin_user_id: nil)
      end
    end


  end

  # Specific parsing. tr is a Nokogiri object
  def self.parse_rates(url, tr)

    result = {}
    if url == "https://www.bfcexchange.co.uk/en/rates.html"
      result[:currency]   =  tr.css('td')[0].text.strip
      result[:buy]        =  tr.css('td')[2].text.strip
      result[:sell]       =  tr.css('td')[3].text.strip
    else
      raise "Dont know how to parse that url"
    end

    result

  end


end