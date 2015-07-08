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

    puts "thats the order i received"
    puts order.inspect

    response = {}
    begin

      template_name = 'order_2'
      template_content = []
      message = {
          to: [{email: order.email}],
          subject: "Order #{order.voucher}",
          from_name: @mode == 'exchange' ? "cambiu" : "cambiu",     # TODO: Change to cn once confirmed by mandrill
          from_email: "team@cambiu.com",                            # TODO: Same
          google_analytics_domains: ["cambiu.com"],                 # TODO: change
          merge_vars: [
              {rcpt: order.email,
               vars: [
                   {name: 'SERVICE_TYPE',     content: order.service_type.upcase},
                   {name: 'VOUCHER_NUMBER',   content: order.voucher},
                   {name: 'EXPIRY_DATE',      content: order.expiry.strftime('%e %b')},
                   {name: 'EXPIRY_TIME',      content: order.expiry.strftime('%H:%M')},
                   {name: 'EXCHANGE_NAME',    content: order.exchange.name},
                   {name: 'EXCHANGE_ADDRESS', content: order.exchange.address},
                   {name: 'PAY_AMOUNT',       content: Money.new(order.pay_cents, order.pay_currency).format},
                   {name: 'BUY_AMOUNT',       content: Money.new(order.buy_cents, order.buy_currency).format}
               ]}
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
