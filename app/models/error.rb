class Error < ApplicationRecord
  belongs_to :search

  def self.report(params)
    Error.create(message: params[:message], text: params[:text], search_id: params[:search_id])
    ErrorJob.perform_later(params[:message], params[:text], params[:search_id])
  end
end
