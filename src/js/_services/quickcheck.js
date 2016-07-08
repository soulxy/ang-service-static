/**
 * Created by Kuroky360 on 15/8/24.
 */
app.service('checkService', function($rootScope, ajax, httpService) {
  this.createTask = function(data) {
    /*return {
        then: function (success) {
            ajax.post('quickcheck/check',data).then(function (data) { success(data.data);});
        }
    }*/
    return httpService.post('quickcheck/check', data);
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
      return datas
    });
  }

  this.getProgress = function(data) {
    return httpService.post('schedule/progress', data)
  }

  this.deletes = function(data) {
    return httpService.post('quickcheck/delete', data)
  }
  this.testConnect = function(data) {
    return httpService.post('code/testconnect', data)
  }
  this.modifyPower = function(data) {
    return httpService.post('quickcheck/perm', data)
  }
  this.configBugSystem = function(task) {
    return httpService.post('quickcheck/tracker', task)
  }
  this.queryperm = function(task) {
    return httpService.post('quickcheck/queryperm', task)
  }
});