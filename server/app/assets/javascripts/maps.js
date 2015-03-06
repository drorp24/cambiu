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
        $('#user_latitude').val(position.coords.latitude);
        $('#user_longitude').val(position.coords.longitude);
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

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
