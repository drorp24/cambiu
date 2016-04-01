namespace :rates do
  desc "remove orphant rate records: belonging to exchanges that are chain rated"
  task :remove_chain_exchanges_rates => :environment do

    Rate.find_each do |rate|

      next if rate.ratable_type == 'Chain'
      next if rate.exchange.individual?
      rate.delete

    end

  end

end