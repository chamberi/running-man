(function(module){

  var googleMap = {};
  googleMap.markers = [];
  googleMap.rendererArray = [];
  googleMap.initMap = function() {

    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 13,
      center: {lat: 47.608, lng: -122.335},
      mapTypeId: 'terrain'
    });


    googleMap.map = map;


    var directionsService = new google.maps.DirectionsService;
    googleMap.map = map;
    googleMap.directionsService = directionsService;


    if (localStorage.getItem('routes')) {
      console.log('fetching routes');
      googleMap.routeList = JSON.parse(localStorage.getItem('routes'));
      googleMap.routeList.forEach(function(el, idx){
        googleMap.rendererArray.push(new google.maps.DirectionsRenderer());
        googleMap.rendererArray[idx].setMap(map);
      });

      $('#mapall').change(function() {
        if( $('#mapall').prop('checked')) {
          showOverlays();
        }
        else {
          clearOverlays();
        }
      });

      function clearOverlays() {
        if (googleMap.markers) {
          for( var i = 0, n = googleMap.markers.length; i < n; ++i ) {
            googleMap.markers[i].setMap(null);
          }
        }
      }

      function showOverlays() {
        if (googleMap.markers) {
          for( var i = 0, n = googleMap.markers.length; i < n; ++i ) {
            googleMap.markers[i].setMap(map);
          }
        }
      }

    } else {
      console.log('no stored routes');
      googleMap.routeList = [];
    }

    googleMap.loadLocal();
    googleMap.loadFilters();
    map.addListener('click', function(e) {
      googleMap.placeMarkerAndPanTo(e.latLng, map);
    });

    document.getElementById('submit').addEventListener('click', function() {
      var newRoute = new Route(googleMap.markers, map);
      googleMap.markers.forEach(function(ele){
        ele.setMap(null);
      });
      googleMap.markers = [];
      Route.calcRoute(newRoute, true);
      var renderer = new google.maps.DirectionsRenderer();
      renderer.setMap(map);
      googleMap.rendererArray.push(renderer);

      Route.renderRoutes(map, [newRoute.id - 1]);
      localStorage.setItem('routes', JSON.stringify(googleMap.routeList));
    });

    $('#toggle').on('click', function(){
      $('aside').toggle('slide',{direction: 'right'}, 500);
    });
    $('.route-filter').on('change', function() {
      var req = $('#required').val();
      var comp = $('#compare').val();
      var which = [];
      if (req !== 'Routes'){
        which.push(req - 1);
        if (comp !== 'Compare' && comp !== req) {
          which.push(comp - 1);
        }
        console.log(which);
        Route.showRoute(which);
      }
    });
  };

  googleMap.getRequest = function(which) {
    console.log(which);
    return googleMap.routeList.reduce(function(acc, cur){
      if (which.includes(cur.id - 1)){
        acc.push(cur);
      }
      return acc;
    }, []);
  };

  googleMap.loadLocal = function() {
    if (localStorage.getItem('routes')) {
      console.log('fetching routes');
      googleMap.routeList = JSON.parse(localStorage.getItem('routes'));
      googleMap.routeList.forEach(function(el, idx){
        googleMap.rendererArray.push(new google.maps.DirectionsRenderer());
        googleMap.rendererArray[idx].setMap(googleMap.map);
      });
    } else {
      console.log('no stored routes');
      googleMap.routeList = [];
    }
  };

  googleMap.loadFilters = function() {
    googleMap.routeList.forEach(function(route) {
      var template = $('#route-filter-template').html();
      var templateRender = Handlebars.compile(template);
      $('.route-filter').append(templateRender(route));
    });
  };

  googleMap.placeMarkerAndPanTo = function(latLng, map) {
    var marker = new google.maps.Marker({
      position: latLng,
      draggable: true,
      map: map
    });
    googleMap.markers.push(marker);
    map.panTo(latLng);
    marker.addListener('dblclick', function() {
      marker.setMap(null);
      googleMap.markers = [];
    });
  };

  $('#delete').change(function() {
    if ($('#delete').prop('clicked')) {
      googleMap.markers.setMap(null);
    }
  });

  module.googleMap = googleMap;
})(window);
