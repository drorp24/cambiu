module ActiveSupport
  module Cache
    class DalliStore

      private

      # silences "Cache read ..." etc debug lines for assets, but allows all others
      def log(operation, key, options=nil)
        return if options.key?(:expires_in)
      end

    end
  end
end
