class Chain < ActiveRecord::Base
  has_many :exchanges, :dependent => :restrict_with_exception
  has_many :rates, as: :ratable, dependent: :delete_all

  has_one     :gbp_rate,    -> {where(currency: 'GBP')}       ,class_name: "Rate", as: :ratable
  has_one     :eur_rate,    -> {where(currency: 'EUR')}       ,class_name: "Rate", as: :ratable
  has_one     :usd_rate,    -> {where(currency: 'USD')}       ,class_name: "Rate", as: :ratable
  has_one     :aud_rate,    -> {where(currency: 'AUD')}       ,class_name: "Rate", as: :ratable
  has_one     :cad_rate,    -> {where(currency: 'CAD')}       ,class_name: "Rate", as: :ratable
  has_one     :jpy_rate,    -> {where(currency: 'JPY')}       ,class_name: "Rate", as: :ratable
  has_one     :cny_rate,    -> {where(currency: 'CNY')}       ,class_name: "Rate", as: :ratable
  has_one     :hkd_rate,    -> {where(currency: 'HKD')}       ,class_name: "Rate", as: :ratable
  has_one     :ils_rate,    -> {where(currency: 'ILS')}       ,class_name: "Rate", as: :ratable
  has_one     :nok_rate,    -> {where(currency: 'NOK')}       ,class_name: "Rate", as: :ratable
#
  enum rates_source: [ :no_rates, :test, :manual, :xml, :scraping ]
  validates :name, uniqueness: true, on: :create
  validates :currency, presence: true, on: :create

  before_create do
    self.rates_source = 'no_rates'
  end

  scope :with_no_real_rates, -> { where("rates_source < 2") }

  def xmlable?
    name.include? 'TMS'
  end

  def self.entire_list(params)

    return {errors: {parameters: 'missing'}} unless params[:country].present?

    begin

      return Chain.all.select(:id, :name)

    rescue => e

      return {errors: {'API error': e}}

    end


  end


end
