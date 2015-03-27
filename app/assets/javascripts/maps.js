
// global variables can be used anytime in the page
var lat;
var lng;

function getLocation() {

    var latitude;
    var longitude;

    if (navigator.geolocation) {
      var timeoutVal = 10 * 1000 * 1000;
      navigator.geolocation.getCurrentPosition(
        displayPosition, 
        displayError,
        { enableHighAccuracy: false, timeout: timeoutVal, maximumAge: 0 }
      );
    }
    else {
      alert("Geolocation is not supported by this browser");
    }
    
    function displayPosition(position) {
        lat = position.coords.latitude;
        lng = position.coords.longitude;
        var latlng = new google.maps.LatLng(lat, lng);
        geocoder = new google.maps.Geocoder();
        geocoder.geocode({'latLng': latlng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
              if (results[1]) {
                var place = results[1].formatted_address;
                console.log('just geocoded place. It is: ' + place)
                mixpanel.register({
                    "lat": lat,
                    "lng": lng,
                    "location": place 
                });
                $('#home_form #search_form #latitude').val(lat);
                $('#home_form #search_form #longitude').val(lng);
                $('#home_form #search_form #geocoded_location').val(place);
                console.log('just placed it in the form. geocoded_location is now: ' + $('#home_form #search_form #geocoded_location').val())
              } else {
                $('#current_address').html(" an environment with no location service");
              }
            } else {
              alert('Geocoder failed due to: ' + status);
            }
      });

        $('#user_latitude').val(lat);
        $('#user_longitude').val(lng);
        
    }
}

function displayError(error) {
  var errors = { 
    1: 'Permission denied',
    2: 'Position unavailable',
    3: 'Request timeout'
  };
  alert("Error: " + errors[error.code]);
}