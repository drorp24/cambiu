ActiveAdmin.register Search do

  config.filters = false
  config.clear_action_items!

  scope :all
  scope :london
  scope 'Tel Aviv', :telaviv
  scope :other
  scope :empty
  
  config.batch_actions = true

  index do
    selectable_column
    id_column
    column 'Mode' do |search|
      search.mode.capitalize if search.mode
    end
=begin
    column 'User' do |search|
      link_to search.user.name, admin_user_searches_path(search.user_id) if search.user_id and search.user
    end
    column :user_location
=end
    column :pay_amount
    column :pay_currency
    column :buy_amount
    column :buy_currency
    column 'Search Location', :location
    column :location_type
    column :location_reason
    column 'Issues' do |search|
      count = search.issues.count
#      status_tag(count, :red) if count > 0
      link_to status_tag(count.to_s + ' issue'.pluralize(count), class: :red), admin_search_issues_path(search) if count > 0
    end
    column 'Best' do |search|
      link_to search.exchange.name, edit_admin_exchange_path(search.exchange_id) if search.exchange_id
    end
    column 'Created' do |search|
      search.created_at.in_time_zone("Jerusalem")
    end
  end

=begin
  controller do

    def index
      if params[:user_id]
        searches = Search.where(user_id: params[:user_id])
      else
        searches = Search.all
      end
      @collection = searches.order(id: :desc).page(params[:page]).per(10)
    end

  end
=end


  ActiveAdmin.register Error, as: 'Issue' do

    config.filters = false
    config.clear_action_items!
    config.batch_actions = true

    index do
      selectable_column
      id_column
      column 'Created' do |error|
        error.created_at.in_time_zone("Jerusalem")
      end
      column :message
    end

    controller do

      def index
        errors = params[:id] ? Error.where(search_id: params[:id]) : Error.all
        @collection = errors.order(id: :desc).page(params[:page]).per(10)
      end

    end

  end

end
