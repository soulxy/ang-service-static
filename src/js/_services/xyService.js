app.service('apiService', function($http) {
  this.post = function(url, data) {
    return $http({
      method: 'POST',
      data: data,
      url: url
    });
  }

  this.get = function(url) {
    return $http({
      method: 'GET',
      url: url
    });
  }

});
app.service('xyService', function(apiService, $q) {

  this.getInfo = function(url) {
    var deferred = $q.defer();
    apiService.get(url)
      .then(function(result) {
        deferred.resolve(result);
      }).catch(function(error) {
        deferred.reject(error);
      });
    return deferred.promise;
  }

});