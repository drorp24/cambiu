(function(f,b){if(!b.__SV){var a,e,i,g;window.mixpanel=b;b._i=[];b.init=function(a,e,d){function f(b,h){var a=h.split(".");2==a.length&&(b=b[a[0]],h=a[1]);b[h]=function(){b.push([h].concat(Array.prototype.slice.call(arguments,0)))}}var c=b;"undefined"!==typeof d?c=b[d]=[]:d="mixpanel";c.people=c.people||[];c.toString=function(b){var a="mixpanel";"mixpanel"!==d&&(a+="."+d);b||(a+=" (stub)");return a};c.people.toString=function(){return c.toString(1)+".people (stub)"};i="disable track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.track_charge people.clear_charges people.delete_user".split(" ");
for(g=0;g<i.length;g++)f(c,i[g]);b._i.push([a,e,d])};b.__SV=1.2;a=f.createElement("script");a.type="text/javascript";a.async=!0;a.src="//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";e=f.getElementsByTagName("script")[0];e.parentNode.insertBefore(a,e)}})(document,window.mixpanel||[]);
mixpanel.init("<%= t :mixpanel_token, scope: [@landing, Rails.env] %>");

$(document).ready(function() {
    
    // Link analyses
    // TODO: Handle buttons too
    // TODO: Try using exitent attributes such as "id" or "href" rather than having to add data- fields ('data-link')
 
    mixpanel.track_links("a", "link", function(ele) { 
        return { clicked: $(ele).attr('id') };
    }); 

    // Change analyses
    // TODO: replace $("[data-analyze='change']") with $('select') and $('input')
    // TODO: Try to guess the key/values from existent html attributes rather than having to add data- fields ('data-key-)

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

        mixpanel.track(activity, aa);
    });

    
    
});