class ErrorsController < ApplicationController
skip_before_action :verify_authenticity_token, raise: false

  def create
    Error.report(error_params)
    render nothing: true
  end

  protected

  def error_params
    puts params.inspect
    params.require(:error).permit!
  end

end