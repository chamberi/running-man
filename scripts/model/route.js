(function(module) {

  function Route(markers, map){
    this.id = googleMap.routeList.length + 1;
    this.markers = markers;
    googleMap.routeList.push(this);
  };

  Route.colors = ['navy', 'gray', 'fuchsia', 'lime', 'maroon'];


  function grabMarkers(){
    console.log(typeof googleMap.routeList);
    return googleMap.routeList.map(function(i){
      return new google.maps.Marker({
        location: i.markers.location,
        map: googleMap.map
      });
    });
  };
  function selectRouteDisplay(which) {
    googleMap.rendererArray.forEach(function(ele){
      ele.setMap(null);
    });
    $('#stats-comparison').text('');
    which.forEach(function(num) {
      googleMap.rendererArray[num].setMap(googleMap.map);
      var tic = num + 1;
      var statsRenderer = $('#stats-comparison');
      statsRenderer.append('<h3>Route ' + tic + '</h3>');
      statsRenderer.append('<p>Total Distance: ' + googleMap.routeList[num].totalDistance + ' km</p>');
      statsRenderer.append('<p>Distance > 10%: ' + googleMap.routeList[num].steepDistance + ' m</p>');
      statsRenderer.append('<p>Elevation Gain: ' + googleMap.routeList[num].totalGain + ' m</p>');
    });
  };


  Route.countDistance = function(responseRoute, route) {
    var runDistanceArray = responseRoute.legs.map(function(curr){
      return (curr.distance.value);
    });
    // this should reduce the created array into one distance value
    var totalDistanceCount = runDistanceArray.reduce(function(prev, curr){
      return prev + curr;

    },0);
    var distanceMiles = totalDistanceCount/1609.34;
    route.totalDistance = totalDistanceCount / 1000;
  };

  Route.calcRoute = function(callback, which) {
    var routes = googleMap.getRequest(which);
    routes.forEach(function(route) {
      googleMap.directionsService.route(route.request,
        function(response, status){
          if (status === 'OK') {
            console.log('its ok');
            var responseRoute = response.routes[0];
            Route.countDistance(responseRoute, route);
            var detailedPath = responseRoute.overview_path.map(function(point) {
              return {
                lat: point.lat(),
                lng: point.lng()
              };
            });
            elevationsView.detailedPath = detailedPath;
            elevationsView.response = response;
            elevationsView.calculateStats(detailedPath, route);
            callback(route);

          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });
    });
  };
  Route.renderRoute = function(route){
    googleMap.rendererArray[route.id - 1].setOptions({
      preserveViewport: true,
      suppressInfoWindows: true,
      polylineOptions: {
        strokeWeight: 4,
        strokeOpacity: .8,
        strokeColor: Route.colors[route.id]
      }
    });
    googleMap.rendererArray[route.id - 1].setDirections(elevationsView.response);
    elevationsView.displayPathElevation(elevationsView.detailedPath);
    elevationsView.plotElevation(elevationsView.elevations, elevationsView.status);
  };


  Route.showRoute = function(which) {
    selectRouteDisplay(which);
    Route.calcRoute(Route.renderRoute, which);
  };

  Route.initializeRoute = function(route) {
    var len = route.markers.length;
    var path = route.markers.map(function(marker){
      return {
        location: {lat: marker.position.lat(), lng: marker.position.lng()},
        stopover: true
      };
    });
    route.request = {
      origin: {lat: path[0].location.lat,
            lng: path[0].location.lng},
      destination: {lat: path[len - 1].location.lat,
                lng: path[len - 1].location.lng},
      waypoints: path.slice(1,len-1),
      optimizeWaypoints: true,
      travelMode: 'WALKING'
    };
    route.markers = path;
  };

  // var statsComparison = document.getElementById('stats-comparison');
  // statsComparison.innerHTML = 'SteepDistance = ' + googleMap.routeList[0].steepDistance;

  module.Route = Route;
})(window);
