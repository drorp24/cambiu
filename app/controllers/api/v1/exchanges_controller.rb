module Api
  module V1

    class ExchangesController < ApplicationController

      def index
        render json: Exchange.entire_list(params)
      end

    end

  end
end
