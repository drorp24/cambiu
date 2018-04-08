module Api
  module V2

    class RatesController < ApplicationController
      skip_before_action :verify_authenticity_token, raise: false # TODO: Replace with verify_API_key

      def create

        if Rate.valid_params?(api_params)

          ratable = api_params[:ratable_type] == 'Chain' ? Chain.find_by(id: api_params[:ratable_id]) : Exchange.find_by(id: api_params[:ratable_id])

          if ratable

            ratable.update(rates_source: api_params[:source])

            api_params[:currencies].each do |currency|

              rate = Rate.find_or_create_by(ratable_type: api_params[:ratable_type], ratable_id: api_params[:ratable_id], currency: currency[:currency])

              unless rate.update_by_api(api_params[:source], api_params[:quote], currency)
                render json: {status: 'wrong data for currency ' + currency[:currency]}
                return
              end

            end

            render json: {status: 'ok'}

          else
            render json: {errors: 'ratable not found'}
          end

        else
          render json: {errors: 'invalid params'}
        end

      end

      def api_params
#        params.permit(:source, :ratable_type, :ratable_id, :base_currency, :quote_currency, :buy, :sell, :buy_markup, :sell_markup)
        params.permit!
      end

    end

  end
end
