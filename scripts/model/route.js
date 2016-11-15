(function(module) {

  function Route(markers){
    Route.idCount++;
    this.id = Route.idCount;
    this.markers = markers;
  };

  Route.idCount = 0;


  Route.calcRoute = function(directions, directionsDisplay, map, route, newRoute) {
    var len = route.markers.length;
    var path;
    if (newRoute) {
      path = route.markers.map(function(marker){
        return {
          location: {lat: marker.position.lat(), lng: marker.position.lng()},
          stopover: true
        };
      });
      route.markers = path;
      googleMap.routeList.push(route);
    } else {
      path = route.markers;
    }
    directions.route({
      origin: {lat: path[0].location.lat,
               lng: path[0].location.lng},
      destination: {lat: path[len - 1].location.lat,
                    lng: path[len - 1].location.lng},
      waypoints: path.slice(1,len-1),
      optimizeWaypoints: true,
      travelMode: 'WALKING'
    }, function(response, status) {
      if (status === 'OK') {
        // route.response = response;
        console.log(googleMap.routeList);
        var route = response.routes[0];
        console.log(response);
        var path = route.overview_path.map(function(point) {
          return {
            lat: point.lat(),
            lng: point.lng()
          };
        });
        directionsDisplay.setDirections(response);

        var elevator = new google.maps.ElevationService;
        elevationsView.displayPathElevation(path, elevator, map);

        var summaryPanel = document.getElementById('directions-panel');
        summaryPanel.innerHTML = '';
        // For each route, display summary information.

        for (var i = 0; i < route.legs.length; i++) {
          var routeSegment = i + 1;
          summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment +
              '</b><br>';
          summaryPanel.innerHTML += route.legs[i].start_address + ' to ';
          summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
          summaryPanel.innerHTML += route.legs[i].distance.text + '<br><br>';

          var totalDistance = document.getElementById('total-distance');
          totalDistance.innerHTML= '';
          // this should create a new array with the distances of the legs
          function countDistance() {
            var runDistanceArray = route.legs.map(function(curr){
              console.log(curr.distance.value);
              return (curr.distance.value);
            });
            // this should reduce the created array into one distance value
            var totalDistanceCount = runDistanceArray.reduce(function(prev, curr){
              console.log(prev+curr);
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
  };

  module.Route = Route;
})(window);
