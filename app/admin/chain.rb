ActiveAdmin.register Chain do

  permit_params :id, :name, :email, :url, :phone, :rates_source, :rates_update
  config.filters = false

  index do
    id_column
    column :name do |chain|
      link_to chain.name, admin_chain_path(chain)
    end
    column :url
    column :currency
    column :rates_source do |chain|
      chain.rates_source.titleize if chain.rates_source
    end
    column :rates_update
  end

    sidebar "Rates", only: [:show, :edit] do
    table_for chain.rates do |r|
      r.column("Currency")    { |rate| status_tag rate.currency }
      r.column("Buy")     { |rate|  rate.buy_s}
      r.column("Sell")    { |rate|  rate.sell_s }
    end
    link_to "Update rates",    admin_chain_rates_path(chain)
  end

  form do |f|

    f.inputs 'Details' do

      f.semantic_errors *f.object.errors.keys

      f.input     :name, as: :string
      f.input     :email
      f.input     :phone
      f.input     :url
      f.input     :currency
      f.input     :rates_source, input_html: { :disabled => true }
      f.input     :rates_update, input_html: { :disabled => true }
    end
    f.actions

  end

      controller do

    def show
      redirect_to edit_admin_chain_path(params[:id])
    end

  end


end
