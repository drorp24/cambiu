namespace :exchanges do
  desc "Cleanse exchanges"
  task :cleanse => :environment do


    Rails.logger.info " "
    Rails.logger.info "Started Exchanges Cleanse task"
    Rails.logger.info " "

    Exchange.where(address: nil).destroy_all

    Rails.logger.info " "
    Rails.logger.info "Finished Exchanges Cleanse task"
    Rails.logger.info " "

  end
end