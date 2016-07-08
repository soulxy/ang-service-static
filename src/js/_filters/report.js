/**
 * Created by Kuroky360 on 15/8/24.
 */
app.filter('reportFilter', function() {
  return function(input, condition) {
    if (!condition.isFilter)
      return input;
    var reportName = $.trim(condition.reportName).toLowerCase();
    var user = $.trim(condition.userName).toLowerCase();
    var sTime = (!condition.stime || condition.stime == '') ? true : Date.parse(condition.stime);
    var eTime = (!condition.etime || condition.etime == '') ? true : Date.parse(condition.etime) + 24 * 60 * 60 * 1000;
    var result = [];
    angular.forEach(input, function(item) {
      if (reportName == '' || item.reportName.toLowerCase().indexOf(reportName) != -1)
        if (user == '' || item.userName.toLowerCase().indexOf(user) != -1)
          if (condition.reportStatus == -1 || item.reportStatus == condition.reportStatus)
            if (condition.extension == -1 || item.extension == condition.extension)
              if (condition.checkType == -1 || item.checkType == condition.checkType)
                if ((sTime === true || Date.parse(item.exportTime) >= sTime) &&
                  (eTime === true || Date.parse(item.exportTime) <= eTime)
                )
                  result.push(item);

    });
    return result;
  };
});