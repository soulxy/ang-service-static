/**
 * Created by Kuroky360 on 15/8/24.
 */
app.service('sysService', function($rootScope, ajax, httpService, $timeout, $q, $sce) {
  this.getNav = function() {
    var data = [{
      "id": 1,
      "title": "用户管理",
      'hide': !$rootScope.hasPower('System_Perm'),
      "nodes": [{
        "id": 21,
        "title": "部门",
        'url': "#/system/dept",
        'hide': !$rootScope.hasPower('System_Org')
      }, {
        "id": 22,
        "title": "用户",
        'url': "#/system/user",
        'hide': !$rootScope.hasPower('System_User')
      }, {
        "id": 22,
        "title": "角色",
        'url': "#/system/role",
        'hide': !$rootScope.hasPower('System_Role')
      }]
    }, {
      "id": 2,
      "title": "检测模板管理",
      'hide': !$rootScope.hasPower('System_Tpl'),
      "nodes": [{
        "id": 21,
        "title": "缺陷检测",
        'url': "#/system/fault-tpl",
        'hide': !$rootScope.hasPower('System_BugTpl')
      }]
    }, {
      "id": 3,
      "title": "日志管理",
      'hide': !$rootScope.hasPower('System_Log'),
      "nodes": [{
        "id": 21,
        "title": "操作日志",
        'url': "#/system/olog",
        'hide': !$rootScope.hasPower('System_OptLog')
      }, {
        "id": 22,
        "title": "异常日志",
        'url': "#/system/elog",
        'hide': !$rootScope.hasPower('System_ErrorLog')
      }, ]
    }, {
      "id": 3,
      "title": "引擎管理",
      'hide': !$rootScope.hasPower('System_Engine'),
      "nodes": [{
        "title": "引擎查询",
        "url": '#/system/engine'
      }]
    }, {
      "id": 4,
      "title": "系统配置",
      'hide': !$rootScope.hasPower('System_Mail'),
      "nodes": [{
        "title": "邮箱配置",
        "url": '#/system/email'
      }]
    }];
    return {
      then: function(callback) {
        callback(data);
      }
    }
  };

  this.getDepts = function() {
    return httpService.post("org/queryallorg");
  };
  this.addDept = function(data) {
    return httpService.post("org/addorg", data);
  };

  this.editDept = function(data) {
    return httpService.post("org/updateorg", data);
  };

  this.deleteDepts = function(data) {
    return httpService.post("org/deleteorgs", data);
  };

  this.getDeptTree = function() {
    return httpService.post("org/queryorgtree");
  };

  //--------------------------用户--------------------------

  this.getUsers = function() {
    return httpService.post("user/queryalluser");
  };
  this.addUser = function(data) {
    return httpService.post("user/adduser", data);
  };

  this.editUser = function(data) {
    return httpService.post("user/updateuser", data);
  };

  this.deleteUsers = function(data) {
    return httpService.post("user/deleteusers", data);
  };
  this.getUserTree = function() {
    return httpService.post("user/queryusertree");
  };
  this.resetPwd = function(user) {
    return httpService.post("user/resetuserpassword", user);
  };
  //--------------------------角色--------------------------

  this.getRoles = function() {
    return httpService.post("role/queryallrole");
  };
  this.addRole = function(data) {
    /* return {
         then: function (success) {
             ajax.post('role/addrole',data).then(function (data) { success(data.data);});
         }
     }*/
    return httpService.post('role/addrole', data);
  };

  this.editRole = function(data) {
    return httpService.post('role/updaterole', data);
  };

  this.deleteRoles = function(data) {
    return httpService.post('role/deleteroles', data);
  };

  //-----------------------------权限--------------------------
  this.getResource = function() {
    return {
      then: function(success) {
        ajax.post('resource/queryallresource', null).then(function(data) {
          success(data.data);
        });
      }
    }
  };

  //---------------------------检测模板------------------------
  this.getTpls = function(type) {
    return httpService.post('tpl/query', type);
  };

  this.getTpl = function(pk) {

    return httpService.post('tpl/get', pk);
  };

  this.addTpl = function(data) {
    return httpService.post('tpl/add', data);
  };

  this.editTpl = function(data) {
    return httpService.post('tpl/update', data);
  };

  this.deleteTpls = function(data) {
    return httpService.post('tpl/delAll', data);
  };

  this.getRules = function(data) {
    return httpService.post('rule/query', data);
  };
  this.getAllRules = function() {
    return httpService.post('rule/queryAll');
  };
  this.getStandards = function(data) {
    return httpService.post('rule/queryStandards', data);
  };

  /*日志*/
  this.getOperateLogs = function() {
    return httpService.post('log/queryoperationlog');
  };

  this.getExceptionLogs = function() {
    return httpService.post('log/queryerrorlog');
  };

  this.getEngines = function() {
    return httpService.post('engine/queryallmachine');
  };

  this.getEnginesAndCheckTypes = function() {
    /* var lang=[{
     lang:1,
     checkTypes:[0,1,2]
     }]*/

    return this.getEngines().then(function(result) {
      var map = {};
      var data = [1, 2, 0, 4, 3]; //语言顺序数组

      angular.forEach(result, function(machish) {
        angular.forEach(machish.engines, function(engine) {
          if (!map[engine.language]) {
            var pos = data.indexOf(engine.language);
            var lang = {
              lang: engine.language,
              checkTypes: [engine.checkType]
            };
            map[engine.language] = lang;
            data[pos] = lang;
          } else {
            var lang = map[engine.language];
            if (lang.checkTypes.indexOf(engine.checkType) == -1) {
              lang.checkTypes.push(engine.checkType);
            }
          }
        });
      });

      var langAndTypes = [];
      angular.forEach(data, function(item) {
        if (isNaN(item))
          langAndTypes.push(item);
      });
      return {
        engines: result,
        data: langAndTypes
      };
    });
  };

  this.getCheckLangs = function() {
    var map = {
      0: 2,
      1: 0,
      2: 1,
      3: 4,
      4: 3
    }; //语言顺序 lang:order
    var langs = [];

    return this.getEngines().then(function(result) {
      angular.forEach(result, function(machish) {
        angular.forEach(machish.engines, function(engine) {
          var pos = langs.indexOf(engine.language);
          if (pos == -1) {
            langs.push(engine.language);
          }
        });
      });
      langs.sort(function(a, b) {
        return map[a] - map[b];
      });
      return langs
    });
  }

  this.updateEngineProcessNum = function(data) {

    var postData = {
      concurrentNum: data.machineConcurrentNum,
      engineIp: data.machineIp
    };

    return httpService.post('engine/setupconcurrentnum', postData);
  };
  this.configEmail = function(data, successCallback, errorCallback) {
    return httpService.post('mail/addMailServer', data).then(successCallback, errorCallback);
  }
  this.getEmailConfig = function() {
    return httpService.post('mail/queryMailServer');
  }
  this.getEnv = function() {
    return httpService.post('env/getenv');
  }
  this.getSysTime = function() {
    return httpService.post('env/getsystime');
  }
});