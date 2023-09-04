/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope Public
 * 
 * 仕訳明細行自動分割処理
 * from-key-type-change-remove
 */
define(['N/ui/serverWidget', 'N/search', 'N/url', 'N/record', 'N/runtime', 'N/log', 'N/email', 'N/format', 'N/error'],
    function (serverWidget, search, url, record, runtime, log, email, format, error) {
        // function beforeLoad(scriptContext) {
        //     var type = scriptContext.type;
        //     var form = scriptContext.form
        //     // Fields that will be hidden in View mode
        //     if (type == scriptContext.UserEventType.VIEW || type == scriptContext.UserEventType.PRINT || type == scriptContext.UserEventType.EMAIL) {
        //         form.getSublist({ id: 'line' }).getField({ id: 'custcol_djkk_split_line_key' }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
        //         form.getSublist({ id: 'line' }).getField({ id: 'custcol_djkk_split_line_type' }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
        //         // form.getSublist({id: 'line'}).getField({id: 'custcol_djkk_split_line_from'}).updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});
        //         form.getSublist({ id: 'line' }).getField({ id: 'custcol_djkk_split_change_flag' }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
        //         form.getSublist({ id: 'line' }).getField({ id: 'custcol_djkk_split_remove_flag' }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
        //     }
        //     // Fields that will be hidden in Create, Edit mode
        //     if (type == scriptContext.UserEventType.CREATE || type == scriptContext.UserEventType.EDIT || type == scriptContext.UserEventType.COPY) {
        //         form.getSublist({ id: 'line' }).getField({ id: 'custcol_djkk_split_line_key' }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
        //         form.getSublist({ id: 'line' }).getField({ id: 'custcol_djkk_split_line_type' }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
        //         // form.getSublist({id: 'line'}).getField({id: 'custcol_djkk_split_line_from'}).updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});
        //         form.getSublist({ id: 'line' }).getField({ id: 'custcol_djkk_split_change_flag' }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
        //         form.getSublist({ id: 'line' }).getField({ id: 'custcol_djkk_split_remove_flag' }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
        //     }
        // }
        function afterSubmit(scriptContext) {
            var type = scriptContext.type;

            // 新規の場合
            if (type === scriptContext.UserEventType.CREATE) {

                var newRecord = scriptContext.newRecord;
                var recordId = newRecord.id;
                var recordType = newRecord.type;

                var currentRecord = record.load({
                    type: recordType,
                    id: recordId,
                    isDynamic: true
                });

                var numLines = currentRecord.getLineCount({
                    sublistId: 'line'
                });
                log.debug('start-numLines', numLines);

                for (var i = 0; i < numLines; i++) {
                    currentRecord.selectLine({ sublistId: 'line', line: i });
                    // セクション
                    var dept_ori = currentRecord.getCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'department'
                    });
                    var deptName_ori = currentRecord.getCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'department_display'
                    });
                    // 勘定科目 
                    var account_ori = currentRecord.getCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'account'
                    });
                    // var typeList = searchAccountType();
                    // log.debug('typeList',typeList);
                    var accType = searchAccountType(account_ori);
                    log.debug('accType_create', accType);

                    // 勘定科目の種類が経費のものだけに当処理実行
                    if (accType == 'Expense') {
                        // 自動分割機能_明細行ステータス
                        var status_pre = currentRecord.getCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'custcol_djkk_split_line_status'
                        });
                        var status = status_pre.split('-');
                        var condition = !isEmpty(dept_ori) && status[0] == 'N' && status[1] == 'N' && status[2] == 'N';
                        splitLine(currentRecord, condition, deptName_ori, dept_ori);
                    }
                }
                var deptList = [];
                for (var j = 0; j < numLines; j++) {
                    currentRecord.selectLine({ sublistId: 'line', line: j });
                    // セクション
                    var dept = currentRecord.getCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'department'
                    });
                    var deptName = currentRecord.getCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'department_display'
                    });
                    // 自動分割機能_明細行ステータス 
                    var status_check = currentRecord.getCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'custcol_djkk_split_line_status'
                    });
                    var status = status_check.split('-');
                    if (!isEmpty(dept)) {
                        if (deptName.indexOf('(') != -1 && deptName.indexOf(',') != -1) {
                            if (status[1] == 'N' && status[2] == 'N') {
                                var result = checkSegmentInfo();
                                if (result.indexOf(dept) == -1) {
                                    deptList.push(deptName);
                                    // alert('支払分割定義書に定義がありませんので支配分割を行いません。');
                                }
                            }
                        }
                    }
                }
                currentRecord.save();

                if (deptList.length > 0) {
                    var temp = [];
                    for(var i = 0;i < deptList.length;i++){
                        if(temp.indexOf(deptList[i]) == -1){
                            temp.push(deptList[i]);
                        }
                    }
                    var str = temp.join('、');
                    throw new error.create({
                        name: 'JOURNAL_SPLIT_ERROR',
                        message: str + 'の支払分割定義書に定義がありませんので支配分割を行いません。',
                        notifyOff: false
                    });
                }
            }
            // 編集 削除の場合
            if (type == scriptContext.UserEventType.EDIT) {

                var newRecord = scriptContext.newRecord;
                var recordId = newRecord.id;
                var recordType = newRecord.type;

                var currentRecord = record.load({
                    type: recordType,
                    id: recordId,
                    isDynamic: true
                });

                var numLines = currentRecord.getLineCount({
                    sublistId: 'line'
                });
                log.debug('start-numLines', numLines);

                for (var i = 0; i < numLines; i++) {
                    currentRecord.selectLine({ sublistId: 'line', line: i });
                    // セクション
                    var dept_edi = currentRecord.getCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'department'
                    });
                    var deptName_edi = currentRecord.getCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'department_display'
                    });
                    // 勘定科目 
                    var account_edi = currentRecord.getCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'account'
                    });

                    var accType = searchAccountType(account_edi);;
                    log.debug('accType_edit', accType);

                    // 勘定科目の種類が経費のものだけに当処理実行
                    if (accType == 'Expense') {
                        // 自動分割機能_明細行ステータス
                        var status_edi = currentRecord.getCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'custcol_djkk_split_line_status'
                        });
                        var status = status_edi.split('-');
                        // split for edited lines
                        if (!isEmpty(dept_edi) && status[0] == 'T' && status[3] == 'T') {
                            var condition_edi = status[0] == 'T' && status[3] == 'T'
                            splitLine(currentRecord, condition_edi, deptName_edi, dept_edi);
                        }
                        // split for new lines
                        if (!isEmpty(dept_edi) && status[0] == 'N' && status[1] == 'N' && status[2] == 'N' && status[3] == 'N' && status[4] == 'N') {
                            var condition_new = !isEmpty(dept_edi) && status[0] == 'N' && status[1] == 'N' && status[2] == 'N' && status[3] == 'N' && status[4] == 'N';
                            splitLine(currentRecord, condition_new, deptName_edi, dept_edi);
                        }
                    }
                }

                // change flags to false
                for (var j = 0; j < numLines; j++) {
                    currentRecord.selectLine({ sublistId: 'line', line: j });
                    // 勘定科目 
                    var account_loop = currentRecord.getCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'account'
                    });
                    var accType = searchAccountType(account_edi);;
                    log.debug('accType_change_flag', accType);

                    if (accType == 'Expense') {
                        // 自動分割機能_明細行ステータス
                        var status_loop = currentRecord.getCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'custcol_djkk_split_line_status'
                        });
                        var statusArr = status_loop.split('-');
                        // 変更有無フラグ
                        if (statusArr[3] == 'T') {
                            statusArr[3] = 'F';
                        }
                        // 削除フラグ
                        if (statusArr[4] == 'T') {
                            statusArr[4] = 'F';
                        }
                        var res = statusArr.join('-');
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'custcol_djkk_split_line_status',
                            value: res
                        });
                        currentRecord.commitLine({ sublistId: 'line' });
                    }
                }

                var deptList = [];
                for (var k = 0; k < numLines; k++) {
                    currentRecord.selectLine({ sublistId: 'line', line: k });
                    // セクション
                    var dept = currentRecord.getCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'department'
                    });
                    var deptName = currentRecord.getCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'department_display'
                    });
                    // 自動分割機能_明細行ステータス 
                    var status_check = currentRecord.getCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'custcol_djkk_split_line_status'
                    });
                    var status = status_check.split('-');
                    if (!isEmpty(dept)) {
                        if (deptName.indexOf('(') != -1 && deptName.indexOf(',') != -1) {
                            if (status[1] == 'N' && status[2] == 'N') {
                                var result = checkSegmentInfo();
                                if (result.indexOf(dept) == -1) {
                                    deptList.push(deptName);
                                    // alert('支払分割定義書に定義がありませんので支配分割を行いません。');
                                }
                            }
                        }
                    }
                }
                
                currentRecord.save();

                if (deptList.length > 0) {
                    var temp = [];
                    for(var i = 0;i < deptList.length;i++){
                        if(temp.indexOf(deptList[i]) == -1){
                            temp.push(deptList[i]);
                        }
                    }
                    var str = temp.join('、');
                    throw new error.create({
                        name: 'JOURNAL_SPLIT_ERROR',
                        message: str + 'の支払分割定義書に定義がありませんので支配分割を行いません。',
                        notifyOff: false
                    });
                }
            }
        }
        function isEmpty(stValue) {
            if ((stValue === null) || (stValue === '') || (stValue === undefined) || (stValue == 0)) {
                return true;
            } else {
                return false;
            }
        }
        function isEmptyObject(obj) {
            // {} is true {"":""} is false
            var objStr = JSON.stringify(obj);
            if (objStr === '{}') {
                return true;
            } else {
                return false;
            }
        }
        function getSegmentInfo(key) {
            var objList = [];
            // var obj = {};
            var searchFilters = [];
            searchFilters.push({
                name: 'custrecord_converted_activity',
                operator: search.Operator.IS,
                values: [key]
            });
            var mySearch = search.create({
                type: 'customrecord_dj_activity_conversion_tbl',
                filters: searchFilters,
                columns: [{ name: 'custrecord_converted_activity' },
                { name: 'custrecord_convert_source_activity_1' },
                { name: 'custrecord_convert_percentage_1' },
                { name: 'custrecord_convert_source_activity_2' },
                { name: 'custrecord_convert_percentage_2' },
                { name: 'custrecord_convert_source_activity_3' },
                { name: 'custrecord_convert_percentage_3' },
                { name: 'custrecord_convert_source_activity_4' },
                { name: 'custrecord_convert_percentage_4' },
                { name: 'custrecord_convert_source_activity_5' },
                { name: 'custrecord_convert_percentage_5' },
                { name: 'custrecord_convert_source_activity_6' },
                { name: 'custrecord_convert_percentage_6' },
                { name: 'custrecord_convert_source_activity_7' },
                { name: 'custrecord_convert_percentage_7' },
                { name: 'custrecord_convert_source_activity_8' },
                { name: 'custrecord_convert_percentage_8' },
                { name: 'custrecord_convert_source_activity_9' },
                { name: 'custrecord_convert_percentage_9' },
                { name: 'custrecord_convert_source_activity_10' },
                { name: 'custrecord_convert_percentage_10' },
                { name: 'custrecord_convert_source_activity_11' },
                { name: 'custrecord_convert_percentage_11' },
                { name: 'custrecord_convert_source_activity_12' },
                { name: 'custrecord_convert_percentage_12' }]
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
                var obj1 = {};
                var obj2 = {};
                var obj3 = {};
                var obj4 = {};
                var obj5 = {};
                var obj6 = {};
                var obj7 = {};
                var obj8 = {};
                var obj9 = {};
                var obj10 = {};
                var obj11 = {};
                var obj12 = {};
                var key = result.getValue({ name: 'custrecord_converted_activity' });
                obj1.act_1 = result.getValue({ name: 'custrecord_convert_source_activity_1' });
                obj1.per_1 = result.getText({ name: 'custrecord_convert_percentage_1' });
                obj2.act_2 = result.getValue({ name: 'custrecord_convert_source_activity_2' });
                obj2.per_2 = result.getText({ name: 'custrecord_convert_percentage_2' });
                obj3.act_3 = result.getValue({ name: 'custrecord_convert_source_activity_3' });
                obj3.per_3 = result.getText({ name: 'custrecord_convert_percentage_3' });
                obj4.act_4 = result.getValue({ name: 'custrecord_convert_source_activity_4' });
                obj4.per_4 = result.getText({ name: 'custrecord_convert_percentage_4' });
                obj5.act_5 = result.getValue({ name: 'custrecord_convert_source_activity_5' });
                obj5.per_5 = result.getText({ name: 'custrecord_convert_percentage_5' });
                obj6.act_6 = result.getValue({ name: 'custrecord_convert_source_activity_6' });
                obj6.per_6 = result.getText({ name: 'custrecord_convert_percentage_6' });
                obj7.act_7 = result.getValue({ name: 'custrecord_convert_source_activity_7' });
                obj7.per_7 = result.getText({ name: 'custrecord_convert_percentage_7' });
                obj8.act_8 = result.getValue({ name: 'custrecord_convert_source_activity_8' });
                obj8.per_8 = result.getText({ name: 'custrecord_convert_percentage_8' });
                obj9.act_9 = result.getValue({ name: 'custrecord_convert_source_activity_9' });
                obj9.per_9 = result.getText({ name: 'custrecord_convert_percentage_9' });
                obj10.act_10 = result.getValue({ name: 'custrecord_convert_source_activity_10' });
                obj10.per_10 = result.getText({ name: 'custrecord_convert_percentage_10' });
                obj11.act_11 = result.getValue({ name: 'custrecord_convert_source_activity_11' });
                obj11.per_11 = result.getText({ name: 'custrecord_convert_percentage_11' });
                obj12.act_12 = result.getValue({ name: 'custrecord_convert_source_activity_12' });
                obj12.per_12 = result.getText({ name: 'custrecord_convert_percentage_12' });

                var value = [];

                value.push(obj1);
                value.push(obj2);
                value.push(obj3);
                value.push(obj4);
                value.push(obj5);
                value.push(obj6);
                value.push(obj7);
                value.push(obj8);
                value.push(obj9);
                value.push(obj10);
                value.push(obj11);
                value.push(obj12);

                obj[key] = value;
                objList.push(obj);
            });
            return objList;
        }
        function formatSegmentInfo(list) {
            // var res = {};
            var result = [];
            // var resultArr = {};
            for (var key in list) {
                var arr = list[key];
                for (var a in arr) {
                    var obj = arr[a];
                    for (var i = 0; i < obj.length; i++) {
                        var map = {};
                        var values = [];
                        for (var val in obj[i]) {
                            if (!isEmpty(obj[i][val])) {
                                values.push(obj[i][val]);
                            }
                        }
                        map[values[0]] = values[1];
                        // log.debug('map',map);
                        // log.debug('trueOrFalse',isEmptyObject(map));
                        if (!isEmptyObject(map)) {
                            result.push(map);
                        }
                    }
                }
            }
            return result;
        }
        function splitLine(currentRecord, condition, deptName_ori, deptId) {

            if (condition) {
                var dept = deptName_ori.slice(0, deptName_ori.indexOf(' '));
                var deptStr = deptName_ori.substring(0, 1);
                // var deptInfo = getSegmentInfo(dept);
                var deptInfo = getSegmentInfo(deptId);


                log.debug('dept', dept);
                log.debug('deptStr', deptStr);
                log.debug('deptInfo', deptInfo);

                if (deptInfo.length > 0) {
                    var deptSplitList = formatSegmentInfo(deptInfo);
                    var deptList = getDeptId();

                    log.debug('deptSplitList', deptSplitList);
                    log.debug('deptList', deptList);

                    var param = {};
                    // 勘定科目 
                    param.account_ori = currentRecord.getCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'account'
                    });
                    // 借方
                    param.debit_ori = currentRecord.getCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'debit'
                    });
                    // 貸方
                    param.credit_ori = currentRecord.getCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'credit'
                    });
                    if (!isEmpty(param.debit_ori)) {
                        param.reverseType = 'credit';
                    } else {
                        param.reverseType = 'debit';
                    }
                    // 税金
                    param.taxcode_ori = currentRecord.getCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'taxcode'
                    });
                    // 税額
                    param.taxamount_ori = currentRecord.getCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'tax1amt'
                    });
                    // メモ
                    param.memo_ori = currentRecord.getCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'memo'
                    });
                    // 名前
                    param.entity_ori = currentRecord.getCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'entity'
                    });
                    // ブランド
                    param.class_ori = currentRecord.getCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'class'
                    });
                    // 場所
                    param.location_ori = currentRecord.getCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'location'
                    });
                    // セクション
                    param.dept_ori = currentRecord.getCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'department'
                    });
                    param.deptName = currentRecord.getCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'department_display'
                    });
                    //DJ_仕訳NO.
                    param.jourNo_ori = currentRecord.getCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'custcol_dj_journal_no'
                    });
                    //DJ_仕訳日
                    param.jourDate_ori = currentRecord.getCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'custcol_dj_journal_date'
                    });
                    // 分割元 ユニックキー
                    param.unique = currentRecord.getCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'lineuniquekey'
                    });
                    // 自動分割機能_明細行ステータス
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'custcol_djkk_split_line_status',
                        value: 'T' + '-' + param.unique + '-N-N-N'
                    });
                    // メモ
                    if (!isEmpty(param.memo_ori)) {
                        if (param.memo_ori.indexOf('（分割元）')) {
                            param.memo_ori = param.memo_ori.replace('（分割元）', '');
                        }
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'memo',
                            value: param.memo_ori + '（分割元）'
                        });
                    } else {
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'memo',
                            value: '（分割元）'
                        });
                    }
                    currentRecord.commitLine({ sublistId: 'line' });
                    log.debug('param', param);

                    if (!isEmpty(param.debit_ori) || !isEmpty(param.credit_ori)) {
                        // add reverse line
                        var obj = {};
                        addReverseSublistRow(param, currentRecord, obj);
                        log.debug('obj.reverse_total', obj.reverse_total);
                        if (!isEmpty(param.debit_ori)) {
                            var total = parseInt(param.debit_ori);
                        } else {
                            var total = parseInt(param.credit_ori);
                        }
                        var total_taxAmt = parseInt(param.taxamount_ori);
                        log.debug('total_taxAmt',total_taxAmt);

                        var sum = 0;
                        var sub_taxAmt = 0;
                        // add sub split line
                        for (var j = 0; j < deptSplitList.length; j++) {
                            var subDeptId = '';
                            var percent = 0.0;
                            for (var key in deptSplitList[j]) {
                                //get sub dept internalid
                                subDeptId = key;
                                //get sub dept proportion 
                                percent = deptSplitList[j][key].replace("%", "") / 100;
                            }
                            log.debug('subDeptId', subDeptId);
                            log.debug('percent', percent);
                            // source with tax
                            if(!isEmpty(param.taxcode_ori)){
                                var taxrate = getTaxRate(param.taxcode_ori);
                                log.debug('taxrate',taxrate);
                                
                                var amount = 0;
                                var taxAmt = 0;
                                var sub = {};
                                if(j == deptSplitList.length - 1){
                                    amount = total - sum;
                                    taxAmt = total_taxAmt - sub_taxAmt;
                                }else{
                                    // 金額
                                    amount = Math.round(total * percent);
                                    sum = sum + amount;
                                    // 税額 
                                    taxAmt = amount * taxrate;
                                }
                                
                                log.debug('tax_amount',amount);
                                log.debug('tax_taxAmt',taxAmt);
                                addSublistRowWithTax(param, currentRecord, subDeptId, 'sub', amount, taxAmt, sub)
                                log.debug('sub.tax',sub.tax);
                                sub_taxAmt = sub_taxAmt + parseInt(sub.tax);
                            }else{
                                // source no tax
                                var amount = 0;
                                if(j == deptSplitList.length - 1){
                                    amount = total - sum;
                                }else{
                                    amount = Math.round(total * percent);
                                    sum = sum + parseInt(amount);
                                }
                                log.debug('no tax_amount',amount);
                                addSublistRowNoTax(param, currentRecord, subDeptId, 'sub', amount);
                            }
                        }
                    }
                }
            }
        }
        // add reverse line
        function addReverseSublistRow(param, currentRecord, obj) {
            try {
                log.debug('add reverse begin', 'add reverse begin');
                currentRecord.selectNewLine({
                    sublistId: 'line'
                });
                // 勘定科目 
                currentRecord.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    value: param.account_ori
                });
                // 貸方 
                if (!isEmpty(param.debit_ori)) {
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'credit',
                        value: param.debit_ori
                    });
                }
                // 借方  
                if (!isEmpty(param.credit_ori)) {
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'debit',
                        value: param.credit_ori
                    });
                }
                // 税金 
                if (!isEmpty(param.taxcode_ori)) {
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'taxcode',
                        value: param.taxcode_ori
                    });
                }
                // 税?
                if (!isEmpty(param.taxcode_ori) && !isEmpty(param.taxamount_ori)) {
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'tax1amt',
                        value: param.taxamount_ori
                    });
                }
                // メモ 
                // param.memo_ori = currentRecord.getCurrentSublistValue({
                //     sublistId: 'line',
                //     fieldId: 'memo'
                // });
                if (!isEmpty(param.memo_ori)) {
                    if (param.memo_ori.indexOf('（分割元）')) {
                        param.memo_ori = param.memo_ori.replace('（分割元）', '');
                    }
                    var source = param.deptName.slice(0, param.deptName.indexOf(' ')).slice(1);
                    log.debug('reverse-source', source);
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'memo',
                        value: '（' + source + '）' + param.memo_ori
                    });
                } else {
                    var source = param.deptName.slice(0, param.deptName.indexOf(' ')).slice(1);
                    log.debug('reverse-source', source);
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'memo',
                        value: '（' + source + '）'
                    });
                }
                // 名前 
                if (!isEmpty(param.entity_ori)) {
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'entity',
                        value: param.entity_ori
                    });
                }
                // ブランド 
                if (!isEmpty(param.class_ori)) {
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'class',
                        value: param.class_ori
                    });
                }
                // 場所 
                if (!isEmpty(param.location_ori)) {
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'location',
                        value: param.location_ori
                    });
                }
                // セクション 
                currentRecord.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'department',
                    value: param.dept_ori
                });
                // DJ_仕訳NO.
                if (!isEmpty(param.jourNo_ori)) {
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'custcol_dj_journal_no',
                        value: param.jourNo_ori
                    });
                }
                //DJ_仕訳日
                if (!isEmpty(param.jourDate_ori)) {
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'custcol_dj_journal_date',
                        value: format.parse({ value: param.jourDate_ori, type: format.Type.DATE })
                    });
                }
                // 自動分割機能_明細行ステータス
                currentRecord.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'custcol_djkk_split_line_status',
                    value: 'N-' + param.unique + '-' + param.reverseType + '-N-N'
                });
                // 総額
                obj.reverse_total = currentRecord.getCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'grossamt'
                });
                currentRecord.commitLine({
                    sublistId: 'line'
                });
                log.debug('add reverse finish', 'add reverse finish');
            } catch (e) {
                log.error('addReverseSublistRow(): ' + e.name, e.message);
            }
        }
        // add sub split line
        function addSublistRowWithTax(param, currentRecord, dept_spl, type, amount, taxAmt ,sub) {
            try {
                log.debug('add subWithTax begin', 'add subWithTax begin');
                
                    currentRecord.selectNewLine({
                        sublistId: 'line'
                    });
                    // 勘定科目 
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'account',
                        value: param.account_ori
                    });
                    // 借方 
                    if (!isEmpty(param.debit_ori)) {
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'debit',
                            value: amount
                        });
                    }
                    // 貸方 
                    if (!isEmpty(param.credit_ori)) {
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'credit',
                            value: amount
                        });
                    }
                    // 税金 
                    if (!isEmpty(param.taxcode_ori)) {
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'taxcode',
                            value: param.taxcode_ori
                        });
                    }
                    //税額
                    log.debug('fun taxAmt',taxAmt);
                    if (!isEmpty(param.taxamount_ori)) {
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'tax1amt',
                            value: taxAmt
                        });
                    }
                    // メモ 
                    if (!isEmpty(param.memo_ori)) {
                        if (param.memo_ori.indexOf('（分割元）')) {
                            // param.memo_ori = param.memo_ori.replace(/\（分割元\）/g,'');
                            param.memo_ori = param.memo_ori.replace('（分割元）', '');
                        }
                        var source = param.deptName.slice(0, param.deptName.indexOf(' ')).slice(1);
                        log.debug('sub-source', source);
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'memo',
                            value: '（' + source + '）' + param.memo_ori
                        });
                    } else {
                        var source = param.deptName.slice(0, param.deptName.indexOf(' ')).slice(1);
                        log.debug('sub-source', source);
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'memo',
                            value: '（' + source + '）'
                        });
                    }
                    // 名前 
                    if (!isEmpty(param.entity_ori)) {
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'entity',
                            value: param.entity_ori
                        });
                    }
                    // ブランド 
                    if (!isEmpty(param.class_ori)) {
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'class',
                            value: param.class_ori
                        });
                    }
                    // 場所 
                    if (!isEmpty(param.location_ori)) {
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'location',
                            value: param.location_ori
                        });
                    }
                    // セクション 
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'department',
                        value: dept_spl
                    });
                    // DJ_仕訳NO.
                    if (!isEmpty(param.jourNo_ori)) {
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'custcol_dj_journal_no',
                            value: param.jourNo_ori
                        });
                    }
                    //DJ_仕訳日
                    if (!isEmpty(param.jourDate_ori)) {
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'custcol_dj_journal_date',
                            value: format.parse({ value: param.jourDate_ori, type: format.Type.DATE })
                        });
                    }
                    // 自動分割機能_明細行ステータス
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'custcol_djkk_split_line_status',
                        value: 'N-' + param.unique + '-' + type + '-N-N'
                    });

                    // get tax amount
                    sub.tax = currentRecord.getCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'tax1amt'
                    });
                    currentRecord.commitLine({
                        sublistId: 'line'
                    });

                log.debug('add subWithTax finish', 'add subWithTax finish');
            } catch (e) {
                log.error('addSublistRowWithTax(): ' + e.name, e.message);
            }
        }
        function addSublistRowNoTax(param, currentRecord, dept_spl, type, amount) {
            try {
                log.debug('add sub no tax begin', 'add sub no tax begin');
                    currentRecord.selectNewLine({
                        sublistId: 'line'
                    });
                    // 勘定科目 
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'account',
                        value: param.account_ori
                    });
                    // 借方 
                    if (!isEmpty(param.debit_ori)) {
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'debit',
                            value: amount
                        });
                    }
                    // 貸方 
                    if (!isEmpty(param.credit_ori)) {
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'credit',
                            value: amount
                        });
                    }
                    // メモ 
                    // param.memo_ori = currentRecord.getCurrentSublistValue({
                    //         sublistId: 'line',
                    //         fieldId: 'memo'
                    // });
                    if (!isEmpty(param.memo_ori)) {
                        if (param.memo_ori.indexOf('（分割元）')) {
                            // param.memo_ori = param.memo_ori.replace(/\（分割元\）/g,'');
                            param.memo_ori = param.memo_ori.replace('（分割元）', '');
                        }
                        var source = param.deptName.slice(0, param.deptName.indexOf(' ')).slice(1);
                        log.debug('sub-source', source);
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'memo',
                            value: '（' + source + '）' + param.memo_ori
                        });
                    } else {
                        var source = param.deptName.slice(0, param.deptName.indexOf(' ')).slice(1);
                        log.debug('sub-source', source);
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'memo',
                            value: '（' + source + '）'
                        });
                    }
                    // 名前 
                    if (!isEmpty(param.entity_ori)) {
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'entity',
                            value: param.entity_ori
                        });
                    }
                    // ブランド 
                    if (!isEmpty(param.class_ori)) {
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'class',
                            value: param.class_ori
                        });
                    }
                    // 場所 
                    if (!isEmpty(param.location_ori)) {
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'location',
                            value: param.location_ori
                        });
                    }
                    // セクション 
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'department',
                        value: dept_spl
                    });
                    // DJ_仕訳NO.
                    if (!isEmpty(param.jourNo_ori)) {
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'custcol_dj_journal_no',
                            value: param.jourNo_ori
                        });
                    }
                    //DJ_仕訳日
                    if (!isEmpty(param.jourDate_ori)) {
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'custcol_dj_journal_date',
                            value: format.parse({ value: param.jourDate_ori, type: format.Type.DATE })
                        });
                    }
    
                    // 自動分割機能_明細行ステータス
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'custcol_djkk_split_line_status',
                        value: 'N-' + param.unique + '-' + type + '-N-N'
                    });
                    currentRecord.commitLine({
                        sublistId: 'line'
                    });
                
                log.debug('add sub no tax finish', 'add sub no tax finish');
            } catch (e) {
                log.error('addSublistRowNoTax(): ' + e.name, e.message);
            }
        }
        function getDeptId() {
            var objList = [];

            var searchFilters = [];
            searchFilters.push({
                name: 'isinactive',
                operator: search.Operator.IS,
                values: ['F']
            });

            var mySearch = search.create({
                type: 'department',
                filters: searchFilters,
                columns: [{ name: 'internalid' },
                { name: 'name' }]
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
                obj.deptId = result.getValue({ name: 'internalid' });
                obj.deptName = result.getValue({ name: 'name' });
                objList.push(obj);
            });
            return objList;
        }

        function searchAccountType(accId) {
            try {
                var searchAcc = search.lookupFields({
                    type: 'account',
                    id: accId,
                    columns: ['type']
                });
                var accType = '';
                util.each(searchAcc.type, function (item) {
                    accType = item.value;
                });
                return accType;
            } catch (e) {
                log.error('searchAccountType: ' + e.name, e.message);
                return '';
            }
        }
        function getTaxRate(taxCode) {
            try {
                var searchTax = search.lookupFields({
                    // type: 'taxgroup',
                    type: 'salestaxitem',
                    id: taxCode,
                    columns: ['rate']
                });
                var rate = parseFloat(searchTax.rate) / 100;
                log.debug('getTaxRate', rate);
                return rate;
            } catch (e) {
                log.error('getTaxRate: ' + e.name, e.message);
                return 0;
            }
        }
        function checkSegmentInfo() {
            var objList = [];
            var mySearch = search.create({
                type: 'customrecord_dj_activity_conversion_tbl',
                columns: [{ name: 'custrecord_converted_activity' }]
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
                var key = result.getValue({ name: 'custrecord_converted_activity' });
                objList.push(key);
            });
            return objList;
        }
        return {
            afterSubmit: afterSubmit,
            // beforeLoad: beforeLoad,
        };

    });