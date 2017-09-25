ActionController::UrlFor.module_eval do

# Fixing a sudden unexplained bug, that super is nil. Line 11 has the fix
def url_options

  @_url_options ||= {
      host: request.host,
      port: request.optional_port,
      protocol: request.protocol,
      _recall: request.path_parameters
  }.merge!(super || {}).freeze

  if (same_origin = _routes.equal?(request.routes)) ||
      (script_name = request.engine_script_name(_routes)) ||
      (original_script_name = request.original_script_name)

    options = @_url_options.dup
    if original_script_name
      options[:original_script_name] = original_script_name
    else
      if same_origin
        options[:script_name] = request.script_name.empty? ? "".freeze : request.script_name.dup
      else
        options[:script_name] = script_name
      end
    end
    options.freeze
  else
    @_url_options
  end
end

end