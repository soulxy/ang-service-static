/**
 * Created by Kuroky360 on 15/8/24.
 */
app.service('reportService', function($rootScope, ajax, httpService, $timeout, $q, $sce) {

  this.exportReport = function(reportParam) {
    var url = "";
    var param = $.extend(true, {}, reportParam);
    var format = parseInt(param.format);
    switch (format) {
      case 0:
        url = "report/exportRtf";
        break;
      case 2:
        url = "report/exportXls";
        break;
      case 1:
        url = "report/exportPdf";
        break;
      default:
        url = "report/exportPdf";
        break;
    }
    delete param.format;
    return httpService.post(url, param);
  }
  this.exportReportSy = function(reportParam) {
    var url = "";
    var param = $.extend(true, {}, reportParam);
    var format = parseInt(param.format);
    switch (format) {
      case 0:
        url = "report/exportRtfSy";
        break;
      case 2:
        url = "report/exportXlsSy";
        break;
      case 1:
        url = "report/exportPdfSy";
        break;
      default:
        url = "report/exportPdfSy";
        break;
    }
    delete param.format;
    return httpService.post(url, param);
  }
  this.getReports = function() {
    return httpService.post("report/queryReport");
  }
  this.sendMail = function(msg) {
    return httpService.post("report/sendRpMail", msg);
  }
  this.deletes = function(rpts) {
    return httpService.post("report/deleteRp", rpts);
  }
  this.downloadReport = function(data) {
    return httpService.post('report/downloadRp', data);
  }
});