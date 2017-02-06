namespace :exchanges do
  desc "Cleanse exchanges"
  task :cleanse => :environment do


    Rails.logger.info " "
    Rails.logger.info "Started Exchanges Cleanse task"
    Rails.logger.info " "

    Exchange.where(address: nil, business_type: :exchange).destroy_all
    Exchange.where(currency: nil).update_all(currency: 'GBP')
    Exchange.where(rates_source: nil).update_all(rates_source: 'no_rates')

    Rails.logger.info " "
    Rails.logger.info "Finished Exchanges Cleanse task"
    Rails.logger.info " "

  end
end