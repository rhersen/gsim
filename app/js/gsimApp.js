angular.module('gsimApp', ['dr.sortable'])
.factory('scene', function() {
  return Scene();
})
.factory('gcodeinterpreter', function(scene) {
  return GCodeInterpreter(scene.getMachine());
})
.directive('threeCanvas', function(scene) {
  return {
    restrict: 'A',
    link: function(scope, elm) {
      scene.init(elm.get(0));
      
      function canvasResize() {
        var left = $('#left');
        elm.width($('#container').width() - left.outerWidth(true) - 24);
        elm.height($(window).height() - 24);
        scene.setSizes();
      }

      canvasResize();

      $(window).bind("resize", canvasResize);
    }    
  }
});
