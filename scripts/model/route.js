(function(module) {

  function Route(newRoute){
    this.id = Route.idCount;
    this.markers = newRoute;
    Route.idCount++;
  };

  Route.idCount = 0;
  Route.currentRoute;


  Route.calcRoute = function(directionsService, directionsDisplay, map, route) {
    var len = route.markers.length;
    var waypts = route.markers.slice(1,len-1).map(function(element){
      return {
        location: {lat: element.position.lat(), lng: element.position.lng()},
        stopover: true
      };
    });
    route.markers.forEach(function(ele){
      ele.setMap(null);
    });
    directionsService.route({
      origin: {lat: route.markers[0].position.lat(),
               lng: route.markers[0].position.lng()},
      destination: {lat: route.markers[len - 1].position.lat(),
                    lng: route.markers[len - 1].position.lng()},
      waypoints: waypts,
      optimizeWaypoints: true,
      travelMode: 'WALKING'
    }, function(response, status) {
      if (status === 'OK') {
        googleMap.routes.push(response);
        var route = response.routes[0];
        console.log(response);
        var path = route.overview_path.map(function(point) {
          return {
            lat: point.lat(),
            lng: point.lng()
          };
        });
        var elevator = new google.maps.ElevationService;

        elevationsView.displayPathElevation(path, elevator, map);
        googleMap.routes.forEach(function(route){
          directionsDisplay.setDirections(route);
        });

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
