module Api
  module V2

    class ExchangesController < ApplicationController

      def index
        render json: Exchange.entire_list(exchange_params)
      end

      def exchange_params
        params.permit(:country, :city)
      end

    end

  end
end
