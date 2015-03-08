class Currency 

  def initialize
    eu_bank = EuCentralBank.new
    @bank = Money.default_bank = eu_bank
    cache = "exchange_rate.xml"
    if !@bank.rates_updated_at || @bank.rates_updated_at < Time.now - 1.days
      begin
      @bank.save_rates(cache)
      @bank.update_rates(cache)
      rescue => e
        return nil
      end
    end
  end

  def rates
    return nil unless @bank  
    @bank.rates     
  end

  def exchange(pay_cents, pay_currency, buy_currency)
    return nil unless @bank  
    begin
      @bank.exchange(pay_cents, pay_currency, buy_currency)
    rescue => e
      return nil
    end
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
  
  def self.select
   hash = {}
   Money::Currency.table.inject([]) do |array, (id, attributes)|
    priority = attributes[:priority]
    if priority && priority < 10
      hash[attributes[:iso_code].to_sym] = attributes[:iso_code]
    end
   end 
   hash
  end

end