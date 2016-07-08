/**
 * Created by Kuroky360 on 15/8/24.
 */
/**
 * Created by micro on 2015/9/16.
 */
app.controller('homeCtrl', ['$rootScope', '$scope', '$location', 'homeService', '$filter',
  function($rootScope, $scope, $location, homeService, $filter) {

    // 基于准备好的dom，初始化echarts图表

    var gradeChart = echarts.init(document.getElementById('chart'));
    var Chart1 = echarts.init(document.getElementById('chart1'));
    homeService.getSummaryInfo().then(function(result) {
      $scope.summaryInfo = result;

      var optionPie = {
        noDataLoadingOption: {
          text: ' ',
          effect: 'bubble',
          effectOption: {
            effect: {
              n: 0
            },
            backgroundColor: "#fff"
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
        color: [],
        /* ['#FECE56', '#9ED665', '#58B4FD', '#FF6B51', '#E75B8C']*/
        series: [{
          name: '检测语言',
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

          data: [
            /* {value: result.taskCodeNumDetail.codeRowNum[0].codeRowNum, name: 'C/C++'},
             {value: result.taskCodeNumDetail.codeRowNum[1].codeRowNum, name: 'C#'},
             {value: result.taskCodeNumDetail.codeRowNum[2].codeRowNum, name: 'Java'},
             {value: result.taskCodeNumDetail.codeRowNum[3].codeRowNum, name: 'PHP'},
             {value: result.taskCodeNumDetail.codeRowNum[4].codeRowNum, name: 'Python'},*/
          ]
        }]
      };
      if (result.taskCodeNumDetail.codeRowNum[0].codeRowNum > 0) {
        optionPie.color.push('#FECE56');
        optionPie.series[0].data.push({
          value: result.taskCodeNumDetail.codeRowNum[0].codeRowNum,
          name: 'C/C++'
        });
      }
      if (result.taskCodeNumDetail.codeRowNum[1].codeRowNum > 0) {
        optionPie.color.push('#9ED665');
        optionPie.series[0].data.push({
          value: result.taskCodeNumDetail.codeRowNum[1].codeRowNum,
          name: 'C#'
        });
      }
      if (result.taskCodeNumDetail.codeRowNum[2].codeRowNum > 0) {
        optionPie.color.push('#58B4FD');
        optionPie.series[0].data.push({
          value: result.taskCodeNumDetail.codeRowNum[2].codeRowNum,
          name: 'Java'
        });
      }
      if (result.taskCodeNumDetail.codeRowNum[3].codeRowNum > 0) {
        optionPie.color.push('#FF6B51');
        optionPie.series[0].data.push({
          value: result.taskCodeNumDetail.codeRowNum[3].codeRowNum,
          name: 'PHP'
        });
      }
      if (result.taskCodeNumDetail.codeRowNum[4].codeRowNum > 0) {
        optionPie.color.push('#E75B8C');
        optionPie.series[0].data.push({
          value: result.taskCodeNumDetail.codeRowNum[4].codeRowNum,
          name: 'Python'
        });
      }
      gradeChart.setOption(optionPie);


      var optionPieBug = {
        noDataLoadingOption: {
          text: ' ',
          effect: 'bubble',
          effectOption: {
            effect: {
              n: 0
            },
            backgroundColor: "#fff"
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
          show: result.bugNumDetail.highBugNum || result.bugNumDetail.midBugNum || result.bugNumDetail.lowBugNum,
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
                  color: '#000',
                  fontWeight: 'bold'
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
            value: result.bugNumDetail.highBugNum,
            name: '高'
          }, {
            value: result.bugNumDetail.midBugNum,
            name: '中'
          }, {
            value: result.bugNumDetail.lowBugNum,
            name: '低'
          }]
        }]
      };
      Chart1.setOption(optionPieBug);
    });

  }
])