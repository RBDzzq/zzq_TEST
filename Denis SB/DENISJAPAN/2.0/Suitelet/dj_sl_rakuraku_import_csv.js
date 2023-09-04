/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * �y�y���Z�d��捞
 */
define(['N/ui/serverWidget', 'N/runtime', 'N/file', 'N/redirect', 'N/task', 'N/format', 'N/search', 'N/record', 'N/log', 'N/https', 'N/url'],
    function (serverWidget, runtime, file, redirect, task, format, search, record, log, https, url) {
        //file items
        var fileitems = {
            header: [],
            first: ['journalnum', 'journaldate', 'debitdeptcode', 'debitdept', 'deptabbrevia', 'brandcode', 'brandname', 'empcode', 'empname', 'debitaccountcode', 'debitaccount', 'debitnotaxamount', 'creditaccountcode', 'creditaccount', 'creditamount', 'abstract'],
            second: ['', '', '', '', '', '', '', '', '', 'debittaxrate', 'debittax', 'debittaxamount']
        }

        function onRequest(context) {
            try {
                var taskId = '';
                var msgKey = false;
                var message = '';

                var scriptObj = runtime.getCurrentScript();

                if (context.request.method === 'POST') {
                    log.audit("CSV�f�[�^�捞 start :" + getJapanDateTime());

                    // �A��
                    var subsidiary = context.request.parameters.custpage_dj_custom_subsidiary;
                    // ���t
                    var inputDate = context.request.parameters.custpage_dj_date;

                    var scriptObj = runtime.getCurrentScript();
                    var csvfolder = scriptObj.getParameter({ name: 'custscript_dj_rakuraku_csvfolder_array' });
                    var fileObj = context.request.files.custpage_dj_select_file;
                    fileObj.folder = csvfolder;
                    fileObj.encoding = file.Encoding.SHIFT_JIS;

                    // get mapping info
                    var deptList = getMappingList('customsearch_dj_dept_mapping_search', 'custrecord_dept_mapping_rakuraku', 'custrecord_dept_mapping_ns');
                    var brandList = getMappingList('customsearch_dj_brand_mapping_search', 'custrecord_brand_mapping_rakuraku', 'custrecord_brand_mapping_ns');
                    var accountList = getMappingList('customsearch_dj_account_mapping_search', 'custrecord_account_mapping_rakuraku', 'custrecord_account_mapping_ns');
                    var taxList = getMappingList('customsearch_dj_tax_mapping_search', 'custrecord_tax_mapping_rakuraku', 'custrecord_tax_mapping_ns');

                    var nameList = searchName();
                    //get employee id list
                    var empIdList = getEmpId();
                    
                    var objlist = null;
                    var lineitems = fileitems;
                    if (!isEmpty(fileObj)) {
                        var arrData = CSVToArray(fileObj.getContents());
                        objlist = csvarrayToObjectList(arrData, lineitems);
                        log.debug('objlist', objlist);
                    }

                    // check file format
                    if (checkLineNum(arrData) != 0 || checkFirstRowNum(objlist) == false || checkSecondRowNum(objlist) == false) {
                        showMsg('CSV�t�@�C���̃t�H�[�}�b�g������������܂���̂ł��m�F���������B',context);
                        return;
                    }

                    // Every two rows are merged into one row.
                    var result = [];
                    var results = [];
                    for (var i = 0; i < objlist.length; i += 2) {
                        result.push(objlist.slice(i, i + 2));
                    }
                    if (result.length > 0) {
                        for (var j = 0; j < result.length; j++) {
                            var o1 = result[j][0];
                            var o2 = result[j][1];
                            var obj = mergeObjects(o1, o2);
                            results.push(obj);
                        }
                    }
                    log.debug('results', results);

                    // for check journal no 
                    var existingJournalNo = getExistingJournalNo();
                    log.debug('existingJournalNo',existingJournalNo);

                    // Replace some values with internalid 
                    var objArr = [];
                    for (var i = 0; i < results.length; i++) {
                        var obj = {};
                        var row = results[i];

                        // �d��No.
                        obj.journalnum = row.journalnum;
                        if(!isEmpty(obj.journalnum)){
                            if(existingJournalNo.indexOf(obj.journalnum) != -1){
                                showErrorMsg('CSV�t�@�C���́u�d��No.�v�F','������Netsuite�Ɏ捞�܂�܂����̂Ńt�@�C�����e���m�F���Ă��������B',context,obj.journalnum);
                                return;
                            }
                        }
                        // �d���
                        obj.journaldate = row.journaldate;
                        // �ؕ��F���S����R�[�h
                        if(!isEmpty(row.debitdeptcode)){
                            obj.debitdeptcode = setMappingValue(deptList, row.debitdeptcode);
                            // log.debug('obj.debitdeptcode',obj.debitdeptcode);
                            if(isEmpty(obj.debitdeptcode)){
                                showErrorMsg('CSV�t�@�C���́u�ؕ��F���S����R�[�h�v�F','��NetSuite�}�X�^�Ɉ�v����f�[�^������܂���̂ł��m�F���������B',context,row.debitdeptcode);
                                return;
                            }
                        }
                        // Brand�R�[�h
                        if(!isEmpty(row.brandcode)){
                            obj.brandcode = setMappingValue(brandList, row.brandcode);
                            // log.debug('obj.brandcode',obj.brandcode);
                            if(isEmpty(obj.brandcode)){
                                showErrorMsg('CSV�t�@�C���́uBrand�R�[�h�v�F','��NetSuite�}�X�^�Ɉ�v����f�[�^������܂���̂ł��m�F���������B',context,row.brandcode);
                                return;
                            }
                        }
                        // �Ј��R�[�h �u�Ј��R�[�h�v��擪�u�O�v�ŕ�U�A�S���܂�
                        var name = padStart(row.empcode);
                        if(empIdList.indexOf(name) === -1){
                            showErrorMsg('CSV�t�@�C���́u�Ј����v�F','��NetSuite�}�X�^�Ɉ�v����f�[�^������܂���̂ł��m�F���������B',context,row.empcode);
                            return;
                        }else{
                            util.each(nameList, function (item) {
                                if((item.code).indexOf('_') != -1){
                                    if ((item.code).split('_')[0] == name && subsidiary == item.subsidiary) {
                                        obj.empcode = item.id;
                                    }
                                }else{
                                    if ((item.code).split(' ')[0] == name && subsidiary == item.subsidiary) {
                                        obj.empcode = item.id;
                                    }
                                }
                            });
                        }
                        log.debug('obj.empcode',obj.empcode);
                        // �ؕ��F����ȖڃR�[�h
                        obj.debitaccountcode = setMappingValue(accountList, row.debitaccountcode);
                        if (isEmpty(obj.debitaccountcode)) {
                            showErrorMsg('CSV�t�@�C���́u�ؕ��F����ȖڃR�[�h�v�F','��NetSuite�}�X�^�Ɉ�v����f�[�^������܂���̂ł��m�F���������B',context,row.debitaccountcode);
                            return;
                        }
                        // �ؕ��F�Ŕ����z
                        obj.debitnotaxamount = row.debitnotaxamount;
                        // �ݕ��F����ȖڃR�[�h
                        obj.creditaccountcode = setMappingValue(accountList, row.creditaccountcode);
                        if (isEmpty(obj.creditaccountcode)) {
                            showErrorMsg('CSV�t�@�C���́u�ݕ��F����ȖڃR�[�h�v�F','��NetSuite�}�X�^�Ɉ�v����f�[�^������܂���̂ł��m�F���������B',context,row.creditaccountcode);
                            return;
                        }
                        // �ݕ��F���z
                        obj.creditamount = row.creditamount;
                        // �E�v
                        obj.abstract = row.abstract;
                        // �ؕ��F�ŗ�
                        if((row.debittax === null) || (row.debittax === '') || (row.debittax === undefined)){
                            showMsg('CSV�t�@�C���́u�ŗ��v���Z�b�g����Ă��Ȃ����R�[�h������܂��̂ł��m�F���������B',context);
                            return;
                        }else{
                            obj.debittax = setMappingValue(taxList, row.debittax);
                            if(isEmpty(obj.debittax)){
                                showErrorMsg('CSV�t�@�C���́u�ؕ��F�ŗ��v�F','��NetSuite�}�X�^�Ɉ�v����f�[�^������܂���̂ł��m�F���������B',context,row.debittax);
                                return;
                            }
                        }
                        // �ؕ��F�Ŋz
                        obj.debittaxamount = row.debittaxamount;
   
                        objArr.push(obj);
                    }  
                    log.debug('objArr', objArr);
                    
                    // get subsidiary info
                    var deptSubsidiary = getSubsidiary('department', 'custrecord_djkk_dp_subsidiary');
                    var brandSubsidiary = getSubsidiary('classification', 'custrecord_djkk_cs_subsidiary');
                    var accountSubsidiary = getSubsidiary('account', 'subsidiary');
                    var taxSubsidiary = getSubsidiary('salestaxitem', 'subsidiary');
                    var nameSubsidiary = getSubsidiary('entity', 'subsidiary');
                    var resultArr = [];
                    // data subsidiary matching
                    for (var i = 0; i < objArr.length; i++) {
                        var deptSubs = '';
                        var brandSubs = '';
                        var debitAccSubs = '';
                        var creditAccSubs = '';
                        var nameSubs = '';
                        // var taxSubs = '';
                        //dept
                        if (!isEmpty(objArr[i].debitdeptcode)) {
                            deptSubs = setMappingValue(deptSubsidiary, objArr[i].debitdeptcode);
                        }
                        //brand
                        if (!isEmpty(objArr[i].brandcode)) {
                            brandSubs = setMappingValue(brandSubsidiary, objArr[i].brandcode);
                        }
                        // debit account
                        if (!isEmpty(objArr[i].debitaccountcode)) {
                            debitAccSubs = setMappingValue(accountSubsidiary, objArr[i].debitaccountcode);
                        }
                        // credit account
                        if (!isEmpty(objArr[i].creditaccountcode)) {
                            creditAccSubs = setMappingValue(accountSubsidiary, objArr[i].creditaccountcode);
                        }
                        // name
                        if (!isEmpty(objArr[i].empcode)) {
                            nameSubs = setMappingValue(nameSubsidiary, objArr[i].empcode);
                        }
                        //tax
                        // if (!isEmpty(objArr[i].debittax)) {
                        //     taxSubs = setMappingValue(nameSubsidiary, objArr[i].debittax);
                        // }

                        if (isEmpty(deptSubs) && isEmpty(brandSubs) && isEmpty(debitAccSubs)
                            && isEmpty(creditAccSubs) && isEmpty(nameSubs)) {
                            continue;
                        } else {
                            if (isEmpty(objArr[i].debitdeptcode)) {
                                deptSubs = subsidiary;
                            }
                            if (isEmpty(objArr[i].brandcode)) {
                                brandSubs = subsidiary;
                            }
                            if (isEmpty(objArr[i].debitaccountcode)) {
                                debitAccSubs = subsidiary;
                            }
                            if (isEmpty(objArr[i].creditaccountcode)) {
                                creditAccSubs = subsidiary;
                            }
                            if (isEmpty(objArr[i].empcode)) {
                                nameSubs = subsidiary;
                            }
                        }

                        var debitSubs = dealAccountList(accountSubsidiary,objArr[i].debitaccountcode, subsidiary);
                        var creditSubs = dealAccountList(accountSubsidiary, objArr[i].creditaccountcode, subsidiary);
                        var taxSubs = dealAccountList(taxSubsidiary, objArr[i].debittax, subsidiary);
                        
                        log.debug('subsidiary', subsidiary);
                        log.debug('deptSubs', deptSubs);
                        log.debug('brandSubs', brandSubs);
                        log.debug('nameSubs', nameSubs);
                        log.debug('debitSubs', debitSubs);
                        log.debug('creditSubs', creditSubs); 
                        log.debug('taxSubs', taxSubs); 

                        if (subsidiary == deptSubs && subsidiary == brandSubs && debitSubs && creditSubs
                            && subsidiary == nameSubs && taxSubs) {
                            resultArr.push(objArr[i]);
                        }
                        else {
                            if(deptSubs !== subsidiary){
                                showErrorMsg('��ʂɑI�����ꂽ�A����CSV�t�@�C��','�s�ڂ́u���S����R�[�h�v��������A���ƈ�v���܂���̂ł��m�F���������B',context,i+1);
                                return;
                            }
                            if(brandSubs !== subsidiary){
                                showErrorMsg('��ʂɑI�����ꂽ�A����CSV�t�@�C��','�s�ڂ́uBrand�R�[�h�v��������A���ƈ�v���܂���̂ł��m�F���������B',context,i+1);
                                return;
                            }
                            if(nameSubs !== subsidiary){
                                showErrorMsg('��ʂɑI�����ꂽ�A����CSV�t�@�C��','�s�ڂ́u�Ј��R�[�h�v��������A���ƈ�v���܂���̂ł��m�F���������B',context,i+1);
                                return;
                            }
                            if(!taxSubs){
                                showErrorMsg('��ʂɑI�����ꂽ�A����CSV�t�@�C��','�s�ڂ́u�ؕ��F�ŗ��v��������A���ƈ�v���܂���̂ł��m�F���������B',context,i+1);
                                return;
                            }
                            if(!debitSubs){
                                showErrorMsg('��ʂɑI�����ꂽ�A����CSV�t�@�C��','�s�ڂ́u�ؕ��F����ȖڃR�[�h�v��������A���ƈ�v���܂���̂ł��m�F���������B',context,i+1);
                                return;
                            }
                            if(!creditSubs){
                                showErrorMsg('��ʂɑI�����ꂽ�A����CSV�t�@�C��','�s�ڂ́u�ݕ��F����ȖڃR�[�h�v��������A���ƈ�v���܂���̂ł��m�F���������B',context,i+1);
                                return;
                            }
                            // continue;
                        }
                    }
                    log.debug('resultArr', resultArr);

                    if (resultArr.length <= 0) {
                        showMsg('��ʂɑI�����ꂽ�A����CSV�t�@�C���̂��ׂăf�[�^��������A������v���܂���̂ł��m�F���������B',context);
                        return;
                    }
                    fileObj.save();

                    var scriptTask = task.create({ taskType: task.TaskType.SCHEDULED_SCRIPT });
                    scriptTask.scriptId = 'customscript_ss_rakuraku_create_journal';
                    scriptTask.deploymentId = 'customdeploy_ss_rakuraku_create_journal';
                    scriptTask.params = {
                        custscript_dj_journal_subsidiary: subsidiary,
                        custscript_dj_import_csv_arr: JSON.stringify(resultArr),
                        custscript_dj_import_csv_inputdate: inputDate,
                        custscript_dj_csv_filename: fileObj.name
                    };
                    taskId = scriptTask.submit();
                }else {
                    taskId = context.request.parameters.taskId;
                    log.debug('GET_taskId', taskId);
                }

                // �y�y���Z�d��捞���
                var form = serverWidget.createForm({
                    title: '�y�y���Z�d��捞'
                });

                form.clientScriptModulePath = '../Client/dj_cs_rakuraku_import_csv.js';

                // ���s����
                form.addFieldGroup({
                    label: '���s����',
                    id: 'custpage_dj_group_message',
                });

                form.addFieldGroup({
                    label: '�捞',
                    id: 'custpage_dj_csv_input_group',
                });
                // �A��
                var subsidiaryField = form.addField({
                    id: 'custpage_dj_custom_subsidiary',
                    type: serverWidget.FieldType.SELECT,
                    label: '�A��',
                    source: 'subsidiary',
                    container: 'custpage_dj_csv_input_group'
                });
                subsidiaryField.isMandatory = true;
                subsidiaryField.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.STARTROW
                });
                subsidiaryField.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
                // ���t
                var nowDate = getNowDateJP();
                var dateField = form.addField({
                    id: 'custpage_dj_date',
                    type: serverWidget.FieldType.DATE,
                    label: '���t',
                    container: 'custpage_dj_csv_input_group'
                });
                dateField.defaultValue = nowDate;
                dateField.updateBreakType({
                    breakType: serverWidget.FieldBreakType.STARTCOL
                });
                dateField.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.STARTROW
                });
                // �ʉ�
                var currencyField = form.addField({
                    id: 'custpage_dj_currency_type',
                    type: serverWidget.FieldType.SELECT,
                    label: '�ʉ�',
                    container: 'custpage_dj_csv_input_group'
                });
                currencyField.addSelectOption({
                    value: 0,
                    text: '�~'
                });
                currencyField.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                currencyField.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.MIDROW
                });
                // �בփ��[�g
                var rateField = form.addField({
                    id: 'custpage_dj_exchange_rate',
                    type: serverWidget.FieldType.FLOAT,
                    label: '�בփ��[�g',
                    container: 'custpage_dj_csv_input_group'
                });
                rateField.defaultValue = parseFloat(1).toFixed(0);
                rateField.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                rateField.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.ENDROW
                });
                //�t�@�C���I��
                var field = form.addField({
                    id: 'custpage_dj_select_file',
                    type: serverWidget.FieldType.FILE,
                    label: '�t�@�C���I��',
                    // container: 'custpage_dj_csv_input_group'
                });
                field.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW
                });
                //���t���b�V���{�^��
                var refreshBtn = form.addButton({
                    id: 'refreshButton',
                    label: '���t���b�V��',
                    functionName: 'refresh("' + taskId + '");'
                });
                // ���s�{�^��
                var submitBtn = form.addSubmitButton({
                    label: '���s'
                });

                // �{�^������ 
                if (!isEmpty(taskId)) {

                    // �X�e�[�^�X�̒l���擾����
                    var taskStatus = task.checkStatus(taskId);

                    // �����̏ꍇ
                    if ('COMPLETE' == taskStatus.status || 'FAILED' == taskStatus.status) {
                        submitBtn.isDisabled = false;
                        refreshBtn.isDisabled = true;
                        taskId = '';
                    } else { // �������̏ꍇ
                        submitBtn.isDisabled = true;
                        refreshBtn.isDisabled = false;
                        msgKey = true;
                    }

                } else {
                    submitBtn.isDisabled = false;
                    refreshBtn.isDisabled = true;
                }
                // ��łȂ��ꍇ
                if (msgKey) {

                    if (message == null || message == '') {
                        // ���b�Z�[�W
                        message = '<font color = "#5A6F8F"><br><b>�d��쐬�o�b�`�����s���ł��A��������܂ł��҂��������B</b></font>';
                    }
                    // ���b�Z�[�W���x��
                    form.addField({
                        type: serverWidget.FieldType.LABEL,
                        label: message,
                        id: 'custpage_dj_start_batch_message',
                        container: 'custpage_dj_group_message'
                    }).updateLayoutType({
                        layoutType: serverWidget.FieldLayoutType.OUTSIDEABOVE
                    });
                }

                context.response.writePage(form);
                log.debug('Remaining governance units: ' + scriptObj.getRemainingUsage());
            } catch (exception) {
                log.error({
                    title: 'Error',
                    details: exception
                });
            }
        }

        function isEmpty(stValue) {
            if ((stValue === null) || (stValue === '') || (stValue === undefined) || (stValue == 0)) {
                return true;
            } else {
                return false;
            }
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
        function getJapanDateTime() {
            var now = new Date();
            var offSet = now.getTimezoneOffset();
            var offsetHours = 9 + (offSet / 60);
            now.setHours(now.getHours() + offsetHours);
            return '' + now.getFullYear() + '/' + pad(now.getMonth() + 1) + '/' + pad(now.getDate()) + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':'
                + pad(now.getSeconds());
        }
        function pad(v) {
            if (v >= 10) {
                return v;
            } else {
                return "0" + v;
            }
        }
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
            return removeEmptyElem(arrData);
        }
        function csvarrayToObjectList(arrData, lineitems) {
            try {
                var objlist = [];
                for (var i = 2; i < arrData.length; i++) {
                    var row = arrData[i];

                    var items;
                    if (i % 2 == 0) {
                        items = lineitems.first;
                    } else {
                        items = lineitems.second;
                    }

                    var obj = {};
                    for (var m = 0; m < items.length; m++) {
                        obj[items[m]] = row[m];
                    }
                    objlist.push(obj);
                }
                return objlist;
            } catch (e) {
                log.error('csvarrayToObjectList: ' + e.name, e.message);
            }
            return null
        }
        function checkSuffix(str) {
            try {
                var index = str.lastIndexOf('.');
                var ext = str.substr(index + 1);
                ['csv'].indexOf(ext.toLowerCase()) !== -1;

            } catch (e) {
                log.error('checkLineNum: ' + e.name, e.message);
            }
        }
        function checkLineNum(arrData) {
            try {
                //Remove the blank line from the last row.
                var line = arrData.length;
                return line % 2;
            } catch (e) {
                log.error('checkLineNum: ' + e.name, e.message);
            }
        }
        function checkFirstRowNum(jsonData) {
            try {

                for (var i = 0; i < jsonData.length; i++) {
                    var len = 0;
                    if (i % 2 == 0) {
                        for (var item in jsonData[i]) {
                            if (jsonData[i][item] !== undefined) {
                                // log.debug('item',item + ':'+jsonData[i][item]);
                                len++;
                            }
                        }
                        // log.debug('first_len',len);
                        if (len != 16) {
                            // log.debug('false','false');
                            return false;
                        } else {
                            // log.debug('continue','continue');
                            continue;
                        }
                    }
                }
                return;

            } catch (e) {
                log.error('checkFirstRowNum: ' + e.name, e.message);
            }
        }
        function checkSecondRowNum(jsonData) {
            try {

                for (var i = 0; i < jsonData.length; i++) {
                    var len = 0;
                    if (i % 2 != 0) {
                        for (var item in jsonData[i]) {
                            if (jsonData[i][item] !== undefined) {
                                len++;
                            }
                        }
                        // log.debug('second_len',len);
                        if (len != 4) {
                            // log.debug('false','false');
                            return false;
                        } else {
                            // log.debug('continue','continue');
                            continue;
                        }
                    }
                }
                return;

            } catch (e) {
                log.error('checkSecondRowNum: ' + e.name, e.message);
            }
        }
        function removeEmptyElem(arr) {
            for (var i = arr.length - 1; i >= 0; i--) {
                if (arr[i] == "") {
                    arr.splice(i, 1);
                } else if (arr[i] == undefined) {
                    arr.splice(i, 1);
                }
            }
            return arr;
        }
        function mergeObjects(target, source) {
            for (var prop in source) {
                if (source.hasOwnProperty(prop)) {
                    target[prop] = source[prop];
                }
            }
            return target;
        }
        function getMappingList(searchId, originalField, nsField) {
            try {
                var objList = [];

                var commonSearch = search.load({
                    id: searchId
                });
                // var commonFilter = search.createFilter({
                //     name: 'isinactive',
                //     operator: 'is',
                //     values: 'F'
                // });
                // commonSearch.filters.push(commonFilter);
                var objSearch = commonSearch.run();

                var res = [];
                var resultIndex = 0;
                var resultStep = 1000;
                do {
                    var results = objSearch.getRange({
                        start: resultIndex,
                        end: resultIndex + resultStep
                    });

                    if (results.length > 0) {
                        res = res.concat(results);
                        resultIndex = resultIndex + resultStep;
                    }
                } while (results.length > 0);

                for (var i = 0; i < res.length; i++) {
                    var obj = {};
                    var key = res[i].getValue(originalField);
                    var value = res[i].getValue(nsField);
                    obj[key] = value;
                    objList.push(obj);
                }
                return objList;
            } catch (e) {
                log.error("ERROR", e.message);
                return [];
            }
        }
        function setMappingValue(list, attr) {
            var str;
            for (var j = 0; j < list.length; j++) {
                for (var item in list[j]) {
                    if (attr == item) {
                        str = list[j][item];
                    }
                }
            }
            return str;
        }
        function searchName() {
            var objList = [];
            var searchFilters = [];
            searchFilters.push(['isinactive', 'is', 'F']);
            var nameSearch = search.create({
                type: 'entity',
                filters: searchFilters,
                columns: [{ name: 'internalid' },
                { name: 'subsidiary' },
                { name: 'entityid' }]
            });
            var objSearch = nameSearch.run();

            var res = [];
            var resultIndex = 0;
            var resultStep = 1000;
            do {
                var results = objSearch.getRange({
                    start: resultIndex,
                    end: resultIndex + resultStep
                });

                if (results.length > 0) {
                    res = res.concat(results);
                    resultIndex = resultIndex + resultStep;
                }
            } while (results.length > 0);

            util.each(res, function (result) {
                var obj = {};
                obj.id = result.getValue({ name: 'internalid' });
                obj.code = result.getValue({ name: 'entityid' });
                obj.subsidiary = result.getValue({ name: 'subsidiary' });
                objList.push(obj);
            });
            return objList;
        }
        function padStart(str) {
            return ('00000000' + str).slice(-4);
        }
        function getSubsidiary(searchType, colName) {
            try {

                // nameId : name entityid  ���O
                var objList = [];
                // var searchFilters = [];
                // searchFilters.push(['isinactive', 'is', 'F']);
                var mySearch = search.create({
                    type: searchType,
                    // filters: searchFilters,
                    columns: [{ name: 'internalid' },
                    { name: colName },
                    ]
                });
                var objSearch = mySearch.run();

                var res = [];
                var resultIndex = 0;
                var resultStep = 1000;
                do {
                    var results = objSearch.getRange({
                        start: resultIndex,
                        end: resultIndex + resultStep
                    });

                    if (results.length > 0) {
                        res = res.concat(results);
                        resultIndex = resultIndex + resultStep;
                    }
                } while (results.length > 0);

                util.each(res, function (result) {
                    var obj = {};
                    var key = result.getValue({ name: 'internalid' });
                    var value = result.getValue({ name: colName });
                    obj[key] = value;
                    objList.push(obj);
                });
                return objList;
            } catch (e) {
                log.error('getSubsidiary:' + e.name, e.message);
                return [];
            }
        }
        function dealAccountList(list, attr, subs) {
            try {
                var num = [];
                for (var i = 0; i < list.length; i++) {
                    for (var item in list[i]) {
                        if (attr === item) {
                            num.push(list[i][item]);
                        }
                    }
                }
                // log.debug('num',num);
                if (num.indexOf(subs) == -1) {
                    return false;
                } else {
                    return true;
                }
            } catch (e) {
                log.error('dealAccountList' + e.name, e.message);
            }
        }
        function showErrorMsg(msg1,msg2,context,value) {
            var html = '<SCRIPT language="JavaScript" type="text/javascript">';
            html += "function bindEvent(element, type, handler) {if(element.addEventListener) {element.addEventListener(type, handler, false);} else {element.attachEvent('on'+type, handler);}} ";
            html += 'bindEvent(window, "load", function(){';
            html += 'if (confirm("' + msg1 + value + msg2 + '") == true) {';
            html += 'window.history.back()';
            html += '}';
            html += 'else{';
            html += 'window.history.back()';
            html += '}';
            html += '});';
            html += '</SCRIPT>';
            var form = serverWidget.createForm({
                title: '�y�y���Z�d��捞(�G���[)'
            });
            var field1 = form.addField({
                id: 'fieldid',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Text'
            });
            field1.defaultValue = html;
            context.response.writePage(form);
            
        }
        function showMsg(msg1,context) {
            var html = '<SCRIPT language="JavaScript" type="text/javascript">';
            html += "function bindEvent(element, type, handler) {if(element.addEventListener) {element.addEventListener(type, handler, false);} else {element.attachEvent('on'+type, handler);}} ";
            html += 'bindEvent(window, "load", function(){';
            html += 'if (confirm("' + msg1 + '") == true) {';
            html += 'window.history.back()';
            html += '}';
            html += 'else{';
            html += 'window.history.back()';
            html += '}';
            html += '});';
            html += '</SCRIPT>';
            var form = serverWidget.createForm({
                title: '�y�y���Z�d��捞(�G���[)'
            });
            var field1 = form.addField({
                id: 'fieldid',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Text'
            });
            field1.defaultValue = html;
            context.response.writePage(form);
            
        }
        function getEmpId(){
            var objList = [];
            var searchFilters = [];
            searchFilters.push(['isinactive', 'is', 'F']);
            var mySearch = search.create({
                type: 'employee',
                filters: searchFilters,
                columns: [{ name: 'internalid' },
                { name: 'entityid' },
                { name: 'custentity_djkk_employee_id' }]
            });
            var objSearch = mySearch.run();

            var res = [];
            var resultIndex = 0;
            var resultStep = 1000;
            do {
                var results = objSearch.getRange({
                    start: resultIndex,
                    end: resultIndex + resultStep
                });

                if (results.length > 0) {
                    res = res.concat(results);
                    resultIndex = resultIndex + resultStep;
                }
            } while (results.length > 0);

            util.each(res, function (result) {
                var id = result.getValue({ name: 'custentity_djkk_employee_id' });
                if(id.indexOf('_') != -1){
                    id = id.split('_')[0];
                }
                objList.push(id);
            });
            return objList;
        }
        function getExistingJournalNo(){
            var objList = [];
            var searchFilters = [];

            searchFilters.push({
                name: 'custcol_dj_journal_no',
                operator: search.Operator.ISNOTEMPTY
            });
            var noSearch = search.create({
                type: 'journalentry',
                filters: searchFilters,
                columns: [{ name: 'internalid' },
                { name: 'custcol_dj_journal_no' }]
            });
            var objSearch = noSearch.run();

            var res = [];
            var resultIndex = 0;
            var resultStep = 1000;
            do {
                var results = objSearch.getRange({
                    start: resultIndex,
                    end: resultIndex + resultStep
                });

                if (results.length > 0) {
                    res = res.concat(results);
                    resultIndex = resultIndex + resultStep;
                }
            } while (results.length > 0);

            util.each(res, function (result) {
                var no = result.getValue({ name: 'custcol_dj_journal_no' });
                if(objList.indexOf(no) == -1){
                    objList.push(no);
                }
            });
            
            return objList;
        }
        return {
            onRequest: onRequest
        };
    });