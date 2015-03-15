$(document).ready(function() {
    

    // Link analyses
    mixpanel.track_links("a", "link", function(ele) { 
    return { clicked: $(ele).attr('data-link') };
    });


    // Change analyses
    $("[data-analyze='change']").change(function() {

        var activity = $(this).attr('data-activity');
        var key1 = $(this).attr('data-key1');
        var val1 = $(this).attr('data-val1');
        var key2 = $(this).attr('data-key2');
        var val2 = $(this).attr('data-val2');
        var key3 = $(this).attr('data-key3');
        var val3 = $(this).val();
        
        var aa = {};
        aa[key1] = val1;
        aa[key2] = val2;
        aa[key3] = val3;

        ga('send', 'event', activity, val1, val2, val3);
        mixpanel.track(activity, aa);
    });


    // Google maps invoked from client so needs to read url params
    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }


    // hide address bar - not working
    window.addEventListener("load",function() {
    // Set a timeout...
    setTimeout(function(){
        // Hide the address bar!
        window.scrollTo(0, 1);
    }, 0);
    });


});