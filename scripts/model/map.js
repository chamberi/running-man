(function(module){

  var googleMap = {};
  googleMap.markers = [];
  googleMap.rendererArray = [];
  googleMap.routeResponses = [];
  googleMap.activeIndexes = [];


  googleMap.initMap = function() {

    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 13,
      center: {lat: 47.608, lng: -122.335},
      mapTypeId: 'terrain'
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

    $('#deleteMarkers').on('click', function() {
      if (googleMap.markers.length !== 0) {
        googleMap.markers.pop().setMap(null);
      };
    });

    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer({
      draggable: true,
      map: googleMap.map,
    });

    googleMap.map = map;
    googleMap.directionsService = directionsService;

    googleMap.loadLocal();
    map.addListener('click', function(e) {
      googleMap.placeMarkerAndPanTo(e.latLng);
    });

    document.getElementById('submit').addEventListener('click', function() {
      var newRoute = new Route(googleMap.markers, map);
      googleMap.markers.forEach(function(ele){
        ele.setMap(null);
      });
      googleMap.markers = [];
      var renderer = new google.maps.DirectionsRenderer();
      var renderer = directionsDisplay;
      googleMap.rendererArray.push(renderer);
      renderer.setMap(map);
      googleMap.activeIndexes.push(newRoute.id - 1);
      Route.queryRoute(newRoute, [googleMap.addFilter,Route.renderActive]);
      // renderer.addListener('directions_changed', function() {
      //   console.log('changed');
      //   computeTotalDistance(directionsDisplay.getDirections());
      // });
    });


    $('#toggle').on('click', function(){
      $('aside').toggle('slide',{direction: 'right'}, 500);
    });

  };

  googleMap.getRequest = function(which) {
    // console.log(which);
    return googleMap.routeList.reduce(function(acc, cur){
      if (which.includes(cur.id - 1)){
        acc.push(cur);
      }
      return acc;
    }, []);
  };

  googleMap.setLocal = function() {
    localStorage.setItem('routes', JSON.stringify(googleMap.routeList));
  };

  googleMap.loadLocal = function() {
    if (localStorage.getItem('routes')) {

      console.log('fetching routes');
      googleMap.routeList = JSON.parse(localStorage.getItem('routes'));
      googleMap.routeList.forEach(function(el, idx){
        googleMap.rendererArray.push(new google.maps.DirectionsRenderer({
          draggable: true,
          map: googleMap.map
        }));
        Route.queryRoute(el, [googleMap.addFilter]);
        googleMap.rendererArray[idx].setMap(googleMap.map);
        // googleMap.rendererArray[idx].addListener('directions_changed', function() {
        //   console.log('changed');
        //   computeTotalDistance(googleMap.rendererArray[idx].getDirections());
        // });
      });
    } else {
      console.log('no stored routes');
      googleMap.routeList = [];
    }
  };

  googleMap.loadFilters = function() {
    googleMap.routeList.forEach(function(route) {
      googleMap.addFilter(route);
    });
  };

  googleMap.addFilter = function(route) {
    var template = $('#route-filter-template').html();
    var templateRender = Handlebars.compile(template);
    $('#route-filter').append(templateRender(route));
    var $filter = $('#route-filter h3');
    $filter.unbind();
    $filter.click(function(event) {
      var id = parseInt(event.target.id) - 1;
      if (googleMap.activeIndexes.includes(id)){
        googleMap.activeIndexes.splice(id,1);
        googleMap.rendererArray[id].setMap(null);
      } else {
        googleMap.activeIndexes.push(id);
        googleMap.rendererArray[id].setMap(googleMap.map);
      }
      Route.renderActive();
      $(this).next().toggle('slow');
      return false;
    }).next().hide();
  };

  googleMap.placeMarkerAndPanTo = function(latLng) {
    var marker = new google.maps.Marker({
      position: latLng,
      draggable: true,
      map: googleMap.map
    });
    googleMap.markers.push(marker);
    googleMap.map.panTo(latLng);
    marker.addListener('dblclick', function() {
      marker.setMap(null);
      googleMap.markers = [];
    });
  };

  module.googleMap = googleMap;
})(window);
