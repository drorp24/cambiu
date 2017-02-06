namespace :exchanges do
  desc "Check exchanges"
  task :check => :environment do


    Rails.logger.info " "
    Rails.logger.info "Started Exchanges Check task"
    Rails.logger.info " "

    Exchange.find_each do |exchange|
      rates_are_stale = exchange.rates_are_stale?
      if exchange.stale? != rates_are_stale
        rates_are_stale ? exchange.stale! : exchange.clear_status
        exchange.save!
      end
    end

    Rails.logger.info " "
    Rails.logger.info "Finished Exchanges Check task"
    Rails.logger.info " "

  end
end