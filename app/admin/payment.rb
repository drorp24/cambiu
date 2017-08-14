ActiveAdmin.register Payment do

  permit_params :order_id, :authNumber, :cardToken, :cardMask, :cardExp, :txId, :uniqueID

  config.filters = false
  config.clear_action_items!
  before_filter :only => :index do @skip_sidebar = true end

  index do

    id_column
    column :user
    column :order
    column :authNumber
    column :cardToken
    column :cardMask
    column :uniqueID
    column 'Created' do |payment|
      payment.created_at.in_time_zone("Jerusalem")
    end

  end

  form do |f|

    f.inputs 'Details' do

      f.semantic_errors *f.object.errors.keys
    f.input :order_id
    f.input :authNumber
    f.input :cardToken
    f.input :cardMask
    f.input :cardExp
    f.input :txId
    f.input :uniqueID

  end

end

  end