class Exchange < ActiveRecord::Base
  
  def self.list(amenity, area)
    options={amenity:       amenity,
             area:          area,
            timeout:       900,
             element_limit: 1073741824,
             json:          true}
    
    overpass = Overpass.new(options)
    list = overpass.query
  end
  
  def self.import(amenity="bdc", area="London")
    return unless list = self.list(amenity, area)
    
    list.each do |osm_rec| 
      Exchange.find_or_create_by(osm_id: osm_rec[:id].to_s) do |exchange|
        exchange.latitude           = osm_rec[:lat]
        exchange.longitude          = osm_rec[:lon]
        exchange.name               = osm_rec[:tags][:name]
        exchange.website            = osm_rec[:tags][:website]
        exchange.wheelchair         = osm_rec[:tags][:wheelchair]
        exchange.email              = osm_rec[:tags][:email]
        exchange.note               = osm_rec[:tags][:note]
        exchange.opening_hours      = osm_rec[:tags][:opening_hours]
        exchange.phone              = osm_rec[:tags][:phone]
        exchange.addr_country       = osm_rec[:tags][:"addr:country"]
        exchange.addr_city          = osm_rec[:tags][:"addr:city"]
        exchange.addr_street        = osm_rec[:tags][:"addr:street"]
        exchange.addr_housename     = osm_rec[:tags][:"addr:housename"]
        exchange.addr_housenumber   = osm_rec[:tags][:"addr:housenumber"]
        exchange.addr_postcode      = osm_rec[:tags][:"addr:postcode"]
        exchange.addr_unit          = osm_rec[:tags][:"addr:unit"]
        exchange.atm                = osm_rec[:tags][:atm]
        exchange.source             = osm_rec[:source]
      end 
    end
  end

end
