/**
 * Created by Kuroky360 on 15/8/24.
 */
app.directive('bugtree', ['$rootScope', 'auditService', function($rootScope, auditService) {
  return {
    restrict: 'E',
    replace: true,
    template: '<ul id="{{key}}" class="ztree"></ul>',
    scope: {
      domain: '=',
      key: '@',
      bugs: '=',
      open: '&',
    },
    controller: ['$scope', function($scope) {
      $scope.domain.audit = function(auditLevel) {
        $scope.domain.menushow = false;
        var infos = [];
        for (var i = 0; i < $scope.domain.selectNodes.length; i++) {
          var info = {
            pkTask: $scope.domain.taskId,
            bugId: $scope.domain.selectNodes[i].rawData.bugId,
            auditResult: auditLevel,
            auditResultOld: $scope.domain.selectNodes[i].rawData.auditResultOld,
            bugLevel: $scope.domain.selectNodes[i].rawData.bugLevel,
            auditMemo: '',
            ruleCode: $scope.domain.selectNodes[i].rawData.ruleCode
          };
          $scope.domain.selectNodes[i].rawData.auditResultOld = auditLevel;
          infos.push(info);
        }

        auditService.audits(infos).then(function(result) {
          var nodes = $scope.domain.selectNodes;
          for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            node.changeStatus(auditLevel);
          }
          $scope.domain.tree.cancelSelectedNode();
          $scope.domain.selectNodes = [];
        });
      }
    }],
    link: function($scope, element, attrs) {

      function addMethodToNode(treeNode) {
        treeNode.changeStatus = function(status) {
          var statusIco = document.getElementById(this.tId + "_ico");
          statusIco.className = "button audit-icon-" + status + "_ico_docu";
        };
      }

      function selectNodes(startNode, endNode, zTree) {
        if (startNode.isParent || endNode.isParent)
          return;
        var startIndex = startNode.tId.split('_')[2]; //shift键按下之前的选中的最后一个节点的节点标志行数
        var endIndex = endNode.tId.split('_')[2]; //最后选中的节点的节点标志行数
        var count = endIndex - startIndex;
        zTree.selectNode(startNode, true);
        if (count > 0) { //大于0，向下全部选中
          for (var i = 0; i < count; i++) {
            startNode = startNode.getNextNode();
            $scope.domain.selectNodes.push(startNode);
          }
        } else { //小于0，向上全部选中
          for (var i = 0; i < (-count); i++) {
            startNode = startNode.getPreNode();
            $scope.domain.selectNodes.push(startNode);
          }
        }
        var nodes = $scope.domain.selectNodes;
        for (var i = 0; i < nodes.length; i++) {
          addMethodToNode(nodes[i]);
          zTree.selectNode(nodes[i], true);
        }
      }

      function addDiyDom(treeId, treeNode) {
        var aObj = $("#" + treeNode.tId + "_a");
        treeNode.maxPage = Math.round(treeNode.num / treeNode.pageSize - .5) + (treeNode.num % treeNode.pageSize == 0 ? 0 : 1);
        if (treeNode.isParent && treeNode.num > 1000 && treeNode.sons.length == 0) {
          if ($("#nextBtn_" + treeNode.tId).length > 0) return;
          var addStr = "<span class='button firstPage' id='firstBtn_" + treeNode.tId + "' title='首页' onfocus='this.blur();'></span><span class='button prevPage' id='prevBtn_" + treeNode.tId + "' title='上页' onfocus='this.blur();'></span><span class='button nextPage' id='nextBtn_" + treeNode.tId + "' title='下页' onfocus='this.blur();'></span><span class='button lastPage' id='lastBtn_" + treeNode.tId + "' title='末页' onfocus='this.blur();'></span>";
          aObj.after(addStr);
          var first = $("#firstBtn_" + treeNode.tId);
          var prev = $("#prevBtn_" + treeNode.tId);
          var next = $("#nextBtn_" + treeNode.tId);
          var last = $("#lastBtn_" + treeNode.tId);
          first.bind("click", function() {
            if (!treeNode.isAjaxing) {
              goPage(treeId, treeNode, 1);
            }
          });
          last.bind("click", function() {
            if (!treeNode.isAjaxing) {
              goPage(treeId, treeNode, treeNode.maxPage);
            }
          });
          prev.bind("click", function() {
            if (!treeNode.isAjaxing) {
              goPage(treeId, treeNode, treeNode.page - 1);
            }
          });
          next.bind("click", function() {
            if (!treeNode.isAjaxing) {
              goPage(treeId, treeNode, treeNode.page + 1);
            }
          });
        }
        if (treeNode.isParent) return;
        if (!treeNode.rawData.bugUrl) return;
        var veiwBugStr = "<a href='" + treeNode.rawData.bugUrl + "' target='_blank' tooltip='查看bug'><i class='iconfont'>&#xe60a;</i></a>";
        aObj.append(veiwBugStr);
      }


      /*子节点翻页*/
      function goPage(treeId, treeNode, page) {
        treeNode.page = page;
        if (treeNode.page < 1) treeNode.page = 1;
        if (treeNode.page > treeNode.maxPage) treeNode.page = treeNode.maxPage;
        var zTree = $.fn.zTree.getZTreeObj(treeId);
        zTree.reAsyncChildNodes(treeNode, "refresh");
      }

      function ajaxDataFilter(treeId, parentNode, responseData) {
        var data = responseData.data;
        var i;
        var treeArray = [];
        var aObj = $("#" + parentNode.tId + "_a");
        aObj.attr("title", "当前第 " + parentNode.page + " 页 / 共 " + parentNode.maxPage + " 页");

        for (i = 0; i < data.length; i++) {
          bug = data[i];
          treeItem = {};
          treeItem.rawData = bug;
          treeItem.value = bug.bugId;
          treeItem.iconSkin = 'audit-icon-' + bug.auditResult;
          if (parentNode.ruleCode !== null) { //判断分类方式
            var fileName = bug.bugFile;
            var index = (index = fileName.lastIndexOf('/')) > 0 ? index : fileName.lastIndexOf('\\');
            fileName = fileName.substring(++index) + '(' + bug.bugBeginline + ')';
            treeItem.name = fileName;
            treeItem.title = bug.bugFile
          } else {
            treeItem.name = bug.ruleType + "-" + bug.ruleName + "(" + bug.bugBeginline + ")";
            treeItem.title = "";
          }
          treeArray.push(treeItem);
        }
        return treeArray;
      }
      var setting = {
        async: {
          enable: true,
          url: 'result/queryAllBugsByRuleOrFile',
          autoParam: ["queryData=data"],
          dataFilter: ajaxDataFilter
        },
        data: {
          key: {
            children: "sons",
            title: 'title',
            name: 'name'
          },
          simpleData: {
            enable: true,
          }
        },
        view: {
          /*addHoverDom: addHoverDom,
          removeHoverDom: removeHoverDom,*/
          addDiyDom: addDiyDom
        },
        callback: {
          beforeAsync: function(treeId, treeNode) {
            if (!treeNode) {
              return false;
            } else {
              var queryArray = {
                "pkTask": treeNode.pkTask,
                "treeType": treeNode.treeType,
                "isRule": treeNode.isRule,
                "ruleOrFile": treeNode.ruleOrFile,
                "page": treeNode.page,
                "pageSize": treeNode.pageSize
              };
              $.extend(queryArray, $scope.$parent.currentSearchParam);
              treeNode.queryData = JSON.stringify(queryArray);
              return true;
            }
          },
          onAsyncSuccess: function(event, treeId, treeNode, msg) { //自动的打开源代码
            if ($scope.$parent.openFirstNode) {
              var zTree = $.fn.zTree.getZTreeObj(treeId);
              var currentNode = treeNode.sons && treeNode.sons.length > 0 ? treeNode.sons[0] : null;
              if (!currentNode)
                return;
              $scope.$apply(function() {
                $scope.$parent.openFirstNode = false;
                addMethodToNode(currentNode);
                currentNode.treeObj = zTree;
                $rootScope.selectData = currentNode;
                $scope.open();
              });
            }
          },
          beforeExpand: function(treeId, treeNode) {
            if (treeNode.page == 0) treeNode.page = 1;
            return !treeNode.isAjaxing;
          },
          beforeClick: function(treeId, treeNode) {
            if (!treeNode.isParent) {
              var treeObj = $.fn.zTree.getZTreeObj(treeId);
              $scope.domain.selectNodes = treeObj.getSelectedNodes();
            }

          },
          onRightClick: function(event, treeId, treeNode) {
            var zTree = $.fn.zTree.getZTreeObj(treeId);
            $scope.domain.tree = zTree;
            if (!treeNode && event.target.tagName.toLowerCase() != "button" && $(event.target).parents("a").length == 0) {
              zTree.cancelSelectedNode();
            } else if (treeNode && !treeNode.noR && !treeNode.isParent) {
              if (!$scope.domain.selectNodes || $scope.domain.selectNodes.length <= 1) {
                zTree.selectNode(treeNode);
                addMethodToNode(treeNode);
                $scope.domain.selectNodes = [treeNode];
                $scope.domain.currentNode = treeNode;
              }
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
              if (!event.shiftKey) {
                $scope.domain.selectNodes = [treeNode];
                $scope.$apply(function() {
                  addMethodToNode(treeNode);
                  treeNode.treeObj = zTree;
                  $rootScope.selectData = treeNode;
                  $scope.open();
                });
              } else {
                if ($scope.domain.selectNodes.length == 0)
                  $scope.domain.selectNodes = [treeNode];
                else {
                  var startNode = $scope.domain.selectNodes[0];
                  selectNodes(startNode, treeNode, zTree, event);
                }
              }
            }
            $scope.$apply(function() {
              $scope.domain.menushow = false;
            });
            event.stopPropagation();
          }
        }
      }
      $scope.$watch(attrs.$attr.bugs, function(value) {
        if (value) {
          var currentZTree = $.fn.zTree.init(element, setting, value);
          if ($scope.$parent.expandFirstNode) {
            var allNodes = currentZTree.getNodes();
            if (allNodes[0] && allNodes[0].sons[0]) {
              allNodes[0].sons[0].page = 1;
              currentZTree.expandNode(allNodes[0].sons[0]);
            } else if (allNodes[0]) {
              allNodes[0].page = 1;
              currentZTree.expandNode(allNodes[0]);
            }
          }
          $(element[0].parentNode).bind("click", function(var1) {
            $scope.$apply(function() {
              $scope.domain.menushow = false;
            });
            if ($scope.domain.selectNodes && $scope.domain.selectNodes.length > 1) {
              $scope.domain.tree.cancelSelectedNode();
              $scope.domain.selectNodes = [];
            }
          });
        }

      });

    }
  }
}])