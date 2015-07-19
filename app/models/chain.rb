class Chain < ActiveRecord::Base
  has_many :exchanges
  has_many :rates, as: :ratable
  enum rates_source: [ :no_rates, :fake, :manual, :xml, :scraping ]

end
