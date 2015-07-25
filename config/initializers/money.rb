require 'money'
require 'money/bank/google_currency'
require 'json'
MultiJson.engine = :json_gem
Money.default_bank = Money::Bank::GoogleCurrency.new
Money::Bank::GoogleCurrency.ttl_in_seconds = 86400
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
   :decimal_mark        => "."
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
