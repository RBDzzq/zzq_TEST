/**
 * Copyright 2019 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or
 * otherwise make available this code.
 *
 */

if (!suitel10n) {
    var suitel10n = {};
}

suitel10n.jp = suitel10n.jp || {};
suitel10n.jp.data = suitel10n.jp.data || {};

suitel10n.jp.data.ReportDAO = function () {

    this.getReportId = function getReportId(reportName){
        var rs = nlapiSearchGlobal(reportName);
        if (rs == null)
            return null;

        for (var i = 0; i < rs.length; ++i)
        {
            var rsName = rs[i].getValue("name");
            if (rsName && (rsName.toLowerCase() === reportName.toLowerCase()))
            {
                var reportId = rs[i].getId().replace(/REPO_/, "");  //remove "REPO_" prefix
                nlapiLogExecution('AUDIT', 'getReportId', 'reportId=' + reportId);
                return parseInt(reportId, 10);
            }
        }

        return null;
    }
};