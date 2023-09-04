/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope Public
 * @NAmdConfig ../Common/myconfig.json
 * CSV読み込んでレコードに保存する
 *
 *
 */

define(['N/ui/serverWidget', 'N/log', 'N/https', 'N/url', 'N/record', 'N/runtime', 'N/format', 'N/redirect', 'N/search', 'N/file','N/task', 'me', 'lib', 'underscore'],
    function (serverWidget, log, https, url, record, runtime, format, redirect, search, file,task, me, lib, _) {

        //file items
        var fileitems = {
            '三井住友銀行': {
                bank: 'SMBC_NBKK',
                filetype: 'csv',
                header: [1, 'typcode', 'codesort', 'createdte', 'acountdtefrom', 'acountdteto', 'bankcode', 'bankname', 'branchcode', 'branchname', 'deposititem', 'depositacc', 'subsidiaryname'],
                record: [2, 'depositnum', 'paymentdate', 'startdte', 'paymentamo', 'otheramo', 'transclientcode', 'request', 'bank', 'branchoff', 'cancelindicator', 'ediinfo'],
                trailor: [8, 'totaltrans', 'totaltransamo', 'totalcancel', 'totalcancelamo'],
                end: [9],
            },
            'みずほ': {
                bank: 'MIZUHO_NBKK',
                filetype: 'csv',
                header: [1, 'typcode', 'codesort', 'createdte', 'acountdtefrom', 'acountdteto', 'bankcode', 'bankname', 'branchcode', 'branchname', 'deposititem', 'depositacc', 'subsidiaryname'],
                record: [2, 'depositnum', 'paymentdate', 'startdte', 'paymentamo', 'otheramo', 'transclientcode', 'request', 'bank', 'branchoff', 'cancelindicator', 'ediinfo'],
                trailor: [8, 'totaltrans', 'totaltransamo', 'totalcancel', 'totalcancelamo'],
                end: [9],
            },
            '三菱UFJ': {
                bank: 'MUFG_NBKK',
                filetype: 'csv',
                header: [1, 'bankname', 'bankname2','column4','column5','depositaccname', 'depositacc', 'subsidiaryname', 'acountdtefromTo', 'column10','column11','column12'],
                record: [2, 'paymentdate', 'column3', 'column4', 'request', 'bank', 'branchoff', 'column8', 'column9', 'paymentamo'],
                trailor: [8, 'totaltrans', 'column3', 'column4', 'column5', 'column6', 'column7', 'column8', 'column9', 'totaltransamo'],
                end: [9],
            },
        }



    function onRequest(context) {
            try {
                if (context.request.method === 'GET') {
                    var scriptObj = runtime.getCurrentScript();

                    var form = serverWidget.createForm({
                        title: '入金データ取込'
                    });

                    var clientScriptFileId = scriptObj.getParameter({name: 'custscript_dj_cs_import_csv_fileid'});
                    form.clientScriptFileId = clientScriptFileId;

                    var selectField = form.addField({
                        id: 'custpage_bankname',
                        type: serverWidget.FieldType.SELECT,
                        label: '振込銀行'
                    });

                    var bankSearch = search.create({
                        type: 'customlist_dj_custpayment_bankname',
                        columns: [{
                            name: 'name'
                        },{name:'internalid',sort: search.Sort.ASC}]
                    });
                    var resultSet = bankSearch.run();
                    var results = resultSet.getRange({ start: 0, end: 100 });

                    for (var i = 0; i < results.length; i++) {
                        selectField.addSelectOption({
                            value: results[i].getValue({name: 'name'}),
                            text: results[i].getValue({name: 'name'})
                        });
                    }

                    var subsidiaryField = form.addField({
                        id: 'custpage_custom_subsidiary',
                        type: serverWidget.FieldType.SELECT,
                        label: '連結'
                    });

                    var objSearch = search.load({id: 'customsearch_dj_subsidiary_search'}).run();

                    var res = [];
                    var resultIndex = 0;
                    var resultStep = 1000;
                    do {
                        var results = objSearch.getRange({
                            start : resultIndex,
                            end : resultIndex + resultStep
                        });

                        if (results.length > 0) {
                            res = res.concat(results);
                            resultIndex = resultIndex + resultStep;
                        }
                    } while (results.length > 0);
                    log.debug('res',res);

                    var currentSubsidiary;
                    for(var i=0;i<res.length;i++){
                        if(res[i].id == runtime.getCurrentUser().subsidiary){
                            currentSubsidiary = res[i];
                            break;
                        }
                    }

                    var nameSelf = currentSubsidiary.getValue({name:'namenohierarchy'});

                    var resArray = [];
                    for(var i=0;i<res.length;i++){
                        var name = res[i].getValue({name:'name'});
                        var nameArray = name.split(' : ');
                        var index = nameArray.indexOf(nameSelf);
                        if(index == 0){
                            resArray = res;
                            break;
                        }
                        if(index > 0){
                            resArray.push(res[i])
                        }
                    }

                    util.each(resArray, function (r) {
                        subsidiaryField.addSelectOption({
                            value: r.id,
                            text: r.getValue({name:'name'})
                        });
                    })

                    var field = form.addField({
                        id: 'custom_file',
                        type: serverWidget.FieldType.FILE,
                        label: 'ファイル選択'
                    });
                    field.updateLayoutType({
                        layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW
                    });
                    form.addSubmitButton({label: '実行'});
                    context.response.writePage(form);
                }
                else if (context.request.method === 'POST') {
                    log.audit("入金データ取込 start :" + Date.now());
                    var scriptObj = runtime.getCurrentScript();
                    var csvfolder = scriptObj.getParameter({name: 'custscript_dj_csvfolder_array'});
                    var fileObj = context.request.files.custom_file;
                    fileObj.folder = csvfolder;
                    fileObj.encoding = file.Encoding.SHIFT_JIS;


                    var objlist = null;
                    var custombank = context.request.parameters.custpage_bankname;
                    var subsidiary = context.request.parameters.custpage_custom_subsidiary;
                    var lineitems = fileitems[custombank];

                    if (checkFileName(fileObj.name)) {
                        var html = '<SCRIPT language="JavaScript" type="text/javascript">';
                        html += "function bindEvent(element, type, handler) {if(element.addEventListener) {element.addEventListener(type, handler, false);} else {element.attachEvent('on'+type, handler);}} ";
                        html += 'bindEvent(window, "load", function(){';
                        html += 'if (confirm("csv ファイル名が重複しています。") == true) {';
                        html += 'window.history.back()';
                        html += '}';
                        html += 'else{';
                        html += 'window.history.back()';
                        html += '}';
                        html += '});';
                        html += '</SCRIPT>';
                        var form = serverWidget.createForm({
                            title: '入金データ取込'
                        });
                        var field1 = form.addField({
                            id: 'fieldid',
                            type: serverWidget.FieldType.INLINEHTML,
                            label: 'Text'
                        });
                        field1.defaultValue = html;
                        context.response.writePage(form);
                        return;
                    }
                    if (lineitems.filetype == 'csv') {

                        var arrData = CSVToArray(fileObj.getContents());

                        objlist = csvarrayToObjectList(arrData, lineitems);


                    }
                    if (!objlist || objlist[0].indicator != 1 || objlist[objlist.length - 2].indicator != 9) {
                        var html = '<SCRIPT language="JavaScript" type="text/javascript">';
                        html += "function bindEvent(element, type, handler) {if(element.addEventListener) {element.addEventListener(type, handler, false);} else {element.attachEvent('on'+type, handler);}} ";
                        html += 'bindEvent(window, "load", function(){';
                        html += 'if (confirm("データファイルのフォーマットが正しくありません。") == true) {';
                        html += 'window.history.back()';
                        html += '}';
                        html += 'else{';
                        html += 'window.history.back()';
                        html += '}';
                        html += '});';
                        html += '</SCRIPT>';
                        var form = serverWidget.createForm({
                            title: '入金データ取込'
                        });
                        var field1 = form.addField({
                            id: 'fieldid',
                            type: serverWidget.FieldType.INLINEHTML,
                            label: 'Text'
                        });
                        field1.defaultValue = html;
                        context.response.writePage(form);
                        return;
                    }

                    // DBにCSVの銀行名と連結名と勘定科目を取得
                    var searchType = 'customrecord_dj_custpayment_sub_acc';
                    var searchFilters = [];
                    // searchFilters.push(["custrecord_dj_subsidiary", "is", subsidiary]);
                    // searchFilters.push("AND");
                    searchFilters.push(["custrecord_dj_custpayment_bankname", "is", custombank]);

                    var searchColumns = [search.createColumn({
                        name : "custrecord_dj_custpayment_subsidiaryname"
                    }),search.createColumn({
                        name : "custrecord_dj_custpayment_bankname_csv"
                    }),search.createColumn({
                        name : "custrecord_dj_subsidiary"
                    })];
                    var searchResults = lib.createSearch(searchType,searchFilters,searchColumns)
                    var bankname = "";
                    var subsidiaryname = "";
                    if (searchResults && searchResults.length > 0) {
                        bankname = searchResults[0].getValue(searchColumns[1])
                        for (var i=0;i<searchResults.length;i++){
                            var sub = searchResults[i].getValue(searchColumns[2]);
                            if (sub == subsidiary) {
                                subsidiaryname = searchResults[i].getValue(searchColumns[0]);
                                break;
                            }
                        }

                    }


                    if (checkBankname(objlist, bankname)) {
                        var html = '<SCRIPT language="JavaScript" type="text/javascript">';
                        html += "function bindEvent(element, type, handler) {if(element.addEventListener) {element.addEventListener(type, handler, false);} else {element.attachEvent('on'+type, handler);}} ";
                        html += 'bindEvent(window, "load", function(){';
                        html += 'if (confirm("画面で選択した銀行とCSVの銀行が一致していません。") == true) {';
                        html += 'window.history.back()';
                        html += '}';
                        html += 'else{';
                        html += 'window.history.back()';
                        html += '}';
                        html += '});';
                        html += '</SCRIPT>';
                        var form = serverWidget.createForm({
                            title: '入金データ取込'
                        });
                        var field1 = form.addField({
                            id: 'fieldid',
                            type: serverWidget.FieldType.INLINEHTML,
                            label: 'Text'
                        });
                        field1.defaultValue = html;
                        context.response.writePage(form);
                        return;
                    }


                    if (checkSubsidiary(objlist, subsidiaryname)) {
                        var html = '<SCRIPT language="JavaScript" type="text/javascript">';
                        html += "function bindEvent(element, type, handler) {if(element.addEventListener) {element.addEventListener(type, handler, false);} else {element.attachEvent('on'+type, handler);}} ";
                        html += 'bindEvent(window, "load", function(){';
                        html += 'if (confirm("画面で選択した連結とCSVの連結が一致していません。") == true) {';
                        html += 'window.history.back()';
                        html += '}';
                        html += 'else{';
                        html += 'window.history.back()';
                        html += '}';
                        html += '});';
                        html += '</SCRIPT>';
                        var form = serverWidget.createForm({
                            title: '入金データ取込'
                        });
                        var field1 = form.addField({
                            id: 'fieldid',
                            type: serverWidget.FieldType.INLINEHTML,
                            label: 'Text'
                        });
                        field1.defaultValue = html;
                        context.response.writePage(form);
                        return;
                    }

                    for (var i = 0; i < objlist.length; i++) {
                        var row = objlist[i];
                        if (row.indicator == 2) {
                            row.paymentamo = format.parse({ value: row.paymentamo, type: format.Type.INTEGER });
                        } else if (row.indicator == 8) {
                            row.totaltransamo = format.parse({ value: row.totaltransamo, type: format.Type.INTEGER });
                        }
                    }

                    if (checkTotal(objlist)) {
                        var html = '<SCRIPT language="JavaScript" type="text/javascript">';
                        html += "function bindEvent(element, type, handler) {if(element.addEventListener) {element.addEventListener(type, handler, false);} else {element.attachEvent('on'+type, handler);}} ";
                        html += 'bindEvent(window, "load", function(){';
                        html += 'if (confirm("データ内で不一致が生じています。") == true) {';
                        html += 'window.history.back()';
                        html += '}';
                        html += 'else{';
                        html += 'window.history.back()';
                        html += '}';
                        html += '});';
                        html += '</SCRIPT>';
                        var form = serverWidget.createForm({
                            title: '入金データ取込'
                        });
                        var field1 = form.addField({
                            id: 'fieldid',
                            type: serverWidget.FieldType.INLINEHTML,
                            label: 'Text'
                        });
                        field1.defaultValue = html;
                        context.response.writePage(form);
                        return;
                    }
                    if (checkPaymentdate(objlist)) {
                        var html = '<SCRIPT language="JavaScript" type="text/javascript">';
                        html += "function bindEvent(element, type, handler) {if(element.addEventListener) {element.addEventListener(type, handler, false);} else {element.attachEvent('on'+type, handler);}} ";
                        html += 'bindEvent(window, "load", function(){';
                        html += 'if (confirm("CSVの入金日が複数存在しています。") == true) {';
                        html += 'window.history.back()';
                        html += '}';
                        html += 'else{';
                        html += 'window.history.back()';
                        html += '}';
                        html += '});';
                        html += '</SCRIPT>';
                        var form = serverWidget.createForm({
                            title: '入金データ取込'
                        });
                        var field1 = form.addField({
                            id: 'fieldid',
                            type: serverWidget.FieldType.INLINEHTML,
                            label: 'Text'
                        });
                        field1.defaultValue = html;
                        context.response.writePage(form);
                        return;
                    }
                    var fileId = fileObj.save();

                    // CSV DATA BACKUP
                    var scriptTask = task.create({taskType: task.TaskType.MAP_REDUCE});
                    scriptTask.scriptId = 'customscript_dj_mr_import_csv';
                    scriptTask.deploymentId = 'customdeploy_dj_mr_import_csv';
                    scriptTask.params = {
                        custscript_dj_import_csv_arrdata: JSON.stringify(objlist),
                        custscript_dj_import_csv_filename: fileObj.name

                    };
                    var scriptTaskId = scriptTask.submit();

                    var recCustpaymentHeadId = createCustomRecord(objlist, fileObj.name, subsidiary, custombank);
                    log.audit("入金データ取込 end :" + Date.now());
                    redirect.toSuitelet({
                        scriptId: 'customscript_dj_sl_payment_management',
                        deploymentId: 'customdeploy_dj_sl_payment_management',
                        parameters: {
                            'custscript_custpayment_head_id': recCustpaymentHeadId
                        }
                    });

                    var scriptObj = runtime.getCurrentScript();
                    log.debug("Remaining governance units: " + scriptObj.getRemainingUsage());
                }
            } catch (exception) {
                log.error({
                    title: 'Error',
                    details: exception
                });
            }
        }

        function csvarrayToObjectList(arrData, lineitems) {
            try {
                var objlist = [];
                for (var i = 0; i < arrData.length; i++) {
                    var row = arrData[i];

                    var items = lineitems.end;
                    if (row[0] == lineitems.record[0])
                        items = lineitems.record;
                    else if (row[0] == lineitems.header[0])
                        items = lineitems.header;
                    else if (row[0] == lineitems.trailor[0])
                        items = lineitems.trailor;

                    var warekiYear = getWarekiYear();
                    var obj = { indicator: row[0] };
                    for (var m = 1; m < items.length; m++) {
                        if (row[m] && typeof(row[m]) == 'string') {
                            obj[items[m]] = row[m].trim();
                        } else {
                            obj[items[m]] = row[m];
                        }
                        if (lineitems.bank == 'MUFG_NBKK' && items[m] == 'paymentdate') {
                            var dateTmpArr = obj[items[m]].split('.');
                            var year = parseInt(dateTmpArr[0]) - parseInt(warekiYear);
                            obj[items[m]] = '' + npad(year) + npad(dateTmpArr[1]) + npad(dateTmpArr[2]);

                            obj['depositnum'] = '' + parseInt(dateTmpArr[0]) + npad(dateTmpArr[1]) + npad(dateTmpArr[2]) + '-'+i;
                        }
                    }
                    objlist.push(obj);
                }
                return objlist;
            } catch(e) { }
            return null
        }

        function checkCSVData(arrData) {
            if (arrData[0][0] != 1 || arrData[arrData.length - 2][0] != 9) {
                return (true);
            } else {
                return (false);
            }
        }

        function checkBankname(objlist,bankname) {

            var banknameCsv = objlist[0].bankname;
            log.debug("csv banknameCsv",banknameCsv)
            log.debug("db bankname",bankname)
            return bankname != banknameCsv;
        }

        function checkSubsidiary(objlist, subsidiaryName) {

            var subsidiaryNameCsv = objlist[0].subsidiaryname;

            log.debug("db subsidiaryname",subsidiaryName)
            log.debug("csv subsidiaryNameCsv",subsidiaryNameCsv)
            return subsidiaryName != subsidiaryNameCsv;
        }

        function checkTotal(objlist) {
            var sum_amounts = 0;
            var total_transfer_amount = 0;
            for (i = 1; i < objlist.length; i++) {
                var row = objlist[i];
                if (row.indicator == 2) {
                    sum_amounts += row.paymentamo;
                } else if (row.indicator == 8) {
                    total_transfer_amount = row.totaltransamo;
                }
            }
            return total_transfer_amount != sum_amounts;
        }

        function checkPaymentdate(objlist) {

            var paymentdate = '';
            for (var i = 1; i < objlist.length; i++) {
                var row = objlist[i];
                if (row.indicator == 2 && !me.isEmpty(row.paymentdate)) {
                    if (paymentdate != '' && paymentdate != row.paymentdate) {
                        return true;
                    } else {
                        paymentdate = row.paymentdate;
                    }
                }
            }
            return false;

        }

        function checkFileName(fileName) {


            var filterArr = [];
            filterArr.push({
                name: 'custrecord_dj_cust_csvfile_filename',
                operator: search.Operator.IS,
                values: [fileName]
            });
            var searchObj = search.create({
                type: "customrecord_dj_custpayment_csvfile",
                filters: filterArr,
                columns:
                    [
                        search.createColumn({name: "custrecord_dj_cust_csvfile_filename", label: "Name"})
                    ]
            });
            var searchResultCount = searchObj.run();
            var searchlinesResults = searchResultCount.getRange({
                start: 0,
                end: 1
            });
            if (searchlinesResults != null && searchlinesResults.length > 0) {

                return true;
            }
            return false;


        }

        /**
         * Read data from input and add it to custom record
         * @param {[array]} arrData [two dimension array of csv data]
         */
        function createCustomRecord(objlist, filename, subsidiary, custombank) {
            try {
                var recCustpaymentHeadId;
                var userObj = runtime.getCurrentUser();
                var nowDate = getNowDateJP();
                var warekiYear = getWarekiYear();


                var objSearch = search.load({id: 'customsearch_dj_subsidiary_search'}).run();

                var res = [];
                var resultIndex = 0;
                var resultStep = 1000;
                do {
                    var results = objSearch.getRange({
                        start : resultIndex,
                        end : resultIndex + resultStep
                    });

                    if (results.length > 0) {
                        res = res.concat(results);
                        resultIndex = resultIndex + resultStep;
                    }
                } while (results.length > 0);

                var currentSubsidiary;
                for(var i=0;i<res.length;i++){
                    if(res[i].id == subsidiary){
                        currentSubsidiary = res[i];
                        break;
                    }
                }

                var nameSelect = currentSubsidiary.getValue({name:'namenohierarchy'});

                for (var i = objlist.length - 1; i >= 0; i--) {
                    var row = objlist[i];
                    if (row.indicator == 8) {
                        var recCustpaymentHead = record.create({
                            type: 'customrecord_dj_custpayment_management'
                        });
                        recCustpaymentHead.setValue({
                            fieldId: 'custrecord_dj_custpayment_importdate',
                            value: nowDate
                        });
                        recCustpaymentHead.setValue({
                            fieldId: 'custrecord_dj_custpayment_importnumber',
                            value: format.parse({value: row.totaltrans, type: format.Type.INTEGER})
                        });
                        recCustpaymentHead.setValue({
                            fieldId: 'custrecord_dj_custpayment_amountsum',
                            value: format.parse({value: row.totaltransamo, type: format.Type.INTEGER})
                        });
                        recCustpaymentHead.setValue({
                            fieldId: 'custrecord_dj_custpayment_filename',
                            value: filename
                        });
                        recCustpaymentHead.setValue({
                            fieldId: 'custrecord_dj_custpayment_importperson',
                            value: userObj.id
                        });
                        recCustpaymentHead.setValue({
                            fieldId: 'custrecord_dj_custpayment_status',
                            value: 1
                        });
                        recCustpaymentHead.setValue({
                            fieldId: 'custrecord_dj_custpayment_subsidiary',
                            value: subsidiary
                        });
                        recCustpaymentHead.setValue({
                            fieldId: 'custrecord_dj_custpayment_bank_name',
                            value: custombank
                        });

                        break;
                    }
                }
                //get payment list
                var paymentList = [];
                var paymentDate = '';
                var invoiceList = lib.doGetAllInvDetail();



                var custbankSearch = search.load({
                    id: 'customsearch_dj_custpayment_custbank'
                });
                var custList = custbankSearch.run();
                var searchCustResults = [];
                if (custList != null) {
                    var searchCount = 0;
                    var searchlinesResults;
                    do {
                        searchlinesResults = custList.getRange({
                            start: searchCount,
                            end: searchCount + 1000
                        });
                        if (searchlinesResults != null && searchlinesResults.length > 0) {
                            searchCustResults = searchCustResults.concat(searchlinesResults);
                        }
                        searchCount += 1000;
                    } while ( searchlinesResults.length == 1000 );
                }

                //
                // var allInvoiceList = lib.doGetAllInvDetail();
                log.debug('objlist.length',objlist.length);
                for (var i = 0; i < objlist.length - 1; i++) {

                    var row = objlist[i];
                    if (row.indicator == 2) {
                        var obj = {};
                        //入金番号
                        obj.depositnum = row.depositnum;
                        //入金日
                        obj.paymentdate = new Date(coventDate(row.paymentdate, warekiYear));
                        if (paymentDate == '') {
                            var date = parseFloat(row.paymentdate);
                            var yearString = warekiYear * 10000 + date
                            var year = yearString.toString().slice(0, 4);
                            var month = yearString.toString().slice(4, 6);
                            var day = yearString.toString().slice(6);
                            paymentDate = year + '/' + month + '/' + day;
                        }
                        // 入金口座
                        obj.depositacc = objlist[0].depositacc;
                        //銀行
                        obj.bank = row.bank;
                        //支店
                        obj.branchoff = row.branchoff;
                        //依頼人
                        obj.request = row.request.replace(/\s/g, '');
                        for (var k = 0; k < searchCustResults.length; k++){

                            // log.debug('顧客 obj.id', searchCustResults[k].id);
                            // log.debug('顧客 subsidiary', searchCustResults[k].getText({name: 'subsidiary'}));
                            // log.debug('顧客 nameSelect', nameSelect);
                            // log.debug('顧客 searchCustResults[k].getValue({name: \'custentity_dj_custpayment_bankname\'})', searchCustResults[k].getValue({name: 'custentity_dj_custpayment_bankname'}));
                            // log.debug('顧客 obj.bank', obj.bank);
                            // log.debug('顧客 searchCustResults[k].getValue({name: \'custentity_dj_custpayment_branchname\'})', searchCustResults[k].getValue({name: 'custentity_dj_custpayment_branchname'}));
                            // log.debug('顧客 obj.branchoff', obj.branchoff);
                            // log.debug('顧客 searchCustResults[k].getValue({name: \'custentity_dj_custpayment_clientname\'})', searchCustResults[k].getValue({name: 'custentity_dj_custpayment_clientname'}));
                            // log.debug('顧客 obj.request', obj.request);
                            // log.debug('顧客 if1', searchCustResults[k].getValue({name: 'custentity_dj_custpayment_bankname'}) == obj.bank);
                            // log.debug('顧客 if2', searchCustResults[k].getValue({name: 'custentity_dj_custpayment_branchname'}) == obj.branchoff);
                            // log.debug('顧客 if3', searchCustResults[k].getValue({name: 'custentity_dj_custpayment_clientname'}) == obj.request);
                            // log.debug('顧客 if4', searchCustResults[k].getText({name: 'subsidiary'}).split(' : ').indexOf(nameSelect) >= 0);

                            if (searchCustResults[k].getValue({name: 'custentity_dj_custpayment_bankname'}) == obj.bank
                            && searchCustResults[k].getValue({name: 'custentity_dj_custpayment_branchname'}) == obj.branchoff
                            && searchCustResults[k].getValue({name: 'custentity_dj_custpayment_clientname'}) == obj.request
                            && new RegExp(nameSelect + "$").test(searchCustResults[k].getText({name: 'subsidiary'}))) {

                                // 顧客
                                obj.id = searchCustResults[k].id;
                                obj.nameText = searchCustResults[k].getValue({name: 'altname'});
                                log.debug('顧客 obj.id', obj.id);
                                // 得意先NO.
                                obj.entityid = searchCustResults[k].getValue({name:'formulatext',formula:'{entityid}'});
                                obj.customerno = obj.entityid.split(" ")[0];
                                // 請求書リスト
                                obj.invoiceList = [];
                                // 債権合計
                                for (var m = 0; m < invoiceList.length; m++) {

                                    var result = invoiceList[m];

                                    if ((result.nameText+" ").indexOf(" "+obj.nameText+" ") >= 0
                                        && new RegExp(nameSelect + "$").test(result.subsidiary)) {
                                        log.debug("result.duedate",result.duedate)
                                        log.debug("paymentDate",paymentDate)
                                        log.debug("result.duedate <= paymentDate",result.duedate <= paymentDate)
                                        if(result.duedate <= paymentDate){

                                            if (!obj.claimsum) {
                                                obj.claimsum = 0;
                                            }
                                            obj.claimsum += parseInt(result.amountremaining);
                                            obj.invoiceList.push(result);
                                        }
                                    }
                                }


                                log.debug('顧客'+obj.nameText, obj.invoiceList);

                                break;
                            }
                        }

                        // 入金額
                        obj.paymentamo = row.paymentamo;

                        paymentList.push(obj);
                        // log.debug('paymentList.length',paymentList.length)

                    }
                }

                // var df = new Date(Math.min.apply(null, paymentDateArr));
                // log.debug('custrecord_dj_custpayment_date_from  ', df);

                // var dt = new Date(Math.max.apply(null, paymentDateArr));
                // log.debug('custrecord_dj_custpayment_date_to  ', dt);

                recCustpaymentHead.setValue({
                    fieldId: 'custrecord_dj_custpayment_date_from_csv',
                    value: new Date(paymentDate)
                });
                recCustpaymentHead.setValue({
                    fieldId: 'custrecord_dj_custpayment_date_to',
                    value: new Date(paymentDate)
                });


                //summary amount
                var paymentGroupObj = _.groupBy(paymentList, function (e) {
                    return e.bank + '|' + e.branchoff + '|' + e.request;
                });

                var listGroupKey = _.keys(paymentGroupObj);
                var listSummaryPayment = [];
                util.each(listGroupKey, function (groupKey) {
                    //each parent has a list item in group
                    var groupListItem = paymentGroupObj[groupKey];
                    var paymentSum = 0;
                    util.each(groupListItem, function (item, i) {
                        paymentSum += item.paymentamo;
                        if (groupListItem.length - 1 == i) {
                            item.paymentamo = paymentSum;
                            listSummaryPayment.push(item);
                        }
                    });
                });
                //sort as 入金番号
                var listSummaryPaymentSort = _.sortBy(listSummaryPayment, me.string_comparator('depositnum'));
                var objSetting = getSetting();
                var feeList = getFee();
                //set data
                util.each(listSummaryPaymentSort, function (rowObj, j) {
                    //選択チェック
                    recCustpaymentHead.setSublistValue({
                        sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                        fieldId: 'custrecord_dj_custpayment_exclusion',
                        line: j,
                        value: true
                    });
                    //入金番号
                    recCustpaymentHead.setSublistValue({
                        sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                        fieldId: 'custrecord_dj_custpayment_depositnum',
                        line: j,
                        value: rowObj.depositnum
                    });
                    //入金口座
                    recCustpaymentHead.setSublistValue({
                        sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                        fieldId: 'custrecord_dj_custpayment_depositacc',
                        line: j,
                        value: rowObj.depositacc
                    });
                    //得意先
                    if (!me.isEmpty(rowObj.customerno)) {
                        recCustpaymentHead.setSublistValue({
                            sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                            fieldId: 'custrecord_dj_custpayment_customerno',
                            line: j,
                            value: rowObj.customerno
                        });
                    }
                    //顧客
                    var rowObjId = rowObj.id;
                    if (!me.isEmpty(rowObjId)) {
                        recCustpaymentHead.setSublistValue({
                            sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                            fieldId: 'custrecord_dj_custpayment_client',
                            line: j,
                            value: rowObjId,
                            ignoreFieldChange: true
                        });
                    }

                    // 入金日
                    recCustpaymentHead.setSublistValue({
                        sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                        fieldId: 'custrecord_dj_custpayment_paymentdate',
                        value: rowObj.paymentdate,
                        line: j
                    });
                    // 銀行
                    recCustpaymentHead.setSublistValue({
                        sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                        fieldId: 'custrecord_dj_custpayment_bank',
                        value: rowObj.bank,
                        line: j
                    });
                    // 支店
                    recCustpaymentHead.setSublistValue({
                        sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                        fieldId: 'custrecord_dj_custpayment_branchoff',
                        value: rowObj.branchoff,
                        line: j
                    });
                    // 依頼人
                    recCustpaymentHead.setSublistValue({
                        sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                        fieldId: 'custrecord_dj_custpayment_request',
                        value: rowObj.request,
                        line: j
                    });
                    // 入金額
                    if (!me.isEmpty(rowObj.paymentamo) && rowObj.paymentamo != 0) {
                        recCustpaymentHead.setSublistValue({
                            sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                            fieldId: 'custrecord_dj_custpayment_paymentamo',
                            value: rowObj.paymentamo,
                            line: j
                        });
                    }
                    // 債権合計
                    if (!me.isEmpty(rowObj.claimsum) && rowObj.claimsum != 0) {
                        recCustpaymentHead.setSublistValue({
                            sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                            fieldId: 'custrecord_dj_custpayment_claimsum',
                            value: rowObj.claimsum,
                            line: j
                        });
                    }

                    if (!me.isEmpty(rowObj.paymentamo) && !me.isEmpty(rowObj.claimsum)) {

                        // 一致
                        if (rowObj.paymentamo == rowObj.claimsum) {
                            recCustpaymentHead.setSublistValue({
                                sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                                fieldId: 'custrecord_dj_custpayment_match',
                                value: true,
                                line: j
                            });
                            //選択チェック
                            recCustpaymentHead.setSublistValue({
                                sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                                fieldId: 'custrecord_dj_custpayment_exclusion',
                                line: j,
                                value: false
                            });
                        } else  {
                            // 債権合計消費税
                            // var taxcoAmount = parseInt(rowObj.claimsum*(parseInt(objSetting.taxco))/100);
                            var savingFlg = false;
                            // if (Math.abs(rowObj.paymentamo + taxcoAmount - rowObj.claimsum) <= objSetting.error) {
                            var diff = rowObj.paymentamo - rowObj.claimsum;
                            if (Math.abs(diff) <= parseInt(objSetting.error,10)) {

                                //選択チェック
                                recCustpaymentHead.setSublistValue({
                                    sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                                    fieldId: 'custrecord_dj_custpayment_exclusion',
                                    line: j,
                                    value: false
                                });
                                recCustpaymentHead.setSublistValue({
                                    sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                                    fieldId: 'custrecord_dj_custpayment_consumption',
                                    value: true,
                                    line: j
                                });

                                var acc = objSetting.minus;
                                if (diff > 0) {
                                    acc = objSetting.plus;
                                }

                                var jsonSave3 = {
                                    "account": acc,
                                    "amount": Math.abs(diff),
                                    "amountLeft": Math.abs(diff),
                                    "taxitem": null,
                                    "taxAmount": 0,
                                    "totalAmount": Math.abs(diff)
                                };
                                recCustpaymentHead.setSublistValue({
                                    sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                                    fieldId: 'custrecord_dj_custpayment_saving_t',
                                    value: JSON.stringify(jsonSave3),
                                    line: j
                                });

                                savingFlg = true;

                            } else {

                                // 手数料

                                log.audit('errorCalc',diff);
                                log.audit('feeList',feeList);
                                var findObj = _.findWhere(feeList, {sum: Math.abs(diff), taxco: objSetting.taxco});
                                log.audit('findObj',findObj);
                                if (!_.isUndefined(findObj)) {//found

                                    //選択チェック
                                    recCustpaymentHead.setSublistValue({
                                        sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                                        fieldId: 'custrecord_dj_custpayment_exclusion',
                                        line: j,
                                        value: false
                                    });
                                    recCustpaymentHead.setSublistValue({
                                        sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                                        fieldId: 'custrecord_dj_custpayment_fee',
                                        value: true,
                                        line: j
                                    });

                                    var jsonSave4 = {
                                        "account": objSetting.acc,
                                        "accountTaxMinus": objSetting.accTaxMinus,
                                        "amount": findObj.sum,
                                        "amountLeft": findObj.base,
                                        "taxitem": findObj.taxco,
                                        "taxAmount": findObj.tax,
                                        "totalAmount": findObj.sum
                                    };

                                    recCustpaymentHead.setSublistValue({
                                        sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                                        fieldId: 'custrecord_dj_custpayment_saving_a',
                                        value: JSON.stringify(jsonSave4),
                                        line: j
                                    });

                                    savingFlg = true;

                                } else {
                                    var errorCalc = Math.abs(Math.abs(rowObj.paymentamo - rowObj.claimsum) - parseInt(objSetting.error,10));
                                    log.audit('errorCalc2',errorCalc);
                                    var findObj = _.findWhere(feeList, {sum: errorCalc, taxco: objSetting.taxco});
                                    log.audit('findObj2',findObj);
                                    if (!_.isUndefined(findObj)) {//found

                                        //選択チェック
                                        recCustpaymentHead.setSublistValue({
                                            sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                                            fieldId: 'custrecord_dj_custpayment_exclusion',
                                            line: j,
                                            value: false
                                        });
                                        // 消費税
                                        recCustpaymentHead.setSublistValue({
                                            sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                                            fieldId: 'custrecord_dj_custpayment_consumption',
                                            value: true,
                                            line: j
                                        });
                                        // 手数料
                                        recCustpaymentHead.setSublistValue({
                                            sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                                            fieldId: 'custrecord_dj_custpayment_fee',
                                            value: true,
                                            line: j
                                        });
                                        // 手数料
                                        var jsonSave4 = {
                                            "account": objSetting.acc,
                                            "accountTaxMinus": objSetting.accTaxMinus,
                                            "amount": findObj.sum,
                                            "amountLeft": findObj.base,
                                            "taxitem": findObj.taxco,
                                            "taxAmount": findObj.tax,
                                            "totalAmount": findObj.sum
                                        };

                                        recCustpaymentHead.setSublistValue({
                                            sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                                            fieldId: 'custrecord_dj_custpayment_saving_a',
                                            value: JSON.stringify(jsonSave4),
                                            line: j
                                        });


                                        // 消費税
                                        var jsonSave3 = {
                                            "account": objSetting.minus,
                                            "amount": parseInt(objSetting.error,10),
                                            "amountLeft": parseInt(objSetting.error,10),
                                            "taxitem": null,
                                            "taxAmount": 0,
                                            "totalAmount": parseInt(objSetting.error,10)
                                        };
                                        recCustpaymentHead.setSublistValue({
                                            sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                                            fieldId: 'custrecord_dj_custpayment_saving_t',
                                            value: JSON.stringify(jsonSave3),
                                            line: j
                                        });

                                        savingFlg = true;

                                    }
                                }
                            }

                            if (savingFlg) {
                                var saving = {};
                                var listSelectedInvoice = [];
                                util.each(rowObj.invoiceList, function (invoice, i) {
                                    var applied = invoice.amountremaining;
                                    var adjustmentTmp = null;
                                    if (i == rowObj.invoiceList.length - 1) {
                                        adjustmentTmp =Math.abs(rowObj.paymentamo - rowObj.claimsum);
                                        applied = parseInt(applied - adjustmentTmp, 10);
                                    }
                                    var jsonSave = {
                                        "id": invoice.id,
                                        "check": 'T',
                                        "applied": applied,
                                        "adjustment": adjustmentTmp
                                    };
                                    listSelectedInvoice.push(jsonSave);
                                });
                                saving.invoice = listSelectedInvoice;
                                //合計適用額
                                saving.from = "";
                                //合計適用額
                                saving.to = "";
                                //合計適用額
                                saving.totalAppliedAmount = rowObj.claimsum;
                                //合計調整額
                                saving.totalAdjustmentAmount = Math.abs(rowObj.paymentamo - rowObj.claimsum);

                                if (rowObj.paymentamo - rowObj.claimsum > 0
                                    && Math.abs(rowObj.paymentamo - rowObj.claimsum) <= parseInt(objSetting.error,10)) {
                                    saving.totalAdjustmentAmountWithSign = rowObj.paymentamo - rowObj.claimsum;
                                }

                                recCustpaymentHead.setSublistValue({
                                    sublistId: 'recmachcustrecord_dj_custpayment_m_id',
                                    fieldId: 'custrecord_dj_custpayment_saving',
                                    value: JSON.stringify(saving),
                                    line: j
                                });
                            }

                        }
                    }

                    //set status when finish
                    if (j == paymentList.length - 1) {
                        recCustpaymentHead.setValue({
                            fieldId: 'custrecord_dj_custpayment_status',
                            value: 1
                        });
                    }
                });

                log.debug('============recCustpaymentHead.save before');

                recCustpaymentHeadId = recCustpaymentHead.save({
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                });
                return (recCustpaymentHeadId);
            } catch (e) {
                log.error('createCustomRecord ' + e.name, e.message);
            }
        }

        function getSetting() {
            try {
                var columnsArr = [];
                columnsArr.push({name: 'custrecord_dj_custpayment_setting_acc'});
                columnsArr.push({name: 'custrecord_dj_cuspm_setting_acc_tax_plus'});
                columnsArr.push({name: 'custrecord_dj_cuspm_seting_acc_tax_minus'});
                columnsArr.push({name: 'custrecord_dj_custpayment_setting_taxco'});
                columnsArr.push({name: 'custrecord_dj_custpayment_setting_taxca'});
                columnsArr.push({name: 'custrecord_dj_custpayment_setting_error'});
                columnsArr.push({name: 'custrecord_dj_custpayment_setting_plus'});
                columnsArr.push({name: 'custrecord_dj_custpayment_setting_minus'});

                var mysearch = search.create({
                    type: 'customrecord_dj_custpayment_setting',
                    columns: columnsArr
                });
                var resultSet = mysearch.run().getRange({start: 0, end: 1});
                var obj = {};
                util.each(resultSet, function (result) {
                    obj.acc = result.getValue({name: 'custrecord_dj_custpayment_setting_acc'});
                    obj.accTaxPlus = result.getValue({name: 'custrecord_dj_cuspm_setting_acc_tax_plus'});
                    obj.accTaxMinus = result.getValue({name: 'custrecord_dj_cuspm_seting_acc_tax_minus'});
                    obj.taxco = result.getValue({name: 'custrecord_dj_custpayment_setting_taxco'});
                    obj.taxca = result.getValue({name: 'custrecord_dj_custpayment_setting_taxca'});
                    obj.error = result.getValue({name: 'custrecord_dj_custpayment_setting_error'});
                    obj.plus = result.getValue({name: 'custrecord_dj_custpayment_setting_plus'});
                    obj.minus = result.getValue({name: 'custrecord_dj_custpayment_setting_minus'});
                })
                return obj;
            } catch (e) {
                log.error(' ' + e.name, e.message);
                return {};
            }
        }

        function getFee() {
            try {
                var mysearch = search.create({
                    type: 'customrecord_dj_custfee',
                    columns: [{
                        name: 'name'
                    }, {
                        name: 'custrecord_dj_custfee_sum'
                    }, {
                        name: 'custrecord_dj_custfee_base'
                    }, {
                        name: 'custrecord_dj_custfee_tax'
                    }, {
                        name: 'custrecord_dj_custfee_taxco'
                    }]
                });
                var resultSet = mysearch.run().getRange({start: 0, end: 100});
                var results = [];
                util.each(resultSet, function (result) {
                    var obj = {};
                    obj.id = result.id;
                    obj.name = result.getValue({name: 'name'});
                    obj.sum = parseInt(result.getValue({name: 'custrecord_dj_custfee_sum'}),10);
                    obj.base = parseInt(result.getValue({name: 'custrecord_dj_custfee_base'}),10);
                    obj.tax = parseInt(result.getValue({name: 'custrecord_dj_custfee_tax'}),10);
                    obj.taxco = result.getValue({name: 'custrecord_dj_custfee_taxco'});
                    results.push(obj);
                })
                return results;
            } catch (e) {
                log.error('getFee ' + e.name, e.message);
                return [];
            }
        }

        function coventDate(strDate, warekiYear) {
            var date = parseFloat(strDate);
            var yearString = warekiYear * 10000 + date
            var year = yearString.toString().slice(0, 4);
            var month = yearString.toString().slice(4, 6);
            var day = yearString.toString().slice(6);
            var parsedDateStringAsRawDateObject = format.parse({
                value: year + '/' + month + '/' + day,
                type: format.Type.DATE
            });
            return (parsedDateStringAsRawDateObject);
        }

        function getWarekiYear() {
            var yearSearch = search.create({
                type: 'customlist_dj_wareki_year',
                columns: [{
                    name: 'name'
                }]
            });
            var rs = yearSearch.run();
            var warekiYear = rs.getRange({
                start: 0,
                end: 1
            })[0].getValue({
                name: 'name'
            });
            return (warekiYear);
        }

        function getNowDateJP() {
            var stNow = new Date();
            stNow.setMilliseconds((3600000 * 9));
            var stYear = stNow.getUTCFullYear();
            var stMonth = stNow.getUTCMonth();
            var stDate = stNow.getUTCDate();
            stNow = new Date(stYear, stMonth, stDate);
            return stNow;
        }

        /**
         * Input a string of csv data and parse it and return to two dimension array
         * @param {[string]} strData      [csv string data]
         * @param {[string]} strDelimiter [split method charactor]
         */
        function CSVToArray(strData, strDelimiter) {
            // Check to see if the delimiter is defined. If not,
            // then default to comma.
            strDelimiter = (strDelimiter || ",");

            // Create a regular expression to parse the CSV values.
            var objPattern = new RegExp(
                (
                    // Delimiters.
                    "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                    // Quoted fields.
                    "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                    // Standard fields.
                    "([^\"\\" + strDelimiter + "\\r\\n]*))"
                ),
                "gi"
            );


            // Create an array to hold our data. Give the array
            // a default empty first row.
            var arrData = [[]];

            // Create an array to hold our individual pattern
            // matching groups.
            var arrMatches = null;


            // Keep looping over the regular expression matches
            // until we can no longer find a match.
            while (arrMatches = objPattern.exec(strData)) {

                // Get the delimiter that was found.
                var strMatchedDelimiter = arrMatches[1];

                // Check to see if the given delimiter has a length
                // (is not the start of string) and if it matches
                // field delimiter. If id does not, then we know
                // that this delimiter is a row delimiter.
                if (
                    strMatchedDelimiter.length &&
                    strMatchedDelimiter !== strDelimiter
                ) {

                    // Since we have reached a new row of data,
                    // add an empty row to our data array.
                    arrData.push([]);
                }
                var strMatchedValue;
                // Now that we have our delimiter out of the way,
                // let's check to see which kind of value we
                // captured (quoted or unquoted).
                if (arrMatches[2]) {
                    // We found a quoted value. When we capture
                    // this value, unescape any double quotes.
                    strMatchedValue = arrMatches[2].replace(
                        new RegExp("\"\"", "g"),
                        "\""
                    );
                } else {
                    // We found a non-quoted value.
                    strMatchedValue = arrMatches[3];
                }
                // Now that we have our value string, let's add
                // it to the data array.
                arrData[arrData.length - 1].push(strMatchedValue);
            }

            // Return the parsed data.
            return (arrData);
        }
        /**
         * @param v
         * @returns
         */
        function npad(v) {
            if (v >= 10) {
                return v;
            } else {
                return '0' + v;
            }
        }
        return {
            onRequest: onRequest
        };
    });