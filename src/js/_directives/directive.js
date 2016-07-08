/**
 * Created by micro on 2015/10/10.
 */
/**
 * Created by Kuroky360 on 15/8/24.
 */
app.directive("gradebar", function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      count: '=',
      high: '=',
      middle: '=',
      low: '='
    },
    template: '<div class="gradebar">' +
      '<div class="gradebar-high" ng-style="{width:(high/count*100)+\'%\'}"></div>' +
      '<div class="gradebar-middle" ng-style="{width:(middle/count*100)+\'%\'}"></div>' +
      '<div class="gradebar-low" ng-style="{width: (low/count*100)+\'%\'}"></div>' +
      '</div>'
  }
});