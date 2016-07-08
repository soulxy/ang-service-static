/**
 * Created by micro on 2015/9/16.
 */
app.controller('dashboardCtrl', ['$stateParams', '$rootScope', '$timeout', '$scope', '$location', 'uiService', 'auditService', 'checkService', '$filter',
  function($stateParams, $rootScope, $timeout, $scope, $location, uiService, auditService, checkService, $filter) {

    // 基于准备好的dom，初始化echarts图表
    var taskId = $stateParams.task_id;
    (function() {
      var task = {
        pkTask: taskId
      }; //
      auditService.getTaskInfo(task).then(function(result) {
        $scope.checkResult = result;
        $scope.checkResult.taskId = taskId;
        $scope.checkResult.checkType = $stateParams.checktype;
        $scope.checkResult.taskType = $stateParams.tasktype;

        var option = {
          noDataLoadingOption: {
            text: ' ',
            effect: 'bubble',
            effectOption: {
              effect: {
                n: 0
              }
            },
            textStyle: {
              fontSize: 20,
              fontWeight: 'bold'
            }
          },
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data: ['模块', '类', '方法', '文件']
          },
          toolbox: {
            show: false,
            feature: {
              mark: {
                show: true
              },
              dataView: {
                show: true,
                readOnly: false
              },
              magicType: {
                show: true,
                type: ['line', 'bar']
              },
              restore: {
                show: true
              },
              saveAsImage: {
                show: true
              }
            }
          },
          calculable: true,
          xAxis: [{
            type: 'category',
            data: ['1月', '2月', '3月', '4月', '5月', '6月']
          }],
          yAxis: [{
            type: 'value',
            splitArea: {
              show: true
            }
          }],
          series: [{
              name: '模块',
              type: 'bar',
              data: [2.0, 4.9, 7.0, 23.2, 25.6, 76.7]
            }, {
              name: '类',
              type: 'bar',
              data: [2.6, 5.9, 9.0, 26.4, 28.7, 70.7]
            }, {
              name: '方法',
              type: 'bar',
              data: [2.6, 5.9, 9.0, 26.4, 28.7, 70.7]
            }, {
              name: '文件',
              type: 'bar',
              data: [2.6, 5.9, 9.0, 26.4, 28.7, 70.7]
            }

          ]
        };
        $timeout(function() {
          var myChart = echarts.init(document.getElementById('bar-chart'));
          myChart.setOption(option);
        }, 500);

        var optionGrade = {
          noDataLoadingOption: {
            text: ' ',
            effect: 'bubble',
            effectOption: {
              effect: {
                n: 0
              }
            },
            textStyle: {
              fontSize: 20,
              fontWeight: 'bold'
            }
          },
          tooltip: {
            show: true,
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
          },
          legend: {
            show: result.problemNum5 || result.problemNum3 || result.problemNum1,
            orient: 'vertical',
            x: 'left',
            data: ['高', '中', '低']
          },
          toolbox: {
            show: false,
            feature: {
              mark: {
                show: true
              },
              dataView: {
                show: true,
                readOnly: false
              },
              magicType: {
                show: true,
                type: ['pie', 'funnel'],
                option: {
                  funnel: {
                    x: '25%',
                    width: '50%',
                    funnelAlign: 'center',
                    max: 1548
                  }
                }
              },
              restore: {
                show: true
              },
              saveAsImage: {
                show: true
              }
            }
          },
          calculable: false,
          color: ['#FF6B51', '#FECE56', '#9ED665'],
          series: [{
            name: '缺陷等级分布',
            type: 'pie',
            radius: ['30%', '80%'],
            itemStyle: {
              normal: {
                label: {
                  position: 'inner',
                  formatter: function(params) {
                    return params.percent == 0 ? "" : (params.percent + '%');
                  },
                  textStyle: {
                    color: '#000'
                  },
                  show: false
                },
                labelLine: {
                  show: false
                }
              },
              emphasis: {
                label: {
                  show: true,
                  position: 'center',
                  textStyle: {
                    fontSize: '30',
                    fontWeight: 'bold'
                  }
                }
              }
            },

            data: [{
              value: result.problemNum5,
              name: '高'
            }, {
              value: result.problemNum3,
              name: '中'
            }, {
              value: result.problemNum1,
              name: '低'
            }]
          }]
        };

        $timeout(function() {
          var gradeChart = echarts.init(document.getElementById('grade-chart'));
          gradeChart.setOption(optionGrade);
        }, 500);


        var cateOption = {
          /* tooltip: { show: false },*/
          grid: { // 控制图的大小，调整下面这些值就可以，
            x: 130,
            x2: 30,
            y: 10,
            y2: 30
              //y2: 150,// y2可以控制 X轴跟Zoom控件之间的间隔，避免以为倾斜后造成 label重叠到zoom上
          },
          legend: {
            show: false,
            data: ['category']
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: { // 坐标轴指示器，坐标轴触发有效
              type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
            }
          },
          toolbox: {
            show: false
          },
          calculable: false,
          xAxis: [{
            type: 'value'
          }],
          yAxis: [{
            type: 'category',
            axisLabel: {
              //interval:0,
              rotate: 15,
              /* margin:2,*/
              textStyle: {
                color: "#222"
              },
              /* formatter:function(val){
                   ///return val.split("").join("\n");
               }*/
            },
            data: []
          }],
          series: [{
            name: '数量',
            type: 'bar',
            stack: '总量',
            itemStyle: {
              normal: {
                label: {
                  show: true,
                  position: 'insideRight'
                }
              }
            },
            data: []
          }]
        };
        result.categoryAndNum.sort(function(a, b) {
          return parseInt(a.value) - parseInt(b.value);
        });
        angular.forEach(result.categoryAndNum, function(item) {

          cateOption.yAxis[0].data.push(item.key);
          cateOption.series[0].data.push(item.value);
        });
        $scope.categoryChardHeight = cateOption.yAxis[0].data.length * 45;
        $scope.categoryChardHeight = $scope.categoryChardHeight < 100 ? 150 : $scope.categoryChardHeight;
        $timeout(function() {
          var cateChart = echarts.init(document.getElementById('category-chart'));
          if (result.categoryAndNum.length) {
            cateChart.setOption(cateOption);
          }
        }, 500);
      });
    })();
  }
])