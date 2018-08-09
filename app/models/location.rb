class Location

  include Mongoid::Document
  embedded_in :merchant

  field :type, type: String, default: "Point"
  field :coordinates, type: Array

end
