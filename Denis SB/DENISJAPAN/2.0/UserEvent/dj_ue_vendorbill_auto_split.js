/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope Public
 * 
 * �x���������o��׍s������������
 * from-key-type-change-remove
 */
define(['N/ui/serverWidget', 'N/search', 'N/url', 'N/record', 'N/runtime', 'N/log', 'N/email', 'N/format'],
    function (serverWidget, search, url, record, runtime, log, email,format) {
        // function beforeLoad(scriptContext) {
        //     var type = scriptContext.type;
        //     var form = scriptContext.form
        //     // Fields that will be hidden in View mode
        //     if (type == scriptContext.UserEventType.VIEW || type == scriptContext.UserEventType.PRINT || type == scriptContext.UserEventType.EMAIL) {
        //         form.getSublist({id: 'expense'}).getField({id: 'custcol_djkk_split_line_key'}).updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});
        //         form.getSublist({id: 'expense'}).getField({id: 'custcol_djkk_split_line_type'}).updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});
        //         // form.getSublist({id: 'expense'}).getField({id: 'custcol_djkk_split_line_from'}).updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});
        //         form.getSublist({id: 'expense'}).getField({id: 'custcol_djkk_split_change_flag'}).updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});
        //         form.getSublist({id: 'expense'}).getField({id: 'custcol_djkk_split_remove_flag'}).updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});
        //     }
        //     // Fields that will be hidden in Create, Edit mode
        //     if (type == scriptContext.UserEventType.CREATE || type == scriptContext.UserEventType.EDIT || type == scriptContext.UserEventType.COPY) {
        //         form.getSublist({id: 'expense'}).getField({id: 'custcol_djkk_split_line_key'}).updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});
        //         form.getSublist({id: 'expense'}).getField({id: 'custcol_djkk_split_line_type'}).updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});
        //         // form.getSublist({id: 'expense'}).getField({id: 'custcol_djkk_split_line_from'}).updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});
        //         form.getSublist({id: 'expense'}).getField({id: 'custcol_djkk_split_change_flag'}).updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});
        //         form.getSublist({id: 'expense'}).getField({id: 'custcol_djkk_split_remove_flag'}).updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});
        //     }
        // }
        function afterSubmit(scriptContext) {
            var type = scriptContext.type;

            // �V�K�̏ꍇ
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
                    sublistId: 'expense'
                });
                log.debug('start-numLines', numLines);

                for (var i = 0; i < numLines; i++) {
                    currentRecord.selectLine({ sublistId: 'expense', line: i });
                    // �Z�N�V����
                    var dept_ori = currentRecord.getCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'department'
                    });
                    var deptName_ori = currentRecord.getCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'department_display',
                        line: i
                    });
                    // ���������@�\_���׍s�X�e�[�^�X
                    var status_pre = currentRecord.getCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'custcol_djkk_split_line_status',
                        line: i
                    });
                    var status = status_pre.split('-');

                    var condition = !isEmpty(dept_ori) && status[0] == 'N' && status[1] == 'N' && status[2] == 'N';
                    splitLine(currentRecord, condition, deptName_ori,dept_ori);
                }

                currentRecord.save({ ignoreMandatoryFields: true });

                var numLines1 = currentRecord.getLineCount({
                    sublistId: 'expense'
                });
                log.debug('end_linenum', numLines1);
            }
            // �ҏW �폜�̏ꍇ
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
                    sublistId: 'expense'
                });
                log.debug('start-numLines', numLines);

                for (var i = 0; i < numLines; i++) {
                    currentRecord.selectLine({ sublistId: 'expense', line: i });
                    // �Z�N�V����
                    var dept_edi = currentRecord.getCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'department'
                    });
                    var deptName_edi = currentRecord.getCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'department_display',
                        line: i
                    });
                    // ���������@�\_���׍s�X�e�[�^�X
                    var status_edi = currentRecord.getCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'custcol_djkk_split_line_status',
                        line: i
                    });
                    var status = status_edi.split('-');
                    // split for edited lines
                    if(!isEmpty(dept_edi) && status[0] == 'T' && status[3] == 'T'){
                        var condition_edi = status[0] == 'T' && status[3] == 'T'
                        splitLine(currentRecord, condition_edi, deptName_edi,dept_edi);
                    }
                    // split for new lines
                    if(!isEmpty(dept_edi) &&  status[0] == 'N' && status[1] == 'N' && status[2] == 'N' && status[3] == 'N' && status[4] == 'N'){
                        var condition_new = !isEmpty(dept_edi) && status[0] == 'N' && status[1] == 'N' && status[2] == 'N' && status[3] == 'N' && status[4] == 'N';
                        splitLine(currentRecord, condition_new, deptName_edi,dept_edi);
                    }
                }
                // change flags to false
                for (var j = 0; j < numLines; j++) {
                    currentRecord.selectLine({ sublistId: 'expense', line: j });
                    // ���������@�\_���׍s�X�e�[�^�X
                    var status_loop = currentRecord.getCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'custcol_djkk_split_line_status',
                        line: j
                    });
                    var statusArr = status_loop.split('-');
                    // �ύX�L���t���O
                    if (statusArr[3] == 'T') {
                        statusArr[3] = 'F';
                    } 
                    // �폜�t���O
                    if (statusArr[4] == 'T') {
                        statusArr[4] = 'F';
                    }
                    var res = statusArr.join('-');
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'custcol_djkk_split_line_status',
                        value: res
                    });
                    currentRecord.commitLine({ sublistId: 'expense' });
                }

                currentRecord.save({ignoreMandatoryFields: true });

                var numLines1 = currentRecord.getLineCount({
                    sublistId: 'expense'
                });
                log.debug('end_linenum', numLines1);
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
        function splitLine(currentRecord, condition, deptName_ori,deptId) {

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
                    // �J�e�S��
                    param.category_ori = currentRecord.getCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'category'
                    });
                    // ����Ȗ� 
                    param.account_ori = currentRecord.getCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'account'
                    });
                    // ���z
                    param.amount_ori = currentRecord.getCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'amount'
                    });
                    // �ŋ�
                    param.taxcode_ori = currentRecord.getCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'taxcode'
                    });
                    // ����
                    param.memo_ori = currentRecord.getCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'memo'
                    });
                    // �Z�N�V����
                    param.dept_ori = currentRecord.getCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'department'
                    });
                    param.deptName = currentRecord.getCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'department_display'
                    });
                    // �u�����h
                    param.class_ori = currentRecord.getCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'class'
                    });
                    // �ꏊ
                    param.location_ori = currentRecord.getCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'location'
                    });
                    // �ڋq:�v���W�F�N�g
                    param.client_ori = currentRecord.getCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'customer'
                    });
                    // �����\
                    param.billable_ori = currentRecord.getCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'billable'
                    });
                    // ���p�X�P�W���[��
                    param.amort_ori = currentRecord.getCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'amortizationschedule'
                    });
                    // ���p�̊J�n
                    param.amortSt_ori = currentRecord.getCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'oldamortizstartdate'
                    });
                    // ���p�̏I��
                    param.amortEnd_ori = currentRecord.getCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'oldamortizationenddate'
                    });
                    // �ŋ��J�e�S��
                    param.taxCate_ori = currentRecord.getCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'custcol_4572_tax_category'
                    });
                    // ������ ���j�b�N�L�[
                    param.unique = currentRecord.getCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'lineuniquekey'
                    });
                    // ���������@�\_���׃^�C�v
                    // param.type = currentRecord.getCurrentSublistValue({
                    //     sublistId: 'expense',
                    //     fieldId: 'custcol_djkk_split_line_type'
                    // });
                    // ���������@�\_������
                    // param.from = currentRecord.getCurrentSublistValue({
                    //     sublistId: 'expense',
                    //     fieldId: 'custcol_djkk_split_line_from'
                    // });
                    // ������ ���j�b�N�L�[
                    // currentRecord.setCurrentSublistValue({
                    //     sublistId: 'expense',
                    //     fieldId: 'custcol_djkk_split_line_key',
                    //     value: param.unique
                    // });
                    // ���������@�\_������
                    // currentRecord.setCurrentSublistValue({
                    //     sublistId: 'expense',
                    //     fieldId: 'custcol_djkk_split_line_from',
                    //     value: 'T'
                    // });

                    // set zero
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'amount',
                        value: 0
                    });
                    // ���������@�\_���׍s�X�e�[�^�X
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'custcol_djkk_split_line_status',
                        value: 'T' + '-' + param.unique + '-N-N-N'
                    });
                    // ����
                    if(!isEmpty(param.memo_ori)){
                        if(param.memo_ori.indexOf('�i�������j')){
                            // param.memo_ori = param.memo_ori.replace(/\�i������\�j/g,'');
                            param.memo_ori = param.memo_ori.replace('�i�������j','');
                        }
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'expense',
                            fieldId: 'memo',
                            value: param.memo_ori + '�i�������j'
                        });
                    }else{
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'expense',
                            fieldId: 'memo',
                            value: '�i�������j'
                        });
                    }
                    currentRecord.commitLine({ sublistId: 'expense' });
                    log.debug('param', param);

                    if (!isEmpty(param.amount_ori)) {
                        // add reverse line
                        // addReverseSublistRow(param, currentRecord);
                        var total = parseInt(param.amount_ori);
                        var sum = 0;
                        // add sub split line
                        for (var j = 0; j < deptSplitList.length; j++) {
                            var subDeptId = '';
                            var percent = 0.0;
                            for (var key in deptSplitList[j]) {
                                //get sub dept internalid
                                subDeptId = key;
                                // var subDept = deptStr + key;
                                // log.debug('subDept', subDept);
                                // util.each(deptList, function (item) {
                                //     if (subDept == (item.deptName).slice(0, (item.deptName).indexOf(' '))) {
                                //         subDeptId = item.deptId;
                                //     }
                                // });

                                //get sub dept proportion 
                                percent = deptSplitList[j][key].replace("%", "") / 100;
                            }
                            log.debug('subDeptId', subDeptId);
                            log.debug('percent', percent);

                            // lineNum = lineNum + 1;
                            // log.debug('after-lineNum',lineNum);
                            
                            var amount  = 0;
                            if(j == deptSplitList.length -1){
                                amount = parseInt(total - sum);
                            }else{
                                sum = sum + Math.round(total * percent);
                                amount = Math.round(parseInt(total) * percent);
                            }
                            addSublistRow(param, currentRecord, subDeptId, 'sub', percent,amount);
                        }
                    }
                }
            }
        }
        // add reverse line
        function addReverseSublistRow(param, currentRecord) {
            try {
                log.debug('add reverse begin', 'add reverse begin');
                currentRecord.selectNewLine({
                    sublistId: 'expense'
                });
                // ����Ȗ� 
                currentRecord.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'account',
                    value: param.account_ori
                });
                // ���z
                if (!isEmpty(param.amount_ori)) {
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'amount',
                        value: param.amount_ori
                    });
                }
                // �ŋ� 
                if (!isEmpty(param.taxcode_ori)) {
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'taxcode',
                        value: param.taxcode_ori
                    });
                }
                // ���� 
                if (!isEmpty(param.memo_ori)) {
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'memo',
                        value: param.memo_ori
                    });
                }
                // �u�����h 
                if (!isEmpty(param.class_ori)) {
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'class',
                        value: param.class_ori
                    });
                }
                // �ꏊ 
                if (!isEmpty(param.location_ori)) {
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'location',
                        value: param.location_ori
                    });
                }
                // �Z�N�V���� 
                currentRecord.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'department',
                    value: param.dept_ori
                });
                // ���������@�\_���׃��j�b�N�L�[
                currentRecord.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'custcol_djkk_split_line_key',
                    value: param.unique
                });
                // ���������@�\_���׃^�C�v
                currentRecord.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'custcol_djkk_split_line_type',
                    value: param.reverseType
                });
                currentRecord.commitLine({
                    sublistId: 'expense'
                });
                log.debug('add reverse finish', 'add reverse finish');
            } catch (e) {
                log.error('addReverseSublistRow(): ' + e.name, e.message);
            }
        }
        // add sub split line
        function addSublistRow(param, currentRecord, dept_spl, type, percent,amount) {
            try {
                log.debug('add sub begin', 'add sub begin');
                currentRecord.selectNewLine({
                    sublistId: 'expense'
                });
                // �J�e�S��
                if(!isEmpty(param.category_ori)){
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'category',
                        value: param.category_ori
                    });
                }
                // ����Ȗ� 
                currentRecord.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'account',
                    value: param.account_ori
                });
                // ���z amount
                currentRecord.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'amount',
                    value: amount
                });
                // �ŋ� 
                if (!isEmpty(param.taxcode_ori)) {
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'taxcode',
                        value: param.taxcode_ori
                    });
                }
                // ���� 
                // if (!isEmpty(param.memo_ori)) {
                //     currentRecord.setCurrentSublistValue({
                //         sublistId: 'expense',
                //         fieldId: 'memo',
                //         value: param.memo_ori
                //     });
                // }
                log.debug('1-param.memo_ori',param.memo_ori);
                if (!isEmpty(param.memo_ori)) {
                    if(param.memo_ori.indexOf('�i�������j')){
                        param.memo_ori = param.memo_ori.replace('�i�������j','');
                    }
                    log.debug('2-param.memo_ori',param.memo_ori);
                    var source = param.deptName.slice(0, param.deptName.indexOf(' ')).slice(1);
                    log.debug('sub-source',source);
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'memo',
                        value: '�i'+ source +'�j'+ param.memo_ori
                    });
                }else{
                    var source = param.deptName.slice(0, param.deptName.indexOf(' ')).slice(1);
                    log.debug('sub-source',source);
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'memo',
                        value: '�i'+ source +'�j'
                    });
                }
                // �u�����h 
                if (!isEmpty(param.class_ori)) {
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'class',
                        value: param.class_ori
                    });
                }
                // �ꏊ 
                if (!isEmpty(param.location_ori)) {
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'location',
                        value: param.location_ori
                    });
                }
                // �Z�N�V���� 
                currentRecord.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'department',
                    value: dept_spl
                });
                // �ڋq:�v���W�F�N�g 
                if (!isEmpty(param.client_ori)) {
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'customer',
                        value: param.client_ori
                    });
                }
                // �����\ 
                if (!isEmpty(param.billable_ori)) {
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'billable',
                        value: param.billable_ori
                    });
                }
                // ���p�X�P�W���[�� 
                if (!isEmpty(param.amort_ori)) {
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'amortizationschedule',
                        value: param.amort_ori
                    });
                }
                // ���p�̊J�n 
                if (!isEmpty(param.amortSt_ori)) {
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'oldamortizstartdate',
                        value: param.amortSt_ori
                    });
                }
                // ���p�̏I�� 
                if (!isEmpty(param.amortEnd_ori)) {
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'oldamortizationenddate',
                        value: format.parse({ value: param.amortEnd_ori, type: format.Type.DATE })
                    });
                }
                // �ŋ��J�e�S�� 
                if (!isEmpty(param.taxCate_ori)) {
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'custcol_4572_tax_category',
                        value: format.parse({ value: param.taxCate_ori, type: format.Type.DATE })
                    });
                }
                // ���������@�\_���׃��j�b�N�L�[
                // currentRecord.setCurrentSublistValue({
                //     sublistId: 'expense',
                //     fieldId: 'custcol_djkk_split_line_key',
                //     value: param.unique
                // });
                // ���������@�\_���׃^�C�v
                // currentRecord.setCurrentSublistValue({
                //     sublistId: 'expense',
                //     fieldId: 'custcol_djkk_split_line_type',
                //     value: type
                // });

                // ���������@�\_���׍s�X�e�[�^�X
                currentRecord.setCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'custcol_djkk_split_line_status',
                    value: 'N-' + param.unique + '-' + type + '-N-N'
                });
                currentRecord.commitLine({
                    sublistId: 'expense'
                });
                log.debug('add sub finish', 'add sub finish');
            } catch (e) {
                log.error('addSublistRow(): ' + e.name, e.message);
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
        
        return {
            afterSubmit: afterSubmit,
            // beforeLoad: beforeLoad,
        };

    });