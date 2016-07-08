/**
 * Created by Kuroky360 on 15/8/24.
 */
app.directive('tracetree', ['$rootScope', function($rootScope) {
  return {
    restrict: 'E',
    replace: true,
    template: '<ul id="{{key}}" class="ztree"></ul>',
    scope: {
      key: '@',
      traces: '=',
      go: '&'
    },
    link: function($scope, element, attrs) {
      var setting = {
        data: {
          key: {
            name: 'filePath'
          },
          simpleData: {
            enable: true,
            idKey: 'traceId',
            pIdKey: 'fatherTraceid',
            rooPId: ''
          }

        },
        callback: {
          /* beforeClick: function (treeId, treeNode) {//点击菜单时进行的处理
           var zTree = $.fn.zTree.getZTreeObj("tree");
           if (treeNode.isParent) {
           zTree.expandNode(treeNode);
           return false;
           } else {
           window.location.href = treeNode.url;
           return true;
           }
           }
           },*/
          onClick: function(event, treeId, treeNode) {
            if (!treeNode.isParent) {
              $scope.$apply(function() {
                $rootScope.traceNode = treeNode;
                $scope.go();
              });
            }
          }
        }
      }
      $scope.$watch(attrs.$attr.traces, function(value) {
        if (value)
          $.fn.zTree.init(element, setting, value);
      });
    }
  }
}])