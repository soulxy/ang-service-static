app.controller('reportCtrl', ['$rootScope', '$scope', '$location', '$filter', 'reportService', 'uiService',
  function($rootScope, $scope, $location, $filter, reportService, uiService) {
    $scope.condition = {
      reportName: '',
      userName: '',
      reportStatus: -1,
      extension: -1,
      checkType: -1,
      stime: '',
      etime: '',
      isFilter: false
    };
    $scope.clearCondition = function() {
      $scope.condition.reportName = '';
      $scope.condition.userName = '';
      $scope.condition.stime = '';
      $scope.condition.etime = '';
      $scope.condition.reportStatus = -1;
      $scope.condition.extension = -1;
      $scope.condition.checkType = -1;
      $scope.condition.isFilter = false;
      $scope.reports = $scope.list;
    };
    $scope.search = function() {
      $scope.condition.isFilter = true;
      $scope.reports = $filter('reportFilter')($scope.list, $scope.condition);
    };
    $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1
    };
    $scope.openFrom = function($event) {
      $scope.condition.fromOpened = true;
    };
    $scope.openEnd = function($event) {
      $scope.condition.endOpened = true;
    };
    $scope.load = function() {
      if ($scope.checkModel) {
        $scope.checkModel.checkall = false;
      }
      reportService.getReports().then(function(result) {
        $scope.reports = result;
        $scope.list = result;
      });
    }
    $scope.download = function(data) {
      //下载报告
      var hostUrl = $location.absUrl();
      hostUrl = hostUrl.substring(0, hostUrl.indexOf('#'));
      var url = hostUrl + 'report/downloadRp?data={"pkReport":"' + data + '"}';
      window.location.href = url;
    }
    $scope.removes = function() {
      if (window.confirm("确定要删除吗？")) {
        var datas = [];
        angular.forEach($scope.reportsToDisplay, function(item) {
          if (item.checked) {
            delete item.checked;
            delete item.$$hashKey;
            datas.push(item);
          }
        });
        if (datas.length > 0) {
          reportService.deletes(datas).then(function(data) {
            $scope.checkModel.checkall = false;
            $scope.load();
          }, function() {
            $scope.checkModel.checkall = false;
          });
        }
      }
    }
    $scope.sendMail = function(report) {
      $scope.instance = uiService.modal({
        title: '发送邮件',
        okText: '发送',
        templateUrl: 'app/views/report/report-mail-modal.html',
        successText: '发送成功',
        load: function() {
          $scope.msg = {
            subject: '<codename>源代码安全检测报告',
            sendHtml: '',
            receiveUser: '',
            ccUser: '',
            attachment: report.savePath
          }

        },
        ok: function(formData) {
          return reportService.sendMail($scope.msg).then(function(result) {
            //$scope.reports = result;
          });
        },
        scope: $scope
      });
    };
    $scope.load();
  }
])