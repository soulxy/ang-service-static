/**
 * Created by Kuroky360 on 15/8/24.
 */
app.directive('sybugtree', ['$rootScope', 'auditService', function($rootScope, auditService) {
  return {
    restrict: 'E',
    replace: true,
    template: '<ul id="{{key}}" class="ztree"></ul>',
    scope: {
      domain: '=',
      key: '@',
      bugs: '=',
      open: '&'
    },
    controller: ['$scope', function($scope) {
      $scope.domain.audit = function(auditLevel) {
        var currentNode = $scope.domain.currentNode;
        $scope.domain.menushow = false;
        var info = {
          pkTask: $scope.domain.task,
          pkResDependence: currentNode.rawData.pkResDependence,
          auditResult: auditLevel
        };
        auditService.auditSY(info).then(function(result) {
          currentNode.changeStatus(auditLevel);
          $scope.domain.tree.cancelSelectedNode();

        });
      }
    }],
    link: function($scope, element, attrs) {

      function addMethodToNode(treeNode) {
        treeNode.changeStatus = function(status) {
          var statusIco = document.getElementById(this.tId + "_ico");
          statusIco.className = "button audit-sy-icon-" + status + "_ico_open";
        };
      }

      var setting = {
        data: {
          key: {
            children: "nodes",
            title: 'title'
          }
        },
        callback: {
          beforeClick: function(treeId, treeNode) {},
          onRightClick: function(event, treeId, treeNode) {
            var zTree = $.fn.zTree.getZTreeObj(treeId);
            $scope.domain.tree = zTree;
            if (!treeNode && event.target.tagName.toLowerCase() != "button" && $(event.target).parents("a").length == 0) {
              zTree.cancelSelectedNode();
            } else if (treeNode && treeNode.isParent) {
              zTree.selectNode(treeNode);
              addMethodToNode(treeNode);
              $scope.domain.currentNode = treeNode;
              $scope.$apply(function() {
                $scope.domain.menushow = true;
                $scope.domain.x = event.pageX - 115;
                //解决屏幕底部遮挡问题
                if (winHeight - event.pageY > 100)
                  $scope.domain.y = event.pageY - 90;
                else
                  $scope.domain.y = event.pageY - 200;
              });
            }
          },
          onClick: function(event, treeId, treeNode) {
            var zTree = $.fn.zTree.getZTreeObj(treeId);
            $scope.domain.tree = zTree;
            if (!treeNode.isParent) {
              $scope.$apply(function() {
                $scope.domain
                $scope.domain.showSwitch = 3;
                auditService.getCVEInfo(treeNode.name).then(function(result) {
                  $scope.domain.cveInfo = result;
                });
              });
            } else {
              $scope.$apply(function() {
                $scope.domain.showSwitch = 2;
                $scope.domain.libInfo = treeNode.rawData;
              });
            }
          }
        }
      }
      $scope.$watch(attrs.$attr.bugs, function(value) {
        if (value) {
          $.fn.zTree.init(element, setting, value);
          $(element[0].parentNode).bind("click", function(var1) {
            $scope.$apply(function() {
              $scope.domain.menushow = false;
            });
          });
        }
      });

    }
  }
}])