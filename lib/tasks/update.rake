namespace :rates do
  desc "Update rates"
  task :update => :environment do

    Rake::Task["rates:extract"].invoke
    Rake::Task["rates:generate"].invoke
    Rake::Task["exchanges:check"].invoke

  end
end