class Quotation

  include Mongoid::Document
  embedded_in :merchant

  field :currency,  type: String
  field :buy,       type: Float
  field :sell,      type: Float

end
