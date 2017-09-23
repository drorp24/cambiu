module ActiveSupport
  module Cache
    class DalliStore

      private

      if DalliStore.method_defined? :log
        alias_method :orig_log, :log
      end

      # silences "Cache read ..." etc debug lines for assets, but allows all others
      def log(operation, key, options=nil)
        return if options.key?(:expires_in)
        orig_log(operation, key, options)
      end

    end
  end
end
