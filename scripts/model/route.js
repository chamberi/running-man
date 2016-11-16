(function(module) {

  function Route(markers, map){
    this.id = googleMap.routeList.length;
    this.markers = markers;
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
  function selectRouteDisplay(nums) {
    googleMap.rendererArray.forEach(function(ele){
      ele.setMap(null);
    });
    nums.forEach(function(num) {
      googleMap.rendererArray[num].setMap(googleMap.map);
    });
  };

  Route.renderRoutes = function(directions, map, which){
    var routes = googleMap.getRequest(which);
    routes.forEach(function(route) {
      directions.route(route.request,
      function(response, status) {
        if (status === 'OK') {
          // googleMap.rendererArray[route.id].setOptions({
          //   preserveViewport: true,
          //   suppressInfoWindows: true,
          //   polylineOptions: {
          //     strokeWeight: 4,
          //     strokeOpacity: .8,
          //     strokeColor: Route.colors[route.id]
          //   }
          // });
          console.log(response);
          googleMap.rendererArray[route.id].setDirections(response);
          var responseRoute = response.routes[0];
          var elevator = new google.maps.ElevationService;
          var detailedPath = responseRoute.overview_path.map(function(point) {
            return {
              lat: point.lat(),
              lng: point.lng()
            };
          });
          elevationsView.displayPathElevation(detailedPath, elevator, map, route);

          var summaryPanel = document.getElementById('directions-panel');
          summaryPanel.innerHTML = '';
          // For each route, display summary information.

          for (var i = 0; i < responseRoute.legs.length; i++) {
            var routeSegment = i + 1;
            summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment +
                '</b><br>';
            summaryPanel.innerHTML += responseRoute.legs[i].start_address + ' to ';
            summaryPanel.innerHTML += responseRoute.legs[i].end_address + '<br>';
            summaryPanel.innerHTML += responseRoute.legs[i].distance.text + '<br><br>';

            var totalDistance = document.getElementById('total-distance');
            totalDistance.innerHTML= '';
            // this should create a new array with the distances of the legs
            function countDistance() {
              var runDistanceArray = responseRoute.legs.map(function(curr){
                return (curr.distance.value);
              });
              // this should reduce the created array into one distance value
              var totalDistanceCount = runDistanceArray.reduce(function(prev, curr){
                return prev + curr;

              },0);
              var distanceMiles = totalDistanceCount/1609.34;
              totalDistance.innerHTML= 'Total distance ran: '+totalDistanceCount+' meters, or '+
              distanceMiles.toFixed(2) + ' miles';
            }
            countDistance();
          }
        } else {
          window.alert('Directions request failed due to ' + status);
        }
      });
    });
  };


  Route.showRoute = function(nums) {
    selectRouteDisplay(nums);
    Route.renderRoutes(googleMap.directionsService, googleMap.map, nums);
  };

  Route.calcRoute = function(route, newRoute) {

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
    googleMap.routeList.push(route);

  };
  module.Route = Route;
})(window);
