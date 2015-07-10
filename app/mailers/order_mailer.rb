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
      logger.info error
      response[:error] = error
      return response
    end

    if order.offer?
      subject = "Someone just clicked Get it..."
      to =  [
                  {
                      email:  'dror@cambiu.com',
                      type:   'to'
                  }
            ]
    elsif order.produced?
      subject = "Order #{order.voucher} is ready"
      to =  [
                  {
                      email:  order.email,
                      type:   'to'
                  },
                  {

                      email:  Rails.env.production? ? exchange.email : 'dror@cambiu.com',
                      name:   exchange.name,
                      type:   'to'
                  },
                  {
                      email:  'dror@cambiu.com',
                      type:   'bcc'
                  }
            ]
      elsif order.used?
      subject = "Order #{order.voucher} has been fulfilled"
      to =  [
                  {
                      email:  order.email,
                      type:   'to'
                  },
                  {
                      email:  'dror@cambiu.com',
                      type:   'bcc'
                  }
            ]
    end

    if order.collection?
      service_type_message = 'Please pick it up at the above address'
    elsif order.delivery?
      service_type_message = "Please specify your desired delivery details if you haven't done so already"
    end

    begin

      template_name = 'order_' + order.status
      template_content = []
      message = {
          to:   to,
          subject: subject,
          from_name: @mode == 'search' ? "cambiu" : "cambiu",       # TODO: Change to cn once confirmed by mandrill
          from_email: "team@cambiu.com",                            # TODO: Same
          headers: {
              "Reply-To": "support@currency-net.com"
          },
          track_opens: true,
          track_clicks: true,
          google_analytics_domains: ["cambiu.com"],                 # TODO: change
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
             {name: 'COMPANY_NAME',             content: @mode == 'search' ? 'cambiu' : 'Currency-net'},
             {name: 'COMPANY_ADDRESS',          content: @mode == 'search' ? 'cambiu address' : 'Currency-net address'},
             {name: 'CURRENT_YEAR',             content: Date.today.strftime('%Y')}
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

    logger.info "Mandrill response:"
    logger.info response.inspect
    response                               # TODO: Returns ActionMailer::Base::NullEmail if called with no .deliver, or nil if called with .deliver_now

  end

end
