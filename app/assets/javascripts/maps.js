
// global variables can be used anytime in the page
function getLocation() {
    
    sessionStorage.getLocation_invoked = true;

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
        sessionStorage.lat = lat;
        sessionStorage.lng = lng;
        var latlng = new google.maps.LatLng(lat, lng);
        geocoder = new google.maps.Geocoder();
        geocoder.geocode({'latLng': latlng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
              if (results[1]) {
                var place = results[1].formatted_address;
                mixpanel.register({
                    "lat": lat,
                    "lng": lng,
                    "location": place 
                });
                $('#home_form #search_form #latitude').val(lat);
                $('#home_form #search_form #longitude').val(lng);
                $('#home_form #search_form #geocoded_location').val(place);
                $('#current_address').html(place);
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