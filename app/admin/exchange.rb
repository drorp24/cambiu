ActiveAdmin.register Exchange do

  permit_params :id, :name, :address, :email, :latitude, :longitude, :country, :opens, :closes,:website, :email, :note, :phone, :atm, :source, :business_type, :chain, :city, :region, :rating, :nearest_station,
                :airport, :directory, :accessible, :status, :logo, :currency, :admin_user_id, :rates_source, :contract, :rates_policy,
                :todo, :chain_name, :contact, :weekday_open, :weekday_close, :saturday_open, :saturday_close, :sunday_open, :sunday_close, :rates_url, :comment

=begin
    rates_attributes: [:id, :buy_cents, :buy_currency, :pay_cents, :pay_currency, :_destory],
    business_hours_attributes: [:id, :day, :open1, :close1, :open2, :close2]
=end

  includes :chain

  # csv import
  # TODO: update opening hours in the search
  active_admin_importable do |model, hash|

    columns = Exchange.column_names - Exchange.unexported_columns
    begin

      if hash[:name].blank? or hash[:address].blank?
        puts "no name and address or empty line"
        next
      end

      exchange = Exchange.identify_by_either(hash[:id], hash[:name], hash[:address], hash[:nearest_station])
      columns.each do |column|
        exchange.send(column + '=', hash[column.to_sym])
      end
      exchange.chain_id        = Chain.where(name: hash[:chain]).first_or_create.id if hash[:chain].present?

      exchange.save!

    rescue => e
 #      e.save validate: false
      puts "e: #{e}"
      puts "e.error: #{e.error}" if e
      puts ""
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
  scope :error

  filter :name
  filter :nearest_station
  filter :chain
  filter :id
=begin
  filter :rates_source, as: :select, collection: [['No rates', 'no_rates'],['Test', 'test'], ['Manual', 'manual'], ['XML', 'xml'], ['Scraping', 'scraping']]
  filter :chain
  filter :name
  filter :address
  filter :region
=end

  config.batch_actions = true

  index do
    selectable_column
    id_column
    column(:todo)   {|exchange| status_tag(exchange.todo, exchange.todo_color) if exchange.todo }
    column(:system) {|exchange| status_tag(exchange.system, exchange.system_color) if exchange.system }
    column :chain
    column :name
    column :nearest_station
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
#        link_to exchange.chain.rates_source ? exchange.chain.rates_source.titleize : '', admin_chain_rates_path(exchange.chain_id)
      end
    end
    column(:status) {|exchange| status_tag(exchange.status, exchange.status_color) if exchange.status }
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


  sidebar "System", only: [:show, :edit] do
    status_tag(exchange.status, exchange.status_color) if exchange.status
    status_tag(exchange.system, exchange.system_color) if exchange.system
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
      link_to "Manually update rates",    admin_chain_rates_path(exchange.chain_id)
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

    def new
      @exchange = Exchange.new(admin_user_id: current_admin_user.id, currency: "GBP", rates_source: 0, contract: true)
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
      f.input     :contract
      f.input     :todo, as: :select, collection: {:"Verify"=>"verify", :"Call"=>"call", :"Meet"=>"meet"}
      f.input     :chain_name, label: 'Chain'
      f.input     :name
      f.input     :nearest_station
      f.input     :contact
      f.input     :address
      f.input     :phone, as: :phone
      f.input     :email, as: :email
      f.input     :website, as: :url
      f.input     :weekday_open
      f.input     :weekday_close
      f.input     :saturday_open
      f.input     :saturday_close
      f.input     :sunday_open
      f.input     :sunday_close
      f.input     :business_type, as: :select, collection: {:"Exchange"=>"exchange", :"Bank"=>"bank", :"Post office"=>"post_office", :"Other"=>"other"}, include_blank: false
      f.input     :rates_policy, as: :select, collection: {:"Individual"=>"individual", :"Chain"=>"chain"}, include_blank: false
      f.input     :rates_source, as: :select, collection: {:"No rates"=>"no_rates", :"Test"=>"test", :"Manual"=>"manual", :"XML"=>"xml", :"Scraping"=>"scraping"}, include_blank: false
      f.input     :rates_url, as: :url
      f.input     :latitude
      f.input     :longitude
      f.input     :currency, as: :select, collection: Currency.select, label: "Local currency", value: "GBP"
      f.input     :comment, as: :text
      f.input     :error, input_html: { :disabled => true }
      f.input     :created_at, as: :string, input_html: { :disabled => true }
      f.input     :rates_update, as: :string, input_html: { :disabled => true }
      f.input     :rates_error, as: :string, input_html: { :disabled => true }
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

        chain = Chain.find_by(name: hash[:chain_name])
        unless chain
          puts "no name and address or empty line"
          next
        end

        unless chain.manual?
          raise "Not a manual feed chain"
          next
        end

        chain.rates.where(currency: hash[:curreny_code]).first_or_create.update(source: 'manual', currency: hash[:curreny_code], sell: hash[:sell_rate], buy: hash[:buy_rate])

      rescue => e
        puts "e: #{e}"
        puts ""
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
        best_in_place rate, :source, as: :select, collection: {:"manual"=>"Manual", :"xml"=>"XML", :"scraping"=>"Scraping", :"test"=>"Test"}
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
      column :last_update do |rate|
        update = rate.last_update || rate.updated_at
        update.in_time_zone('Jerusalem') if update
      end
      column "By", :admin_user_s
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
end