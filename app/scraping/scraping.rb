require 'rubygems'
require 'nokogiri'
require 'open-uri'
require "erb"
include ERB::Util

class Scraping


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
      pay_cents     = node.css('td')[2].text.remove(',').to_f * 100.0
      Rate.refresh(chain_id, buy_currency, buy_cents, pay_currency, pay_cents)
    end
  end


end