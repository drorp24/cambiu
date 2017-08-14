class Payment < ApplicationRecord
  belongs_to :order

  def self.record_token(params)
    Payment.create({order_id: params[:id]}.merge(params.slice(:authNumber, :cardToken, :cardMask, :cardExp, :txId, :uniqueID)))
  end


end
