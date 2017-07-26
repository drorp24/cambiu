class NotifyJob < ActiveJob::Base
  queue_as :default

  def perform(order, photo)

#    return if Rails.env.development?

    response = {}
    error = nil
    exchange = order.exchange
    if !exchange
      error = "Exchange id on order is: " + order.exchange_id.to_s + ". Exchange does not exist"
    end

    if error
      logger.warn 'Missing details in exchange or order:'
      logger.warn error
      logger.warn ""
      report(exchange, error)
      return
    end


    to_user =
        order.customer_email ?
            [
                {
                    email:  order.customer_email,
                    type:   'to'
                }
            ] :
            [
                {
                    email:  'support@cambiu.com',
                    type:   'to'
                }
            ]

    to_exchange =
        exchange.email ?
        [
            {
                email:  exchange.email,
                name:   exchange.name,
                type:   'to'
            }
        ] : []

    bcc_me = [
        {
            email:  'drorp24@gmail.com',
            type:   'bcc'
        }
    ]

    bcc_us = [
        {
            email:  'drorp24@gmail.com',
            type:   'bcc'
        },
        {
            email:  'yonatan@cambiu.com',
            type:   'bcc'
        },
        {
            email:  'support@cambiu.com',
            type:   'bcc'
        }
    ]

    bcc = Rails.env.development?  ? bcc_me : bcc_us
    to  = to_user + to_exchange
    warning = "NO EMAIL SENT TO EXCHANGE (EMAIL MISSING)" unless exchange.email.present?


    subject = "#{order.service_type.capitalize} order #{order.voucher} - #{order.status.upcase}"
    subject += " (#{Rails.env})" unless Rails.env.production?


    from_name = 'cambiu'
    from_email = 'support@cambiu.com'
    company_address = "5 long street, E2 8HJ, london"

    begin

      template_name =  exchange.lang == 'he' ? 'order_he' : 'neworder'
      template_content = []
      message = {
          to:             to + bcc,
          preserve_recipients: true,
          subject:        subject,
          from_name:      from_name,
          from_email:     from_email,
          headers: {
              "Reply-To": from_email
          },
          track_opens: true,
          track_clicks: true,
          global_merge_vars: [
              {name: 'SERVICE_TYPE',             content: order.service_type.upcase},
              {name: 'VOUCHER_NUMBER',           content: order.voucher},
              {name: 'EXPIRY_DATE',              content: order.expiry.strftime('%e %b, %Y')},
              {name: 'EXPIRY_TIME',              content: order.expiry.strftime('%H:%M')},
              {name: 'EXCHANGE_ID',              content: order.exchange_id},
              {name: 'EXCHANGE_NAME',            content: exchange.name},
              {name: 'EXCHANGE_ADDRESS',         content: exchange.address},
              {name: 'EXCHANGE_PHONE',           content: exchange.phone},
              {name: 'PAY_AMOUNT',               content: Money.new(order.pay_cents, order.pay_currency).format},
              {name: 'GET_AMOUNT',               content: Money.new(order.buy_cents, order.buy_currency).format},
              {name: 'LOCATION',                 content: order.search.location},
              {name: 'CUSTOMER_EMAIL',           content: order.customer_email || ""},
              {name: 'CUSTOMER_ADDRESS1',        content: order.customer_address1 || ""},
              {name: 'CUSTOMER_ADDRESS2',        content: order.customer_address1 || ""},
              {name: 'CUSTOMER_ADDRESS3',        content: order.customer_address1 || ""},
              {name: 'CUSTOMER_PHONE',           content: order.customer_phone || ""},
              {name: 'COMPANY_NAME',             content: from_name},
              {name: 'COMPANY_ADDRESS',          content: company_address},
              {name: 'CURRENT_YEAR',             content: Date.today.strftime('%Y')},
              {name: 'DELIVERY_AMOUNT',          content: ""},
              {name: 'CC_AMOUNT',                content: ""},
              {name: 'WARNING',                  content: warning}
          ]
      }

      message[:images] = [{type: "image/png", name: 'photo',  content:   photo.split(',')[1]}] if photo

      async = false
      ip_pool = "Main Pool"
      @mandrill ||= Mandrill::API.new MANDRILL_API_KEY
      response = @mandrill.messages.send_template template_name, template_content, message, async, ip_pool#, send_at

=begin
      order_rec = Order.find_by_id(order.id)
      order_rec.emails.create(
          from:             message[:from_email],
          to:               message[:to][0][:email],
          status:           response[0]["status"],
          mandrill_id:      response[0]["_id"],
          reject_reason:    response[0]["reject_reason"],
          order_status:     order.status      # gets 0 always, thou the above puts clearly shows it's 2
      ) if order_rec
=end

    rescue Mandrill::Error => e

      # Mandrill errors are thrown as exceptions
      error = "A mandrill error occurred: #{e.class} - #{e.message}"
      logger.info(error)
      report(exchange, error)

        # TODO: Happens, since async = false. Consider moving to async.

    rescue => e
      error = "Standard error: #{e}"
      logger.info(error)
      report(exchange, error)

    end

    logger.info ""
    logger.info "Mandrill response and errors"
#    response[:error] = error
    logger.info response.inspect
    logger.info ""
    response                               # TODO: Returns ActionMailer::Base::NullEmail if called with no .deliver, or nil if called with .deliver_now

  end

  def report(exchange, error)
    begin

      subject = 'error'
      subject += " (#{Rails.env})" unless Rails.env.production?
      template_name = 'order_error'
      template_content = []
      message = {
          to: [
              {
                  email:  'dror@cambiu.com',
                  type:   'to'
              }
          ],
          subject: 'error',
          from_name: 'system',
          from_email: "team@cambiu.com",
          headers: {
              "Reply-To": "support@cambiu.com"
          },
          track_opens: true,
          track_clicks: true,
          global_merge_vars: [
              {name: 'EXCHANGE_NAME',            content: exchange ? exchange.name : ''},
              {name: 'EXCHANGE_ADDRESS',         content: exchange ? exchange.address : ''},
              {name: 'ERROR',                    content: error}
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

    end

  end

end
