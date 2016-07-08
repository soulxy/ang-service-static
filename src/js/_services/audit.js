/**
 * Created by Kuroky360 on 15/8/24.
 */
app.service('auditService', function($rootScope, ajax, httpService, $timeout, $q, $sce) {

  this.createTask = function(data) {
    return httpService.post('quickcheck/check', data);
    /*return {
        then: function (success) {
            ajax.post('quickcheck/check',data).then(function (data) { success(data.data);});
        }
    }*/
  }

  this.createCode = function(data) {
    return httpService.post('code/addcode', data);
  }

  this.uploadCode = function(data) {
    return httpService.post('code/upload', data);
  }

  this.list = function(type) {
    return httpService.post('quickcheck/list', null).then(function(data) {
      var datas = [];
      angular.forEach(data, function(item) {
        if (item.checkType == type)
          datas.push(item);
      });
      return datas;
    });
  }

  this.deletes = function(data) {
    return httpService.post('quickcheck/delete', data);
  }

  this.getBugs = function(task) {
    return httpService.post('result/queryAllBugs', task);
  }
  this.getAllBugsType = function(task) {
    return httpService.post('result/queryAllBugsType', task);
  }

  this.getTaskInfo = function(task) {
    return httpService.post('result/queryOneTaskInfo', task);
  }
  this.getMyTaskInfo = function(task) {
    return httpService.post('result/queryOneTaskInfoMybug', task);
  }
  this.audit = function(auditInfo) {
    return httpService.post('result/auditBug', auditInfo);
  }
  this.getBugAuditLogs = function(info) {
    return httpService.post('result/queryBugAuditLogs', info);
  }

  this.getBugDesp = function(info) {
    return httpService.post('result/queryBugDesp', info);
  }

  this.getSourceCode = function(fileinfo) {
    return httpService.post('result/getFileConetext', fileinfo);
  }

  this.getTraceInfo = function() {
    return httpService.post('result/queryAllBugsAndTraces');
  }

  this.audits = function(auditInfos) {
    return httpService.post('result/auditBugs', auditInfos);
  }

  this.getSyBugs = function(task) {
    return httpService.post('result/queryAllCPEs', task);
  }
  this.getCVEInfo = function(cveName) {
    return httpService.post('result/queryCVEDesp', cveName);
  }

  this.auditSY = function(auditInfo) {
    return httpService.post('result/auditCpe', auditInfo);
  }

  this.commitBug = function(bugInfo) {
    return httpService.post('result/postBugToTkTool', bugInfo);
  }

  this.getCommitingBugs = function(bugInfo) {
    return httpService.post('result/getBugsToTkTool', bugInfo);
  }
  this.commitBugs = function(bugInfo) {
    return httpService.post('result/postBugToTkTool', bugInfo);
  }

});
app.service('resultService', function($rootScope, httpService) {

  this.getBugTypes = function(data) {
    return httpService.post('result/queryAllBugsType', data);
  }
});