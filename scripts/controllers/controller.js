google.load('visualization', '1', {packages: ['columnchart']});

function initMap() {
  googleMap.initMap();
  var $name = $('.wrapper input#route-name');
  $('.map-nav-button#submit span').on('mouseenter', function() {
    console.log('event trig');
    $name.show();
  });
  $name.on('mouseleave', function() {
    $name.hide();
  });
}
