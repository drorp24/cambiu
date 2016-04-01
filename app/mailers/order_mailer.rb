class OrderMailer < ApplicationMailer

  def mandrill
    @mandrill ||= Mandrill::API.new MANDRILL_API_KEY
  end


  # smtp thru mandrill, not using mandrill's api nor template
  def smtp_notify(order)
    @order = order
    mail(to: @order.email, subject: 'Welcome to My Awesome Site', cc: 'drorp24@yahoo.com')
  end

  # mandrill api based. All smtp definitions ignored
  def notify(order)

    logger.info "At notify. thats the order i received"
    logger.info  order.inspect

    response = {}
    error = nil
    exchange = order.exchange
    if !exchange
      error = "Exchange id on order is: " + order.exchange_id.to_s + ". Exchange does not exist"
    elsif !order.pictured? and exchange.email.blank?
      error = "Exchange id on order is: " + order.exchange_id.to_s + ". Exchange does not have an email"
    elsif Rails.application.config.email_required and !order.offer? and order.collection? and order.email.blank?
      error = "Order has no email"
    end

    if error
      logger.warn 'Missing details in exchange or order:'
      logger.warn error
      logger.warn ""
      report(exchange, error)
      return
    end


    to_user =
    [
        {
            email:  order.customer_email,
            type:   'to'
        }
    ]

    bcc_exchange =
    [
        {
            email:  Rails.env.production? ? exchange.email : 'dror@cambiu.com',
            name:   exchange.name,
            type:   'bcc'
        }
    ]

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
        }
    ]
    bcc_eyal =
    [
        email:  'eyal@cambiu.com',
        type:   'bcc'
    ]
    bcc_us += bcc_eyal if Rails.env.production?
    bcc_us = bcc_me if Rails.env.development?


    if order.pictured?
      to = bcc_us
      subject = "Receipt photo"
    elsif order.offer?
      to = bcc_us
      subject = "Someone just clicked Get it..."
    elsif order.produced?
      to = bcc_us
      to +=  (to_user + bcc_exchange) if order.collection?
      subject = "Order #{order.voucher}"
    elsif order.used?
      to = to_user + bcc_us
      subject = "Order #{order.voucher} has been fulfilled"
    end
    subject += " (#{Rails.env})" unless Rails.env.production?


    if order.collection?
      service_type_message = 'Please pick it up at the above address'
    elsif order.delivery?
      service_type_message = "Please specify delivery details if you haven't done so already"
    end

    if $request.domain == 'cambiu.com'
      from_name = 'cambiu'
      from_email = 'support@cambiu.com'
    elsif $request.domain == 'currency-net.com'
      from_name = 'currency-net'
      from_email = 'support@currency-net.com'
    elsif $request.domain == 'localhost'
      from_name = 'cambiu'
      from_email = 'support@cambiu.com'
    end

    company_address = "5 long street, E2 8HJ, london"

    pay_currency = order.pay_currency
    buy_currency = order.buy_currency
    base_currency = pay_currency == exchange.currency ? pay_currency : buy_currency
    rated_currency = pay_currency == base_currency ? buy_currency : pay_currency
    rates = exchange.rate(rated_currency, base_currency)

    begin

      template_name = 'order_' + order.status
      if order.produced? or order.used?
        template_name += '_' + $request.domain.split('.')[0]
      end
      template_content = []
      message = {
          to:             to,
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
              {name: 'SERVICE_TYPE_MESSAGE',     content: service_type_message},
              {name: 'VOUCHER_NUMBER',           content: order.voucher},
              {name: 'EXPIRY_DATE',              content: order.expiry.strftime('%e %b, %Y')},
              {name: 'EXPIRY_TIME',              content: order.expiry.strftime('%H:%M')},
              {name: 'EXCHANGE_ID',              content: order.exchange_id},
              {name: 'EXCHANGE_NAME',            content: exchange.name},
              {name: 'EXCHANGE_ADDRESS',         content: exchange.address},
              {name: 'EXCHANGE_PHONE',           content: exchange.phone},
              {name: 'PAY_AMOUNT',               content: Money.new(order.pay_cents, order.pay_currency).format},
              {name: 'GET_AMOUNT',               content: Money.new(order.buy_cents, order.buy_currency).format},
              {name: 'USER_LOCATION',            content: order.user_location},
              {name: 'CUSTOMER_EMAIL',           content: order.customer_email || ""},
              {name: 'CUSTOMER_ADDRESS1',        content: order.customer_address1 || ""},
              {name: 'CUSTOMER_ADDRESS2',        content: order.customer_address1 || ""},
              {name: 'CUSTOMER_ADDRESS3',        content: order.customer_address1 || ""},
              {name: 'CUSTOMER_PHONE',           content: order.customer_phone || ""},
              {name: 'COMPANY_NAME',             content: from_name},
              {name: 'COMPANY_ADDRESS',          content: company_address},
              {name: 'CURRENT_YEAR',             content: Date.today.strftime('%Y')},
              {name: 'BASE_CURRENCY',            content: base_currency},
              {name: 'RATED_CURRENCY',           content: rated_currency},
              {name: 'BUY',                      content: '%.4f' % rates[:buy]},
              {name: 'SELL',                     content: '%.4f' % rates[:sell]}
          ],
          images: [
            {type: "image/png", name: 'photo',  content:   order.photo.split(',')[1]}
          ]
      }

      async = false
      ip_pool = "Main Pool"
      response = mandrill.messages.send_template template_name, template_content, message, async, ip_pool#, send_at

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
    rescue Rack::Timeout::RequestTimeoutError => e
      error = "Timeout error: #{e.class} - #{e.message}"
      logger.info(error)
      report(exchange, error)

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
              "Reply-To": "support@currency-net.com"
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
      response = mandrill.messages.send_template template_name, template_content, message, async, ip_pool#, send_at

    rescue Mandrill::Error => e

      # Mandrill errors are thrown as exceptions
      error = "A mandrill error occurred: #{e.class} - #{e.message}"
      logger.info(error)

    end

  end

end
