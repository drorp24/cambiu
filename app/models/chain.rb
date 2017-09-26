class Chain < ActiveRecord::Base
  has_many :exchanges, :dependent => :destroy
  has_many :orders, through: :exchanges
  has_many :rates, as: :ratable, dependent: :destroy

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

  has_one     :czk_rate,    -> {where(currency: 'CZK')}       ,class_name: "Rate",  as: :ratable
  has_one     :ron_rate,    -> {where(currency: 'RON')}       ,class_name: "Rate",  as: :ratable
  has_one     :pln_rate,    -> {where(currency: 'PLN')}       ,class_name: "Rate",  as: :ratable
  has_one     :chf_rate,    -> {where(currency: 'CHF')}       ,class_name: "Rate",  as: :ratable
  has_one     :thb_rate,    -> {where(currency: 'THB')}       ,class_name: "Rate",  as: :ratable
  has_one     :php_rate,    -> {where(currency: 'PHP')}       ,class_name: "Rate",  as: :ratable
  has_one     :inr_rate,    -> {where(currency: 'INR')}       ,class_name: "Rate",  as: :ratable



  enum rates_source: [ :no_rates, :test, :manual, :xml, :scraping, :api ]
  validates :name, uniqueness: true, on: :create
  validates :currency, presence: true, on: :create

  before_create do
    self.rates_source = 'no_rates'
  end

  scope :with_real_rates, -> {where("rates_source > 1") }
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
