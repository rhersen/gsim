/*
 * Usage:
 * <ul sortable ng-model="itemArray">
 *   <li ng-repeat="item in itemArray">...</li>
 * </ul>
 */

angular.module('dr.sortable', [])
  .directive('sortable', function() {
    return {
      restrict : 'A',
      require: 'ngModel',
      link: function(scope, elm, attrs, ngModel) {
        scope.dragStart = function(e, ui) {
          ui.item.data('start', ui.item.index());
        }
        
        scope.dragEnd = function(e, ui) {
            var start = ui.item.data('start');
            var end = ui.item.index();
            ngModel.$modelValue.splice(end, 0, ngModel.$modelValue.splice(start, 1)[0]);
            scope.$apply();
        }
            
        sortableEle = $(elm).sortable({
            start: scope.dragStart,
            update: scope.dragEnd
        });
      }
    }
  });
