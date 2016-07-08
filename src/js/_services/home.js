/**
 * Created by Kuroky360 on 15/8/24.
 */
app.service('homeService', ['ajax', function(ajax) {
  console.log('homeService');
  this.getSummaryInfo = function() {
    return {
      then: function(success) {
        ajax.post('homepage/queryall', {}).then(function(data) {
          success(data.data);
        });
      }
    }
  }
}]);