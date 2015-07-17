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
    elsif exchange.email.blank?
      error = "Exchange id on order is: " + order.exchange_id.to_s + ". Exchange does not have an email"
    elsif !order.offer? and order.email.blank?
      error = "Order has no email"
    end

    if error
      logger.warn 'Missing details in exchange or order:'
      logger.warn error
      logger.warn ""
      report(exchange, error)
    end

    development_bcc = [
        {
            email:  'dror@cambiu.com',
            type:   'bcc'
        }
    ]

    test_bcc = [
        {
            email:  'sharon@cambiu.com',
            type:   'bcc'
        },
        {
            email:  'arnon@cambiu.com',
            type:   'bcc'
        },
        {
            email:  'dror@cambiu.com',
            type:   'bcc'
        }
    ]

    production_bcc = [
        {
            email:  'arnon@cambiu.com',
            type:   'bcc'
        },
        {
            email:  'sharon@cambiu.com',
            type:   'bcc'
        }
    ]

    if order.offer?
      subject = "Someone just clicked Get it..."
      to =  [
            ]
    elsif order.produced?
      subject = "Order #{order.voucher} is ready"
      to =  [
                  {
                      email:  order.email,
                      type:   'to'
                  },
                  {

                      email:  (Rails.env.production? and exchange.email.present?) ? exchange.email : 'dror@cambiu.com',
                      name:   exchange.name,
                      type:   'to'
                  }
            ]
      elsif order.used?
      subject = "Order #{order.voucher} has been fulfilled"
      to =  [
                  {
                      email:  order.email,
                      type:   'to'
                  }
            ]
    end

    if Rails.env.development?
      to += development_bcc
    elsif Rails.env.test? or Rails.env.staging?
      to += test_bcc
    elsif Rails.env.production?
      to += production_bcc
    end

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
      from_name = 'currency-net'
      from_email = 'support@currency-net.com'
    end

    company_address = "5 long street, E2 8HJ, london"

    begin

      template_name = 'order_' + order.status
      if order.produced? or order.used?
        template_name += '_' + $request.domain.split('.')[0]
      end
      template_content = []
      message = {
          to:             to,
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
             {name: 'EXCHANGE_NAME',            content: order.exchange.name},
             {name: 'EXCHANGE_ADDRESS',         content: order.exchange.address},
             {name: 'PAY_AMOUNT',               content: Money.new(order.pay_cents, order.pay_currency).format},
             {name: 'GET_AMOUNT',               content: Money.new(order.buy_cents, order.buy_currency).format},
             {name: 'COMPANY_NAME',             content: from_name},
             {name: 'COMPANY_ADDRESS',          content: company_address},
             {name: 'CURRENT_YEAR',             content: Date.today.strftime('%Y')},
             {name: 'USER_LOCATION',            content: order.user_location}
      ]
      }

      async = false
      ip_pool = "Main Pool"
      response = mandrill.messages.send_template template_name, template_content, message, async, ip_pool#, send_at

      order_rec = Order.find_by_id(order.id)
      order_rec.emails.create(
          from:             message[:from_email],
          to:               message[:to][0][:email],
          status:           response[0]["status"],
          mandrill_id:      response[0]["_id"],
          reject_reason:    response[0]["reject_reason"],
          order_status:     order.status      # gets 0 always, thou the above puts clearly shows it's 2
      ) if order_rec

    rescue Mandrill::Error => e

      # Mandrill errors are thrown as exceptions
      logger.info "A mandrill error occurred: #{e.class} - #{e.message}"

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

      template_name = 'order_error'
      template_content = []
      message = {
          to: [
              {
                  email:  'dror@cambiu.com',
                  type:   'to'
              },
              {
                  email:  'arnon@cambiu.com',
                  type:   'bcc'
              },
              {
                  email:  'sharon@cambiu.com',
                  type:   'bcc'
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
      logger.info "A mandrill error occurred: #{e.class} - #{e.message}"

    end

  end

end
