ActiveAdmin.register Chain do

  permit_params :id, :name, :email, :url, :phone, :rates_source, :rates_update, :currency
  config.filters = false

  index do
    selectable_column
    id_column
    column :name do |chain|
      link_to chain.name, admin_chain_path(chain)
    end
    column :exchanges do |chain|
        link_to "View exchanges", admin_chain_exchanges_path(chain)
    end
    column :currency
    column :rates_source do |chain|
      chain.rates_source.titleize if chain.rates_source
      link_to chain.rates_source.titleize, admin_chain_rates_path(chain)
    end
    column :rates_update do |rate|
      rate.rates_update.in_time_zone('Jerusalem') if rate.rates_update
    end


    actions defaults: false do |chain|
      link_to('Upload rates', update_rates_admin_chain_path(chain)) if chain.xmlable?
    end



  end


    sidebar "Rates", only: [:show, :edit] do
    table_for chain.rates do |r|
      r.column("Currency")    { |rate| status_tag rate.currency }
      r.column("Buy")     { |rate|  rate.buy_s}
      r.column("Sell")    { |rate|  rate.sell_s }
    end
    link_to "Update rates",    admin_chain_rates_path(chain)
  end

  config.batch_actions = true

  form do |f|

    f.inputs 'Details' do

      f.semantic_errors *f.object.errors.keys

      f.input     :name, as: :string
      f.input     :email
      f.input     :phone
      f.input     :url
      f.input     :currency, as: :select, collection: Currency.select, label: "Local currency"
      f.input     :rates_source, as: :select, collection: [['No rates', 'no_rates'],['Test', 'test'], ['Manual', 'manual'], ['XML', 'xml'], ['Scraping', 'scraping']], include_blank: false
      f.input     :rates_update, as: :string, input_html: { :disabled => true }
      f.input     :rates_error, as: :string, input_html: { :disabled => true }
      f.input     :updated_at, as: :string, input_html: { :disabled => true }
    end
    f.actions

  end

      controller do

        def update_rates
        end

        def extract
          chain = Chain.find(params[:id])
          Extract.update(chain.name, nil, params[:extract][:file].tempfile, 'xmlFile')
          redirect_to collection_path, notice: "Rates were successfully updated"
        end

        def show
          redirect_to edit_admin_chain_path(params[:id])
        end

  end


end
