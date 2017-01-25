ActiveAdmin.register Search do

  config.filters = false

  scope :all
  scope :london
  scope :telaviv
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
      if count > 0
 #       link_to status_tag(count, :red), admin_search_issues_path(search)
      end
    end
    column 'Created', :created_at
  end

end
