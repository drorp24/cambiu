ActiveAdmin.register Chain do

  permit_params :id, :name, :email, :url, :phone, :rates_source, :rates_update
  config.filters = false

  index do
    id_column
    column :name
    column :url
    column :currency
    column :rates_source do |chain|
      chain.rates_source.titleize
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




end
