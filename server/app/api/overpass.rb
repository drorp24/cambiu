require 'httpi'
require 'diskcached'
require 'open-uri'
require 'json'
require 'nokogiri'

class Overpass
  
  DEFAULT_ENDPOINT='http://overpass-api.de/api/interpreter?data='

  def initialize(args={})
    @endpoint = args[:endpoint] || DEFAULT_ENDPOINT
    @json = args[:json] ? "output='json'" : ''
    @timeout = args[:timeout] ? "timeout='#{args[:timeout]}'" : ''
    @element_limit = args[:element_limit] ? "element-limit='#{args[:element_limit]}'" : ''
    cache_expiration_time = args[:cache_expiration_time] || 7200
    @cache = Diskcached.new('tmp/cache',cache_expiration_time,true)
    @bbox = args[:area] == "London" ? "bbox='51.28,-0.489,51.686,0.236'" : ''
    @query = args[:amenity] == "bdc" ? "<query type='node'><has-kv k='amenity' v='bureau_de_change'/></query>" : ''
  end

  def query
    perform "<osm-script #{@bbox} #{@timeout} #{@element_limit} #{@json}>" <<
            "#{@query}<print/></osm-script>"            
  end

  def raw_query(query)
    return unless query
    perform query
  end

  private

  def perform(query)
    url = URI::encode("#{@endpoint}#{query}")
    data = @cache.cache("overpass_api_ruby_#{query}") do
      request = HTTPI::Request.new(url)
      begin
        HTTPI.get(request).body
      rescue => e
        puts e
        return false
      end
    end

    begin
      return JSON.parse(data, :symbolize_names=> true)[:elements] unless @json.empty?
    rescue JSON::ParserError => e
      puts "Another request is still running"
      return false
    end

    doc = Nokogiri::XML(data) do |config|
      config.options = Nokogiri::XML::ParseOptions::NOBLANKS
    end

    raw = doc.children.first.children.select{|e| e.name != 'note' and e.name != 'meta'}
    parse_nokogiri raw
  end

  def parse_nokogiri(xml)
    xml.map {|e|
      element = {:type => e.name}

      e.attributes.each {|a|
        element[a[1].name.to_sym] = a[1].value
      }

      members = e.children.select{|n| n.name != 'tag'}.map {|child|
        key_values={:type => child.name }
        child.attributes.each {|a|
          key_values[a[1].name.to_sym] = a[1].value
        }
        key_values
      }
      element[:members] = members unless members.empty?

      tags={}
      e.children.select{|n| n.name == 'tag'}.each {|child|
        tags[child.values.first] = child.values[1]
      }
      element[:tags] = tags unless tags.empty?

      element
    }
  end

end