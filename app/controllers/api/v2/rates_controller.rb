module Api
  module V2

    class RatesController < ApplicationController
      skip_before_action :verify_authenticity_token # TODO: Replace with verify_API_key

      def create
        puts api_params.inspect
        ratable = Rate.api_update_by(api_params)
        if ratable and ratable.errors.empty?
          render json: {status: 'ok'}
        else
          render json: {errors: ratable && ratable.errors.any? ? ratable.errors : 'ratable was not updated'}
        end
      end

      def api_params
#        params.permit(:source, :ratable_type, :ratable_id, :base_currency, :quote_currency, :buy, :sell, :buy_markup, :sell_markup)
        params.permit!
      end

    end

  end
end
