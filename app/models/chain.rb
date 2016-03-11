class Chain < ActiveRecord::Base
  has_many :exchanges
  has_many :rates, as: :ratable
  enum rates_source: [ :no_rates, :test, :manual, :xml, :scraping ]
  validates :name, uniqueness: true, on: :create
end
