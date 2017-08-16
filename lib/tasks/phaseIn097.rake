namespace :version do
  desc "phaseIn097"
  task :phaseIn097 => :environment do

    Rails.logger.info ""
    Rails.logger.info "phaseIn097 started"
    Rails.logger.info ""

    Exchange.where(country: 'ISR').update_all(locale: 'he')

    Rails.logger.info ""
    Rails.logger.info "phaseIn097 completed"
    Rails.logger.info ""



  end

end