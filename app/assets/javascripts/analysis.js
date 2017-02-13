
(function onLoad() {
    var now = new Date().getTime();
    var page_load_time = now - performance.timing.navigationStart;
    console.log("User-perceived page load time: " + page_load_time);
    gaTiming('User-perceived', 'page load time', page_load_time);
})();


gaTiming = function(category, variable, value) {
    ga('send', 'timing', category,  variable, value);
};


tagSession = function(tagObj) {
    ga('set', tagObj);
    __insp.push(['tagSession',tagObj]);
};

report = function(category, action) {

    var currExchange = currentExchange();
    var name = currExchange && currExchange.name ? currExchange.name : "";
    var id = currExchange && currExchange.id ? currExchange.id : "";
    ga('send', 'event', category, action, name, {id: id});

};

