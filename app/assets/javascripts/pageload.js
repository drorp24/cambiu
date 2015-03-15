$(document).ready(function() {
    
    mixpanel.track_links("a", "link", function(ele) { 
    return { clicked: $(ele).attr('data-link') };
    });


});