ActiveAdmin.register Exchange do

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

  sidebar "Business Information", only: [:show, :edit] do
    ul do
      li link_to "Exchange Rates",    admin_exchange_rates_path(exchange)
    end
  end
  
  index do
    id_column
    column :name
    column :address
    column :phone
    column :website
    actions
  end
  
  show do
    attributes_table do
      row :name
      row :address
      row :phone
      row :website
    end
    panel "Rates" do
      table_for exchange.rates do
        column "buy_cents" do |rate|
          rate.buy_cents
        end
        column "buy_currency" do |rate|
          rate.buy_currency
        end
        column "pay_cents" do |rate|
          rate.pay_cents
        end
        column "pay_currency" do |rate|
          rate.pay_currency
        end
      end
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

  form do |f|
    f.inputs 'Details' do
      f.input :name
      f.input :address
      f.input :phone
      f.input :website
    end
    f.actions
  end
  
  permit_params :name, :address, :phone, :website


  # rates page (nested reousrce)
  ActiveAdmin.register Rate do

    belongs_to :exchange

    permit_params :exchange_id, :buy_cents, :buy_currency, :pay_cents, :pay_currency, :source

    index do
      render partial: 'form'
#      selectable_column
      id_column
      column :buy_currency, :sortable => :buy_currency do |resource|
        editable_text_column resource, :buy_currency
      end
      column :pay_currency
      column :pay_cents
      column :source
      actions
    end
    
    form do
      
    end

    controller do
      # [eventually will not be needed] redirect to index rather than show

      def index
        @rate = Rate.new
        super
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

  end

end