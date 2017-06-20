class ErrorsController < ApplicationController
skip_before_action :verify_authenticity_token

  def create
    Error.report(error_params)
  end

  protected

  def error_params
    puts params.inspect
    params.require(:error).permit!
  end

end