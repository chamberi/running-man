(function(module) {

  function Route(markers, map){
    this.id = googleMap.routeList.length + 1;
    this.markers = markers;
    googleMap.routeList.push(this);
  };

  Route.colors = ['navy', 'gray', 'fuchsia', 'lime', 'maroon'];


  function grabMarkers(){
    return googleMap.routeList.map(function(i){
      return new google.maps.Marker({
        location: i.markers.location,
        map: googleMap.map
      });
    });
  };

  Route.renderActive = function () {
    var routes = googleMap.getRequest(googleMap.activeIndexes);
    $('#elevation_chart').empty();
    routes.forEach(function(route){
      Route.renderRoute(route);
    });
    googleMap.setLocal();
  };

  Route.renderRoute = function(route){
    var renderer = googleMap.rendererArray[route.id - 1];
    renderer.setOptions({
      preserveViewport: true,
      suppressInfoWindows: true,
      draggable:true,
      editable:true,
      polylineOptions: {
        strokeWeight: 4,
        strokeOpacity: .8,
        strokeColor: Route.colors[route.id - 1]
      }
    });
    renderer.addListener('directions_changed', function() {
      var draggedRoute = renderer.getDirections();
      var detailedPath = draggedRoute.routes[0].overview_path.map(function(point) {
        return {
          lat: point.lat(),
          lng: point.lng()
        };
      });
      route.detailedPath = detailedPath;
      Route.countDistance(draggedRoute.routes[0], route);
      elevationsView.calculateStats(route, [Route.rebuildStats]);
    });
    renderer.setDirections(googleMap.routeResponses[route.id - 1]);
    elevationsView.displayPathElevation(route.detailedPath);
    elevationsView.plotElevation('OK', route);
  };

  Route.rebuildStats = function(route) {
    $('div p').empty();
    $('div p')[0].append('Total Distance: ' + route.totalDistance + ' km (' + route.totMiles + ' mi)');
    $('div p')[1].append('Distance > 10%: ' + route.steepDistance + ' m (' + route.steepMiles + ' mi)');
    $('div p')[2].append('Elevation Gain: ' + route.totalGain + ' m (' + route.elevMiles + ' mi)');
    $('#elevation_chart').empty();
    googleMap.activeIndexes.forEach(function(idx) {
      elevationsView.plotElevation('OK', googleMap.routeList[idx]);
    });
  };

  Route.showRoute = function() {
    selectRouteDisplay();
    Route.renderActive();
  };


  Route.queryRoute = function(route, callback) {
    if (!route.request) {
      route.markers = route.markers.map(function(marker){
        return {
          location: {lat: marker.position.lat(), lng: marker.position.lng()},
          stopover: true
        };
      });
      Route.setRequest(route, route.markers);
    }
    googleMap.directionsService.route(route.request,
      function(response, status) {
        if (status === 'OK') {
          var responseRoute = response.routes[0];
          googleMap.routeResponses[route.id - 1] = response;
          var detailedPath = responseRoute.overview_path.map(function(point) {
            return {
              lat: point.lat(),
              lng: point.lng()
            };
          });
          route.detailedPath = detailedPath;
          Route.countDistance(responseRoute, route);
          elevationsView.calculateStats(route, callback);
        } else {
          window.alert('directionsService fail status: ' + status);
        }
      });
  };

  Route.setRequest = function(route, path) {
    var len = route.markers.length;
    route.request = {
      origin: {lat: path[0].location.lat,
            lng: path[0].location.lng},
      destination: {lat: path[len - 1].location.lat,
                lng: path[len - 1].location.lng},
      waypoints: path.slice(1,len-1),
      optimizeWaypoints: true,
      travelMode: 'WALKING'
    };
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
    var dis = totalDistanceCount / 1000;
    route.totalDistance = dis.toFixed(2);
    route.totMiles = distanceMiles.toFixed(2);
  };

  // var statsComparison = document.getElementById('stats-comparison');
  // statsComparison.innerHTML = 'SteepDistance = ' + googleMap.routeList[0].steepDistance;

  module.Route = Route;
  // var summaryPanel = document.getElementById('directions-panel');
  // summaryPanel.innerHTML = '';
  // // For each route, display summary information.
  //
  // for (var i = 0; i < responseRoute.legs.length; i++) {
  //   var routeSegment = i + 1;
  //   summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment +
  //       '</b><br>';
  //   summaryPanel.innerHTML += responseRoute.legs[i].start_address + ' to ';
  //   summaryPanel.innerHTML += responseRoute.legs[i].end_address + '<br>';
  //   summaryPanel.innerHTML += responseRoute.legs[i].distance.text + '<br><br>';
  //
  //   var totalDistance = document.getElementById('total-distance');
  //   totalDistance.innerHTML= '';
})(window);
