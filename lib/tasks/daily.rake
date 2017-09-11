namespace :rates do
  desc "Daily process"
  task :daily => :environment do


    # This is the place to put processes which, by nature, can only run after the fact

    Rails.logger.info ""
    Rails.logger.info "Daily rates cleanse process started"
    Rails.logger.info ""

    Exchange.with_real_rates.find_each do |e|
      e.rates.where(source: 'test').delete_all
    end


    Chain.with_real_rates.find_each do |c|
      c.rates.where(source: 'test').delete_all
    end

    Rails.logger.info ""
    Rails.logger.info "Daily rates cleanse process finished"
    Rails.logger.info ""


  end

end