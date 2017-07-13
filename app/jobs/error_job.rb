class ErrorJob < ActiveJob::Base
  queue_as :default

  def perform(message, text, search_id)


    to =
      [
        {
            email:  'drorp24@gmail.com',   # add Eyal, support@cambiu.com
            type:   'to'
        }
      ]

    from_name = 'cambiu'
    from_email = 'support@cambiu.com'

    begin

      template_name = 'error'
      template_content = []
      message = {
          to:             to,
          preserve_recipients: true,
          subject:        "Error (#{Rails.env})"
          from_name:      from_name,
          from_email:     from_email,
          headers: {
              "Reply-To": from_email
          },
          track_opens: true,
          track_clicks: true,
          global_merge_vars: [
              {name: 'MESSAGE',             content: message},
              {name: 'TEXT',                content: text},
              {name: 'SEARCH',              content: search_id.to_s}
          ]
      }

      async = false
      ip_pool = "Main Pool"
      @mandrill ||= Mandrill::API.new MANDRILL_API_KEY
      response = @mandrill.messages.send_template template_name, template_content, message, async, ip_pool#, send_at

    rescue Mandrill::Error => e

      # Mandrill errors are thrown as exceptions
      error = "A mandrill error occurred: #{e.class} - #{e.message}"
      logger.info(error)

        # TODO: Happens, since async = false. Consider moving to async.
    rescue Rack::Timeout::RequestTimeoutError => e
      error = "Timeout error: #{e.class} - #{e.message}"
      logger.info(error)

    rescue => e
      error = "Standard error: #{e}"
      logger.info(error)

    end

    logger.info ""
    logger.info "Mandrill response and errors"
#    response[:error] = error
    logger.info response.inspect
    logger.info ""
    response                               # TODO: Returns ActionMailer::Base::NullEmail if called with no .deliver, or nil if called with .deliver_now

  end

end
