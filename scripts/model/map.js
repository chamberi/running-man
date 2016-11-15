google.load('visualization', '1', {packages: ['columnchart']});
var markers = [];
function initMap() {

  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: {lat: 47.608, lng: -122.335},
    mapTypeId: 'terrain'
  });

  directionsDisplay.setMap(map);

  map.addListener('click', function(e) {
    placeMarkerAndPanTo(e.latLng, map);
  });

  document.getElementById('submit').addEventListener('click', function() {

    calculateAndDisplayRoute(directionsService, directionsDisplay, map);

  });
}

function placeMarkerAndPanTo(latLng, map) {
  var marker = new google.maps.Marker({
    position: latLng,
    draggable: true,
    map: map
  });
  markers.push(marker);
  map.panTo(latLng);
}

function displayPathElevation(path, elevator, map) {
  new google.maps.Polyline({
    path: path,
    strokeColor: '#0000CC',
    strokeOpacity: 0.4,
    map: map
  });

  elevator.getElevationAlongPath({
    'path': path,
    'samples': 256
  }, plotElevation);
}

function calculateAndDisplayRoute(directionsService, directionsDisplay, map) {
  var waypts = markers.slice(1,markers.length-1).map(function(element){
    return {
      location: {lat: element.position.lat(), lng: element.position.lng()},
      stopover: true
    };
  });


  // waypts.push({
  //   location: checkboxArray[i].value,
  //   stopover: true
  // });
  // console.log(waypts);


  directionsService.route({
    origin: {lat: markers[0].position.lat(), lng: markers[0].position.lng()},
    destination: {lat: markers[markers.length - 1].position.lat(),
      lng: markers[markers.length - 1].position.lng()},
    waypoints: waypts,
    optimizeWaypoints: true,
    travelMode: 'WALKING'
  }, function(response, status) {
    if (status === 'OK') {
      var path = response.routes[0].overview_path.map(function(markerPoint) {
        // console.log(markerPoint);
        // new google.maps.Marker({
        //   position: markerPoint,
        //   map: map
        // });
        return {
          lat: markerPoint.lat(),
          lng: markerPoint.lng()
        };
      });
      var elevator = new google.maps.ElevationService;
      displayPathElevation(path, elevator, map);
      directionsDisplay.setDirections(response);
      var route = response.routes[0];
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

      }
    } else {
      window.alert('Directions request failed due to ' + status);
    }

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
  });

}

function plotElevation(elevations, status) {
  elevations.reduce(function(acc, cur, idx) {
    if (idx < elevations.length - 1) {
      nextIdx = idx + 1;
    };
    if (elevations[nextIdx].elevation > cur.elevation) {
      acc = acc + elevations[nextIdx].elevation - cur.elevation;
      var gain = acc.toFixed(2);
    };
    console.log('Elevation gain = ' + gain);
    return acc;
  }, []);

  var chartDiv = document.getElementById('elevation_chart');
  if (status !== 'OK') {
    chartDiv.innerHTML = 'Cannot show elevation: request failed because ' +
        status;
    return;
  }
  var chart = new google.visualization.ColumnChart(chartDiv);
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Sample');
  data.addColumn('number', 'Elevation');
  for (var i = 0; i < elevations.length; i++) {
    data.addRow(['', elevations[i].elevation]);
  }

  chart.draw(data, {
    height: 150,
    legend: 'none',
    titleY: 'Elevation (m)'
  });
}
