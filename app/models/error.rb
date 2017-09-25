class Error < ApplicationRecord
  belongs_to :search

  def self.report(params)

    return unless params[:message].present? or params[:text].present?

    @last_message = params[:message]

    Error.create(message: params[:message], text: params[:text], search_id: params[:search_id])

    ErrorJob.perform_later(params[:message], params[:text], params[:search_id]) unless
        (@last_message && @last_message == params[:message]) || Error.where(message: params[:message]).where("created_at >= ?", Time.zone.now.beginning_of_day).exists?

  end
end
