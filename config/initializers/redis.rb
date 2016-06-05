uri = ENV["REDISTOGO_URL"]
REDIS = Redis.new(:url => uri)