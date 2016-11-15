(function(module){

  var elevationsView = {};

  elevationsView.displayPathElevation = function(path, elevator, map) {
    new google.maps.Polyline({
      path: path,
      strokeColor: '#0000CC',
      strokeOpacity: 0.4,
      map: map
    });

    elevator.getElevationAlongPath({
      'path': path,
      'samples': 256
    }, elevationsView.plotElevation);
  };

  elevationsView.plotElevation = function(elevations, status) {
    // console.log(elevations[0]);
    // console.log(elevations[0].location.lng());
    elevations.reduce(function(acc, cur, idx) {
      if (idx < elevations.length - 1) {
        nextIdx = idx + 1;

        if (elevations[nextIdx].elevation > cur.elevation) {
          acc = acc + elevations[nextIdx].elevation - cur.elevation;
          var gain = acc.toFixed(2);
          // console.log('Elevation gain = ' + gain);
        };
        return acc;
      };
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
  };

  module.elevationsView = elevationsView;
})(window);
