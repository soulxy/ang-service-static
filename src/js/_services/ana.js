/**
 * Created by zhengkunshan on 2015/10/21.
 */

app.service('anaService', ['$rootScope', 'ajax', 'httpService', function($rootScope, ajax, httpService) {
  this.getNav = function() {
    var data = [{
        "id": 1,
        "title": "缺陷检测",
        "nodes": [{
          "id": 11,
          "title": "部门数据统计",
          'url': "#/analysis/dept-fault"
        }, {
          "id": 13,
          "title": "缺陷类型统计",
          'url': "#/analysis/type-fault"
        }]
      },
      /*{
          "id": 3,
          "title": "溯源检测",
          "nodes": [
              {
                  "id": 31,
                  "title": "部门数据统计",
                  'url': "#/analysis/dept-trace"
              }
          ]
      }*/
    ];

    return {
      then: function(callback) {
        callback(data);
      }
    }
  }
  this.getDeptsTree = function(args) {
    return httpService.post('org/queryorgtree', args);

  };
  this.getData = function(condition) {
    return httpService.post('statistics/query', condition);
  };
}]);