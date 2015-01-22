class Exchange < ActiveRecord::Base
  
  def self.list(amenity, area)
    options={amenity:       amenity,
             area:          area,
#            timeout:       900,
             element_limit: 1073741824,
             json:          true}
    
    overpass = Overpass.new(options)
    list = overpass.query
  end
  

end
