class Rate < ActiveRecord::Base
  belongs_to :exchange
  
  def display_name
    "#{pay_currency} to #{buy_currency}"
  end
end
