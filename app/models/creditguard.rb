class Creditguard
  include HTTParty
  base_uri 'https://cguat2.creditguard.co.il/xpo/Relay'

  def initialize(username, password)
    @options = { query: { username: username, password: password } }
  end

  def url
    self.class.get("/2.2/questions", @options)
  end



  def self.url

    username  = 'israeli'
    password  = 'I!fr43s!34'
    int_in    = self.xml
    endpoint  = "#{gateway}?user=#{username}&password=#{password}&int_in=abc"

#    fetch(url, {method: 'post'}).then((response) => {console.log(response)})

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
                          <terminalNumber>0962831</terminalNumber>
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
                          <mid>938</mid>
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

#    xml = $.parseXML(xmlString)

  end

end