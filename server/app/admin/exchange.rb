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
    table_for exchange.rates do |r|
      r.column("For")    { |rate| status_tag rate.category }
      r.column("Buy")     { |rate| humanized_money_with_symbol rate.buy}
      b.column("Pay")    { |rate| humanized_money_with_symbol rate.pay }
    end
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

  sidebar "Business Information", only: [:show, :edit] do
    ul do
      li link_to "Exchange Rates",    admin_exchange_rates_path(exchange)
    end
  end
  

  # rates page (nested reousrce)
  ActiveAdmin.register Rate do

    belongs_to :exchange

    permit_params :id, :exchange_id, :category, :up_to_cents, :up_to_currency, :buy_cents, :buy_currency, :pay_cents, :pay_currency, :source
  

    index do
      id_column
      column :source        do |rate|
#        best_in_place rate, :source, as: :select, collection: {:"0"=>"Phone", :"1"=>"API", :"2"=>"Scraping"}
        "Phone"
      end
      column :category      do |rate|
#        best_in_place rate, :category, as: :select, collection: {:"0"=>"Walk-in", :"1"=>"Pickup", :"2"=>"Delivery"}
        "Walk-in"
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
      actions
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
    
=begin
    controller do
      # [eventually will not be needed] redirect to index rather than show

      def index
        @rate = Rate.new
        super
      end
      
      def update
        @rate = Rate.find(params[:id])  
        if @rate.update(permitted_params[:rate])
          respond_to do |format|
                format.json 
              end
        else
        end
      end

      def create
        @rate = Rate.new(permitted_params[:rate])
        @rate.exchange_id = params[:exchange_id]  
        if @rate.save
          redirect_to admin_exchange_rates_path(params[:exchange_id]), notice: "Rate added successfully"
        else
          redirect_to admin_exchange_rates_path(params[:exchange_id]), notice: "Rate creation failed!"
        end
      end

    end
=end

  end
end