/**
 * Created by Kuroky360 on 15/8/24.
 */
app.service('uiService', function($rootScope, $modal, $timeout, $q, $sce) {
  var self = this;
  /**
   * 显示错误信息
   * @param  {String} message [错误信息]
   * @param  {String} [type]    []
   * @return {}         []
   */
  var alertPromise;
  this.alert = function(message, type) {
    if (type === true) {
      type = 'success';
    } else {
      type = 'error';
    }
    $rootScope.alert = {
      type: type,
      msg: message
    };
    $rootScope.close = function(index) {
      $rootScope.alert = null;
      alertPromise = null;
    }
    if (type == "success") {
      $timeout.cancel(alertPromise);
      alertPromise = $timeout(function() {
        alertPromise = null;
        $rootScope.alert = null;
      }, 1000);
    }
  };
  /**
   * 弹出层
   * @return {[type]} [description]
   */
  this.modal = function(options) {
    options = options || {};
    if (!$rootScope.modal) {
      $rootScope.modal = {};
    }
    //超时promise
    var getTimeoutPromise = function(time) {
      var deferred = $q.defer();
      $timeout(function() {
        deferred.reject('timeout ' + time + 's');
      }, time * 1000)
      return deferred.promise;
    }
    $rootScope.modal = angular.extend($rootScope.modal, {
      $templateUrl: options.templateUrl,
      $cancel: function() {
        if (options['cancel'])
          options['cancel']();
        $rootScope.modal = {};
        $q.when().then(function() {
          instance.dismiss('cancel')
        });
      },
      $noOkBtn: options.noOkBtn || false,
      $title: options.title,
      $style: options.style,
      $disabled: false,
      $okText: $sce.trustAsHtml(options.okText || '保存'),
      //点击保存按钮的处理函数
      $ok: function(modalData) {
        if (!instance.$scope.modalForm.$valid) {
          return;
        }
        var okText = modalData.$okText;
        $rootScope.modal.$_okText = okText;
        //禁用保存的按钮
        modalData.$disabled = true;
        modalData.$okText = $sce.trustAsHtml('<span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>');

        var data = {};
        for (var name in modalData) {
          if (name[0] !== '$') {
            data[name] = modalData[name];
          }
        }
        var ret = options.ok(data);

        //$q里没有race方法
        var p1 = $q.when(ret);
        var timeout = getTimeoutPromise(options.timeout || 10);
        var isResolved = false;
        var resolve = function(data) {
          instance.dismiss('close');
          $rootScope.modal = {};
          if (data === true) {
            return;
          }
          var successText = options.successText || '保存成功';
          if (typeof data === 'string' && data) {
            successText = data;
          }
          self.alert(successText, true);
        }
        p1.then(function(data) {
          if (isResolved) {
            return
          };
          isResolved = true;
          //出现错误
          if (data === false) {
            modalData.$disabled = false;
            modalData.$okText = okText;
            return;
          }
          resolve(data);
        }).catch(function() {
          if (isResolved) {
            return
          };
          isResolved = true;
          modalData.$disabled = false;
          modalData.$okText = okText;
        });
        timeout.then(function() {
          if (isResolved) {
            return
          };
          isResolved = true;
          resolve();
        })
      }
    });
    options.backdrop = "static";
    options.templateUrl = 'modal.html';
    var instance = $modal.open(options);
    //初始化异步加载
    if (options.load) {
      $rootScope.modal.$disabled = true;
      $rootScope.modalLoading = true;
      var load = options.load();
      $q.when(load).then(function(result) {
        var modalForm = instance.$scope.modalForm;
        if (modalForm && modalForm.$valid && result !== false) {
          $rootScope.modal.$disabled = false;
        } else {
          $rootScope.modal.$disabled = true;
        }
        $rootScope.modalLoading = false;
      })
    }
    instance.$scope.$watch('modalForm.$valid', function(value) {
      $rootScope.modal.$disabled = !value;
    })
    return instance;
  }
});