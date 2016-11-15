(function(module){

  var googleMap = {};
  googleMap.routes = [];
  googleMap.markers = [];
  googleMap.renderedRoutes = [];
  googleMap.id = 0;




  googleMap.initMap = function() {
    if (localStorage.getItem('routes')) {
      console.log('fetching routes');
      googleMap.routes = JSON.parse(localStorage.getItem('routes'));
    } else {
      console.log('no stored routes');
    }

    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 13,
      center: {lat: 47.608, lng: -122.335},
      mapTypeId: 'terrain'
    });

    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer({
      map: map,
      draggable: true
    });

    directionsDisplay.setMap(map);
    googleMap.map = map;
    map.addListener('click', function(e) {
      googleMap.placeMarkerAndPanTo(e.latLng, map);
    });

    document.getElementById('submit').addEventListener('click', function() {
      var newRoute = new Route(googleMap.markers);
      googleMap.markers = [];
      Route.calcRoute(directionsService, directionsDisplay, map, newRoute);
      localStorage.setItem('routes', JSON.stringify(googleMap.routes));

    });


  };

  googleMap.placeMarkerAndPanTo = function(latLng, map) {
    var marker = new google.maps.Marker({
      position: latLng,
      draggable: true,
      map: map
    });

    googleMap.markers.push(marker);
    map.panTo(latLng);
  };




  module.googleMap = googleMap;
})(window);
