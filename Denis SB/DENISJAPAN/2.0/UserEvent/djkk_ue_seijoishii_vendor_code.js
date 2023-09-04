/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
 define(['N/record', 'N/search', 'N/log'], function(record, search, log) {
    /**
     * Function definition to be triggered before record is loaded.
     * 
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {
        if (scriptContext.type == scriptContext.UserEventType.DELETE) {
            // 削除する場合

            // レコード情報を取得する
            var newRecord = scriptContext.newRecord;
            var recordId = newRecord.id;
            var recordType = newRecord.type;
            var currentRecord = record.load({
                type : recordType,
                id : recordId
            });

            var subsidiaryId = currentRecord.getValue({fieldId: 'custrecord5'});

            var subsidiaryRecord = record.load({
                type: record.Type.SUBSIDIARY,
                id: subsidiaryId
            });
            
            // 既存の連結.DJ_ 成城石井取引先コード を取得
            var vendors = subsidiaryRecord.getValue({fieldId: 'custrecord_djkk_seijoishii_vendor_code'});
                
            if (vendors != null && vendors != '') {
                vendors = vendors.filter(function(x) {
                    if (x == recordId) {
                        return false;
                    } else {
                        return true;
                    }
                });

                subsidiaryRecord.setValue({
                    fieldId: 'custrecord_djkk_seijoishii_vendor_code',
                    value: vendors
                })
            }
            subsidiaryRecord.save();
        }
            
    }

    /**
     * Function definition to be triggered before record is loaded.
     * 
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) {
        // 新規と編集の場合
        if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT) {
            // レコード情報を取得する
            var newRecord = scriptContext.newRecord;
            var recordId = newRecord.id;
            var recordType = newRecord.type;
            var currentRecord = record.load({
                type : recordType,
                id : recordId
            });
            
            var subsidiaryId = currentRecord.getValue({fieldId: 'custrecord5'});

            log.debug({
                title: 'subsidiary id',
                details: subsidiaryRecord
            });

            var subsidiaryRecord = record.load({
                type: record.Type.SUBSIDIARY,
                id: subsidiaryId
            });
            
            // 既存の連結.DJ_ 成城石井取引先コード を取得
            var vendors = subsidiaryRecord.getValue({fieldId: 'custrecord_djkk_seijoishii_vendor_code'});

            var flgIsInactive = currentRecord.getValue({
                fieldId: 'isinactive'
            });

            if (!flgIsInactive) {
                if (vendors != null && vendors != '') {
                    if (vendors.indexOf(recordId) < 0) {
                        vendors.push(recordId);
                        subsidiaryRecord.setValue({
                            fieldId: 'custrecord_djkk_seijoishii_vendor_code',
                            value: vendors
                        })
                    }
                } else {
                    subsidiaryRecord.setValue({
                        fieldId: 'custrecord_djkk_seijoishii_vendor_code',
                        value: [recordId.toString()]
                    })
                }
                
            } else {
                if (vendors != null && vendors != '') {
                    vendors = vendors.filter(function(x) {
                        if (x == recordId) {
                            return false;
                        } else {
                            return true;
                        }
                    });

                    subsidiaryRecord.setValue({
                        fieldId: 'custrecord_djkk_seijoishii_vendor_code',
                        value: vendors
                    })
                }
            }
            subsidiaryRecord.save();
        }
    }

    return {
        beforeSubmit : beforeSubmit,
        afterSubmit : afterSubmit
    };
});
