ActiveAdmin.register Exchange do

  permit_params :id, :name, :name_he, :address, :address_he, :email, :latitude, :longitude, :country, :opens, :closes,:website, :email, :note, :phone, :atm, :source, :business_type, :chain, :city, :region, :rating, :nearest_station,
                :airport, :directory, :accessible, :status, :logo, :currency, :admin_user_id, :rates_source, :contract, :rates_policy,
                :todo, :chain_name, :contact, :weekday_open, :weekday_close, :saturday_open, :saturday_close, :sunday_open, :sunday_close, :rates_url, :comment, :photo,
                :cc_fee, :delivery_charge, :delivery, :card, :delivery_polygon_a_lat, :delivery_polygon_a_lng, :delivery_polygon_b_lat, :delivery_polygon_b_lng,
                :delivery_polygon_c_lat, :delivery_polygon_c_lng, :delivery_polygon_d_lat, :delivery_polygon_d_lng, :bank_fee

=begin
    rates_attributes: [:id, :buy_cents, :buy_currency, :pay_cents, :pay_currency, :_destory],
    business_hours_attributes: [:id, :day, :open1, :close1, :open2, :close2]
=end

  includes :chain

  # Deserted: not clear how to trigger error (no currency, any invalid value that is raised), skip empty lines,
  # didn't find any documentation what method does importer support
  # flash[:error] not recognized
=begin
  active_admin_import headers_rewrites:
    { :'Chain' => :chain_id },
      before_batch_import: ->(importer) {
      chains_names = importer.values_at(:chain_id)
      # replacing chain name with chain id
      chains   = Chain.where(name: chains_names).pluck(:name, :id)
      options = Hash[*chains.flatten] # #{"Debebhams" => 2, "Thomas Cook" => 1}
      importer.batch_replace(:chain_id, options)
    }
=end

  # csv import
  # TODO: update opening hours in the search
  active_admin_importable do |model, hash|

    columns = Exchange.column_names - Exchange.unexported_columns

    begin

      name = hash[:name_he] ? hash[:name_he] : hash[:name]
      address = hash[:address_he] ? hash[:address_he] : hash[:address]
      next if name.blank? or address.blank?

      if hash[:currency].blank?
        raise "No currency"
      end

      if hash[:country].blank?
        raise "No country"
      end

      if hash[:country].length > 3
        raise "Country should be in ISO code"
      end

      exchange = Exchange.identify_by_either(hash[:id], hash[:name], hash[:name_he], hash[:address], hash[:address_he], hash[:nearest_station])
      columns.each do |column|
        exchange.send(column + '=', hash[column.to_sym])
      end
      exchange.chain_id        = Chain.where(name: hash[:chain], currency: hash[:currency]).first_or_create.id if hash[:chain].present?
      if hash[:rates_policy] == 'chain' and !exchange.chain_id
=begin
        puts ">>>>>>>>>"
        puts exchange.inspect
        puts hash.inspect
        puts ">>>>>>>>>>>"
        raise "Rates policy is chain but no chain specified"
=end
      end
      if !exchange.latitude
        latlng = exchange.geocode
        if latlng
          exchange.latitude = latlng[0]
          exchange.longitude = latlng[1]
        else
          raise "Invalid address" unless hash[:address_he].present?
        end
      end

      exchange.rates_source = 'no_rates' unless exchange.rates_source.present?
      exchange.save!
      puts "I have just saved exchange " + exchange.id.to_s

    rescue => e

      message = "#{name} (#{address}) - #{e}"
      puts message
      Error.create!(text: 'Exchanges upload error', message: message)

    end

  end

  # osm import
=begin
  collection_action :import_osm, method: :post do
    Exchange.import("bdc", "London")
    redirect_to collection_path, notice: "OSM imported successfully!"
  end
  action_item only: :index do
    link_to 'OSM Import', import_osm_admin_exchanges_path, method: :post
  end
=end


=begin
  # scraping
  collection_action :scraping, method: :post do
    Scraping.thomas
    redirect_to collection_path, notice: "Thomas Exchange Global scraped successfully!"
  end

  action_item only: :index do
    link_to 'Scraping', scraping_admin_exchanges_path, method: :post
  end
=end

  scope :all
  scope :online_rates
  scope :real_rates
  scope :any_rates
  scope :no_rates

  scope :stale
  scope :todo
  scope :unverified
  scope :no_contract
  scope :removed
  scope :fix_address
  scope :error

  config.filters = false


  config.batch_actions = false

  index do
    selectable_column
    id_column
#    column(:todo)   {|exchange| status_tag(exchange.todo, class: exchange.todo_color) if exchange.todo }
#    column(:system) {|exchange| status_tag(exchange.system, class: exchange.system_color) if exchange.system }
    column :chain
    column "Name", :either_name
    column :nearest_station
    column "Address", :either_address
    column :contract
#    column :address
    column :phone
    column :rates_policy do |exchange|
      exchange.rates_policy ? exchange.rates_policy.titleize : ''
    end
    column :rates do |exchange|
      if    exchange.individual?
        link_to exchange.rates_source ? exchange.rates_source.titleize : '', admin_exchange_rates_path(exchange)
      elsif exchange.chain?
        if exchange.chain
          link_to exchange.chain.rates_source ? exchange.chain.rates_source.titleize : '', admin_chain_rates_path(exchange.chain_id)
        else
          "exchange has no chain"
        end
      end
    end
    column(:status) {|exchange| status_tag(exchange.status, class: exchange.status_color) if exchange.status }
    column 'Orders' do |exchange|
      count = exchange.orders.count
      link_to count.to_s + ' order'.pluralize(count), admin_exchange_orders_path(exchange) if count > 0
    end

#    actions
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


  sidebar "Status Date", only: [:show, :edit] do
    exchange.status_date.to_s
  end

  sidebar "System", only: [:show, :edit] do
    status_tag(exchange.status, class: exchange.status_color) if exchange.status
    status_tag(exchange.system, class: exchange.system_color) if exchange.system
  end

  sidebar "Comments", only: [:show, :edit] do
    exchange.comment
  end

  sidebar "Rates", only: [:show, :edit] do
    table_for exchange.rates do |r|
      r.column("Currency")    { |rate| status_tag rate.currency }
      r.column("Buy")     { |rate|  rate.buy_s}
      r.column("Sell")    { |rate|  rate.sell_s }
    end
    if exchange.individual?
      link_to "Manually update rates",    admin_exchange_rates_path(exchange)
    elsif exchange.chain?
      if exchange.chain_id
        link_to "Manually update rates",    admin_chain_rates_path(exchange.chain_id)
      else
        link_to "Manually update rates",    admin_exchange_rates_path(exchange)
      end
    end
  end

  sidebar "Opening hours", only: [:show, :edit] do
    table_for Exchange.days do
      column :day do |day|
        day.humanize
      end
      column :open do |day|
        time = exchange.send(day + '_open')
        time.strftime("%H:%M") if time
      end
      column :close do |day|
        time = exchange.send(day + '_close')
        time.strftime("%H:%M") if time
      end
    end
  end


  controller do

    before_filter :only => :index do
      @per_page = 30
    end

    # working...
    def scoped_collection
      if params[:chain_id]
        super.where(chain_id: params[:chain_id]).ransack(params[:q]).result
      elsif params[:name]
        super.where(name: params[:name]).ransack(params[:q]).result
      elsif params[:name_he]
        super.where(name_he: params[:name_he]).ransack(params[:q]).result
      elsif params[:address]
        super.where(address: params[:address]).ransack(params[:q]).result
      elsif params[:address_he]
        super.where(address_he: params[:address_he]).ransack(params[:q]).result
      else
        super
      end
    end

    def new
      @exchange = Exchange.new(admin_user_id: current_admin_user.id, rates_source: 0, contract: false)
    end

    def show
      redirect_to edit_admin_exchange_path(params[:id])
    end

    def create
      super do |success,failure|
        success.html { redirect_to admin_exchanges_path }
      end
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
      f.input     :business_type, as: :select, collection: {:"Exchange"=>"exchange", :"Bank"=>"bank", :"Post office"=>"post_office", :"Other"=>"other", :"Interbank"=>"inter"}, include_blank: false
      if f.object.bank?
        f.input     :bank_fee, label: 'Bank fee (%)'
      end
      f.input     :status, as: :select, collection: {:"Active"=> nil, :"Removed"=>"removed", :"Stale"=>"stale"}, include_blank: false
      f.input     :locale, as: :select, collection: {:"Hebrew"=>"he", :"English"=>"en"}, include_blank: false
      f.input     :chain_name, label: 'Chain name'
      f.input     :name, label: 'Exchange name'
      f.input     :nearest_station, label: 'Nearest station (if name is not unique)'
      f.input     :name_he, label: 'Name in Hebrew'
      f.input     :country, as: :string, label: 'Country (ISO Alpha-3 code)'
      f.input     :city
      f.input     :address
      f.input     :address_he, label: 'Address in Hebrew'
      f.input     :rates_policy, as: :select, collection: {:"Individual"=>"individual", :"Chain"=>"chain"}, include_blank: false
      f.input     :rates_source, as: :select, collection: {:"No rates"=>"no_rates", :"Test"=>"test", :"Manual"=>"manual", :"XML"=>"xml", :"Scraping"=>"scraping", :"API"=>"api"}, include_blank: false
      f.input     :rates_url, as: :url
      f.input     :currency, as: :select, collection: Currency.select, label: "Local currency"
      f.input     :credit, label: 'Accepts credit cards'
      f.input     :cc_fee, label: 'Credit card fee (%)'
      f.input     :delivery, label: 'Has a delivery service'
      f.input     :delivery_charge
      f.input     :delivery_nw_lat, label: 'Delivery NW Latitude', :wrapper_html => { :class => 'fl' }
      f.input     :delivery_nw_lng, label: 'Delivery NW Longitude', :wrapper_html => { :class => 'fl' }
      f.input     :delivery_se_lat, label: 'Delivery SE Latitude', :wrapper_html => { :class => 'fl' }
      f.input     :delivery_se_lng, label: 'Delivery SE Longitude', :wrapper_html => { :class => 'fl' }
      f.input     :email, as: :email
      f.input     :phone, as: :phone
      f.input     :website, as: :url
      f.input     :photo
      f.input     :contract
      f.input     :todo, as: :select, collection: {:"Verify"=>"verify", :"Call"=>"call", :"Meet"=>"meet", :"Sell"=>"sell"}
      f.input     :contact
      f.input     :weekday_open
      f.input     :weekday_close
      f.input     :saturday_open
      f.input     :saturday_close
      f.input     :sunday_open
      f.input     :sunday_close
      f.input     :latitude
      f.input     :longitude
      f.input     :comment, as: :text
      f.input     :error, input_html: { :disabled => true }
      f.input     :created_at, as: :string, input_html: { :disabled => true }
      f.input     :updated_at, as: :string, input_html: { :disabled => true }
      f.input     :admin_user_s, as: :string, label: "By", input_html: { :disabled => true }
      f.input     :admin_user_id, input_html: { :disabled => true }, as: :hidden
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

    active_admin_importable do |model, hash|

#      columns = Exchange.column_names - Exchange.unexported_columns
      begin

        chain = Chain.find_by(name: hash[:chain ])
        unless chain
          puts "no name and address or empty line"
          next
        end

        unless chain.manual?
          raise "Not a manual feed chain"
          next
        end

        chain.rates.where(currency: hash[:currency_code]).first_or_create.update(source: 'manual', currency: hash[:currency_code], sell: hash[:sell_rate], buy: hash[:buy_rate])

      rescue => e
        puts "e: #{e}"
        puts ""
      end

    end



    index do
      selectable_column
      id_column
      column :source        do |rate|
        best_in_place rate, :source, as: :select, collection: {:"manual"=>"Manual", :"xml"=>"XML", :"scraping"=>"Scraping", :"test"=>"Test", :"api"=>"API"}
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
      column :buy_markup           do |rate|
        best_in_place rate, :buy_markup, :as => :input
      end
      column :sell_markup           do |rate|
        best_in_place rate, :sell_markup, :as => :input
      end
      column :invBuy do |rate|
        rate.buy.present? and Currency.inverse?(rate.ratable.currency) ? '%.4f' %(1.0 / rate.buy) : ""
      end
      column :invSell do |rate|
        rate.sell.present? and Currency.inverse?(rate.ratable.currency) ? '%.4f' %(1.0 / rate.sell) : ""
      end
      column :last_update do |rate|
        update = rate.last_update || rate.updated_at
        update.in_time_zone('Jerusalem') if update
      end
      column "By", :admin_user_s
      column (:method) {|rate| status_tag(rate.method, class: rate.method_color) if rate.reference? }
      actions defaults: false
    end

 #   filter :currency

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
          exchange = Exchange.find(params[:exchange_id])
          if exchange.chain? and exchange.chain_id.present?
            ratable_type = 'Chain'
            ratable_id = exchange.chain_id
          else
            ratable_type = 'Exchange'
            ratable_id = params[:exchange_id]
          end
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

=begin
          if params[:exchange_id]
            redirect_to new_admin_exchange_rate_path(ratable_id) and return
          elsif params[:chain_id]
            redirect_to new_admin_chain_rate_path(ratable_id) and return
          end
=end

        end

      end

      def new

=begin
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
=end

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

  ActiveAdmin.register Order do

    includes :search
    includes :exchange


    config.filters = false
    config.clear_action_items!
    config.batch_actions = true

    index do
      selectable_column
      id_column
      column 'Created' do |order|
        order.created_at.in_time_zone("Jerusalem")
      end
      column 'Search' do |order|
        link_to order.search.location, admin_search_path(order.search_id) if order.search_id
      end
      column 'User' do |order|
        link_to order.user.name, admin_user_path(order.user_id) if order.user_id
      end
      column 'User Location' do |order|
        order.search.user_location if order.search
      end
      column :'Exchange' do |order|
        link_to order.exchange.name.capitalize, admin_exchange_orders_path(order.exchange_id) if order.exchange
      end
      column 'Pay' do |order|
        order.pay_cents && order.pay_currency ? order.pay.format : ""
      end
      column 'Get' do |order|
        order.get_cents && order.get_currency ? order.get.format : ""
      end
      column 'Service' do |order|
        order.service_type.capitalize if order.service_type
      end
      column 'Payment' do |order|
        link_to 'Credit card', admin_order_payments_path(order.id) if order.payments.any?
      end
      column (:status) {|order| status_tag(order.status, class: order.status_color) if order.status }
    end

    controller do

      def index
        if params[:exchange_id]
          orders = Order.where(exchange_id: params[:exchange_id])
        elsif params[:user_id]
          orders = Order.where(user_id: params[:user_id])
        else
          orders = Order.all
        end
        @collection = orders.order(id: :desc).page(params[:page]).per(10)
      end

    end

  end

end

