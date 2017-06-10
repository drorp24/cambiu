module Api
  module V2

    class ChainsController < ApplicationController
      skip_before_action :verify_authenticity_token # TODO: Replace with verify_API_key

      def index
        render json: Chain.entire_list(chain_params)
      end

      def chain_params
        params.permit(:country, :city)
      end

    end

  end
end
