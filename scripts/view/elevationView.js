(function(module){

  var elevationsView = {};

  elevationsView.displayPathElevation = function(path) {
    new google.maps.Polyline({
      path: path,
      strokeColor: '#0000CC',
      strokeOpacity: 0,
      map: googleMap.map
    });
  };

  elevationsView.calculateStats = function(path, route) {
    var hillData = [];
    var elevator = new google.maps.ElevationService;
    elevator.getElevationAlongPath({
      'path': path,
      'samples': 256
    }, function(elevations, status){
      elevationsView.elevations = elevations;
      elevationsView.status = status;
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

      route.steepDistance = hillData.filter(function(dataPoint){
        return dataPoint[2] > 0.10;
      })
      .reduce(function(acc, cur, idx) {
        acc += cur[1];
        acc = parseFloat(acc.toFixed(2));
        return acc;

      }, 0);

    });
  };

  elevationsView.plotElevation = function(elevations, status) {
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
  };

  module.elevationsView = elevationsView;
})(window);
