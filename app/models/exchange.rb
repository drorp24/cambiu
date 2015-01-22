class Exchange < ActiveRecord::Base
  
  def self.get_hash

    ba_query = "<query type='node'><has-kv k='amenity' v='bureau_de_change'/></query>" 
    
    options={bbox:          {min_latitude: 51.28, min_longtitude: -0.489, max_latitude: 51.686, max_longtitude: 0.236},
#            timeout:       900,
             element_limit: 1073741824,
             json:          true}
    
    overpass = Overpass.new(options)
    result_hash = overpass.query(ba_query)
  end

end
