require 'redis'

REDIS1 = Redis.connect(url: ENV['REDISTOGO_URL'])

Geocoder.configure(
  # geocoding options
    cache: REDIS1,
    always_raise: [
        Geocoder::OverQueryLimitError,
        Geocoder::RequestDenied,
        Geocoder::InvalidRequest,
        Geocoder::InvalidApiKey
    ],
   :timeout      => 3,           # geocoding service timeout (secs)
   :lookup       => :google,     # name of geocoding service (symbol)
  # :language     => :en,         # ISO-639 language code
  # :use_https    => false,       # use HTTPS for lookup requests? (if supported)
  # :http_proxy   => nil,         # HTTP proxy server (user:pass@host:port)
  # :https_proxy  => nil,         # HTTPS proxy server (user:pass@host:port)
  # :api_key      => nil,         # API key for geocoding service
  # :cache        => nil,         # cache object (must respond to #[], #[]=, and #keys)
  # :cache_prefix => "geocoder:", # prefix (string) to use for all cache keys

  # exceptions that should not be rescued by default
  # (if you want to implement custom error handling);
  # supports SocketError and TimeoutError
  # :always_raise => [],

  # calculation options
   :units     => :km,       # :km for kilometers or :mi for miles
  # :distances => :linear    # :spherical or :linear
)
