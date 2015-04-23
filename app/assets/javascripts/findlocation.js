
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
        findPosition, 
        displayError,
        { enableHighAccuracy: false, timeout: timeoutVal, maximumAge: 0 }
      );
    }
    else {
      alert("We cant locate you. Please specify where you want to search.");
    }
    
    function findPosition(position) {
        lat = position.coords.latitude;
        lng = position.coords.longitude;
        sessionStorage.user_lat = lat;
        sessionStorage.user_lng = lng;
        var latlng = new google.maps.LatLng(lat, lng);
        geocoder = new google.maps.Geocoder();
        geocoder.geocode({'latLng': latlng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
              if (results[1]) {
                sessionStorage.user_location = results[1].formatted_address;
              } else {
                sessionStorage.user_location = null;
              }
            } else {
              sessionStorage.user_location = null;
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