$('[data-action=paymentFlow]').click(function(e) {

    e.preventDefault();

    // Create user

    // Generate xml and send it to Changeme (how? ask Saar for the JS code)

    // Obtain payment page url

});




paymentUrl = () => {

    const gateway   = 'https://cguat2.creditguard.co.il/xpo/Relay';
    const username  = 'israeli';
    const password  = 'I!fr43s!34';
    const int_in    = create_int_in();
    const url       = `${gateway}?user=${username}&password=${password}&int_in=abc`;

    fetch(url, {method: 'post'}).then((response) => {console.log(response)});

    function create_int_in()  {

        let xmlString =
            "<ashrait>\
                <request>\
                    <version>1001</version>\
                    <language>EN</language>\
                    <dateTime/>\
                    <command>doDeal</command>\
                    <requestid/>\
                    <doDeal>\
                        <terminalNumber>0962831</terminalNumber>\
                        <cardNo>CGMPI</cardNo>\
                        <successUrl>www.cambiu.com/exchanges/payment/success</successUrl>\
                        <errorUrl>www.cambiu.com/exchanges/payment/error</errorUrl>\
                        <cancelUrl>www.cambiu.com/exchanges/payment/cancel</cancelUrl>\
                        <total>10000</total>\
                        <transactionType>Debit</transactionType>\
                        <creditType>RegularCredit</creditType>\
                        <currency>ILS</currency>\
                        <transactionCode>Phone</transactionCode>\
                        <validation>TxnSetup</validation>\
                        <firstPayment></firstPayment>\
                        <periodicalPayment></periodicalPayment>\
                        <numberOfPayments></numberOfPayments>\
                        <user>request identifier</user>\
                        <mid>938</mid>\
                        <uniqueid></uniqueid>\
                        <mpiValidation>AutoComm</mpiValidation>\
                        <description>added description to payment page</description>\
                        <email>test@creditguard.co.il</email>\
                        <customerData>\
                            <userData1/>\
                            <userData2/>\
                            <userData3/>\
                            <userData4/>\
                            <userData5/>\
                            <userData6/>\
                            <userData7/>\
                            <userData8/>\
                            <userData9/>\
                            <userData10/>\
                        </customerData>\
                    </doDeal>\
                </request>\
            </ashrait>";

        let xml = $.parseXML(xmlString);
        console.log('xml', xml);

        return xml;
    }


};