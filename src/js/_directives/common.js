/**
 * Created by Kuroky360 on 15/8/24.
 */
app.directive("myCheck",['$parse', function ($parse) {
        return {
            restrict: 'A',
            controller:['$scope', '$element', function(scope, $element) {
                scope.checkModel=scope.checkModel||{};
                scope.checkModel.checkAll=function(data) {
                    angular.forEach(data, function (item) {
                        if (!item.disabled)
                            item.checked = scope.checkModel.checkall;
                    });
                };
                scope.checkModel.unCheckAll = function(data){
                    angular.forEach(data, function (item) {
                        if (!item.disabled)
                            item.checked = false;
                    });
                    scope.checkModel.checkall = false;
                };
                scope.checkModel.check=function(current,data) {
                    if (!current.checked) scope.checkModel.checkall= false;
                    else {
                        for (var i = 0; i < data.length; i++) {
                            var item = data[i];
                            if (!item.disabled&&!item.checked) {
                                scope.checkModel.checkall = false;
                                return;
                            }
                        }
                        scope.checkModel.checkall = true;
                    }
                };
            }],
            compile: function($element, attr) {
                var fn = $parse(attr.myCheck);
                return function ngEventHandler(scope, element) {
                    element.on('click', function(event) {
                        var callback = function () {
                            fn(scope, {$event: event});
                        };
                        scope.$apply(callback);
                    });
                };
            }
        }
    }])
        .directive("appmodal", function () {
            return {
                restrict: 'E',
                link: function (scope, element, attrs) {
                    scope.getContentUrl = function () {
                        return attrs.ngModalTemplateurl;
                    }
                },
                template: '<div ng-include="getContentUrl()"></div>'
            }
        })
        .directive("ngEnter", function () {
            return function (scope, element, attrs) {
                element.bind("keydown keypress", function (event) {
                    if (event.which === 13) {
                        scope.$apply(function () {
                            scope.$eval(attrs.ngEnter);
                        });
                        event.preventDefault();
                    }
                });
            }
        })
        .directive('ensureEqual', function () {
            return {
                restrict: 'A',
                link: function (scope, elem, attrs, ctrl) {
                    var confirmPwd = '#' + attrs.ensureEqual;
                    var injector= angular.element(elem).injector();
                    var rootScope = injector.get("$rootScope");
                    elem.add(confirmPwd).on('keyup', function () {
                        scope.$apply(function () {
                            var v = elem.val() === $(confirmPwd).val();
                            if (v === false) {
                                //scope.modalForm.$valid = false;
                                scope.modalForm.confirmPwd.$invalid=true;
                                $(elem).addClass('error-equal');
                            }
                            else {
                               // scope.modalForm.$valid = true;
                                scope.modalForm.confirmPwd.$invalid=true;
                                $(elem).removeClass('error-equal');
                            }
                        });
                    });
                }
            }
        })
        .directive('tree', ['traverseTree','$rootScope',function (traverseTree) {
            return {
                require: '?ngModel',
                restrict: 'A',
                link: function ($scope, element, attrs, ngModel) {
                    var _linkScope=null;
                    var treeObj;
                    var setting = {
                        treeId:"org",//attrs.treeId,
                        check: {
                            enable: attrs.check,
                            chkboxType: {"Y": "ps", "N": "ps"}
                        },
                        data: {
                            simpleData: {enable: true},
                            key: {
                                keyname:attrs.key||"key",
                                name:attrs.name||"name",
                                children:attrs.children ||"children"
                            }
                        },
                        callback: {
                            onCheck: function (event, treeId, treeNode) {

                               // _linkScope存储原始数据,同步更新原始数据的checked状态。
                                for (var key in _linkScope) {
                                    _linkScope[key].checked = false;
                                }
                                var zTree = $.fn.zTree.getZTreeObj(treeId);
                                var selectNodes = zTree.getCheckedNodes(true);

                                for (var i = 0; i < selectNodes.length; i++) {
                                    var node = selectNodes[i];
                                    var keyValue = node[setting.data.key.keyname];
                                    if (keyValue) {
                                        if (node.nodetype !== undefined) {
                                            keyValue=node.nodetype+''+keyValue;//避免不同类型的节点 id一样的情况。
                                        }
                                        _linkScope[keyValue].checked = true;
                                    }
                                }
                            },
                            onNodeCreated:function(event, treeId, treeNode) {

                            },
                            beforeClick: function (treeId, treeNode) {//点击菜单时进行的处理

                            },
                            onClick: function (event, treeId, treeNode, clickFlag) {
                                if ($scope.onlyleaf && treeNode.isParent)
                                    return;

                                //外部处理当选择的数据不合法的情况下进行拦截
                                if($scope.validation&&$scope.validation.valid(treeNode) === false) {
                                    return;
                                }

                                var data = {};
                                data[setting.data.key.keyname] = treeNode[setting.data.key.keyname];
                                data[setting.data.key.name] = treeNode[setting.data.key.name];
                                data.rawData = treeNode;
                                $scope.$emit('selecttree', data);
                            }
                        }
                    };
                   // $watchCollection $watch
                    var getChecked = function() {
                        $scope.$watchCollection(attrs.datas, function(value) {
                            if (!value) return;
                            var ruleData;
                            _linkScope = {};
                            // 全选
                            if(!attrs.defaultChecked) {
                                var isAllCheck = true;
                            }
                            traverseTree(value, {childrenAttribute: setting.data.key.children}, function (item) {
                                var key = item[setting.data.key.keyname];
                                if(!attrs.defaultChecked && !item.checked) {
                                    isAllCheck = false;
                                }
                                if (item.nodetype !== undefined) {
                                    item.iconSkin = "nodetype" + item.nodetype;
                                    key=item.nodetype+''+key;//避免不同类型的节点 id一样的情况。
                                }
                                _linkScope[key] = item;
                            });

                            if(attrs.selfChecked) {
                                switch (setting.data.key.children) {
                                    case 'children' :
                                        ruleData = { name: '全选', children: [], open: true, isParent: true};
                                        ruleData.children = value;
                                        break;
                                    case 'sons':
                                        ruleData = { typeName: '全选', sons: [], open: true, typeName2: null, isParent: true};
                                        ruleData.sons = value;
                                        break;
                                    case 'nodes':
                                        ruleData = { name: '全选', nodes: [], open: true, isParent: true};
                                        ruleData.nodes = value;
                                        break;
                                }
                                //为导出报告特殊情况新增属性
                                if(attrs.defaultChecked || isAllCheck) {
                                    ruleData.checked = true;
                                }

                            }else {
                                ruleData = value;
                            }

                            treeObj = $.fn.zTree.init(element, setting, ruleData);
                            treeObj.refresh();
                        });
                    };
                    getChecked();

                }
            }
        }]).directive('convertToNumber', function () {
            return {
                require: 'ngModel',
                link: function (scope, element, attrs, ngModel) {
                    ngModel.$parsers.push(function (val) {
                        return parseInt(val, 10);
                    });
                    ngModel.$formatters.push(function (val) {
                        return '' + val;
                    });
                }
            }
        }).directive('fileupload', function() {
            return {
                restrict: 'A',
                scope: {
                    done: '&',
                    progress: '&'
                },
                link: function (scope, element, attrs) {
                    var optionsObj = {
                        dataType: 'json'
                    };
                    if (scope.done) {
                        optionsObj.done = function (e, data) {
                            scope.$apply(function () {
                                scope.done({e: e, data: data});
                            });
                        };
                    }
                    if (scope.progress) {
                        optionsObj.progress = function (e, data) {
                            scope.$apply(function () {
                                scope.progress({e: e, data: data});
                            });
                        };
                    }
                    element.fileupload(optionsObj);
                }
            }
        }).directive('aDisabled', function() {
        return {
            compile: function(tElement, tAttrs, transclude) {
                //Disable ngClick
                tAttrs["ngClick"] = "!("+tAttrs["aDisabled"]+") && ("+tAttrs["ngClick"]+")";

                //return a link function
                return function (scope, iElement, iAttrs) {

                    //Toggle "disabled" to class when aDisabled becomes true
                    scope.$watch(iAttrs["aDisabled"], function(newValue) {
                        if (newValue !== undefined) {
                            iElement.toggleClass("disabled", newValue);
                        }
                    });

                    //Disable href on click
                    iElement.on("click", function(e) {
                        if (scope.$eval(iAttrs["aDisabled"])) {
                            e.preventDefault();
                        }
                    });
                };
            }
        };
    }).directive('nsresize', function () {
            return {
                link: function (scope, element, attrs, ngModel) {

                    var start_y=0;
                    var down=false;
                    var prevEl;
                    var nextEl;
                    element.bind("mousedown", function (event) {
                        start_y=event.pageY ;
                        down=true;
                        prevEl= event.toElement.previousElementSibling;
                        nextEl=event.toElement.nextElementSibling;
                    });
                    $(document).bind("mouseup", function (event) {
                        start_y=0;
                        down=false;
                    });
                    $(document).bind("mousemove", function (event) {
                        if(down)
                        {
                            move_y=event.pageY;

                            var y=event.pageY-start_y;
                            //if(Math.abs(y)>4)
                            {
                                start_y=event.pageY;
                                $(prevEl).height($(prevEl).height()+y);
                                $(nextEl).height($(nextEl).height()-y);
                            }
                        }
                        //event.preventDefault();
                    });
                }
            }
        }).directive('ewresize', function () {
            return {
                link: function (scope, element, attrs, ngModel) {

                    var start_x=0;
                    var down=false;
                    var prevEl;
                    var nextEl;
                    element.bind("mousedown", function (event) {
                        start_x=event.pageX ;
                        down=true;
                        prevEl= event.toElement.previousElementSibling;
                        nextEl=event.toElement.nextElementSibling;
                    });
                    $(document).bind("mouseup", function (event) {
                        start_x=0;
                        down=false;
                    });
                    $(document).bind("mousemove", function (event) {
                        if(down)
                        {
                            move_x=event.pageX;

                            var x=event.pageX-start_x;
                            //if(Math.abs(y)>4)
                            {
                                start_x=event.pageX;
                                var width=$(prevEl).width()+x;
                                $(prevEl).width(width);
                                //$(nextEl).css("margin-left",width+"px");
                                $(nextEl).css("left",width+"px");
                                $(nextEl).css("padding-right",width+"px");
                                $(element).css("left",width+"px");
                            }
                        }
                        //event.preventDefault();
                    });
                }
            }
        }).directive("clickevent", function () {
            return{
                scope:{run:'&'},
                link:function(scope, element, attrs) {
                    $(document).bind("mousedown", function (event) {
                        scope.$apply(function () {
                            scope.run();
                        });
                        //event.preventDefault();
                    });
                }
            }
        }).directive('localPagination',['$location',function($location){
           return {
               restrict: 'EA',
               replace: true,
               scope: {
                   displayData: '=',
                   rawData: '=',
                   limit: '@',
                   change: '&',
                   keepPage:'@'
               },
               link: function(scope,ele,attrs) {
                    var rgExp=/\/~\d{1,}~/;
                   scope.rawData = scope.rawData || [];
                   scope.displayData = scope.displayData || [];
                   scope.total = scope.rawData.length;
                   scope.currentPage = 1;
                   scope.limit = (scope.limit * 1) || 10;
                   scope.maxSize = 6;
                   scope.forceEllipses = true;
                   scope.boundaryLinkNumbers = false;
                   scope.pageChanged = function () {
                       var cp = scope.currentPage || 1;
                       if(scope.keepPage) {
                           var url=$location.path();//page/~1~ 后面的波浪线部分代表分页，用于后台的时候能定位当当前页
                           if (rgExp.exec(url))
                               var path = url.replace(rgExp, '/~' + cp + '~');
                           else
                               var path = url + "/~"+cp+"~";
                           $location.path(path);
                       }
                       else {
                           var start = (cp - 1) * scope.limit;
                           scope.displayData = scope.rawData.slice(start, start + scope.limit * 1);
                           scope.change();
                       }
                   };
                   scope.$watchCollection('rawData', function (newData, oldData) {
                       if (!newData || newData.length == 0) {
                           scope.displayData=[];
                           scope.showPager=false;
                           return;
                       }
                       var url=$location.path();
                       var pagePart=rgExp.exec(url);
                       if(pagePart){
                           var pageIndex=  pagePart[0].substring(2,pagePart[0].length-1);
                           scope.currentPage=pageIndex||1;
                       } else {
                           scope.currentPage = scope.currentPage || 1;
                       }
                       scope.total = newData.length;
                       var start = (scope.currentPage - 1) * scope.limit;
                       scope.displayData = scope.rawData.slice(start, start + scope.limit * 1);
                       scope.showPager = (scope.total > scope.limit);
                       //删除保留现场
                       if(scope.showPager && oldData.length && oldData!=newData) {
                           //现在共n页
                           scope.totalPage = Math.ceil(scope.total/scope.limit);
                           if(scope.totalPage < scope.currentPage) {
                               scope.currentPage = scope.totalPage;
                           }
                            scope.pageChanged();
                       }
                   });
               },
               template: '<div ng-show="showPager" class="local-pager">' +
                            '<div pagination ng-change="pageChanged()" ng-model="currentPage" total-items="total" force-ellipses="true" boundary-links="true" items-per-page="limit" max-size="maxSize" first-text="首页" previous-text="上一页" next-text="下一页" last-text="尾页" ng-disabled="false"></div>' +
                         '</div>'
           }
        }]).directive("mypager",['$parse', function ($parse) {
            return{
                restrict: 'E',
                replace : true,
                scope: {
                    data:'=',
                    rawDataStatus:'=',
                    change:'&'
                },
                controller:['$scope', '$element', function($scope, $element) {
                    $scope.current=1;
                    $scope.pagesize=15;
                    $scope.hasPrePage=true;
                    $scope.hasNextPage=true;
                }],
                template:' <div class="pager">' +
                            '<span>第{{current}}/{{totalpage}}页({{count}}项)</span>' +
                            '<span><a ng-click="current=(current>1?current-1:current);loadData(current)" ng-class="{disabled:current==1||current==0}">上一页</a></span>' +
                            '<span ng-repeat="item in getPageNums()"><a ng-click="loadData(item)" ng-class="{current:current==item}">{{item}}</a></span>' +
                            '<span><a ng-click="current=(current<totalpage?current+1:current);loadData(current)" ng-class="{disabled:current==totalpage}">下一页</a></span>' +
                '</div>',
                link:function($scope, element, attrs) {
                    $scope.getPageNums = function () {
                        var result = [];
                        for (var i = 1; i <= $scope.totalpage; i++) {
                            result.push(i);
                        }
                        return result;
                    }
                    $scope.loadData = function (current) {
                        $scope.rawDataStatus=0;
                        if ($scope.change)
                            $scope.$eval($scope.change);
                        $scope.current = current;
                        current=current==0?1:current;
                        $scope.data = $scope.rawData.slice((current - 1) * $scope.pagesize, current * $scope.pagesize);
                        angular.forEach($scope.data, function (item) {
                            item.checked = false;
                        });

                    };
                    $scope.$watchCollection(attrs.$attr.data, function (newValue, oldValue) {
                        if (!newValue)
                            return;
                        if (!$scope.rawData||$scope.rawDataStatus==1) {
                            $scope.rawData = newValue.concat([]);

                            $scope.count = $scope.rawData.length;

                            $scope.totalpage = $scope.count % $scope.pagesize == 0 ? $scope.count / $scope.pagesize : parseInt($scope.count / $scope.pagesize) + 1;
                           if($scope.current ==0)
                               $scope.current=1;
                            if ($scope.current > $scope.totalpage) {
                                $scope.current = $scope.totalpage;
                            }
                            else if ($scope.count == 0) {
                                $scope.current = 0;
                            }
                            $scope.loadData($scope.current);
                        }
                    });
                }
            }
        }]).directive('selecttree', ['traverseTree',function (traverseTree) {
            return {
                require: '?ngModel',
                restrict: 'E',
                scope:{
                    value:'=',
                    datas:'=',
                    children:'@',
                    key:'@',
                    name:'@',
                    maxheight:'@',
                    check:'@',
                    required:'@',
                    onlyleaf:'=',
                    id:'@',
                    validation:'='
                },
                controller:['$scope',function($scope){
                    $scope.id=$scope.id||"slTree";
                }],
                template:[
                    '<div>',
                            '<input type="text" class="form-control" ng-if="required" ng-model="value.name" ng-click="selectTreeShow=!selectTreeShow" placeholder="不能为空" required readonly />',
                            '<input type="text" class="form-control" ng-if="!required" ng-model="value.name" ng-click="selectTreeShow=!selectTreeShow" readonly />',
                            '<input type="hidden" class="form-control" ng-model="value.key" />',
                            '<span class="glyphicon glyphicon-triangle-bottom form-control-icon-right cursor_pointer"></span>',
                            '<div ng-style="{\'max-height\':maxheight+\'px\',\'overflow-y\': \'auto\', border: \'1px solid #ccc\', \'border-top\':0}" ng-show="selectTreeShow"> ' ,
                                ' <ul tree id="{{id}}" class="ztree" datas="datas" children="{{children}}" key="{{key}}" name="{{name}}" check="{{check}}" ></ul>',
                            '</div>' ,
                            '<div ng-show="selectTreeShow&&datas&&datas.length>0"  style="text-align: right; background-color: white;margin: 5px;margin-top: -25px;"><a a-disabled="!value.name" ng-click="clear()">清空</a></div>',
                    '</div>'].join('\n'),
                link: function ($scope, element, attrs, ngModel) {
                    $scope.key=attrs.key||"key";
                    $scope.children=attrs.children||"children";
                    $scope.name=attrs.name||"name";

                    //点击下拉箭头的时候要自动校验input
                    $(element[0].firstChild.childNodes[7]).bind("click", function (event) {
                        $scope.$apply(function(){
                            $scope.selectTreeShow=!$scope.selectTreeShow;
                        });
                        element[0].firstChild.firstElementChild.focus();
                    });

                    $scope.$on('selecttree', function (event, data) {
                        $scope.selectTreeShow=false;
                        $scope.value.key = data[$scope.key];
                        $scope.value.name = data[$scope.name];
                    });

                    $scope.clear=function(){
                        $scope.value.key ='';
                        $scope.value.name ='';
                        $scope.selectTreeShow=false;
                    }
                }
            }
        }]).directive('moreTip', ['traverseTree',function (traverseTree) {
            return {
                require: '?ngModel',
                restrict: 'E',
                scope:{
                    content:'=',
                },
                template:[
                    '<label popover-placement="bottom"',
                    ' popover-trigger="mouseenter"',
                    ' popover-template="tipTemplate.html">',
                    '{{content|cutFilter}}',
                    '</label>'
                ].join('\n'),
                link: function ($scope, element, attrs, ngModel) {

                }
            }
        }]).directive('autoFocusWhen', ['$log','$timeout', function($log, $timeout) {
            return {
                restrict: 'A',
                scope: {
                    autoFocusWhen: '='
                },
                link: function(scope, element) {
                    scope.$watch('autoFocusWhen', function(newValue) {
                        if (newValue) {
                            $timeout(function(){
                                element[0].focus();
                            })
                        }
                    });
                   /* element.on('blur', function() {
                     scope.$apply(function() {
                     scope.autoFocusWhen = false;
                     })
                     })*/
                }}
        }]).directive('compareTo', [function() {
            return {
                require: "ngModel",
                priority:1000,
                scope: {
                    otherModelValue: "=compareTo"
                },
                link: function(scope, element, attributes, ngModel) {
                    console.log(ngModel);
                    ngModel.$validators.compareTo = function (modelValue) {
                        if(!scope.otherModelValue)
                        return true;
                        var flag = modelValue == scope.otherModelValue;
                       /* if (!flag)
                            ngModel.$setValidity("eq", false);
                        else
                            ngModel.$setValidity("eq", true);*/
                        return flag;
                    };

                    scope.$watch("otherModelValue", function () {
                        ngModel.$validate();
                    });
                }
            };
        }]).directive('verifyConfig', [function() {
            return {
                require: "ngModel",
                priority:1001,
                scope: {
                    verifyConfig: "="
                },
                link: function(scope, element, attributes, ngModel) {
                    console.log(ngModel);
                    ngModel.$validators.Verify = function (modelValue) {
                        if (scope.verifyConfig.verify)
                            return scope.verifyConfig.verify(modelValue,ngModel);
                        return true;
                    };
                    element.on('blur keyup change', function() {
                        ngModel.$validate();
                    });
                }
            };
        }]).directive('dateFormat', ['$filter',function($filter) {
            return {
                require: 'ngModel',
                link: function(scope, elm, attrs, ctrl) {

                    function formatter(value) {
                        var newDate =new Date(value).Format(attrs.dateFormat);
                        ctrl.$$rawModelValue=new Date(value);
                        ctrl.$modelValue=ctrl.$$rawModelValue.Format(attrs.dateFormat);;
                        return ctrl.$modelValue;
                    }

                    function parser() {
                        return ctrl.$modelValue;
                    }

                    ctrl.$formatters.push(formatter);
                    ctrl.$parsers.unshift(parser);

                }
            };
        }]).directive('backButton', function(){
            return {
                restrict: 'A',

                link: function(scope, element, attrs) {
                    element.bind('click', goBack);

                    function goBack() {
                        history.back();
                        scope.$apply();
                    }
                }
            }
        }).directive('popoverOnlyone', function(){
            return {
                restrict: 'EA',
                link: function(scope, element, attrs) {
                    $(document).bind('click', function() {
                        if ($(".popover").length > 0)
                            $(".popover").remove();
                    });
                    element.bind('click', function(){
                        $(".popover").filter(function(index,el) {return el!=element.context.nextElementSibling;}).remove();
                        $(element.context.nextElementSibling).bind('click', function(){
                            return false;
                        });
                        return false;
                    });
                }
            }
        });