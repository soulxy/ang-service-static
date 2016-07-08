/**
 * Created by Kuroky360 on 15/8/24.
 */

app.filter('intDateFilter', function() {
  return function(intDate) {
    if (intDate) {
      return new Date(intDate).Format("yyyy-MM-dd hh:mm:ss");
    }
    return "--";
  };
});
app.filter('datePartFilter', function() {
  return function(date, format) {
    if (date) {
      return new Date(date).Format(format);
    }
    return "--";
  };
});
app.filter('langFilter', function() {
  return function(data) {
    var lan;
    data = parseInt(data);
    switch (data) {
      case 0:
        lan = 'Java';
        break;
      case 1:
        lan = 'C/C++';
        break;
      case 2:
        lan = 'C#';
        break;
      case 3:
        lan = 'Python';
        break;
      case 4:
        lan = 'PHP';
        break;
      default:
        lan = '未定义';
    }
    return lan;
  }
});
app.filter('unique', function() {
  return function(collection, keyname) {
    var output = [],
      keys = [];

    angular.forEach(collection, function(item) {
      var key = item[keyname];
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        output.push(item);
      }
    });

    return output;
  };
}).filter('checkFilter', function() {
  return function(data) {
    var type;
    data = parseInt(data);
    switch (data) {
      case 0:
        type = '缺陷检测';
        break;
      case 1:
        type = '合规检测';
        break;
      case 2:
        type = '溯源检测';
        break;
      default:
        type = '未定义';
    }
    return type;
  }
}).filter('checkShortFilter', function() {
  return function(data) {
    var type;
    data = parseInt(data);
    switch (data) {
      case 0:
        type = '缺陷';
        break;
      case 1:
        type = '违规';
        break;
      case 2:
        type = '漏洞';
        break;
      default:
        type = '';
    }
    return type;
  }
}).filter('taskFormat', function() {
  return function(data) {
    data = parseInt(data);
    var type;
    switch (data) {
      case 0:
        type = '快速检测';
        break;
      case 1:
        type = '项目检测';
        break;
      case 1:
        type = '里程碑检测';
        break;
      default:
        type = '未定义';
    }
    return type;
  }
}).filter('codeTypeFilter', function() {
  return function(data) {
    var type;
    data = parseInt(data);
    switch (data) {
      case 0:
        type = '本地';
        break;
      case 1:
        type = 'Svn';
        break;
      default:
        type = 'Git';
    }
    return type;
  }
}).filter('auditResultFilter', function() {
  return function(data) {
    var type;
    data = parseInt(data);
    switch (data) {
      case 6:
        type = '不是问题';
        break;
      case 1:
        type = '低';
        break;
      case 3:
        type = '中';
        break;
      case 5:
        type = '高';
        break;
      default:
        type = '未审计';
    }
    return type;
  }
}).filter('auditSyResultFilter', function() {
  return function(data) {
    var type;
    data = parseInt(data);
    switch (data) {
      case 0:
        type = '不是问题';
        break;
      case 1:
        type = '是问题';
        break;
      default:
        type = '未审计';
    }
    return type;
  }
}).filter('JDKFilter', function() {
  return function(data) {
    switch (data) {
      case 0:
        return "1.7";
      case 1:
        return "1.6";
      case 2:
        return "1.5";
      case 3:
        return "1.4";
      case 4:
        return "1.8";
      default:
        return "未知";
    }
  };
}).filter('taskStatusFilter', function() {
  return function(data) {
    var taskStatus = {
      0: "任务未开始",
      1: "检测中",
      2: "检测成功",
      3: "检测失败"
    };
    return taskStatus[data];
  }
}).filter('reportStatusFilter', function() {
  return function(data) {
    var type;
    data = parseInt(data);
    switch (data) {
      case 0:
        type = '成功';
        break;
      case 1:
        type = '失败';
        break;
      case 2:
        type = '进行中';
        break;
      default:
        type = '未知';
    }
    return type;
  }
}).filter('reportFormat', function() {
  return function(data) {
    var type;
    data = parseInt(data);
    switch (data) {
      case 0:
        type = 'Word';
        break;
      case 1:
        type = 'PDF';
        break;
      case 2:
        type = 'Excel';
        break;
      default:
        type = '未知';
    }
    return type;
  }
}).filter('cutFilter', function() {
  return function(data, length) {
    if (!length)
      length = 10;
    if (data && data.length > length)
      return data.substring(0, length) + "...";
    //return "<a title='" + data + "'>" + data.substring(0, 10) + "...<a>";
    else
      return data;
  }
}).filter('osFilter', function() {
  return function(data) {
    var oss = {
      0: "windows",
      1: "linux"
    };
    return oss[data];
  }
}).filter('engineStstusFilter', function() {
  return function(data) {
    var engine = {
      0: "在线",
      1: "不在线"
    };
    return engine[data];
  }
}).filter('osFilter', function() {
  return function(data) {
    data = parseInt(data);
    var engine = {
      0: "Windows",
      1: "Linux"
    };
    return engine[data];
  }
}).filter('toDisplay', function() {
  return function(str) {
    var strHash = {
      lowProblemSum: '低',
      midProblemSum: '中',
      highProblemSum: '高'
    };
    return strHash[str] || str;
  }
}).filter('countFormat', function() {

  return function(data, suffix) {
    suffix = suffix || "";
    if (!data)
      return 0;
    data = parseInt(data);
    if (data > 10000)
      return $.format(data / 10000, 2) + "<font class='unit'>万个" + suffix + "</font>";
    return data + "<font class='unit'>个" + suffix + "</font>";
  }
}).filter('countFormatU', function() {
  return function(data, u) {
    var u_start = "";
    var u_end = "";
    if (u) {
      u_start = "<u>";
      u_end = "</u>";
    }
    if (!data)
      return 0;
    data = parseInt(data);
    if (data > 10000)
      return u_start + $.format(data / 10000, 2) + u_end + "<font class='unit'>万个</font>";
    return u_start + data + u_end + "<font class='unit'>个</font>";
  }
}).filter('sizeFormat', function() {
  return function(data) {
    if (!data)
      return 0;
    data = parseInt(data);
    if (data < 1024)
      return data + "b";
    else if (data < 1024 * 1024)
      return $.format(data / 1024, 2) + "<font class='unit'>K</font>";
    else return $.format(data / (1024 * 1024), 2) + "<font class='unit'>M</font>";

  }
}).filter('rowCountFormat', function() {
  return function(data) {
    if (!data)
      return 0;
    data = parseInt(data);
    if (data > 10000)
      return $.format(data / 10000, 2) + "<font class='unit'>万行</font>";
    return data + "<font class='unit'>行</font>";
  }
}).filter('progressFormat', function() {
  return function(data) {
    if (!data)
      return 0;
    return $.format(data, 1);
  }
}).filter('matchFilter', function($filter) {
  return function(data, keyword, fields) {
    var result = [];

    function deepCompare(item, keyword, fields) {
      keyword = keyword || '';
      if (keyword == '')
        return true;
      for (var i = 0; i < fields.length; i++) {
        var field = fields[i] || '';
        if (field == '')
          return true;
        var fieldValue = item;
        var filterSplit = field.split('|');
        var fieldFilter;
        if (filterSplit.length > 1) {
          field = filterSplit[0];
          fieldFilter = filterSplit[1];
        } else {
          fieldFilter = null
        }
        angular.forEach(field.split('.'), function(subField) {
          fieldValue = fieldValue[subField];
          /*if(field is Array)
           {
           var newFields=field.substring(field.l)
           return deepCompare(fieldValue, keyword, fields);
           }*/

        });
        if (fieldFilter)
          fieldValue = $filter(fieldFilter)(fieldValue);
        if (fieldValue && typeof(fieldValue) == 'object') {
          return deepCompare(fieldValue, keyword, fields);
        } else {
          fieldValue = fieldValue || '';
          fieldValue = fieldValue.toLowerCase();
          if (fieldValue.indexOf(keyword.toLowerCase()) != -1)
            return true;
        }
      }
      return false;
    };

    if (fields && fields.length > 0) {
      angular.forEach(data, function(item) {
        if (deepCompare(item, keyword, fields))
          result.push(item);
      });
      /*  return $filter('filter')(data, condition, function (item, keywork) {
       return deepCompare(item,keywork,fields);
       });*/
      return result;
    } else {
      return $filter('filter')(data, keyword);
    }
  }
});