module Api
  module V1

    class RatesController < ApplicationController
      skip_before_action :verify_authenticity_token # TODO: Replace with verify_API_key

      def index
        render json: Exchange.rates_list(rate_params)
      end

      def create
        rate = Rate.identify_by_either rate_params
        if rate and rate.errors.empty? and rate.update_by_params(rate_params)
          render json: {status: 'ok'}
        else
          render json: {errors: rate && rate.errors.any? ? rate.errors : 'rate was not updated'}
        end
      end

      def rate_params
        params.permit(:country, :city, :chain, :name, :nearest_station, :currency, :buy, :sell, :type)
      end

    end

  end
end
