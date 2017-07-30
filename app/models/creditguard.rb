class Creditguard
  
  include HTTParty
  format :xml
  base_uri 'https://cguat2.creditguard.co.il/xpo/Relay'

  def initialize()
    @options = { query: { username: ENV['CG_USERNAME'], password: ENV['CG_PASSWORD'], int_in: self.class.xml } }
  end

  def response
    @response = self.class.post("", @options)
    puts ""
    puts "Creditguard called to provide payment url"
    puts "Http response code: #{@response.code.to_s} - #{@response.message}"
    @response
  end

  def self.url
    request   = self.new
    response  = request.response
    parsed_response = response.parsed_response
    inner_response = parsed_response['ashrait']['response']
    puts 'Result: '         + inner_response['result']
    puts 'Message: '        + inner_response['message']
    puts 'AdditionalInfo: ' + inner_response['additionalInfo']
    puts ""
    # return url
  end

  def self.xml

     xmlString =
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
                    <successUrl>www.cambiu.com/exchanges/payment/success</successUrl>
                    <errorUrl>www.cambiu.com/exchanges/payment/error</errorUrl>
                    <cancelUrl>www.cambiu.com/exchanges/payment/cancel</cancelUrl>
                    <total>10000</total>
                    <transactionType>Debit</transactionType>
                    <creditType>RegularCredit</creditType>
                    <currency>ILS</currency>
                    <transactionCode>Phone</transactionCode>
                    <validation>TxnSetup</validation>
                    <firstPayment></firstPayment>
                    <periodicalPayment></periodicalPayment>
                    <numberOfPayments></numberOfPayments>
                    <user>request identifier</user>
                    <mid>#{ENV['CG_MID']}</mid>
                    <uniqueid></uniqueid>
                    <mpiValidation>AutoComm</mpiValidation>
                    <description>added description to payment page</description>
                    <email>test@creditguard.co.il</email>
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