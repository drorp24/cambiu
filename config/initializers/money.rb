require 'money'

=begin
require 'money/bank/google_currency'
require 'json'
MultiJson.engine = :json_gem
Money.default_bank = Money::Bank::GoogleCurrency.new
Money::Bank::GoogleCurrency.ttl_in_seconds = 86400
=end

require 'money/bank/open_exchange_rates_bank'
oxr = Money::Bank::OpenExchangeRatesBank.new
oxr.app_id = 'e01797cb4dff4450bd34f794abce9600'
oxr.update_rates

# (optional)
# set the seconds after than the current rates are automatically expired
# by default, they never expire, in this example 1 day.
oxr.ttl_in_seconds = 3600
# (optional)
# use https to fetch rates from Open Exchange Rates
# disabled by default to support free-tier users
# see https://openexchangerates.org/documentation#https
oxr.secure_connection = true
# (optional)
# set historical date of the rate
# see https://openexchangerates.org/documentation#historical-data
#oxr.date = '2015-01-01'
# (optional)
# Set the base currency for all rates. By default, USD is used.
# OpenExchangeRates only allows USD as base currency
# for the free plan users.
# oxr.source = 'GBP'  # TODO: Remove once multi-cities is implemented

Money.default_bank = oxr



Monetize.assume_from_symbol = true
Money::Currency.register({
   :priority            => 1,
   :iso_code            => "HKD",
   :iso_numeric         => "344",
   :name                => "Hong Kong Dollar",
   :symbol              => "$",
   :symbol_first        => true,
   :subunit             => "Cent",
   :subunit_to_unit     => 100,
   :thousands_separator => ",",
   :decimal_mark        => ".",
   :disambiguate_symbol => "H$"
 })
Money::Currency.register({
    :priority            => 1,
    :iso_code            => "CNY",
    :iso_numeric         => "156",
    :name                => "Chinese Renminbi Yuan",
    :symbol              => "¥",
    :symbol_first        => true,
    :subunit             => "Fen",
    :subunit_to_unit     => 100,
    :thousands_separator => ",",
    :decimal_mark        => "."
})
Money::Currency.register({
   :priority            => 1,
   :iso_code            => "ILS",
   :name                => "New Israeli Sheqel",
   :symbol              => "₪",
   :symbol_first        => true,
   :subunit             => "Agorot",
   :subunit_to_unit     => 100,
   :thousands_separator => ",",
   :decimal_mark        => "."
})
Money::Currency.register({
   :priority            => 1,
   :iso_code            => "NOK",
   :name                => "Norwegian Krone",
   :symbol              => "kr",
   :symbol_first        => false,
   :subunit             => "Øre",
   :subunit_to_unit     => 100,
   :thousands_separator => ".",
   :decimal_mark        => ","
})
Money::Currency.register({
    :priority            => 1,
    :iso_code            => "CZK",
    :name                => "Czech Koruna",
    :symbol              => "Kč",
    :symbol_first        => false,
    :subunit             => "Haléř",
    :subunit_to_unit     => 100,
    :thousands_separator => ".",
    :decimal_mark        => ","
})
Money::Currency.register({
    :priority            => 1,
    :iso_code            => "RON",
    :name                => "Romanian Leu",
    :symbol              => "Lei",
    :symbol_first        => true,
    :subunit             => "Bani",
    :subunit_to_unit     => 100,
    :thousands_separator => ".",
    :decimal_mark        => ","
})
Money::Currency.register({
    :priority            => 1,
    :iso_code            => "PLN",
    :name                => "Polish Złoty",
    :symbol              => "zł",
    :symbol_first        => false,
    :subunit             => "Grosz",
    :subunit_to_unit     => 100,
    :thousands_separator => " ",
    :decimal_mark        => ","
})
Money::Currency.register({
    :priority            => 1,
    :iso_code            => "CHF",
    :name                => "Swiss Franc",
    :symbol              => "CHF",
    :symbol_first        => true,
    :subunit             => "Rappen",
    :subunit_to_unit     => 100,
    :thousands_separator => ",",
    :decimal_mark        => ".",
})
Money::Currency.register({
    :priority            => 1,
    :iso_code            => "THB",
    :name                => "Thai Baht",
    :symbol              => "฿",
    :symbol_first        => true,
    :subunit             => "Satang",
    :subunit_to_unit     => 100,
    :thousands_separator => ",",
    :decimal_mark        => ".",
})
Money::Currency.register({
    :priority            => 1,
    :iso_code            => "PHP",
    :name                => "Philippine Peso",
    :symbol              => "₱",
    :symbol_first        => true,
    :subunit             => "Centavo",
    :subunit_to_unit     => 100,
    :thousands_separator => ",",
    :decimal_mark        => ".",
})

