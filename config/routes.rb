Rails.application.routes.draw do

  # landing pages
  root 'home#index'
  get 'homepage',           to: 'home#index'
  get 'exchanges',              to: 'home#index'
  get 'exchanges/list',          to: 'home#index'
  get 'exchanges/:id/:view',          to: 'home#index'
  resources :searches do
    collection do
      post 'record'
    end
  end
  get 'currency_exchange',  to: 'landing#index', as: :currency_exchange  
  get 'save_money',         to: 'landing#index', as: :save_money
  get 'best_rates',         to: 'landing#index', as: :best_rates
  # landing pages

  # non-devise route: post users, routed here to users#create to create guest users
  post 'users', to: 'users#create', as: :users

  devise_for :users, :controllers => {registrations: "users/registrations", sessions: "users/sessions", omniauth_callbacks: "users/omniauth_callbacks" }
  devise_scope :user do
    get 'sign_out', :to => 'devise/sessions#destroy', :as => :adestroy_user_session
  end
  devise_for :admin_users, ActiveAdmin::Devise.config
  ActiveAdmin.routes(self)
  resources :orders
  resources :exchanges do
    member do
      get 'quote'
    end
    collection do
      get 'search'
  end
  end
  
  resources :currencies do
    collection do
      get 'rates', 'exchange'
    end
  end
  resources :rates
  resources :visitors
  namespace :admin do
    resources :rates
    resources :exchanges do
      resources :rates
    end
  end
  namespace :api do
    namespace :v1 do
      resources :exchanges
    end
  end
  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
