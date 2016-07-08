/**
 * Created by zhengkunshan on 2015/10/22.
 */

app.directive('chartBar', ['$filter', function($filter) {
  return {
    restrict: 'A',
    scope: {
      stack: '=',
      data: '=',
      customWidth: '='
    },
    template: '<div class="ec-wrapper"><div class="ec-body"></div></div>',
    link: function(scope, element, attrs) {
      var ecInst = ec.init(element.find('.ec-body')[0]);
      var refreshView = function() {
        //如果有自定义宽度，则重新实例化ec对象
        if (scope.customWidth > 0) {
          angular.element(element.find('.ec-body')[0]).css('width', scope.customWidth);
        } else {
          angular.element(element.find('.ec-body')[0]).css('width', '100%');
        }
        if (ecInst && ecInst.dispose) {
          ecInst.dispose();
        }
        ecInst = ec.init(element.find('.ec-body')[0]);
        var legend = {
          data: []
        };
        var series = [];
        for (var i = 0; i < scope.data.series.length; i++) {
          var name = $filter('toDisplay')(scope.data.series[i].name);
          legend.data.push(name);
          var seri = {
            name: name,
            type: 'bar',
            stack: scope.stack,
            data: scope.data.series[i].data
          };
          series.push(seri);
        }
        var category = scope.data.category;

        var option = {
          color: ['#FF6B51', '#FECE56', '#9ED665'],
          tooltip: {
            trigger: 'axis'
          },
          legend: legend,
          toolbox: {
            show: false
          },
          calculable: false,
          xAxis: [{
            type: 'category',
            data: category,
            splitNumber: category.length,
            splitLine: {
              show: true,
              onGap: true
            },
            axisLabel: {
              show: true,
              interval: 0,
              rotate: (function() {
                if (category.length > 5) {
                  return 25;
                } else {
                  return 0;
                }
              }())
            }
          }],
          yAxis: [{
            type: 'value',
            splitArea: {
              show: true
            }
          }],
          series: series
        };
        ecInst.setOption(option, true);
      };
      scope.$watch('data', function() {
        console.log('refreshView');
        refreshView();
      }, true);

      //首次加载主动刷新
      refreshView();
    }
  };
}]);

app.directive('chartOptBar', [function() {
  return {
    restrict: 'A',
    template: '<div class="ec-wrapper"><div class="ec-body">{{noData}}</div></div>',
    link: function(scope, element, attrs) {
      var width = '100%';
      var height = '20px';
      var ecInst;
      var $ecBody = angular.element(element.find('.ec-body')[0]);
      scope.$on('hide-loading-event', function(event, data) {
        refreshView(data);
      });
      var refreshView = function(data) {
        if (data && data.yAxis[0].data.length != 0) {
          if (scope.width)
            width = scope.width;
          if (scope.height)
            height = scope.height;
          $ecBody.css('width', width);
          $ecBody.css('height', height);
          ecInst = ec.init(element.find('.ec-body')[0]);
          if (ecInst && data) {
            ecInst.clear();
            ecInst.setOption(data, true);
          }
        } else {
          $ecBody.css('width', '100%');
          $ecBody.css('height', '20px');
          if (ecInst && ecInst.dispose) {
            ecInst.clear();
            ecInst.dispose();
            ecInst = '';
          }
          $ecBody.html('暂无数据');
          scope.noData = "暂无数据";
        }
      };
    }
  };
}]);