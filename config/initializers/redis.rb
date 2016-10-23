uri = ENV["REDISTOGO_URL"]
REDIS = Redis.new(
    :url => uri,
    :connect_timeout => 1.0,
    :read_timeout    => 1.0,
    :write_timeout   => 1.0
)