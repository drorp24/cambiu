class Merchant

  include Mongoid::Document

  embeds_many :quotations
  embeds_one  :location

  field :place_id,                type: String
  field :name,                    type: String
  field :name_he,                 type: String
  field :address,                 type: String
  field :address_he,              type: String
  field :email,                   type: String
  field :phone,                   type: String
  field :delivery,                type: Boolean
  field :delivery_charge,         type: Float
  field :currency,                type: String

end