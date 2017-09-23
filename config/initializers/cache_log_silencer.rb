module ActiveSupport
  module Cache
    class DalliStore

      private

      alias_method :orig_log, :log

      # silences "Cache read ..." etc debug lines for assets, but allows all others
      def log(operation, key, options=nil)
        return if options.key?(:expires_in)
        orig_log(operation, key, options)
      end

    end
  end
end
