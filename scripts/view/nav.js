$('#map-link').click(function() {
  $('html, body').animate({
    scrollTop: $('#map').offset().top
  }, 500);
});

$('#stats-link').click(function() {
  $('html, body').animate({
    scrollTop: $('#stats').offset().top
  }, 500);
});
$('#home-link').click(function() {
  $('html, body').animate({
    scrollTop: $('.site-info').offset().top
  }, 500);
});
