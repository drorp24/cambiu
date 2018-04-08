module Api
  module V1

    class CountriesController < ApplicationController
      skip_before_action :verify_authenticity_token, raise: false # TODO: Replace with verify_API_key

      def index
        render json: Exchange.countries
      end

      def country_params
      end

    end

  end
end
