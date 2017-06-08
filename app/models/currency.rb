class Currency 

  # inverse = rate tables based on this currency count how much of *that currency* is required for each foreign currency (example: 'ILS')
  # non inverse = rate tables based on this currency count how much of the *foreign* currency is required for each foreign currency
  # This indication is required for:
  #    -   converting Ratefeed API injected rates from the Israeli way to how the system maintains it - the system has *one* method of recording rates only
  #     -  Whenever such rates should be presented
  def self.inverse?(iso)
    ['ILS', 'AUD'].include? iso # TODO: remove AUD!!!!
  end

  def self.markup

    {
        IL:
            {
                sell_markup:  3.5,
                buy_markup:   3.5,
                sell_spread:  1.5,
                buy_spread:   1.5
            },
        UK:
            {
                sell_markup:  4,
                buy_markup:   4,
                sell_spread:  1.5,
                buy_spread:   1.5
            },
         default:
            {
                sell_markup:  3.5,
                buy_markup:   3.5,
                sell_spread:  1.5,
                buy_spread:   1.5
            }
    }

  end

  def self.base
    ['GBP', 'ILS']
  end

  def self.rates

    reference = {}

    Currency.base.each do |base_currency|

      base_currency_s = base_currency.to_sym
      reference[base_currency_s] = {}

      Currency.major.each do |major_currency|

        supported_currency = major_currency[:iso_code]
        next if supported_currency == base_currency

        supported_currency_s = supported_currency.to_sym
        reference[base_currency_s][supported_currency_s] = Money.default_bank.get_rate(base_currency, supported_currency)

      end

    end

    reference

  end

  def self.updatable
    unless @currency_array
      @currency_array = []
      Money::Currency.table.inject([]) do |array, (id, attributes)|
        priority = attributes[:priority]
        if priority && priority < 10
          @currency_array << attributes[:iso_code]
        end
      end
    end
    @currency_array
  end

  def self.major
    Money::Currency.table.inject([]) do |array, (id, attributes)|
    priority = attributes[:priority]
    if priority && priority < 10
      hash = {}
      hash[:iso_code] = attributes[:iso_code]
#      hash[:name] = attributes[:name]
     hash[:symbol] = attributes[:symbol]
     hash[:select] = attributes[:symbol] + ' ' + attributes[:iso_code]
     array[priority] ||= []
      array[priority] << hash
    end
    array
    end.compact.flatten
  end  
  
  def self.major_with_symbol
    major.collect{|c| [ c[:select], c[:iso_code], {:'data-symbol' => c[:symbol]}] }
  end
  
  def self.select
   hash = {}
   Money::Currency.table.inject([]) do |array, (id, attributes)|
    priority = attributes[:priority]
    iso_code = attributes[:iso_code]
 #   if ['HKD', 'CNY'].include?(iso_code) or (priority && priority < 10)
      hash[attributes[:iso_code].to_sym] = attributes[:iso_code]
 #   end
   end 
   hash
  end

  def self.strip(display_amount)
    display_amount.rpartition(" ")[2].remove(",")
  end

  # override .format with proper negative placement
  def self.format(num, cur)
    result = num.abs.to_money(cur).format
    num < 0 ? "-" + result : result
  end

end