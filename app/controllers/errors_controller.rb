class ErrorsController < ApplicationController
skip_before_action :verify_authenticity_token

  def create

    error = Error.create(error_params)
    if error.errors.any?
      render json: {errors: error.errors.full_messages}, status: 422
    else
      render json: {'status': 'ok'}
    end
    ErrorJob.perform_later(error_params[:text])

  end

  protected

  def error_params
    puts params.inspect
    params.require(:error).permit!
  end

end