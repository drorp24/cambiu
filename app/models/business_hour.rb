class BusinessHour < ActiveRecord::Base

  belongs_to :exchange

  serialize :open1,   Tod::TimeOfDay
  serialize :close1,  Tod::TimeOfDay
  serialize :open2,   Tod::TimeOfDay
  serialize :close2,  Tod::TimeOfDay

end
