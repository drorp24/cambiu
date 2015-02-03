class Currency 

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