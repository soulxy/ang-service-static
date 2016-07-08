/**
 * Created by Kuroky360 on 15/8/24.
 */
app.filter('taskFilter', ['uiService', function(uiService) {
  return function(input, condition) {
    if (!condition.isFilter)
      return input;
    var taskName = $.trim(condition.taskName).toLowerCase();
    var userName = $.trim(condition.user_name).toLowerCase();
    var sTime = (!condition.stime || condition.stime == '') ? true : Date.parse(condition.stime);
    var eTime = (!condition.etime || condition.etime == '') ? true : Date.parse(condition.etime);

    if (eTime !== true) {
      eTime += 24 * 60 * 60 * 1000;
    }

    if (sTime !== true && eTime !== true && condition.stime > condition.etime) {
      uiService.alert("开始时间不能大于结束时间");
      return;
    }
    var result = [];
    angular.forEach(input, function(item) {
      if ((condition.lang == -1 || item.taskVO.language == condition.lang) &&
        (condition.status == -1 || item.taskVO.taskStatus == condition.status)) {
        if (taskName == '' || item.taskVO.codeName.toLowerCase().indexOf(taskName) != -1)
          if (userName == '' || item.user_name.toLowerCase().indexOf(userName) != -1)
            if ((!condition.minBugCount || item.taskVO.problemNum >= condition.minBugCount) &&
              (condition.maxBugCount === '' || condition.maxBugCount === null || (item.taskVO.problemNum <= condition.maxBugCount))
            )
              if ((sTime === true || item.taskVO.taskBeginTime >= sTime) &&
                (eTime === true || item.taskVO.taskEndTime <= eTime)
              )
                result.push(item);
      }
    });
    return result;
  };
}]);