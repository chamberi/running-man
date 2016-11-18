(function(module){

  var elevationsView = {};
  elevationsView.elevationsList = [];

  elevationsView.displayPathElevation = function(path) {
    new google.maps.Polyline({
      path: path,
      strokeColor: '#0000CC',
      strokeOpacity: 0,
      map: googleMap.map
    });
  };

  elevationsView.calculateStats = function(route, callback) {
    var path = route.detailedPath;
    var hillData = [];
    var elevator = new google.maps.ElevationService;
    elevator.getElevationAlongPath({
      'path': path,
      'samples': 256
    }, function(elevations, status) {
      elevationsView.elevationsList[route.id - 1] = elevations;
      // elevationsView.status = status;
      console.log(route.id);
      route.totalGain = elevations.reduce(function(acc, cur, idx) {
        if (idx < elevations.length - 1) {
          nextIdx = idx + 1;
          if (elevations[nextIdx].elevation > cur.elevation) {
            var dif = parseFloat((elevations[nextIdx].elevation - cur.elevation).toFixed(2));
            acc += dif;
            acc = parseFloat(acc.toFixed(2));
            var miniDistance = parseFloat(google.maps.geometry.spherical.computeDistanceBetween (elevations[idx].location, elevations[nextIdx].location).toFixed(2));
            hillData.push([dif, miniDistance, parseFloat((dif / miniDistance).toFixed(2))]);
          };
        };
        return acc;
      }, 0.0);
      elevMi = route.totalGain / 1609.34;
      route.elevMiles = elevMi.toFixed(2);
      route.steepDistance = hillData.filter(function(dataPoint){
        return dataPoint[2] > 0.10;
      })
      .reduce(function(acc, cur, idx) {
        acc += cur[1];
        acc = parseFloat(acc.toFixed(2));
        return acc;
      }, 0);
      steepMi = route.steepDistance / 1609.34;
      route.steepMiles = steepMi.toFixed(2);
      if (callback) {
        callback[0](route);
        if (callback[1]) {
          callback[1]();
        }
      }
    });
  };

  elevationsView.plotElevation = function(status, route) {
    var elevDiv = document.createElement('div');
    var elevations = elevationsView.elevationsList[route.id - 1];
    $('#elevation_chart').append('<h4>' + route.name + '</h4>');
    $('#elevation_chart').append(elevDiv);

    if (status !== 'OK') {
      chartDiv.innerHTML = 'Cannot show elevation: request failed because ' +
          status;
      return;
    }
    var chart = new google.visualization.ColumnChart(elevDiv);
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Sample');
    data.addColumn('number', 'Elevation');
    for (var i = 0; i < elevations.length; i++) {
      data.addRow(['', elevations[i].elevation]);
    }

    chart.draw(data, {
      height: 150,
      legend: 'none',
      titleY: 'Elevation (m)',
    });
  };

  module.elevationsView = elevationsView;
})(window);
