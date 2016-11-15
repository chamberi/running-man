(function(module){

  var googleMap = {};
  googleMap.markers = [];
  googleMap.requestArray;


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
      Route.calcRoute(newRoute, true);
      Route.renderRoutes(directionsService, newRoute.renderer, map, [newRoute.id]);
      localStorage.setItem('routes', JSON.stringify(googleMap.routeList));
    });


  };



  googleMap.getRequest = function(which) {
    googleMap.routeList.reduce(function(acc, cur, idx){
      if (which.includes(idx)){
        acc.push(cur);
      }
      return acc;
    }, []);
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
