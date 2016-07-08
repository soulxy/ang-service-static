var app = angular.module('app', ['ui.router', 'ui.bootstrap', 'ngMaterial', 'ngAnimate']);
//
app.config(function($sceDelegateProvider, $httpProvider) {

    $sceDelegateProvider.resourceUrlWhitelist([
      'self',
      'http://localhost:*/**',
      'http://127.0.0.1:*/**'
    ]);

    $httpProvider.interceptors.push('authRejector');

  })
  .factory('authRejector', function($q, $location) {
    console.log('this is authRejector...');

    return {
      request: function(config) { // This method is called before $http sends the request to the backend
        config.requestTime = new Date().getTime();
        return config;
      },
      response: function(response) { // This method is called right after $http receives the response from the backend
        var hostUrl = $location.absUrl();
        response.config.responseTime = new Date().getTime();
        if (response && response.headers && response.headers('login')) {
          window.location.href = hostUrl.split('#')[0];
          return;
        }
        return response;
      },
      requestError: function(rejectReason) {
        console.log('---->requestError', rejectReason);
      },
      responseError: function(rejectReason) {
        console.log('---->responseError', rejectReason);
      }
    };

  });


(function() {

  angular.element(document).ready(function() {

    angular.bootstrap(document, ['app']);
    
  });

})();