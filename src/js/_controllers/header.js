app.controller('headerCtrl', ['$rootScope','$scope', '$location','httpService','uiService','sysService','$filter', function($rootScope,$scope, $location,httpService,uiService,sysService,$filter) {
        $scope.isAdmin =true;
        $rootScope.userOptShow=false;
        $rootScope.global={};
        $rootScope.safeFnModule={
            "0":{moduleName:"包名"},
            "1":{moduleName:"命名空间"},
            "2":{moduleName:"命名空间"},
            "3":{moduleName:"模块名"},
            "4":{moduleName:"命名空间"}
        };
        $scope.ress=[
            {
                name:'快速检测',
                url:'#/quickcheck',
                identity:'quickcheck',
                powerIdentity:'QuickCheck',
            },
            {
                name:'上传检测结果',
                url:'#/uploadresult',
                identity:'uploadresult',
                powerIdentity:'UploadResult',
            },
            {
                name:'报告管理',
                url:'#/report',
                identity:'report',
                powerIdentity:'Report',
            },
            {
                name:'统计分析',
                url:'#/analysis',
                identity:'analysis',
                powerIdentity:'Analyse',
            },
            {
                name: '系统管理',
                url: '#/system/main',
                identity: 'system',
                powerIdentity:'System',
            }
        ];
        $scope.goHome = function () {
            $location.path("/");
        };
        $scope.logout = function(){
            var hostUrl = $location.absUrl();
            hostUrl=hostUrl.substring(0,hostUrl.indexOf('#'));
            window.location.href=hostUrl+"logout";
        };
        $scope.modifyPwd = function () {
            $scope.instance = uiService.modal({
                title: '修改密码',
                templateUrl: 'app/views/common/user-pwd-modal.html',
                load: function () {
                    $scope.user={pkUser:currentUser.pkUser};
                    $scope.verifyConfig= {
                        verify: function (modelVale, ngModel) {
                            return verifyPwd(modelVale);
                        }
                    };
                },
                ok: function () {
                  return  httpService.post('user/updateuserpassword',$scope.user);
                },
                scope:$scope
            });
        };
        $scope.isActive = function(path){
            var pair = $location.path().split("/");
            var domin = pair[1];
            return domin == path.slice(1);
        };
        $rootScope.hasCheck=function(collection,checkedName) {
            checkedName=checkedName||'checked';
            if (!collection)
                return false;
            for (var i = 0; i < collection.length; i++) {
                if (collection[i][checkedName])
                    return true;
            }
            return false;
        };
        sysService.getEnv().then(function (data) {
            window.currentUser = data.currentUser;
            $rootScope.currentUser=data.currentUser;
            $rootScope.isCheckVersion=function(){return parseInt(data.systemVersion)==0;};
            $rootScope.isDevVersion=function(){return parseInt(data.systemVersion)==1;};
            $rootScope.isPlatformVersion=function(){return parseInt(data.systemVersion)==2;};
            $rootScope.hasPower = function(power) {
                for (var i = 0; i < $rootScope.currentUser.authorities.length; i++) {
                    var authority = $rootScope.currentUser.authorities[i].authority;
                    if (power.toLowerCase() == authority.toLowerCase())
                        return true;
                }
                return false;
            };
        });
        sysService.getCheckLangs().then(function(data) {
            $rootScope.global.checkLangs = data;
            $rootScope.global.langs = [];
            angular.forEach(data, function (item) {
                var langLabel = $filter("langFilter")(item);
                $rootScope.global.langs.push({label: langLabel, value: item});
            });
            $rootScope.global.hasLang = function (lang) {
            var index=$rootScope.global.langs.indexByMethod(function (item) {
                    if (item.value == lang)
                        return true;
                    else
                        return false;
                });
                return index!=-1;
            }
        });

    }])
