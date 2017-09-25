if defined? Rack::Cors
  Rails.configuration.middleware.insert_before 0, Rack::Cors do
    allow do
      origins %w[
        https://www.cambiu.com
        https://cambiustaging.herokuapp.com
      ]
      resource '/assets/*'
    end
  end
end