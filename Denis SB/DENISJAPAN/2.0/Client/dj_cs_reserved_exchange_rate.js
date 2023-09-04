/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 *
 * 為替レート換算
 *
 */
define(['N/ui/dialog', 'N/currentRecord','N/search', 'N/ui/message'],

function( dialog,currentRecord,search,message) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {

        var type = scriptContext.currentRecord.type;

        addButton(type);

        var type = currentRecord.type;

        if (type == 'vendorpayment') {
            var rate1 = currentRecord.getValue({
                fieldId: 'custbody_dj_reserved_exchange_rate_p1'
            });
            if (rate1) {
                currentRecord.getField({
                    fieldId : 'custbody_dj_reserved_exchange_rate_p2'
                }).isDisabled = false
                currentRecord.getField({
                    fieldId : 'custbody_dj_reserved_exchange_rate_p3'
                }).isDisabled = false
            } else {

                currentRecord.getField({
                    fieldId : 'custbody_dj_reserved_exchange_rate_p2'
                }).isDisabled = true
                currentRecord.getField({
                    fieldId : 'custbody_dj_reserved_exchange_rate_p3'
                }).isDisabled = true
            }

        }
    }


    function fieldChanged(scriptContext) {

        var currentRecord = scriptContext.currentRecord;
        var type = currentRecord.type;

        if (type == 'vendorpayment') {
            if (scriptContext.fieldId == 'custbody_dj_reserved_exchange_rate_p1') {
                var rate1 = currentRecord.getValue({
                    fieldId: 'custbody_dj_reserved_exchange_rate_p1'
                });
                if (rate1) {
                    currentRecord.getField({
                        fieldId : 'custbody_dj_reserved_exchange_rate_p2'
                    }).isDisabled = false
                    currentRecord.getField({
                        fieldId : 'custbody_dj_reserved_exchange_rate_p3'
                    }).isDisabled = false
                } else {

                    currentRecord.getField({
                        fieldId : 'custbody_dj_reserved_exchange_rate_p2'
                    }).isDisabled = true
                    currentRecord.getField({
                        fieldId : 'custbody_dj_reserved_exchange_rate_p3'
                    }).isDisabled = true
                }
            }
        }


    }
    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {
        var currentRecord = scriptContext.currentRecord;
        var rateFlg = currentRecord.getValue({fieldId: 'custbody_dj_reserved_exchange_rate_flg'});

        var type = currentRecord.type;

        if (type == 'vendorpayment') {


            var rate = currentRecord.getValue({fieldId: 'custbody_dj_reserved_exchange_rate_p1'});
        } else if (type == 'customerpayment') {

            var rate = currentRecord.getValue({fieldId: 'custbody_dj_reserved_exchange_rate_s1'});
        }
        if (rateFlg && !rate) {
            alert('予約為替レートを選択してください.');
            return false;
        }


        return true;
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        saveRecord: saveRecord
        
    };
    
});

function addButton(type) {

    require([], function() {

        var iEle;

        if (type == 'vendorpayment') {
            iEle = document.getElementById("custbody_dj_reserved_exchange_rate_p1_display");
        } else if (type == 'customerpayment') {
            iEle = document.getElementById("custbody_dj_reserved_exchange_rate_s1_display");
        } else {
            return;
        }

        var pEle = iEle.parentNode;


        var aEle = document.createElement('a');
        aEle.setAttribute("href", "javascript:void(0)");
        aEle.style.marginRight = '8px';
        aEle.innerHTML = '<button type="button" onclick="autoSetRate(\''+ type +'\');" onsubmit="return false;">自動引当</button>';

        pEle.insertBefore(aEle,iEle);
    });
}

function autoSetRate(type) {

    require(['N/currentRecord','N/search','N/ui/dialog'], function(currentRecord, search, dialog) {

        var ctRecord = currentRecord.get();
        var entity;
        var filters = [];
        filters.push(['custrecord_djkk_reservation_rate_type','is','1'])
        if (type == 'vendorpayment') {

            entity = ctRecord.getValue({
                fieldId: 'entity'
            });
            filters.push('AND')
            filters.push(['custrecord_djkk_rer_vendor','anyof',entity])
            filters.push('AND')
            filters.push(['custrecord_djkk_reservation_rate_categ','is','1'])
        } else if (type == 'customerpayment') {

            entity = ctRecord.getValue({
                fieldId: 'customer'
            });
            filters.push('AND')
            filters.push(['custrecord_djkk_rer_customer','anyof',entity])
            filters.push('AND')
            filters.push(['custrecord_djkk_reservation_rate_categ','is','2'])


        }



        var s = search.create({
            type: 'customrecord_djkk_reserved_exchange_rate',
            columns: [search.createColumn({
                name : 'custrecord_djkk_reserved_exchange_rate'
            }), search.createColumn({
                name : 'custrecord_djkk_date',
                sort : search.Sort.DESC
            })],
            filters: filters
        });


        var resultSet = s.run();

        var results = resultSet.getRange({
            start : 0,
            end : 1
        });

        if (results && results.length > 0) {

            var rate = results[0].id;

            if (rate){
                if (type == 'vendorpayment') {

                    ctRecord.setValue({
                        fieldId: 'custbody_dj_reserved_exchange_rate_p1',
                        value : rate
                    });
                } else if (type == 'customerpayment') {


                    ctRecord.setValue({
                        fieldId: 'custbody_dj_reserved_exchange_rate_s1',
                        value : rate
                    });
                }
            } else {

                dialog.alert({
                    title : '為替レート換算',
                    message : '予約為替レートは取得できません。'
                })
            }
        } else {

            dialog.alert({
                title : '為替レート換算',
                message : '予約為替レートは取得できません。'
            })
        }
    });
}