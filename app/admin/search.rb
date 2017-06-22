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
    column :user_location
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
      link_to status_tag(count.to_s + ' issue'.pluralize(count), :red), admin_search_issues_path(search) if count > 0
    end
    column 'Created', :created_at
  end

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
        errors = params[:search_id] ? Error.where(search_id: params[:search_id]) : Error.all
        @collection = errors.order(id: :desc).page(params[:page]).per(10)
      end

    end

  end

end
