var geoSirina;
var geoDuzina;

function initMap() {
        var directionsService = new google.maps.DirectionsService;
        var directionsDisplay = new google.maps.DirectionsRenderer;
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 8,
          center: {lat: 43.4460654, lng: 16.6892128}
        });
        var uluru = {lat: 43.4460654, lng: 16.6892128};

        var marker = new google.maps.Marker({
          position: uluru,
          map: map
        });
        directionsDisplay.setMap(map);

        document.getElementById('submit').addEventListener('click', function() {
          var opcije= {enableHighAccuracy: false};
          navigator.geolocation.getCurrentPosition(uspjeh,neuspjeh,opcije);
          setTimeout(function(){        }, 1500);//Kako bi se dohvatila lokacja

          calculateAndDisplayRoute(directionsService, directionsDisplay);
          setTimeout(function(){        }, 500);//Kako bi se dohvatila lokacja


      });
}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
  var waypts = [];
  directionsService.route({
    origin: geoSirina+","+geoDuzina,
    destination: "43.4460654,16.6892128",
    waypoints: waypts,
    optimizeWaypoints: true,
    travelMode: 'DRIVING'
  }, function(response, status) {
    if (status === 'OK') {
      directionsDisplay.setDirections(response);

    } else {
      window.alert('Nije pronađena ruta ! ');
    }
  });
}

function uspjeh(rezultat)
{
  geoSirina=rezultat.coords.latitude;
  geoDuzina=rezultat.coords.longitude;
}
function neuspjeh(err)
{
  alert("Doslo je do pogreske! "+err.message);
}
