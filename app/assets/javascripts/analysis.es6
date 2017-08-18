
gaTiming = function(category, variable, value) {
    ga('send', 'timing', category,  variable, value);
};

(function onLoad() {
    var now = new Date().getTime();
    var page_load_time = now - performance.timing.navigationStart;
    console.log("User-perceived page load time: " + page_load_time);
    gaTiming('User-perceived', 'page load time', page_load_time);
})();


gaTiming = function(category, variable, value) {
    ga('send', 'timing', category,  variable, value);
};


tagSession = function(obj = {}) {

    var tagObj = Object.assign(obj, {utm_source: utm_source});
    console.log('tagSession', tagObj);

    ga('set', tagObj);
//    __insp.push(['tagSession',tagObj]);
};

// exchange is an obj that needs only include keys 'id' and 'name'
report = function(category, action, exchange = null, value = null) {

    console.log(`report ${category} ${action} ${exchange} ${value}`);
    let exchangeWorthy = (category) => category != 'Set';

    if (exchangeWorthy(category)) {
        var currExchange = exchange || currentExchange();
        var label = currExchange && currExchange.name ? currExchange.name : "";
        var id = currExchange && currExchange.id ? currExchange.id : "";
    } else  {
        var label = value;
        var id = null;
    }
    ga('send', 'event', category, action, label, {id: id});


};



