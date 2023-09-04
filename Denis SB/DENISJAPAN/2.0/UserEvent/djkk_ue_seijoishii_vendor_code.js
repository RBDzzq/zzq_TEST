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
            // �폜����ꍇ

            // ���R�[�h�����擾����
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
            
            // �����̘A��.DJ_ ����Έ�����R�[�h ���擾
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
        // �V�K�ƕҏW�̏ꍇ
        if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT) {
            // ���R�[�h�����擾����
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
            
            // �����̘A��.DJ_ ����Έ�����R�[�h ���擾
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
