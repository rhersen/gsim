function init() {
	
  var canvas = $('#canvas');

  scene.init(canvas.get(0));

  function canvasResize() {
    var left = $('#left');
    canvas.width($('#container').width() - left.outerWidth(true) - 24);
    canvas.height($(window).height() - 24);
    scene.setSizes();
  }

  canvasResize();

  $(window).bind("resize", canvasResize);

  $("#left").resizable({
    handles: 'e',
    minWidth: '50',
    maxWidth: '350'
  });

  jQuery(document).ready(function(){
    $('.expandable .head').click(function() {
        $(this).next().toggle('fast');
        return false;
    });
  });
}
