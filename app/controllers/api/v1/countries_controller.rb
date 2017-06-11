module Api
  module V1

    class CountriesController < ApplicationController
      skip_before_action :verify_authenticity_token # TODO: Replace with verify_API_key

      def index
        render json: {'UK': 'United Kingdom', 'ISR': 'Israel'}
      end

      def country_params
      end

    end

  end
end
