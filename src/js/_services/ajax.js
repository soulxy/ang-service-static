app.service('ajax', ["$http", "uiService", function($http, uiService) {
  this.postJson = function(url, data, callback) {
    callback = callback || {};
    url = app.url(url);
    var jsonStr = JSON.stringify(data);
    var data = {
      data: jsonStr
    };

    var transFn = function(data) {
        return $.param(data);
      },
      postCfg = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        transformRequest: transFn
      };

    $http.post(url, data, postCfg).success(function(data, status, headers, config) {
      if (data.retCode == '000') {
        if (callback.success) callback.success(data);
      } else
        uiService.alert(data.retInfo);
      debug(data);
    }).
    error(function(data, status, headers, config) {
      if (callback.error) callback.error();
      else
        uiService.alert("请求失败");
      debug(data);
    });
  }
  var _this = this;
  this.post = function(url, data) {
    return {
      then: function(action) {
        action = {
          success: action
        };
        _this.postJson(url, data, action);
      }
    };
  }
}]);
app.service('httpService', function($http, $q, $rootScope, uiService) {
  var self = this;
  this.http = function(type, url, data, options) {
    var str = JSON.stringify(data);
    data = {
      data: str
    };
    var promise = $http[type](url, $.param(data), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return promise.then(function(response) {
      var data = response.data;
      debug(data);
      if (data.retCode != '000') {
        uiService.alert(data.retInfo);
        return $q.reject(response);
      } else {
        return data.data;
      }
    }, function(response) {
      debug(response);
      var tip = "请求失败";
      if (response.statusText && response.statusText.length > 0)
        tip += ":" + response.statusText;
      uiService.alert(tip);
      return $q.reject(response);
    })
  };

  this.get = function(url, data, options) {
    return this.http('get', url, data, options);
  };

  this.post = function(url, data, options) {
    return this.http('post', url, data, options);
  };
})