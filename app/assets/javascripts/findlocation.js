
// global variables can be used anytime in the page
function getLocation() {

//  There should be a better way of avoiding to ask the user again and again if he permits to use his location
//    if (sessionStorage.latitude && sessionStorage.longitude) {return;}
    console.log('getLocation');   
       
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
      alert("We cant locate you. Please specify where you want to search.");
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
                sessionStorage.user_location = place;
                $('#latitude').val(lat);
                $('#longitude').val(lng);
                $('#geocoded_location').val(place);
                $('#current_address').html(place);
              } else {
                $('#current_address').html(" an environment with no location service");
              }
            } else {
              console.log('Geocoder failed due to: ' + status);
            }
      });

    }
}

function displayError(error) {
  var errors = { 
    1: 'Permission denied',
    2: 'Position unavailable',
    3: 'Request timeout'
  };
//  console.log("Error: " + errors[error.code]);
}