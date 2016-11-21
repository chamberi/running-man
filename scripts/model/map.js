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
      mapTypeId: 'terrain',
      clickableIcons: false,
      disableDefaultUI: true,


    });

    $('#showMarkers').click(function() {
      $('#hideMarkers').show();
      $('#showMarkers').hide();
      toggleOverlays(map);
    });
    $('#hideMarkers').click(function(){
      $('#showMarkers').show();
      $('#hideMarkers').hide();
      toggleOverlays(null);
    });

    function toggleOverlays(nullOrMap) {
      googleMap.markers.forEach(function(marker) {
        marker.setMap(nullOrMap);
      });
      googleMap.activeIndexes.forEach(function(index) {
        googleMap.rendererArray[index].setMap(nullOrMap);
      });
    }

    $('#deleteMarkers').on('click', function() {
      if (googleMap.markers.length !== 0) {
        googleMap.markers.pop().setMap(null);
      };
    });

    $('#clear').on('click', function() {
      localStorage.clear();
      window.location.reload();
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
      var $name = $('input#route-name');
      if ($name.val() !== '') {
        newRoute.name = $name.val();
      } else {
        newRoute.name = 'Route ' + newRoute.id;
      }
      $name.val('');
      newRoute.isNew = true;
      var renderer = new google.maps.DirectionsRenderer({
        draggable: true
      });
      googleMap.rendererArray.push(renderer);
      renderer.setMap(map);
      googleMap.activeIndexes.push(newRoute.id - 1);
      Route.queryRoute(newRoute, [googleMap.addFilter,Route.renderRoute]);
      // renderer.addListener('directions_changed', function() {
      //   console.log('changed');
      //   computeTotalDistance(directionsDisplay.getDirections());
      // });
    });

    $('ul#route-list').click(function(e) {
      if ($(e.target).hasClass('delete')) {
        var id = parseInt(e.target.id);
        googleMap.routeList.splice(id-1, 1);
        googleMap.rendererArray[id-1].setMap(null);
        googleMap.rendererArray.splice(id-1,1);
        if (googleMap.activeIndexes.includes(id-1)) {
          googleMap.activeIndexes.splice(googleMap.activeIndexes.indexOf(id-1),1);
        }
        $('ul#route-list li#' + id).remove();
        Route.renderActive();
        googleMap.setLocal();
      }
    });

    $('#toggleOn').on('click', function(){
      $('#toggleOn').hide();
      $('#toggleOff').show();
      $('aside').toggle('slide',{direction: 'right'}, 500);
    });
    $('#toggleOff').on('click', function(){
      $('#toggleOn').show();
      $('#toggleOff').hide();
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
    var template = $('#route-li-template').html();
    var templateRender = Handlebars.compile(template);
    $('ul#route-list').append(templateRender(route));
    var $filter = $('ul#route-list h3#' + route.id);
    $filter.unbind();
    $filter.click(function(event) {
      $filter.next().slideToggle();
      var id = parseInt(event.target.id) - 1;
      if (googleMap.activeIndexes.includes(id)){
        google.maps.event.clearInstanceListeners(googleMap.rendererArray[id]);
        googleMap.rendererArray[id].setMap(null);
        googleMap.activeIndexes.splice(googleMap.activeIndexes.indexOf(id),1);
        Route.renderActiveElevations();
      } else {
        googleMap.activeIndexes.push(id);
        googleMap.rendererArray[id].setMap(googleMap.map);
        Route.renderRoute(googleMap.routeList[id]);
      }
      return false;
    }).next().hide();
    if (route.isNew) {
      route.isNew = false;
      $filter.next().show();
    }
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
