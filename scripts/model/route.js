(function(module) {

  function Route(markers, map){
    this.id = googleMap.routeList.length + 1;
    this.markers = markers;
    this.color = Route.colors[Math.floor(Math.random() * Route.colors.length)];
    googleMap.routeList.push(this);
  };

  Route.colors = ['Aqua','Aquamarine','Azure','Bisque','Blue','BlueViolet','BurlyWood','CadetBlue','Chartreuse','Chocolate','Coral','CornflowerBlue','Crimson','Cyan','DarkBlue','DarkCyan','DarkGoldenRod','DarkGreen','DarkMagenta','DarkOliveGreen','Darkorange','DarkRed','DarkSalmon','DarkSeaGreen','DarkSlateBlue','DarkTurquoise','DarkViolet','DeepPink','DeepSkyBlue','DodgerBlue','FireBrick','ForestGreen','Fuchsia','Gold','GoldenRod','Green','GreenYellow','HotPink','IndianRed','Indigo','Ivory','Lavender','LavenderBlush','LawnGreen','LemonChiffon','LightBlue','LightCoral','LightCyan','LightGoldenRodYellow','LightGreen','LightPink','LightSalmon','LightSeaGreen','LightSteelBlue','LightYellow','Lime','LimeGreen','Linen','Magenta','Maroon','MediumAquaMarine','MediumBlue','MediumOrchid','MediumPurple','MediumSeaGreen','MediumSlateBlue','MediumSpringGreen','MediumTurquoise','MediumVioletRed','MidnightBlue','MintCream','MistyRose','Navy','Olive','OliveDrab','Orange','OrangeRed','Orchid','Peru','Pink','Plum','Purple','Red','RosyBrown','RoyalBlue','SeaGreen','SeaShell','Sienna','Silver','SlateBlue','SpringGreen','SteelBlue','Teal','Thistle','Tomato','Turquoise','Violet','Yellow','YellowGreen'];


  function grabMarkers(){
    return googleMap.routeList.map(function(i){
      return new google.maps.Marker({
        location: i.markers.location,
        map: googleMap.map
      });
    });
  };

  Route.renderActive = function() {
    googleMap.activeIndexes.forEach(function(idx) {
      Route.renderRoute(googleMap.routeList[idx], true);
    });
    Route.renderActiveElevations();
  };

  Route.renderActiveElevations = function () {
    $('#elevation_chart').empty();
    googleMap.activeIndexes.forEach(function(idx) {
      var route = googleMap.routeList[idx];
      elevationsView.displayPathElevation(route.detailedPath);
      elevationsView.plotElevation('OK', route);
    });
    googleMap.setLocal();
  };

  Route.renderRoute = function(route, dontRenderElevations){
    var renderer = googleMap.rendererArray[route.id - 1];
    renderer.setOptions({
      preserveViewport: true,
      suppressInfoWindows: true,
      draggable:true,
      editable:true,
      polylineOptions: {
        strokeWeight: 4,
        strokeOpacity: .8,
        strokeColor: route.color
      }
    });
    google.maps.event.clearInstanceListeners(renderer);
    google.maps.event.addListener(renderer, 'directions_changed',
    function() {
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
    if (dontRenderElevations) {
      return 1;
    } else {
      Route.renderActiveElevations();
    }
  };

  Route.rebuildStats = function(route) {
    var $ps = $('aside#stats div#' + route.id + ' p');
    $('div#' + route.id + ' p').innerHTML = '';
    $ps[0].innerHTML = 'Total Distance: <span class="num">' + route.totalDistance + '</span> km (<span class="num">' + route.totMiles + '</span> mi)';
    $ps[1].innerHTML = 'Distance > 10%: <span class="num">' + route.steepDistance + '</span> m (<span class="num">' + route.steepMiles + '</span> mi)';
    $ps[2].innerHTML = 'Elevation Gain: <span class="num">' + route.totalGain + '</span> m (<span class="num">' + route.elevMiles + '</span> mi)';
    $('#elevation_chart').empty();
    googleMap.activeIndexes.forEach(function(idx) {
      elevationsView.plotElevation('OK', googleMap.routeList[idx]);
    });
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

  module.Route = Route;

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
