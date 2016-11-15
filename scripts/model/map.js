(function(module){

  var googleMap = {};
  googleMap.markers = [];


  googleMap.initMap = function() {

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

    if (localStorage.getItem('routes')) {
      console.log('fetching routes');
      googleMap.routeList = JSON.parse(localStorage.getItem('routes'));
      Route.calcRoute(directionsService, directionsDisplay, map, googleMap.routeList[0], false);
    } else {
      console.log('no stored routes');
      googleMap.routeList = [];
    }

    directionsDisplay.setMap(map);

    map.addListener('click', function(e) {
      googleMap.placeMarkerAndPanTo(e.latLng, map);
    });

    document.getElementById('submit').addEventListener('click', function() {
      var newRoute = new Route(googleMap.markers);
      googleMap.markers.forEach(function(ele){
        ele.setMap(null);
      });
      googleMap.markers = [];
      Route.calcRoute(directionsService, directionsDisplay, map, newRoute, true);
      localStorage.setItem('routes', JSON.stringify(googleMap.routeList));
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
