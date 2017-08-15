class Creditguard

  include HTTParty
  format :xml
  base_uri 'https://cguat2.creditguard.co.il/xpo/Relay'

  def initialize(params)
    @options = { query: { user: ENV['CG_USERNAME'], password: ENV['CG_PASSWORD'], int_in: self.class.xml(params) } }
    puts ""
    puts ""
    puts "xml:"
    puts self.class.xml(params)
    puts ""
    puts ""

  end

  def response
    @response = self.class.post("", @options)
  end

  def self.redirect(params)

    request   = self.new(params)
    response  = request.response

    parsed_response = response.parsed_response
    inner_response = parsed_response['ashrait']['response']

    result            = inner_response['result'] ||  nil
    message           = inner_response['message'] || nil
    additionalInfo    = inner_response['additionalInfo'] || nil
    token             = inner_response['doDeal']['token'] || nil
    mpiHostedPageUrl  = inner_response['doDeal']['mpiHostedPageUrl'] || nil

     {
        success:      result == '000',
        url:          mpiHostedPageUrl,
        token:        token,
        result:       result,
        message:      message,
        additionInfo: additionalInfo
    }

  end

  def self.xml(params)

       "<ashrait>
            <request>
                <version>1001</version>
                <language>EN</language>
                <dateTime/>
                <command>doDeal</command>
                <requestid/>
                <doDeal>
                    <terminalNumber>#{ENV['CG_TERMINAL']}</terminalNumber>
                    <cardNo>CGMPI</cardNo>
                    <successUrl>#{params[:base_url]}/payments/#{params[:id]}/success</successUrl>
                    <errorUrl>#{params[:base_url]}/payments/#{params[:id]}/error</errorUrl>
                    <cancelUrl>#{params[:base_url]}/payments/#{params[:id]}/cancel</cancelUrl>
                    <total>#{params[:total_cents]}</total>
                    <transactionType>Debit</transactionType>
                    <creditType>RegularCredit</creditType>
                    <currency>#{params[:pay_currency]}</currency>
                    <transactionCode>Phone</transactionCode>
                    <validation>TxnSetup</validation>
                    <firstPayment></firstPayment>
                    <periodicalPayment></periodicalPayment>
                    <numberOfPayments></numberOfPayments>
                    <user>#{params[:name]}</user>
                    <mid>#{ENV['CG_MID']}</mid>
                    <uniqueid>#{params[:voucher]}</uniqueid>
                    <mpiValidation>Token</mpiValidation>
                    <description></description>
                    <email>#{params[:email]}</email>
                    <customerData>
                        <userData1/>
                        <userData2/>
                        <userData3/>
                        <userData4/>
                        <userData5/>
                        <userData6/>
                        <userData7/>
                        <userData8/>
                        <userData9/>
                        <userData10/>
                    </customerData>
                </doDeal>
            </request>
        </ashrait>"

  end

end