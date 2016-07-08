/**
 * Created by Kuroky360 on 15/8/24.
 */
app.service('homeService', function($rootScope, ajax, $timeout, $q, $sce) {
  this.getSummaryInfo = function() {
    return {
      then: function(success) {
        ajax.post('homepage/queryall', {}).then(function(data) {
          success(data.data);
        });
      }
    }
  }
});