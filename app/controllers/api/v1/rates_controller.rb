module Api
  module V1

    class RatesController < ApplicationController

      def index
        render json: Exchange.entire_rates(params)
      end

      def update
        rate = Rate.identify_by_either params
        if rate and rate.errors.empty? and rate.update(params.merge({source: 'ratefeed'}))
          render json: {status: 'ok'}
        else
          render json: {error: rate.errors.any? ? rate.errors : 'rate was not updated'}
        end
      end

    end

  end
end
