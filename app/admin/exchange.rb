ActiveAdmin.register Exchange do

  permit_params :id, :name, :address, :email, :latitude, :longitude, :country, :opens, :closes,:website, :email, :note, :phone, :atm, :source, :business_type, :chain, :city, :region, :rating, :nearest_station,
                :airport, :directory, :accessible, :status, :logo, :currency, :admin_user_id, :rates_source, :contract, :rates_policy
=begin
    rates_attributes: [:id, :buy_cents, :buy_currency, :pay_cents, :pay_currency, :_destory],
    business_hours_attributes: [:id, :day, :open1, :close1, :open2, :close2]
=end

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

  scope :manual
  scope :xml
  scope :scraping
  scope :fake


  filter :rates_source, as: :select, collection: [['No rates', 'no_rates'],['Fake', 'fake'], ['Manual', 'manual'], ['XML', 'xml'], ['Scraping', 'scraping']]
  filter :chain
  filter :name
  filter :address
  filter :region

  index do
    id_column
    column :name do |exchange|
      link_to exchange.name, admin_exchange_path(exchange)
    end
    column :contract
    column :chain
    column :rates_policy do |exchange|
      exchange.rates_policy ? exchange.rates_policy.titleize : ''
    end
    column :rates do |exchange|
      if    exchange.individual_policy?
        link_to exchange.rates_source ? exchange.rates_source.titleize : '', admin_exchange_rates_path(exchange)
      elsif exchange.chain_policy?
        link_to exchange.chain.rates_source ? exchange.chain.rates_source.titleize : '', admin_chain_rates_path(exchange.chain_id)
      end
    end
     column :address
    column :email
    column :delivery?
    actions
  end
  
=begin
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

=end
  sidebar "Rates", only: [:show, :edit] do
    table_for exchange.rates do |r|
      r.column("Currency")    { |rate| status_tag rate.currency }
      r.column("Buy")     { |rate|  rate.buy_s}
      r.column("Sell")    { |rate|  rate.sell_s }
    end
    link_to "Update rates",    admin_exchange_rates_path(exchange)
  end

  sidebar "Opening hours", only: [:show, :edit] do
    table_for exchange.business_hours.order("day") do |b|
      b.column("Day")    { |bh| status_tag (Date::DAYNAMES[bh.day]), (bh.open1.present? ? :ok : :error) }
      b.column("Open")     { |bh| bh.open1.to_s[0..4]}
      b.column("Close")    { |bh| bh.close1.to_s[0..4] }
    end
  end

  controller do

    def new
      @exchange = Exchange.new(admin_user_id: current_admin_user.id, currency: "GBP", rates_source: 0, contract: true)
    end

    def show
      redirect_to edit_admin_exchange_path(params[:id])
    end

    def update
      exchange = Exchange.find_by_id(params[:id])
      if exchange.update(exchange_params)
        redirect_to admin_exchanges_path, notice: 'Exchange Updated!'
      else
        redirect_to edit_admin_exchange_path(exchange), alert: exchange.errors.full_messages.first
      end
    end

    protected

    def exchange_params
      params.require(:exchange).permit!
    end


  end




form do |f|

    f.inputs 'Details' do

      f.semantic_errors *f.object.errors.keys
      f.input     :created_at, as: :string, input_html: { :disabled => true }
      f.input     :updated_at, as: :string, input_html: { :disabled => true }
      f.input     :admin_user_s, as: :string, label: "By", input_html: { :disabled => true }
      f.input     :admin_user_id, input_html: { :disabled => true }, as: :hidden
      f.input     :chain_name, label: 'Chain'
      f.input     :rates_policy, as: :select, collection: {:"Individual policy"=>"individual_policy", :"Chain"=>"chain_policy"}, include_blank: false
      f.input     :name
      f.input     :address
      f.input     :contract, label: 'Contract', as: :radio
      f.input     :rates_source, as: :select, collection: {:"No rates"=>"no_rates", :"Fake"=>"fake", :"Manual"=>"manual", :"XML"=>"xml", :"Scraping"=>"scraping"}
      f.input     :delivery_tracking, as: :url
      f.input     :direct_link, input_html: { :disabled => true }, hint: '  Direct link for search engines and ads'
      f.input     :logo, as: :file
      f.input     :latitude
      f.input     :longitude
 #     f.input     :country, as: :country
      f.input     :currency, as: :select, collection: Currency.select, label: "Local currency", value: "GBP"
      f.input     :opens, hint: "Fill if opening hours are the same all over the week"
      f.input     :closes, hint: "Fill if closing hours are the same all over the week"
      f.input     :website, as: :url
      f.input     :email, as: :email
      f.input     :phone, as: :phone
      f.input     :osm_id, input_html: { :disabled => true }
      f.input     :atm
      f.input     :business_type
      f.input     :city
      f.input     :region
      f.input     :rating
      f.input     :nearest_station
      f.input     :airport
      f.input     :directory
      f.input     :accessible
      f.input     :upload_id
      f.input     :note
    end

    f.actions

  end


  # rates page (nested reousrce)
  ActiveAdmin.register Rate do

    menu false

#    belongs_to :ratable, polymorphic: true

    permit_params :id, :ratable_id, :ratable_type, :service_type, :currency, :buy, :sell, :admin_user, :rates_source

=begin
    after_build do |rate|
      rate.admin_user = current_admin_user
    end
=end

    config.batch_actions = true

    before_filter :skip_sidebar!, :only => :index

    config.clear_action_items!

    action_item :add_rate, only: :index do
      if    params[:exchange_id]
        link_to 'Add Rate', new_admin_exchange_rate_path(params[:exchange_id])
      elsif params[:chain_id]
        link_to 'Add Rate', new_admin_chain_rate_path(params[:chain_id])
      end
      end

=begin
    scope :collection
    scope :delivery
=end

    index do
      selectable_column
      id_column
      column :source        do |rate|
        best_in_place rate, :source, as: :select, collection: {:"manual"=>"Manual", :"xml"=>"XML", :"scraping"=>"Scraping", :"fake"=>"Fake"}
      end
      column :currency           do |rate|
        best_in_place rate, :currency #, as: :select, collection: Currency.select
      end 
      column :buy           do |rate|
        best_in_place rate, :buy_s, :as => :input
      end
      column :sell           do |rate|
        best_in_place rate, :sell_s, :as => :input
      end
      column :last_update
      column "By", :admin_user_s
      actions defaults: false
    end

=begin
    filter :buy_currency
    filter :pay_currency
=end

    form do |f|
      f.inputs 'Rates' do
        f.input :source
        f.input :currency
        f.input :buy
        f.input :sell
      end
      f.actions
    end
    
    controller do

      def scoped_collection
        super.includes :admin_user
      end

      def index

        if params[:exchange_id]
          ratable_type = 'Exchange'
          ratable_id = params[:exchange_id]
        elsif params[:chain_id]
          ratable_type = 'Chain'
          ratable_id = params[:chain_id]
        else
          return
        end

        @rates = Rate.where(ratable_type: ratable_type, ratable_id: ratable_id)
        if @rates.any?
          @collection = @rates.order(id: :desc).page(params[:page]).per(10)
          return
        else

          if params[:exchange_id]
            redirect_to new_admin_exchange_rate_path(ratable_id) and return
          elsif params[:chain_id]
            redirect_to new_admin_chain_rate_path(ratable_id) and return
          end

        end

      end

      def new

        if params[:exchange_id]
          ratable_type = 'Exchange'
          ratable_id = params[:exchange_id]
        elsif params[:chain_id]
          ratable_type = 'Chain'
          ratable_id = params[:chain_id]
        else
          return
        end

        @rate = Rate.create!(ratable_type: ratable_type, ratable_id: ratable_id, admin_user_id: current_admin_user.id, source: 0, service_type: 0)
        @rate.ratable.update(rates_source: 'manual')
        notice = @rate.errors.any? ? @rate.errors.full_messages : nil

        if params[:exchange_id]
          redirect_to admin_exchange_rates_path(ratable_id), notice: notice
        elsif params[:chain_id]
          redirect_to admin_chain_rates_path(ratable_id), notice: notice
        end

      end

      # since best_in_place automatically goes to the regular exchange#update, the update controller method is defined there not here

       def batch_action
        return unless params[:batch_action] == 'destroy'
        params[:collection_selection].each do |rate_id|
          rate = Rate.find_by_id(rate_id)
          @ratable_id = rate.ratable_id
          @ratable_type = rate.ratable_type
          rate.delete
        end

        if @ratable_type == 'Exchange'
          redirect_to admin_exchange_rates_path(@ratable_id), notice: 'Over and done with!'
        elsif @ratable_type == 'Chain'
          redirect_to admin_chain_rates_path(@ratable_id), notice: 'Over and done with!'
        end

      end

     end

  end
end