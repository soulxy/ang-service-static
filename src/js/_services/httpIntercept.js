  //module
app.factory('myInterceptor', ['$q', '$rootScope', '$location', function($q, $rootScope, $location) {

  return {
    request: function(config) {
      return config;
    },
    response: function(response) {
      var hostUrl = $location.absUrl();
      hostUrl = hostUrl.substring(0, hostUrl.indexOf('#'));
      var header = response.headers('login');
      if (header && header == 'login') {
        window.location.href = hostUrl;
        return;
      }
      return response;
    },
    requestError: function(rejectReason) {
      return $q.reject(rejectReason);
    },
    responseError: function(response) {
      var hostUrl = $location.absUrl();
      hostUrl = hostUrl.substring(0, hostUrl.indexOf('#'));
      if (response.status == 404) {
        window.location.href = hostUrl + '404.html';
        return;
      }
      return $q.reject(response);
    }
  };
}]);