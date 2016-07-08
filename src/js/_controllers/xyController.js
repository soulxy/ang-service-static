app.controller('xyCtrl', function($scope, xyService) {
  console.log('run-xy');
  $scope.contition = {};
  xyService.getInfo('/getList').then(function(res) {
    console.log('--->success', res);

  }).catch(function(e) {
    console.log('--->error', e);
  })['finally'](function() {
    $scope.hidePageLoading();
  });
});