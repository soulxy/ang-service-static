app.directive('numberEdit', ['sysService', function(sysService) {
  return {
    require: '?ngModel',
    restrict: 'E',
    scope: {
      machine: '=',
    },
    controller: ['$scope', function($scope) {
      $scope.beginEdit = function() {
        $scope.edit = true;
      }
      $scope.endEdit = function() {
        if ($scope.editFrom.$valid) {
          delete $scope.machine.$$hashKey;
          delete $scope.machine.checked;
          sysService.updateEngineProcessNum($scope.machine).then(function(result) {
            $scope.edit = false;
          });
        }
      }
    }],
    template: [
      '<form name="editFrom">',
      '<a ng-show="!edit" ng-bind="machine.machineConcurrentNum" data-ng-click="beginEdit()">',
      '</a>',
      '<input type="number" style="width:100px" min="1" max="4" required class="form-control" ng-model="machine.machineConcurrentNum" ng-show="edit" ng-blur="endEdit()" auto-focus-when="edit"/>',
      '</form>'
    ].join('\n'),
    link: function($scope, element, attrs, ngModel) {}
  }

}]);