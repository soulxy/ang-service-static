/**
 * Created by zhengkunshan on 2015/10/21.
 */


app.controller('anaNavController', ['$rootScope', '$scope', '$timeout', 'anaService', function ($rootScope, $scope, $timeout, anaService) {
        anaService.getNav().then(function (data) {
            $scope.list = data;
        });
    }]);

app.controller('deptController', ['$rootScope', '$scope', '$timeout', 'uiService', 'anaService', 'ivhTreeviewBfs', 'pageId', 'sysService', function ($rootScope, $scope, $timeout, uiService, anaService, ivhTreeviewBfs, pageId, sysService) {
    Date.prototype.Format = function (formatStr) {
        var str = formatStr;
        var Week = ['日', '一', '二', '三', '四', '五', '六'];

        str = str.replace(/yyyy|YYYY/, this.getFullYear());
        str = str.replace(/yy|YY/, (this.getYear() % 100) > 9 ? (this.getYear() % 100).toString() : '0' + (this.getYear() % 100));

        str = str.replace(/MM/, this.getMonth() > 8 ? (this.getMonth() + 1).toString() : '0' + (this.getMonth() + 1));
        str = str.replace(/M/g, this.getMonth() + 1);

        str = str.replace(/w|W/g, Week[this.getDay()]);

        str = str.replace(/dd|DD/, this.getDate() > 9 ? this.getDate().toString() : '0' + this.getDate());
        str = str.replace(/d|D/g, this.getDate());

        str = str.replace(/hh|HH/, this.getHours() > 9 ? this.getHours().toString() : '0' + this.getHours());
        str = str.replace(/h|H/g, this.getHours());
        str = str.replace(/mm/, this.getMinutes() > 9 ? this.getMinutes().toString() : '0' + this.getMinutes());
        str = str.replace(/m/g, this.getMinutes());

        str = str.replace(/ss|SS/, this.getSeconds() > 9 ? this.getSeconds().toString() : '0' + this.getSeconds());
        str = str.replace(/s|S/g, this.getSeconds());

        return str;
    };
    $scope.taskTypes = [
        {
            value: 0,
            name: '全部'
        },
        {
            value: 1,
            name: '快速检测'
        },
        {
            value: 2,
            name: '项目管理'
        }
    ];
    $scope.auditStatus = [
        {
            value: 0,
            name: '全部'
        },
        {
            value: 1,
            name: '已审计'
        },
        {
            value: 2,
            name: '未审计'
        }
    ];
    $scope.languages = [
        {
            value: 1,
            selected: true
        },
        {
            value: 2,
            selected: true
        },
        {
            value: 0,
            selected: true
        },
        {
            value: 4,
            selected: true
        },
        {
            value: 3,
            selected: true
        },

    ];
    $scope.chartType = 1;
    $scope.pageId = pageId;
    $scope.isActive = function (pageid) {
        return $scope.pageId == pageid;
    };
    // 默认查询时间  从当前时间开始往前30天
    var now = new Date();
    var dftEnd = now.Format('YYYY-MM-dd');
    var dftStart = (new Date(now - 30 * 24 * 3600 * 1000)).Format('YYYY-MM-dd');
    switch (pageId) {
        case 11:
            $scope.queryItems = ['queryInfoType', 'checkType', 'beginTime', 'endTime', 'taskType', 'languages', 'auditStatus', 'orgs'];
            $scope.condition = {
                "queryInfoType": "0",
                "checkType": "0",
                "beginTime": dftStart,
                "endTime": dftEnd,
                "taskType": $scope.taskTypes[0].value,
                "languages": "0,2",
                "auditStatus": $scope.auditStatus[0].value,
                "orgs": ""
            };
            $scope.pageInfo = {
                title: '部门缺陷数据统计'
            };
            break;
        case 31:
            $scope.queryItems = ['queryInfoType', 'checkType', 'beginTime', 'endTime', 'taskType', 'languages', 'auditStatus', 'orgs'];
            $scope.condition = {
                "queryInfoType": "0",
                "checkType": "2",
                "beginTime": dftStart,
                "endTime": dftEnd,
                "taskType": $scope.taskTypes[0].value,
                "languages": "0,2",
                "auditStatus": $scope.auditStatus[0].value,
                "orgs": ""
            };
            $scope.pageInfo = {
                title: '部门溯源数据统计'
            };
            break;
        case 13:
            $scope.queryItems = ['queryInfoType', 'checkType', 'beginTime', 'endTime', 'taskType', 'languages', 'auditStatus', 'orgs'];
            $scope.condition = {
                "queryInfoType": "2",
                "checkType": "0",
                "beginTime": dftStart,
                "endTime": dftEnd,
                "taskType": $scope.taskTypes[0].value,
                "languages": "0,2",
                "auditStatus": $scope.auditStatus[0].value,
                "orgs": ""
            };
            $scope.pageInfo = {
                title: '缺陷类型数据统计'
            };
            $scope.chartType = 2;
            break;
        default:
            $scope.queryItems = ['queryInfoType', 'checkType', 'beginTime', 'endTime', 'taskType', 'languages', 'auditStatus', 'orgs'];
            $scope.condition = {
                "queryInfoType": "2",
                "checkType": "1",
                "beginTime": dftStart,
                "endTime": dftEnd,
                "taskType": $scope.taskTypes[0].value,
                "languages": "0,2",
                "auditStatus": $scope.auditStatus[0].value,
                "orgs": ""
            };
            $scope.pageInfo = {
                title: '部门缺陷数据统计'
            };
    }
    //通过queryItems标示该字段是否需要显示
    $scope.shouldDisplay = function (item) {
        return $scope.queryItems.indexOf(item) >= 0;
    };
    $scope.formStatus = {
        beginTimeIsOpen: false,
        endTimeIsOpen: false
    };

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };
    $scope.openBegin = function () {
        $scope.formStatus.beginTimeIsOpen = true;
    };
    $scope.openEnd = function () {
        $scope.formStatus.endTimeIsOpen = true;
    };
    $scope.updateLanguages = function () {
        $timeout(function () {
            var langs = [];
            for (var i = $scope.languages.length - 1; i >= 0; i--) {
                if ($scope.languages[i].selected) {
                    langs.push($scope.languages[i].value);
                }
            }
            $scope.condition.languages = langs.join(',');
        }, 0);
    };
    $scope.updateProjects = function () {
        $timeout(function () {
            var pjs = [];
            for (var i = $scope.projects.length - 1; i >= 0; i--) {
                if ($scope.projects[i].selected) {
                    pjs.push($scope.projects[i].pkpj);
                }
            }
            $scope.condition.projects = pjs.join(',');
            //console.log($scope.condition.projects);
        });
    };
    $scope.customWidth = 0;
    $scope.anaData = {
        category: [],
        series: []
    };

    $scope.showResult = false;
    $scope.doAnalyze = function () {
        $scope.showResult = true;
        if ($scope.condition.beginTime && $scope.condition.beginTime != '') {
            var bt = new Date($scope.condition.beginTime);
            $scope.condition.beginTime = bt.Format('YYYY-MM-dd');//bt.toLocaleDateString().replace(/\//g,'-');
        }
        if ($scope.condition.endTime && $scope.condition.endTime != '') {
            var et = new Date($scope.condition.endTime);
            $scope.condition.endTime = et.Format('YYYY-MM-dd');//bt.toLocaleDateString().replace(/\//g,'-');
        }
        $scope.condition.orgs=$scope.getCheckedOrg();
        //
        $scope.noData = '数据加载中...';
        anaService.getData($scope.condition).then(function (result) {
            var data = result;
            var maxNum = 0;
            var series = [];
            if ($scope.chartType == 1) {
                var category = [];
                delete data.resultData.problemSum
                for (var item in data.resultData) {
                    var seri = {
                        name: item,
                        data: []
                    };
                    for (var i = 0; i < data.resultData[item].length; i++) {
                        seri.data.push(data.resultData[item][i].problemNum);
                        if (category.length < data.resultData[item].length) {
                            category.push(data.resultData[item][i].typeName);
                        }
                    }
                    series.push(seri);
                }
                $scope.anaData.series = series;
                if (category.length > 20) {
                    $scope.customWidth = category.length * 40;
                } else {
                    $scope.customWidth = 0;
                }
                $scope.anaData.category = category;
            } else {
                var option = {
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                            type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                        }
                    },
                    legend: {
                        data: ['高', '中', '低']
                    },
                    toolbox: {
                        show: false
                    },
                    calculable: false,
                    grid: {
                        x: 400,
                        x2: 10
                    },
                    xAxis: [
                        {
                            type: 'value'
                        }
                    ],
                    yAxis: [
                        {
                            type: 'category',
                            axisLabel: {
                                //rotate:25
                            },
                            data: []
                        }
                    ],
                    color: ['#FF6B51', '#FECE56', '#9ED665'],
                    series: [
                        {
                            name: '高',
                            type: 'bar',
                            stack: '总量',
                            itemStyle: {normal: {label: {show: true, position: 'insideRight'}}},
                            data: []
                        },
                        {
                            name: '中',
                            type: 'bar',
                            stack: '总量',
                            itemStyle: {normal: {label: {show: true, position: 'insideRight'}}},
                            data: []
                        },
                        {
                            name: '低',
                            type: 'bar',
                            stack: '总量',
                            itemStyle: {normal: {label: {show: true, position: 'insideRight'}}},
                            data: []
                        }

                    ]
                };
                var data = result.resultData.problemSum.sort(function (a, b) {
                    return a.problemNum < b.problemNum ? -1 : 1
                });
                for (var i = 0; i < data.length; i++) {
                    var typeData = data[i];
                    option.yAxis[0].data.push(typeData.typeName);
                    option.series[0].data.push(typeData.highProblemSum);
                    option.series[1].data.push(typeData.midProblemSum);
                    option.series[2].data.push(typeData.lowProblemSum);
                }
                if (data.length == 0) {
                    $scope.height = '20px';
                } else {
                    $scope.height = option.yAxis[0].data.length * 50 + 120 + 'px';
                    $scope.option = option;
                }

            }
            $scope.$broadcast('hide-loading-event', option);

        }, function(e) {
            delete $scope.noData;
        });
    };

    $scope.getCheckedOrg=function() {
        if ($scope.depts.length > 0) {
            var cache=[];
            ivhTreeviewBfs($scope.depts, function (dept) {
                if (dept.checked) {
                    cache.push(dept.datapk);
                }
            });
            return cache.join(',');
        }
        return '';
    };

    (function load() {
        //获取所有引擎
        $scope.languages = [];
        sysService.getCheckLangs().then(function(data) {
            angular.forEach(data, function (item) {
                $scope.languages.push({value: item, selected: true});
            });
            if($scope.languages.length==0) {
                $scope.nothingTpl = true;
            }
            $scope.updateLanguages();
        });
        // 获取所有部门列表
        $scope.depts = [];
        if ($scope.shouldDisplay('orgs')) {
            anaService.getDeptsTree().then(function (data) {
                $scope.depts = data;
            });
        }
    })();
}]);