module Api
  module V2

    class RatesController < ApplicationController
      skip_before_action :verify_authenticity_token # TODO: Replace with verify_API_key

      def index
        render json: Exchange.rates_list(rate_params)
      end

      def rate_params
        params.permit(:country, :city, :chain, :name, :nearest_station, :currency, :buy, :sell, :type, :base)
      end

    end

  end
end
