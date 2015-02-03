class Currency 

  def initialize
    eu_bank = EuCentralBank.new
    @bank = Money.default_bank = eu_bank
    cache = "exchange_rate.xml"
    if !@bank.rates_updated_at || @bank.rates_updated_at < Time.now - 1.days
      @bank.save_rates(cache)
      @bank.update_rates(cache)
    end
  end

  def rates
    return nil unless @bank  
    @bank.rates     
  end

  def exchange(buy_cents, buy_currency, pay_currency)
    return nil unless @bank  
    @bank.exchange(buy_cents, buy_currency, pay_currency).fractional 
  end

  def self.major
    Money::Currency.table.inject([]) do |array, (id, attributes)|
    priority = attributes[:priority]
    if priority && priority < 10
      hash = {}
      hash[:iso_code] = attributes[:iso_code]
      hash[:name] = attributes[:name]
      array[priority] ||= []
      array[priority] << hash
    end
    array
    end.compact.flatten
  end  

end