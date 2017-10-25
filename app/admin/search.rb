ActiveAdmin.register Search do

  config.filters = false
  config.clear_action_items!

  scope :all
  scope :london
  scope 'Tel Aviv', :telaviv
  scope :other
  scope :empty

  config.batch_actions = false

  index do
#    selectable_column
    id_column
=begin
    column 'User' do |search|
      link_to search.user.name, admin_user_searches_path(search.user_id) if search.user_id and search.user
    end
    column :user_location
=end
    column :user_location
    column 'Search Location', :location
    column 'Reason' do |search|
      "#{search.change_field} set to #{search.change_to}" if search.change_field.present? and search.change_to.present?
    end
    column 'Service Type' do |search|
      search.service_type.capitalize if search.service_type
    end
    column 'Payment Method' do |search|
      search.payment_method.capitalize if search.payment_method
    end
    column 'Result Service Type' do |search|
      search.result_service_type.to_s.capitalize if search.result_service_type
    end
    column 'Result Payment Method' do |search|
      search.result_payment_method.to_s.capitalize if search.result_payment_method
    end
     column 'Result Exchange' do |search|
      link_to search.result_exchange.name, edit_admin_exchange_path(search.result_exchange_id) if search.result_exchange_id
    end
=begin
    column(:cached) do |search|
      search.result_cached ? "yes" : ""
    end
=end
    column 'Issues' do |search|
      count = search.issues.count
#      status_tag(count, :red) if count > 0
      link_to status_tag(count.to_s + ' issue'.pluralize(count), class: :red), admin_search_issues_path(search) if count > 0
    end
    column 'Created' do |search|
      search.created_at.in_time_zone("Jerusalem").strftime("%-d %b %k:%M")
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
