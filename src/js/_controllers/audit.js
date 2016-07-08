app.controller('auditCtrl', ['myBug', 'resultService', '$stateParams', '$filter', '$rootScope', '$scope', '$location', 'checkType', 'uiService', 'sysService', 'auditService', '$http', 'traverseTree',
  function(myBug, resultService, $stateParams, $filter, $rootScope, $scope, $location, checkType, uiService, sysService, auditService, $http, traverseTree) {
    //myBug=false;
    $scope.workspaces = [
      /*{id: 1, name: "Workspace 1", active: true},
       {id: 2, name: "Workspace 2", active: false}*/
    ];
    $scope.widHeight = winHeight - 90;
    $scope.taskType = $stateParams.task_type;
    $scope.checkType = checkType;
    $scope.showMore = false;
    $scope.taskId = $stateParams.task_id;
    $scope.nodata = false; //当前页面是否有数据
    $scope.domain = {
      taskId: $stateParams.task_id,
      menushow: false
    };
    // $scope.currentLevel = 'hbugs';
    $scope.controlLevel = {
      showH: false,
      showM: false,
      showL: false,
      showA: false
    };
    $scope.searchParam = {
      level: [],
      str: '',
      fileName: '',
      ruleCode: [],
    };
    $scope.searchParam.auditStatus = {
      /* high: 5,
       middle: 3,
       low: 1,
       safe: 6,
       noaudit: 0,*/
    };
    var columnDefs = [{
        headerName: "文件名",
        field: "name",
        width: 350,
        cellRenderer: {
          renderer: 'group',
          innerRenderer: function(params) {
            var image;
            if (params.node.group) {
              image = 'InCall';
            } else {
              image = 'call';
            }
            var imageFullUrl = 'app/img/' + image + '.png';
            return '<img src="' + imageFullUrl + '" style="padding-left: 4px;" /> ' + params.data.name;
          }
        }
      }, {
        headerName: "行号",
        field: "line",
        width: 80,
        cellStyle: function() {
          return {
            'text-align': 'center'
          };
        }
      },

      {
        headerName: "代码段",
        field: "code"
      }
    ];

    function setAllInactive() {
      angular.forEach($scope.workspaces, function(workspace) {
        workspace.active = false;
      });
    }

    function add(id, name) {
      var id = id || $scope.workspaces.length + 1;
      var workspace = {
        id: id,
        name: name,
        active: true
      };
      $scope.workspaces.unshift(workspace);
      return workspace;

    }

    function formatCode(workspace, filepath, encoding, bugLine, col, type, despRequest) {
      workspace.currentFile = filepath;
      // var fileInfo = {filePath: filepath, fileEncoding: encoding};
      var fileInfo = {
        pkTask: despRequest.pkTask,
        bugId: despRequest.bugId,
        filePath: filepath,
        fileEncoding: encoding
      };
      auditService.getSourceCode(fileInfo).then(function(result) {
        var id = workspace.id + "_c";
        var codeBox = document.getElementById(id);
        if (workspace.editor) {
          workspace.editor.toTextArea(); //销毁原来的CodeMirror
        }
        codeBox.value = result;
        var editor = CodeMirror.fromTextArea(codeBox, {
          //mode: 'text/x-c++src',
          lineNumbers: true,
          matchBrackets: true,
          readOnly: true,
          specialChars: /1111111111111#1111111111111/ /*占位符，修改默认红点*/
        });
        setCodeMode(workspace.currentBug.fileType, editor);
        editor.gotoLine = function(line, col, type) {
          if (editor.doc.lineCount() < line)
            return;
          col = 0;
          var lines = getTraceLines(workspace);

          for (var i = 1; i <= editor.lineCount(); i++) {
            var lineObj = editor.getLineHandle(i - 1);

            editor.removeLineClass(lineObj, "wrap", 'bugLine');
            editor.removeLineClass(lineObj, "wrap", 'cursorLine');
            editor.removeLineClass(lineObj, "wrap", 'traceLine');

            if (lines.indexOf(i) != -1) {
              editor.addLineClass(lineObj, "wrap", "traceLine");
            }
          }

          var className = 'cursorLine';
          if (type !== 'trace') {
            className = 'bugLine';
          }
          editor.addLineClass(editor.getLineHandle(line - 1), "wrap", className);
          var mid = editor.display.lastWrapHeight / 2;
          editor.scrollIntoView({
            line: line,
            ch: col
          }, mid);
        }
        workspace.editor = editor;
        workspace.editor.gotoLine(bugLine, col, type);

      });
    }

    function getTraceLines(workspace) {
      var traces = workspace.bugDesp.bugTraces;
      var lines = [];
      angular.forEach(traces, function(item) {
        if (item.bugFile == workspace.currentFile) {
          lines.push(item.codeBeginline);
        }
      });
      return lines;
    }

    function setCodeMode(filetype, editor) {
      CodeMirror.modeURL = "vendor/codemirror/mode/%N/%N";
      var info = CodeMirror.findModeByExtension(filetype);
      if (!info)
        info = {
          name: "C",
          mime: "text/x-csrc",
          mode: "clike",
          ext: ["c", "h"]
        };
      editor.setOption("mode", info.mime);
      CodeMirror.autoLoadMode(editor, info.mode);
    }

    function bugGroupByType(bugs) {
      var map1 = {};
      var group = [];
      for (var i = 0; i < bugs.length; i++) {
        var bug = bugs[i];
        var level1_name = bugs[i].ruleType;
        var level2_name = bugs[i].ruleName;
        var map1_value = map1[level1_name];

        if (!map1_value) {
          var map2_value_item = {
            name: level2_name,
            open: true,
            checked: true,
            value: bug.ruleCode,
            rawData: bug,
            nodes: []
          };
          var map2 = {};
          map2[level2_name] = map2_value_item;
          map1[level1_name] = {
            name: level1_name,
            open: true,
            checked: true,
            value: bug.ruleType,
            nodes: [map2_value_item],
            map2: map2
          };
        } else {
          var map2_value = map1_value.map2[level2_name];
          if (!map2_value) {
            var map2_value_item = {
              name: level2_name,
              open: true,
              checked: true,
              rawData: bug,
              nodes: []
            };
            map1_value.map2[level2_name] = map2_value_item;
            map1_value.nodes.push(map2_value_item);
          }
        }
      }

      for (key in map1) {
        group.push(map1[key]);
      }

      return group;
    }

    function bugGroupByCata(bugs, grade) {
      var map1 = {};
      var group = [];
      for (var i = 0; i < bugs.length; i++) {
        var bug = bugs[i];
        if (grade == -1 || bug.bugLevel == grade) {
          var fileName = bug.bugFile;
          var index = (index = fileName.lastIndexOf('/')) > 0 ? index : fileName.lastIndexOf('\\');
          fileNmae = fileName.substring(++index) + '(' + bug.bugBeginline + ')';
          var buginfo = {
            name: fileNmae,
            value: bug.bugId,
            rawData: bug,
            title: bug.bugFile
          };
          //if (bug.auditResult != 0)
          buginfo.iconSkin = 'audit-icon-' + bug.auditResult;

          var level1_name = bugs[i].ruleType;
          var level2_name = bugs[i].ruleName;
          var map1_value = map1[level1_name];

          if (!map1_value) {
            var map2_value_item = {
              name: level2_name,
              nodes: [buginfo]
            };
            var map2 = {};
            map2[level2_name] = map2_value_item;
            map1[level1_name] = {
              name: level1_name,
              open: true,
              nodes: [map2_value_item],
              map2: map2
            };
          } else {
            var map2_value = map1_value.map2[level2_name];
            if (!map2_value) {
              var map2_value_item = {
                name: level2_name,
                nodes: [buginfo]
              };
              map1_value.map2[level2_name] = map2_value_item;
              map1_value.nodes.push(map2_value_item);
            } else {
              map2_value.nodes.push(buginfo);
            }
          }
        }
      }

      for (key in map1) {
        group.push(map1[key]);
      }

      return group;
    }

    function bugGroupByFile(bugs, grade) {
      var map = {};
      var group = [];
      for (var i = 0; i < bugs.length; i++) {
        var bug = bugs[i];
        if (grade == -1 || bug.bugLevel == grade) {
          var name = bug.bugFile;
          //var index = (index=fileName.lastIndexOf('/'))>0?index:fileName.lastIndexOf('\\');
          //index++;
          //var indexEnd =fileName.lastIndexOf('.');
          //var name = fileName.substring(index,indexEnd);
          //fileNmae = fileName.substring(index)+'(' + bug.bugBeginline + ')';
          var buginfo = {
            name: bug.ruleName + '(' + bug.bugBeginline + ')',
            value: bug.bugId,
            rawData: bug,
            title: '',
          };
          buginfo.iconSkin = 'audit-icon-' + bug.auditResult;

          var fileIndetify = bug.filePath;
          var map_value = map[fileIndetify];
          if (!map_value) {
            map[fileIndetify] = {
              name: name,
              title: bug.bugFile,
              iconSkin: 'file',
              nodes: [buginfo]
            };
          } else {
            map_value.nodes.push(buginfo);
          }
        }
      }

      for (key in map) {
        group.push(map[key]);
      }

      return group;
    }

    function getWorkspace(id) {
      for (var i = 0; i < $scope.workspaces.length; i++) {
        var workspace = $scope.workspaces[i];
        if (workspace.id == id) {
          return workspace;
        }
      }
      return null;
    }

    function getActiveWorkspace() {
      for (var i = 0; i < $scope.workspaces.length; i++) {
        var workspace = $scope.workspaces[i];
        if (workspace.active === true) {
          return workspace;
        }
      }
      return false;
    }

    function createTraceGrid(workspace, despRequest) {
      return {
        localeText: {
          loadingOoo: '正在加载....',
          noRowsToShow: '没有数据'
        },
        columnDefs: columnDefs,
        rowData: null,
        rowSelection: 'single',
        rowsAlreadyGrouped: true,
        enableColResize: true,
        /*enableSorting: true,*/
        rowHeight: 30,
        /*icons: {
         groupExpanded: '<i class="fa fa-minus-square-o"/>',
         groupContracted: '<i class="fa fa-plus-square-o"/>'
         },*/
        onRowClicked: function rowClicked(params) {
          var traceNode = params.node.rawData;
          var line = traceNode.codeBeginline;
          var col = traceNode.codeBegincol;
          var type = 'trace';
          var encoding = traceNode.fileEncoding;
          workspace.traceGrid.api.selectNode(params.node, true)
          workspace.name = getFileName(traceNode.filePath);
          if (workspace.currentBug.bugFile == traceNode.filePath && workspace.currentBug.bugBeginline == traceNode.codeBeginline) {
            type = 'bug';
          }
          if (workspace.currentFile && workspace.currentFile == traceNode.bugFile) {
            workspace.editor.gotoLine(line, col, type);
          } else {
            formatCode(workspace, traceNode.bugFile, encoding, line, col, type, despRequest);
          }
        }
      };
    }

    function convertToTreeData(traceArray) {
      var config = {
        id: 'traceId',
        pid: 'fatherTraceid',
        name: 'filePath',
        nodeValue: 'key',
        nodeName: "name",
        children: "children"
      };
      var map = {};
      var tree = [];

      function createNode(itemData, childNode) {
        var node = {
          group: false,
          expanded: true,
          rawData: itemData,
          data: {
            name: getFileName(itemData.filePath),
            line: itemData.codeBeginline,
            code: itemData.codePart
          },
          children: []
        };

        if (childNode)
          node.children.push(childNode);
        map[itemData[config.id]] = node;
        var pid = itemData[config.pid];
        if (pid === null || pid === undefined || pid === '0')
          return node;
        var parentNode = map[pid];
        if (parentNode) {
          parentNode.children.push(node);
          parentNode.group = true;
        } else {
          var item = traceArray.get(itemData[config.pid], function(item, condition) {
            return item[config.id] == condition;
          });
          createNode(item, node);
        }
      }
      for (var i = 0; i < traceArray.length; i++) {
        var traceItem = traceArray[i];
        var traceNode = createNode(traceItem);
        if (traceNode)
          tree.push(traceNode);
      }
      delete map;
      return tree;
    };

    function getBugCommitInfo(rawData) {
      var task = $scope.checkResult.taskVO;
      return {
        bugSystem: task.trackerName,
        url: task.trackerUrl,
        userName: task.trackerUserName,
        pwd: task.trackerPassword,
        product: task.trackerProduct,
        component: task.trackerComponent,
        version: task.trackerProductVersion,
        assignee: '',
        priority: 'Normal',
        summary: rawData.ruleType + ":" + rawData.ruleName + " " + rawData.bugFile + ":" + rawData.bugBeginline,
        ruleCode: rawData.ruleCode,
        bugId: rawData.bugId,
        bugUrl: rawData.bugUrl
      };

    }

    $scope.closeAll = function() {
      $scope.workspaces = [];
    }
    $scope.open = function() {
      var treeNode = $rootScope.selectData;
      var line = treeNode.rawData.bugBeginline;
      var existsFile = true;
      var col = treeNode.rawData.bugBegincol;
      setAllInactive();
      var currentWorkspace = getWorkspace(treeNode.rawData.bugFile); //getWorkspace(treeNode.rawData.bugFile);
      if (!currentWorkspace) {
        existsFile = false;
        currentWorkspace = add(treeNode.rawData.bugFile, treeNode.name);
      } else {
        currentWorkspace.name = treeNode.name;
      }
      currentWorkspace.auditLevel = treeNode.rawData.auditResult || treeNode.rawData.bugLevel;
      if (!currentWorkspace.currentBug || currentWorkspace.currentBug.bugId != treeNode.rawData.bugId) {
        currentWorkspace.currentNode = treeNode;
        currentWorkspace.currentBug = treeNode.rawData;
        $scope.despRequest = {
          bugId: treeNode.rawData.bugId,
          ruleCode: treeNode.rawData.ruleCode,
          pkTask: $scope.taskId
        };

        if (!existsFile) {
          currentWorkspace.traceGrid = createTraceGrid(currentWorkspace, $scope.despRequest);
        }
        auditService.getBugDesp($scope.despRequest).then(function(result) {
          currentWorkspace.bugDesp = result;
          var filepath = currentWorkspace.currentBug.filePath;
          var encoding = currentWorkspace.currentBug.fileEncoding;
          formatCode(currentWorkspace, filepath, encoding, line, col, '', $scope.despRequest);
          var treeGridData = convertToTreeData(result.bugTraces);
          currentWorkspace.traceGrid.api.setRowData(treeGridData);
          //爆发行着色
          currentWorkspace.traceGrid.api.forEachNode(function(node) {
            if (node.rawData.codeBeginline === line &&
              node.rawData.filePath == treeNode.rawData.bugFile) {
              currentWorkspace.traceGrid.api.selectNode(node, true);
            }
          });
        });

        var auditRequest = {
          pkTask: $scope.taskId,
          bugId: treeNode.rawData.bugId
        };
        auditService.getBugAuditLogs(auditRequest).then(function(result) {
          currentWorkspace.bugAudits = result;
        });
      } else {
        currentWorkspace.editor.gotoLine(line, col, true);
      }
      currentWorkspace.active = true;
      currentWorkspace.bugCommitInfo = getBugCommitInfo(treeNode.rawData);
    }

    $scope.showWorkspace = function(workspace) {
      $scope.showMore = false;
      setAllInactive();
      workspace.active = true;
      $scope.workspaces.remove(workspace);
      $scope.workspaces.unshift(workspace);
    }


    $scope.activeWorkspace = function(workspace) {
      workspace.currentNode.treeObj.selectNode(workspace.currentNode);
    }

    $scope.close = function(tab) {
      setAllInactive();
      var index = $scope.workspaces.indexOf(tab);
      $scope.workspaces.splice(index, 1);
      index--;
      var activeIndex = index >= 0 ? index : ++index;
      if ($scope.workspaces.length > activeIndex)
        $scope.workspaces[activeIndex].active = true;

    }

    $scope.auditBug = function(workspace) {

      var info = {
        pkTask: $scope.taskId,
        bugId: workspace.currentBug.bugId,
        bugLevel: workspace.currentBug.bugLevel,
        auditResult: workspace.auditLevel,
        auditMemo: workspace.auditMemo,
        ruleCode: workspace.currentBug.ruleCode
      };
      auditService.audit(info).then(function(result) {
        workspace.auditMemo = '';
        info.auditTime = result.auditTime;
        info.userName = result.userVO.username;
        workspace.currentNode.changeStatus(result.auditResult);
        workspace.bugAudits.unshift(info);

      });

    };


    $scope.auditBugByNode = function(node, bugInfo) {

      auditService.audit(bugInfo).then(function(result) {
        node.changeStatus(result.auditResult);
      });

    };

    $scope.showBugs = function() {
      $scope.bugs = $scope.hbugs = $scope.mbugs = $scope.lbugs = undefined;
      $.fn.zTree.destroy(); //切换类型时，把所有的树销毁
      $scope.loadTree($scope.currentLevel);
    };
    $scope.advancdfilterBug = function() {
      $scope.closeAll();
      $scope.instance = uiService.modal({
        title: '高级过滤',
        templateUrl: 'app/views/resultaudit/filter-modal.html',
        okText: '搜索',
        successText: '搜索完成',
        load: function() {
          var task = $scope.checkResult.taskVO;
          var condition = {
            "pkTask": task.pkTask,
            "isBugTypeList": "T",
            "treeType": "A"
          };
          resultService.getBugTypes(condition).then(function(result) {
            var i, j, selectedChildNum;
            for (i = 0; i < result.length; i++) {
              selectedChildNum = 0;
              for (j = 0; j < result[i].sons.length; j++) {
                if ($scope.currentSearchParam && $scope.currentSearchParam.searchRuleCode && $scope.currentSearchParam.searchRuleCode.indexOf(result[i].sons[j].ruleCode) !== -1) {
                  selectedChildNum++;
                  result[i].sons[j].checked = true;
                }
              }
              if (selectedChildNum == result[i].sons.length) {
                result[i].checked = true;
              } else if (selectedChildNum) {
                result[i].checked = true;
                result[i].halfCheck = true;
              }
            }
            $scope.searchParam.bugTypes = result;
          });

          var checkAllorNot = function(flage) {
            var item = angular.extend($scope.searchParam.bugTypes);
            for (var i = 0; i < item.length; i++) {
              for (var j = 0; j < item[i].sons.length; j++) {
                item[i].sons[j].checked = flage ? true : false;
              }
              item[i].checked = flage ? true : false;
              item[i].isParent = flage ? true : false;
            }
            $scope.$broadcast('change-checked');
          };

          //xy: 全选
          $scope.allChecked = function() {
            $scope.searchParam.isAllChecked ? checkAllorNot(1) : checkAllorNot(0);
          }
          $scope.$on('remove-checked-all', function() {
            $scope.searchParam.isAllChecked = false;
          });

        },
        ok: function() {
          var task = {
            pkTask: $scope.taskId
          };
          return auditService.getTaskInfo(task).then(function(result) {
            $scope.refreshTree(false);
            $scope.checkResult = result;
            return true;
          });

        },
        scope: $scope
      });
    };


    $scope.normalfilterBug = function() {
      $scope.closeAll();
      var task = {
        pkTask: $scope.taskId
      };
      auditService.getTaskInfo(task).then(function(result) {
        $scope.checkResult = result;
      });
      $scope.refreshTree(true)
    }
    $scope.commitBug = function(commitInfo) {

      var bugInfo = {
        "isBatch": "N",
        "pkTask": $stateParams.task_id,
        "bugIdList": [
          commitInfo.bugId
        ],
        "trackerName": commitInfo.bugSystem,
        "trackerUrl": commitInfo.url,
        "trackerUserName": commitInfo.userName,
        "trackerPassword": commitInfo.pwd,
        "trackerProduct": commitInfo.product,
        "trackerComponent": commitInfo.component,
        "trackerProductVersion": commitInfo.version,
        "summary": commitInfo.summary,
        "description": commitInfo.summary,
        "assigned_to": commitInfo.assignee,
        "priority": commitInfo.priority,
        "bug_severity": "trivial"
      };
      commitInfo.disabled = true;

      auditService.commitBug(bugInfo).then(function(result) {
        commitInfo.bugUrl = result;
      }).finally(function() {
        commitInfo.disabled = false;
      });
    };
    $scope.commitBugs = function() {

      $scope.instance = uiService.modal({
        title: '批量提交bug',
        $okText: '提交',
        templateUrl: 'app/views/resultaudit/bug-commit-modal.html',
        load: function() {
          var task = $scope.checkResult.taskVO;
          $scope.commitInfo = {
            bugSystem: task.trackerName,
            url: task.trackerUrl,
            userName: task.trackerUserName,
            pwd: task.trackerPassword,
            product: task.trackerProduct,
            component: task.trackerComponent,
            version: task.trackerProductVersion,
            assignee: '',
            priority: 'Normal',
            bugNum: 0,
            auditStatus: {
              high: 'Y',
              middle: 'Y',
              low: 'Y',
              noaduit: 'Y'
            }
          };
          var condition = {
            "pkTask": task.pkTask,
            "isBugTypeList": "T",
            "treeType": "A"
          };
          resultService.getBugTypes(condition).then(function(result) {
            $scope.commitInfo.bugTypes = result;
          });
          $scope.selectBugs = function() {
            var ruleCodes = [];
            for (var i = 0; i < $scope.commitInfo.bugTypes.length; i++) {
              var nodes = $scope.commitInfo.bugTypes[i].sons;
              for (var j = 0; j < nodes.length; j++) {
                var node = nodes[j];
                if (node.checked) {
                  ruleCodes.push(node.ruleCode);
                }
              }
            }
            var data = {
              isBatch: "N",
              pkTask: $stateParams.task_id,
              highBug: $scope.commitInfo.auditStatus.high,
              midBug: $scope.commitInfo.auditStatus.middle,
              lowBug: $scope.commitInfo.auditStatus.low,
              isPostNoAuditBugs: $scope.commitInfo.auditStatus.noaduit,
              pkRuleList: ruleCodes,
              trackerName: task.trackerName,
              trackerUrl: task.trackerUrl,
              trackerUserName: task.trackerUserName,
              trackerPassword: task.trackerPassword
            };

            auditService.getCommitingBugs(data).then(function(result) {
              var num = 0;
              for (var i = 0; i < result.ruleAndbugList.length; i++) {
                var type = result.ruleAndbugList[i];
                num += type.bugList.length;
              }
              $scope.commitInfo.bugInfos = result.ruleAndbugList;
              $scope.commitInfo.bugNum = num;
            });
          }

        },
        ok: function() {
          $scope.checkResult.enableCommitBug = false;
          var bugInfo = {
            isBatch: "Y",
            pkTask: $stateParams.task_id,
            bugIdList: null,
            ruleAndbugList: $scope.commitInfo.bugInfos,
            trackerName: $scope.commitInfo.bugSystem,
            trackerUrl: $scope.commitInfo.url,
            trackerUserName: $scope.commitInfo.userName,
            trackerPassword: $scope.commitInfo.pwd,
            trackerProduct: $scope.commitInfo.product,
            trackerComponent: $scope.commitInfo.component,
            trackerProductVersion: $scope.commitInfo.version,
            summary: $scope.commitInfo.summary,
            description: $scope.commitInfo.summary,
            assigned_to: $scope.commitInfo.assignee,
            priority: $scope.commitInfo.priority,
            bug_severity: "trivial"
          };
          auditService.commitBugs(bugInfo).then(function(result) {
            $scope.checkResult.enableCommitBug = true;
          });
        },
        scope: $scope
      });

    };

    //加载目录结构，构造各个父节点信息。
    $scope.loadTree = function(level) {
      $scope.currentLevel = level;
      $scope.nodata = false;
      $scope.currentSearchParam = $scope.currentSearchParam || {};
      if ($scope[level] === undefined) {
        var task = {
          pkTask: $scope.taskId
        };
        var treeType = 'A';
        if (level == 'hbugs') {
          treeType = 'H';
        } else if (level == 'mbugs') {
          treeType = 'M';
        } else if (level == 'lbugs') {
          treeType = "L";
        }
        task.treeType = treeType;
        $scope.currentSearchParam.isMybug = myBug;
        $.extend(task, $scope.currentSearchParam);
        task.isBugTypeList = ($scope.showType === '0' ? "T" : "F");
        auditService.getAllBugsType(task).then(function(bugs) {
          //从bug系统中跳转过来的自动展开第一个节点。
          $scope.expandFirstNode = parseInt($stateParams.type) === 0 || parseInt($stateParams.type) === 1;
          $scope.openFirstNode = parseInt($stateParams.type) === 0 || parseInt($stateParams.type) === 1;
          var i, j;
          for (i = 0; i < bugs.length; i++) {
            bugs[i].open = false;
            bugs[i].isParent = true;
            bugs[i].title = "";
            bugs[i].name = bugs[i].typeName + '(' + bugs[i].num + ')';
            if ($scope.showType === '0') {
              for (j = 0; j < bugs[i].sons.length; j++) {
                bugs[i].sons[j].isParent = true;
                bugs[i].sons[j].title = "";
                bugs[i].sons[j].page = 0;
                bugs[i].sons[j].pageSize = 1000;
                bugs[i].sons[j].ruleOrFile = bugs[i].sons[j].ruleCode;
                bugs[i].sons[j].isRule = "T";
                bugs[i].sons[j].treeType = treeType;
                bugs[i].sons[j].name = bugs[i].sons[j].typeName + '(' + bugs[i].sons[j].num + ')';
              }
            } else {
              bugs[i].page = 0;
              bugs[i].pageSize = 1000;
              bugs[i].ruleOrFile = bugs[i].typeName;
              bugs[i].isRule = "F";
              bugs[i].treeType = treeType;
            }
          }
          $scope[level] = bugs;
          if (bugs.length == 0) {
            $scope.nodata = true;
          }
        });
      } else {
        if ($scope[level].length == 0) {
          $scope.nodata = true;
        }
      }
    };

    //根据所选的参数， 刷新树，病展开第一个节点
    $scope.refreshTree = function(isQuickSearch) {
      $scope.bugs = $scope.hbugs = $scope.mbugs = $scope.lbugs = undefined;
      $.fn.zTree.destroy(); //查询时，把所有的树销毁
      $scope.currentSearchParam = {
        isMybug: myBug
      };

      if (isQuickSearch) {
        $scope.searchParam.level = [];
        $scope.searchParam.fileName = '';
        $scope.searchParam.ruleCode = [];
        if ($scope.searchParam.str) {
          $scope.currentSearchParam.searchStr = $scope.searchParam.str;
        }
      } else {
        $scope.searchParam.str = '';
        var ruleCodes = [];
        var levels = [];
        var key;
        for (var i = 0; i < $scope.searchParam.bugTypes.length; i++) {
          var nodes = $scope.searchParam.bugTypes[i].sons;
          for (var j = 0; j < nodes.length; j++) {
            var node = nodes[j];
            if (node.checked) {
              ruleCodes.push(node.ruleCode);
            }
          }
        }
        if (ruleCodes.length) {
          $scope.currentSearchParam.searchRuleCode = ruleCodes;
        }
        if ($scope.searchParam.fileName) {
          $scope.currentSearchParam.searchFileName = $scope.searchParam.fileName;
        }
        for (key in $scope.searchParam.auditStatus) {
          if ($scope.searchParam.auditStatus[key] !== false) {
            levels.push($scope.searchParam.auditStatus[key]);
          }
        }
        if (levels.length) {
          $scope.currentSearchParam.searchLevel = levels;
        }
      }
      if (!$.isEmptyObject($scope.currentSearchParam)) {
        $scope.expandFirstNode = true;
      } else {
        $scope.expandFirstNode = false;
      }

      $scope.loadTree($scope.currentLevel);
    };

    (function() {
      setAllInactive();
      var task = {
        pkTask: $scope.taskId
      };

      if (myBug === 'Y') { //从我的bug调整过来
        auditService.getMyTaskInfo(task).then(function(result) {
          $scope.checkResult = result;
          $scope.checkResult.enableCommitBug = true;
          $scope.controlLevel.showH = true;
        });
      } else {
        auditService.getTaskInfo(task).then(function(result) {
          $scope.checkResult = result;
          $scope.checkResult.enableCommitBug = true;
          var id = $stateParams.id;
          if (id) { //从bug管理系统中跳转过来
            $scope.currentSearchParam = {};
            var type = parseInt($stateParams.type); //0:按照bugid查找；1:按照规则id查找
            var level = $stateParams.level;
            if (type === 0)
              $scope.currentSearchParam.bugId = id;
            else
              $scope.currentSearchParam.searchRuleCode = [id];
            $scope.controlLevel = {
              showH: level == 'hbugs',
              showM: level == 'mbugs',
              showL: level == 'lbugs',
              showA: level == 'abugs'
            };
          } else {
            //切换高、中、低会调用$scope.loadTree
            $scope.controlLevel.showH = true;
          }
        });
      }

      //$scope.showBugs();
      //auditService.getBugs(task).then(function (bugs) {
      //    $scope.rawBugs=bugs;
      //    $scope.showBugs();
      //});
    })();

  }
]);