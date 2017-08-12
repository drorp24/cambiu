ActiveAdmin.register User do

  permit_params :email, :first_name, :last_name, :phone, :city, :street

  config.filters = false
  config.clear_action_items!
  before_filter :only => :index do @skip_sidebar = true end

  index do

    id_column
    column :email
    column :orders do |user|
      count = user.orders.count
      link_to count.to_s + ' order'.pluralize(count), admin_user_orders_path(user) if count > 0
    end
    column :first_name
    column :last_name
    column :phone
    column :city
    column :street
    column 'Created' do |search|
      search.created_at.in_time_zone("Jerusalem")
    end

  end

  form do |f|

    f.inputs 'Details' do

      f.semantic_errors *f.object.errors.keys
    f.input :first_name
    f.input :last_name
    f.input :email
    f.input :phone
    f.input :company
    f.input :locale
#    f.input :country
    f.input :city
    f.input :street
    f.input :house
    f.input :entry
    f.input :floor
    f.input :apartment

  end

end

  end