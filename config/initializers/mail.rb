MANDRILL_API_KEY = 'SL8GczS0VF_og_8qvAbgyQ'
ActionMailer::Base.smtp_settings = {
  address:              'smtp.mandrillapp.com',
  port:                 587,
  enable_starttls_auto: true,
  user_name:            'drorp24@gmail.com',
  password:              MANDRILL_API_KEY,
  authentication:       'login'
}

ActionMailer::Base.delivery_method = :smtp
ActionMailer::Base.default charset: "utf-8"
