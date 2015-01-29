ActiveAdmin.register Exchange do

  active_admin_importable

  ActiveAdmin.register Rate do
    belongs_to :exchange
    permit_params :buy_cents, :buy_currency, :pay_cents, :pay_currency, :source
  end
  
  sidebar "Business Info", only: [:show, :edit] do
    ul do
      li link_to "Rates",    admin_exchange_rates_path(exchange)
    end
  end


  permit_params :name, :address, :latitude, :longitude, :country, :user_ratings, :opens, :closes

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
      row :latitude
      row :longitude
      row :user_ratings
      row :opens
      row :closes
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
  end

  form do |f|
    f.inputs 'Details' do
      f.input :name
      f.input :address
      f.input :latitude
      f.input :longitude
      f.input :user_ratings
      f.input :opens
      f.input :closes
      f.input :country, :as => :select, collection: country_dropdown
      f.inputs "Rates" do
        f.has_many :rates, new_record: 'Add' do |b|
          b.input :buy_cents
          b.input :buy_currency
          b.input :pay_cents
          b.input :pay_currency
        end
      end
    end
    f.actions
  end

end
