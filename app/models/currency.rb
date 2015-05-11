class Currency 

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
    if priority && priority < 10
      hash[attributes[:iso_code].to_sym] = attributes[:iso_code]
    end
   end 
   hash
  end

  def self.strip(display_amount)
    display_amount.rpartition(" ")[2].remove(",")
  end

end