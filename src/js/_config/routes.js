app.config(function($stateProvider, $urlRouterProvider) {
  var defaultPage = '/home';

  $urlRouterProvider.when("/", defaultPage);
  //
  $urlRouterProvider.otherwise(function($injector, $location) {
    var $state = $injector.get('$state');
    if ($location.$$path === '') {
      $state.go('content.home');
    } else {
      $state.go('404');
    }
    return true;
    // return $location.path();
  });
  // Now set up the states
    $stateProvider
      .state('404', {
        url: '/404',
        template: '<div>404...</div>',
        controller: function($scope) {
        }
      })
      .state('content', { //根视图  
        url: "",
        abstract: true, //An abstract state will never be directly activated
        templateUrl: staticHost  + "/tpl/index.html",
        controller: function($scope) {
          console.log('run--index');
        }
      })
      .state('content.home', { //首页
        url: "/home",
        templateUrl: staticHost + "/tpl/home/home.html",
        controller: 'xyCtrl'
      });

});