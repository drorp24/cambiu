namespace :exchanges do
  desc "Cleanse exchanges"
  task :cleanse => :environment do


    Rails.logger.info " "
    Rails.logger.info "Started Exchanges Cleanse task"
    Rails.logger.info " "

    Exchange.where(address: nil, business_type: :exchange).destroy_all

    # Should match exchange.rb's before_create

    Exchange.where(rates_source: nil).update_all(rates_source: 'no_rates')

    Exchange.where(rates_policy: nil, chain_id: nil).update_all(rates_policy: 'individual')
    Exchange.where(rates_policy: nil).where.not(chain_id: nil).update_all(rates_policy: 'chain')
    Exchange.where(rates_policy: 'chain', chain_id: nil).update_all(rates_policy: 'individual')

    Exchange.where(business_type: nil).update_all(business_type: 'exchange')

    Chain.where(rates_source: 'scraping').each{|chain| chain.exchanges.where.not(rates_source: 'scraping').each{|exchange| exchange.update(rates_source: 'scraping')}}

    Exchange.find_each do |exchange|
      rates_are_stale = exchange.rates_are_stale?
      if exchange.stale? != rates_are_stale
        rates_are_stale ? exchange.stale! : exchange.clear_status
        exchange.save!
      end
    end

    Rails.logger.info "At the end of the Exchange Cleanse task:"
    Rails.logger.info "There are #{Exchange.where(rates_source: nil).count} exchanges whose rates_source is nil"
    Rails.logger.info "There are #{Exchange.where(rates_policy: nil).count} exchanges whose rates_policy is nil"
    Rails.logger.info "There are #{Exchange.where(business_type: nil).count} exchanges whose business_type is nil"
    Rails.logger.info "There are #{Exchange.where(currency: nil).count} exchanges whose currency is nil"
    Rails.logger.info "There are #{Exchange.where(country: nil).count} exchanges whose country is nil"
    countries = Exchange.group(:country).count
    Rails.logger.info "Following countries inserted with no ISO code: #{countries.select{|c| c && c.length > 3}}"

    stales = Exchange.stale
    Rails.logger.info "There are #{stales.count} exchanges whose rates are stale"
    Rails.logger.info "They are: #{stales.pluck(:id, :name, :rates_policy)}"

    Rails.logger.info " "
    Rails.logger.info "Finished Exchanges Cleanse task"
    Rails.logger.info " "

  end
end