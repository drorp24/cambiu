ActiveAdmin.register Exchange do
  
  includes :chain

  # csv import
  active_admin_importable do |model, hash|
#   begin
    hash = Hash[ hash.map { |key, value| [key, value ? value.force_encoding('iso-8859-1').encode('utf-8') : nil] } ]
    hash = Hash[ hash.map { |key, value| [key, value == "00:00-24:00" ? "00:00-23:59" : value] } ]
    puts hash
    e = Exchange.where(name: (hash[:change]), address: (hash[:address])).first_or_initialize
    e.name =            hash[:change]
    e.exchange!
    e.chain_id =        Chain.where(name: hash[:chain_name]).first_or_create.id if hash[:chain_name]
    e.country =         hash[:country]
    e.city =            hash[:metropolis]
    e.region =          hash[:districtregion] || hash[:region]
    e.address =         hash[:address]
    e.latitude =        hash[:latitude]
    e.longitude =       hash[:longitude]
    e.phone =           hash[:telephone]
    e.nearest_station = hash[:nearest_station]
    e.airport =         hash[:airport]
    e.save!
    e.update_csv_business_hours(hash[:sunday_openning_hours], 0) 
    e.update_csv_business_hours(hash[:monday_openning_hours], 1) 
    e.update_csv_business_hours(hash[:tuesday_openning_hours], 2) 
    e.update_csv_business_hours(hash[:wednesday_openning_hours], 3) 
    e.update_csv_business_hours(hash[:thursday_openning_hours], 4) 
    e.update_csv_business_hours(hash[:friday_openning_hours], 5) 
    e.update_csv_business_hours(hash[:saturday_openning_hours], 6) 

#    rescue => e
#       error = e  
#    end     
  end
  
  # osm import
  collection_action :import_osm, method: :post do
    Exchange.import("bdc", "London")
    redirect_to collection_path, notice: "OSM imported successfully!"
  end
  action_item only: :index do
    link_to 'OSM Import', import_osm_admin_exchanges_path, method: :post
  end

  # scraping
  collection_action :scraping, method: :post do
    Scraping.thomas
    redirect_to collection_path, notice: "Thomas Exchange Global scraped successfully!"
  end
  action_item only: :index do
    link_to 'Scraping', scraping_admin_exchanges_path, method: :post
  end

  filter :chain
  filter :name
  filter :address
  filter :region

  index do
    id_column
    column :name do |exchange|
      link_to exchange.name, admin_exchange_path(exchange)
    end
    column :chain 
    column :address
    column :phone
    actions
  end
  
  show do
    attributes_table do
      row :name
      row :chain
      row :address
      row :phone
      row :latitude
      row :longitude
    end
    active_admin_comments
  end
  
  sidebar "Opening hours", only: [:show, :edit] do
    table_for exchange.business_hours.order("day") do |b|
      b.column("Day")    { |bh| status_tag (Date::DAYNAMES[bh.day]), (bh.open1.present? ? :ok : :error) }
      b.column("Open")     { |bh| bh.open1.to_s[0..4]}
      b.column("Close")    { |bh| bh.close1.to_s[0..4] }
    end
  end

  sidebar "Rates", only: [:show, :edit] do
    table_for exchange.effective_rates do |r|
      r.column("For")    { |rate| status_tag rate.category }
      r.column("Cur")    { |rate| rate.buy_currency }
      r.column("Buy")     { |rate| humanized_money_with_symbol rate.buy}
      r.column("Pay")    { |rate| humanized_money_with_symbol rate.pay }
    end
    link_to "Update rates",    admin_exchange_rates_path(exchange)
  end

  form do |f|
    f.inputs 'Details' do
      f.input :name
      f.input :address
      f.input :phone
      f.input :website
      f.inputs do
      f.has_many :rates, new_record: 'Add' do |b|
        b.input :buy_cents
      end
    end
    end
    f.actions
  end
  
  permit_params :id, :name, :address, :phone, :website, 
    rates_attributes: [:id, :buy_cents, :buy_currency, :pay_cents, :pay_currency, :_destory],
    business_hours_attributes: [:id, :day, :open1, :close1, :open2, :close2]

  # rates page (nested reousrce)
  ActiveAdmin.register Rate do

    belongs_to :exchange

    permit_params :id, :exchange_id, :category, :up_to_cents, :up_to_currency, :buy_cents, :buy_currency, :pay_cents, :pay_currency, :source
  
    scope :walkin
    scope :pickup
    scope :delivery

    index do
      id_column
      column :source        do |rate|
        best_in_place rate, :source, as: :select, collection: {:"phone"=>"Phone", :"api"=>"API", :"scraping"=>"Scraping"}
      end
      column :category      do |rate|
        best_in_place rate, :category, as: :select, collection: {:"walkin"=>"Walk-in", :"pickup"=>"Pickup", :"delivery"=>"Delivery"}
      end  
      column :buy           do |rate|
        best_in_place rate, :buy, :as => :input
      end 
      column :buy_currency  do |rate|
        best_in_place rate, :buy_currency, as: :select, collection: Currency.select
      end 
      column :pay           do |rate|
        best_in_place rate, :pay, :as => :input
      end 
      column :pay_currency  do |rate|
        best_in_place rate, :pay_currency, as: :select, collection: Currency.select
      end 
      actions defaults: false do |post|
        link_to "Add another rate", new_admin_exchange_rate_path(params[:exchange_id])
  end
    end

    filter :buy_currency
    filter :pay_currency

    form do |f|
      f.inputs 'Rates' do
        f.input :category
        f.input :up_to_cents
        f.input :up_to_currency
        f.input :buy_cents
        f.input :buy_currency
        f.input :pay_cents
        f.input :pay_currency
      end
      f.actions
    end
    
    controller do
 
      def new
        @rate = Rate.create_template(params[:exchange_id])
        notice = @rate.errors.any? ? @rate.errors.full_messages : nil
        redirect_to admin_exchange_rates_path(params[:exchange_id]), notice: notice
      end

    end

  end
end