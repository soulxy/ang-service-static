app.controller('quickCheckCtrl', ['resultService', 'checkType', '$rootScope', '$scope', '$location', 'uiService', 'sysService', 'checkService', '$filter', 'reportService', 'traverseTree', '$timeout',
  function(resultService, checkType, $rootScope, $scope, $location, uiService, sysService, checkService, $filter, reportService, traverseTree, $timeout) {

    $scope.action_search = false;
    $scope.condition = {
      taskName: '',
      createPerson: '',
      lang: -1,
      status: -1,
      stime: '',
      etime: '',
      minBugCount: '',
      maxBugCount: '',
      isFilter: false
    };
    $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1
    };
    /*$scope.minDate=new Date();
    $scope.maxDate=new Date(2020,5,22);*/
    $scope.openFrom = function($event) {
      $scope.condition.fromOpened = true;
    };
    $scope.openEnd = function($event) {
      $scope.condition.endOpened = true;
    };

    $scope.clearCondition = function() {
      $scope.condition.taskName = '';
      $scope.condition.stime = '';
      $scope.condition.etime = '';
      $scope.condition.lang = -1;
      $scope.condition.status = -1;
      $scope.condition.minBugCount = '';
      $scope.condition.maxBugCount = '';
      $scope.condition.isFilter = false;
      $scope.condition.user_name = '';
      $scope.tasks = $scope.list;
    };
    $scope.search = function() {
      $scope.condition.isFilter = true;
      $scope.tasks = $filter('taskFilter')($scope.list, $scope.condition);
    };

    $scope.searchValidation = function() {
      if ($scope.condition.stime > $scope.condition.etime)
        return false;
      if ($scope.condition.minBugCount > $scope.condition.maxBugCount)
        return false;

      return true;
    };

    $scope.search_toggle = function() {
      $scope.action_search = !$scope.action_search;
    }
    $scope.removes = function() {
      if (window.confirm("确定要删除吗？")) {
        var datas = [];
        angular.forEach($scope.tasksToDisplay, function(item) {
          if (item.checked) {
            datas.push(item.taskVO); //{pkQuick: item.pkQuick}
          }
        });
        if (datas.length > 0) {
          checkService.deletes(datas).then(function(data) {
            $scope.checkModel.checkall = false;
            load();
          });
        }
      }
    }
    $scope.exportReport = function(task) {
      uiService.modal({
        okText: '导出报告',
        title: '导出报告',
        successText: '导出成功',
        templateUrl: 'app/views/report/report-config-modal.html',
        load: function() {
          $scope.reportParam = {
            pkTask: task.pkTask,
            format: 0,
            ifOnlySum: "Y",
            pHighShow: "Y",
            pMidShow: "Y",
            pLowShow: "Y",
            levelFirst: "Y",
            ifAdv: "N",
            ifTrace: "N",
            rpName: task.codeName,
          };
          var condition = {
            "pkTask": task.pkTask,
            "isBugTypeList": "T",
            "treeType": "A"
          };
          resultService.getBugTypes(condition).then(function(result) {
            traverseTree(result, {
              childrenAttribute: 'sons'
            }, function(node) {
              node.checked = true;
            });
            $scope.bugTypes = result;
          });
        },
        ok: function() {
          var ruleCodes = [];
          for (var i = 0; i < $scope.bugTypes.length; i++) {
            var nodes = $scope.bugTypes[i].sons;
            for (var j = 0; j < nodes.length; j++) {
              var node = nodes[j];
              if (node.checked) {
                ruleCodes.push(node.ruleCode);
              }
            }
          }
          $scope.reportParam.ruleCodeList = ruleCodes;
          return reportService.exportReport($scope.reportParam).then(function(result) {
            $location.path('/report');
          });
        },
        scope: $scope
      });
    }
    $scope.exportReportSy = function(task) {
      uiService.modal({
        okText: '导出报告',
        title: '导出报告',
        successText: '导出成功',
        templateUrl: 'app/views/report/reportsy-config-modal.html',
        load: function() {
          $scope.reportParam = {
            pkTask: task.pkTask,
            format: '0',
            /* ifshowAduitonly: "Y",*/
            rpName: task.codeName,
          };
        },
        ok: function() {
          return reportService.exportReportSy($scope.reportParam).then(function(result) {
            $location.path('/report');
          });
        },
        scope: $scope
      });
    }
    $scope.modifyPower = function(check) {
      uiService.modal({
        title: '访问权限',
        templateUrl: 'app/views/common/user-power-modal.html',
        load: function() {
          $scope.param = {
            power: check.quickPerm
          };
          delete check.$$hashKey;
          delete check.checked;
          checkService.queryperm(check).then(function(perms) {
            sysService.getUserTree().then(function(result) {
              if (!result || result.length == 0)
                $scope.param.users = [];
              else {
                traverseTree(result, function(item) {
                  if (item.nodetype == 1) {
                    if (item.datapk === check.pkUser) { //创建人默认选中且不能编辑
                      item.chkDisabled = true;
                      item.checked = true;
                    } else if (perms.userPks && perms.userPks.indexOf(item.datapk) != -1) {
                      item.checked = true;
                    }
                  } else if (!item.children || item.children.length == 0) {
                    item.chkDisabled = true;
                  }

                });
              }
              $scope.param.users = result;
            });

          });

        },
        ok: function(formData) {
          var data = {
            pkQuick: check.pkQuick,
            quickPerm: $scope.param.power,
            userPks: []
          };

          if ($scope.param.power == 0) {
            data.userPks.push($rootScope.currentUser.pkUser);
          } else if ($scope.param.power == 1) {
            traverseTree($scope.param.users, function(node) {
              if (node.checked && node.nodetype == 1) {
                data.userPks.push(node.datapk);
              }
            });
            if (data.userPks.length == 0) {
              uiService.alert("请选择人员");
              return false;
            }
          }

          return checkService.modifyPower(data).then(function(result) {
            check.quickPerm = result.quickPerm;
          });
        },
        scope: $scope
      });
    }

    $scope.configBugSystem = function(task) {
      uiService.modal({
        title: '配置缺陷跟踪系统',
        templateUrl: 'app/views/resultaudit/bug-system-config.html',
        load: function() {
          $scope.bugConfig = {
            systemType: task.trackerName,
            url: task.trackerUrl,
            userName: task.trackerUserName,
            pwd: task.trackerPassword,
            product: task.trackerProduct,
            component: task.trackerComponent,
            version: task.trackerProductVersion
          };
        },
        ok: function() {
          task.trackerName = $scope.bugConfig.systemType;
          task.trackerUrl = $scope.bugConfig.url;
          task.trackerUserName = $scope.bugConfig.userName;
          task.trackerPassword = $scope.bugConfig.pwd;
          task.trackerProduct = $scope.bugConfig.product;
          task.trackerComponent = $scope.bugConfig.component;
          task.trackerProductVersion = $scope.bugConfig.version;
          delete task.$hashKey;
          delete task.checked;
          return checkService.configBugSystem(task).then(function(result) {

          });
        },
        scope: $scope
      });
    }

    function progress() {
      $rootScope.showProgress = true;
      angular.forEach($scope.tasks, function(item) {
        updateProgress(item.taskVO);
      });
    }

    function updateProgress(task) {
      if ($location.$$path.indexOf('quickcheck') == -1)
        return;
      if (task.taskStatus == 0 || task.taskStatus == 1) {
        checkService.getProgress(task.pkTask).then(function(result) {
          task.taskStatus = result.taskStatus;
          task.problemNum = result.problemNum;
          task.problemNum1 = result.problemNum1;
          task.problemNum3 = result.problemNum3;
          task.problemNum5 = result.problemNum5;
          task.taskEndTime = result.taskEndTime;
          task.componentNum = result.componentNum;
          task.vulComponentNum = result.vulComponentNum;
          task.taskResultDesc = result.taskResultDesc;
          task.progress = parseFloat(result.progress).toFixed(1);
          $timeout(function() {
            updateProgress(task);
          }, 2000);

        });

      }
    }

    function initSelect(tree, selectData) {
      traverseTree(tree, {
        childrenAttribute: 'nodes'
      }, function(node) {
        for (var i = 0; i < selectData.length; i++) {
          var data = selectData[i];
          if (node.value !== undefined && node.value == rule.data) {
            node.checked = true;
            break;
          }
        }
      });
    }

    function load() {
      checkService.list(checkType).then(function(data) {
        angular.forEach(data, function(item) {
          item.disabled = item.disabled === 'Y';
        });
        $scope.tasks = data;
        $scope.list = data;
        progress();
      });
    };
    load();

  }
]);
app.controller('configCheckCtrl', ['$stateParams', '$rootScope', '$scope', '$location', 'uiService', 'sysService', 'checkService', '$filter', 'traverseTree',
  function($stateParams, $rootScope, $scope, $location, uiService, sysService, checkService, $filter, traverseTree) {

    var checkType = $stateParams.checkType;
    $scope.action_function = false;
    $scope.action_upload = false;
    $scope.action_uploading = false;
    $scope.action_cancel = false;
    $scope.checkTypes = {};
    $scope.code = {
      getCodeType: 0, //LOCAL(0,"本地上传"),SVN(1,"SVN获取"),GIT(2,"Git获取");
      codeName: "",
      pkCode: "",
      savePath: "",
      language: 1, //JAVA(0,"Java/JSP"),C(1,"C/C++"),CSharp(2,"C#"),Python(3,"Python"),PHP(4,"PHP");
      isJ2ee: 'Y', //Y\N
      jdkVersion: 4, //JDK8(4,"JDK8")JDK7(0,"JDK7"),JDK6(1,"JDK6"),JDK5(2,"JDK5"),JDK4(3,"JDK1.4");
      csharpCompiler: 0,
      csharpFilePath: "",
      cCompilerCmd: "",
      svnGitUri: "",
      svnGitUserName: "",
      svnGitPwd: ""
    };
    $scope.codeRepository = {};
    $scope.filepath = {};
    $scope.codepaths = {}; //缓存各个语言上传文件的路径
    $scope.safeFns = [];
    $scope.quick = {
      quickPerm: 0,
      userPks: [],
    };
    $scope.quick1 = {
      checkType: 0,
      //pkTemplate: 1,
      quickPerm: $scope.quick.quickPerm,
      userPks: $scope.quick.userPks,
      safeFunctionVOs: []
    };

    $scope.selectUserIdentifys = [];

    $scope.show_add = function() {
      $scope.action_add = !$scope.action_add;
    }
    $scope.show_function = function() {
      $scope.action_function = !$scope.action_function;
    }
    $scope.OneInit = function() {
      var filterCodition = {
        standardType: $scope.safeFn.checkType,
        language: $scope.code.language
      };
      $scope.selOptions.one = $filter('unique')($filter('filter')($scope.rules, filterCodition), 'ruleType');
      if (!$scope.ruleObj.ruleType) {
        $scope.ruleObj.ruleType = $scope.selOptions.one.length > 0 ? $scope.selOptions.one[0].ruleType : null;
      }
    };
    $scope.TwoInit = function(refresh) {
      if (refresh)
        $scope.safeFn.ruleVO = null;
      var filterCodition = {
        standardType: $scope.safeFn.checkType,
        language: $scope.code.language,
        ruleType: $scope.ruleObj.ruleType
      };

      $scope.selOptions.two = $filter('filter')($scope.rules, filterCodition);
      if (!$scope.safeFn.ruleVO) {
        $scope.safeFn.ruleVO = $scope.selOptions.two.length > 0 ? $scope.selOptions.two[0] : null;
      }
    };
    $scope.testConnect = function(data) {
      return checkService.testConnect(data).then(function(result) {
        uiService.alert("测试成功", true);
        $scope.action_success = true;
      });
    };
    $scope.show_function_win = function(index, fn) {
      uiService.modal({
        title: '函数白名单',
        templateUrl: 'app/views/common/safe-fun-modal.html',
        load: function() {
          $scope.selOptions = {
            top: [],
            one: [],
            two: []
          };


          $scope.ruleObj = {
            standardName: null,
            ruleType: null
          };
          $scope.safeFn = {
            ruleVO: null,
            checkType: 0
          };

          if (fn) {
            var newFn = jQuery.extend(true, {}, fn); //深克隆
            $scope.ruleObj.ruleType = fn.ruleVO.ruleType;
            $scope.safeFn = newFn;
          }
        },
        ok: function(funData) {
          $scope.safeFn.pkRule = $scope.safeFn.ruleVO.pkRule; //添加pkRule属性
          $scope.safeFn.lang = $scope.code.language; //添加pkRule属性
          if (fn) {
            $scope.safeFns[index] = $scope.safeFn;
          } else {
            $scope.safeFns.push($scope.safeFn);
          }
        },
        scope: $scope
      });
    }
    $scope.removefun = function() {
      angular.forEach($scope.safeFns.slice(), function(item) {
        if (item.checked) {
          $scope.safeFns.splice($scope.safeFns.indexOf(item), 1);
        }
        delete item.checked;
      });
      $scope.checkModel.checkall = false;

    };

    $scope.show_user = function(rawPerm) {
      var instance = uiService.modal({
        title: '用户',
        templateUrl: 'app/views/common/user-modal.html',
        load: function() {
          $scope.users = [];
          return sysService.getUserTree().then(function(result) {
            if (result) {
              traverseTree(result, function(node) {
                if (node.nodetype == 1) { //用户节点
                  if (node.datapk == $rootScope.currentUser.pkUser) { //默认选中创建人且不能编辑
                    node.chkDisabled = true;
                    node.checked = true;
                  } else if ($scope.quick.userPks.indexOf(node.datapk) != -1) {
                    node.checked = true;
                  }
                } else if (!node.children || node.children.length == 0) {
                  node.chkDisabled = true;
                }
              });
            }
            $scope.users = result;
          }).then(function() {
            return $scope.users && $scope.users.length > 0;
          });
        },
        cancel: function() {
          $scope.quick.quickPerm = rawPerm;
        },
        ok: function() {
          $scope.rawPerm = 1;
          $scope.quick.userPks = [];
          if ($scope.users) {
            traverseTree($scope.users, function(node) {
              if (node.checked && node.nodetype == 1) {
                $scope.quick.userPks.push(node.datapk);
              }
            });
          }
          $scope.quick.userPks.push($rootScope.currentUser.pkUser);
        },
        scope: $scope
      });
    }
    $scope.cancelCreate = function() {
      var returnUrl = '/quickcheck';
      $location.path(returnUrl);
    }
    $scope.create_task = function() {
      function done() {
        $scope.quicks = [];
        if ($scope.langs.length == 0) {
          uiService.alert('没有可用的检查引擎');
          return;
        }

        $scope.quick1.safeFunctionVOs = filterSafeFun(0);
        if (!$scope.quick1.pkTemplate || $scope.quick1.pkTemplate == "") {
          uiService.alert('请选择缺陷检测模板');
          return;
        }

        $scope.quick1.quickPerm = $scope.quick.quickPerm;
        $scope.quicks.push($scope.quick1);


        if ($scope.quick.quickPerm != 1) {
          $scope.quick.userPks = [];
        }
        if ($scope.codepaths[$scope.code.language])
          $scope.code.savePath = $scope.codepaths[$scope.code.language];
        var data = {
          codeVO: $scope.code,
          quickVOs: $scope.quicks
        };
        checkService.createTask(data).then(function(returnTasks) {
          var returnUrl = "/quickcheck";
          $location.path(returnUrl);
        });

      }

      if ($scope.code.getCodeType != 0) {
        $scope.code.svnGitUri = $scope.codeRepository[$scope.code.getCodeType].svnGitUri;
        $scope.code.svnGitUserName = $scope.codeRepository[$scope.code.getCodeType].svnGitUserName;
        $scope.code.svnGitPwd = $scope.codeRepository[$scope.code.getCodeType].svnGitPwd;
        checkService.testConnect($scope.code).then(function() {
          done();
        });
      } else
        done();
    }

    $scope.changeLang = function() {
      // $scope.filepath[$scope.code.language] = '';
      if ($scope.code.language == 1) {
        $scope.code.getCodeType = 0;
      }
      $scope.action_complete = false;
      setDefaultBugTpl();
    }

    function filterSafeFun(checkType) {
      var funs = [];
      angular.forEach($scope.safeFns, function(item) {
        delete item.$$hashKey;
        if (item.checkType == checkType && item.lang == $scope.code.language) {
          delete item.lang;
          funs.push(item);
        }
      });
      return funs;
    }

    function setDefaultBugTpl() {
      var tpls = $filter('filter')($scope.faultTpls, {
        templateLang: $scope.code.language
      });
      if (tpls && tpls.length > 0) {
        $scope.quick1.pkTemplate = tpls[0].pkTemplate;
      } else {
        $scope.quick1.pkTemplate = null;
      }
    }
    var xhrMgr = null;
    $scope.upload_cancel = function() {
      $scope.filepath[$scope.code.language] = "";
      if (xhrMgr) {
        xhrMgr.abort();
        xhrMgr = null;
      }
    };
    $scope.safeApply = function(fn) {
      var phase = this.$root.$$phase;
      if (phase == '$apply' || phase == '$digest') {
        if (fn && (typeof(fn) === 'function')) {
          fn();
        }
      } else {
        this.$apply(fn);
      }
    };
    $('#fileUpload').fileupload({
      dataType: 'json',
      formData: {
        'data': JSON.stringify($scope.code)
      },
      add: function(e, data) {
        if ($scope.action_uploading)
          return;
        var fileName = data.files[0].name;
        var reg = /.+\.zip$/g;
        if (!reg.exec(fileName)) {
          $scope.$apply(function() {
            $scope.filepath[$scope.code.language] = fileName;
            $scope.action_complete = true;
            $scope.action_success = false;
            $scope.upload_error = "文件格式错误，只能上传*.zip格式文件";
          });
          return;
        }
        $scope.$apply(function() {
          $scope.action_upload = true;
          $scope.action_complete = false;
          $scope.filepath[$scope.code.language] = fileName;
        });
        //$('#upload-btn').unbind('click').bind('click', {}, function () {
        $scope.$apply(function() {
          $scope.action_upload = false;
          $scope.action_uploading = true;
          $scope.action_cancel = true;
          $scope.action_complete = false;
        });
        xhrMgr = data.submit()
          .success(function(result, textStatus, jqXHR) {
            console.log('success');
            if (result.retCode == '000') {
              $scope.safeApply(function() {
                $scope.codepaths[$scope.code.language] = result.data.savePath;
                // $scope.code.savePath = result.data.savePath;
                $scope.action_success = true;
              });
            } else {
              $scope.safeApply(function() {
                $scope.action_success = false;
                $scope.upload_error = "上传失败： " + result.retInfo;
              });
            }

          })
          .error(function(jqXHR, textStatus, errorThrown) {
            var header = jqXHR.getResponseHeader('login');

            //超时重新登陆
            if (header && header == 'login') {
              var hostUrl = $location.absUrl();
              hostUrl = hostUrl.substring(0, hostUrl.indexOf('#'));
              window.location.href = hostUrl;
              return;
            }
            $scope.safeApply(function() {
              $scope.action_success = false;
              if (errorThrown == 'abort') {
                errorThrown = '用户取消'; //换成更好看的文字
              } else {
                errorThrown = '用户取消';
              }
              $scope.upload_error = "上传失败： " + errorThrown;
            });
          })
          .complete(function(result, textStatus, jqXHR) {
            console.log('complete');
            xhrMgr = null;
            $('#fileUpload').val('');
            $('#progress .bar').css('width', 0);
            $('#progress .bar').text('');
            $scope.safeApply(function() {
              $scope.action_upload = false;
              $scope.action_cancel = false;
              $scope.action_uploading = false;
              $scope.action_complete = true;
            });
          });
        // });
      },
      progressall: function(e, data) {
        console.log('progressall');
        var progress = parseInt(data.loaded / data.total * 100, 10);
        $('#progress .bar').css('width', progress + '%');
        $('#progress .bar').text(progress + '%');
      },
      done: function(e, data) {
        console.log('done');
      }
    });

    function load() {
      sysService.getAllRules().then(function(data) {
        $scope.rules = data;
      });

      sysService.getEnginesAndCheckTypes().then(function(result) {
        $scope.langs = result.data;
        if ($scope.langs && $scope.langs.length > 0) {
          $scope.code.language = $scope.langs[0].lang;
        }

        sysService.getTpls(0).then(function(data) {
          $scope.faultTpls = data;
          setDefaultBugTpl();
        });
      });
    }
    load();
  }
]);