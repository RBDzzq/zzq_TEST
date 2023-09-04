/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 * @NAmdConfig ../Common/myconfig.json
 * ì¸ã‡ä«óùÇÃï“èWÅAåÎç∑í≤êÆã‡äzâÊñ 
 *
 *
 */
define(['N/ui/dialog', 'N/currentRecord', 'N/search', 'N/ui/message', 'N/record', 'N/format', 'me'],

    function (dialog, currentRecord, search, message, record, format, me) {

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

        }

        /**
         * Function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.line - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */
        function fieldChanged(scriptContext) {
            var currentRecord = scriptContext.currentRecord;
            var line = scriptContext.line;
            var sublistId = scriptContext.sublistId;
            var payment_id = currentRecord.getValue({
                fieldId: 'custpage_payment_id'
            });
            // í≤êÆäz
            var adjustment = currentRecord.getValue({
                "fieldId": "custpage_adjustment"
            });

            // // ç∑äz
            // var adjustmentDiffTmp = currentRecord.getValue({
            //     "fieldId": "custpage_diff"
            // });

            // êøãÅäz
            var amountremainingTmp = currentRecord.getValue({
                "fieldId": "custpage_amountremaining"
            });

            if (line != null) {

                // ã‡äz
                if (scriptContext.fieldId == 'custpage_amount'
                    || scriptContext.fieldId == 'custpage_taxitem'
                    || scriptContext.fieldId == 'custpage_sub_account') {
                    var amount = currentRecord.getCurrentSublistValue({
                        sublistId: sublistId,
                        fieldId: 'custpage_amount',
                        line: line
                    });

                    if (me.isEmpty(amount)) {
                        return;
                    }
                    amount = parseInt(amount);

                    var taxitem = currentRecord.getCurrentSublistValue({
                        sublistId: sublistId,
                        fieldId: 'custpage_taxitem',
                        line: line
                    });

                    var amountLeft = amount;
                    if (!me.isEmpty(taxitem)) {
                        amountLeft = parseInt((amount*100) / (100 + parseInt(taxitem)));
                    }
                    var amountTax = amount - amountLeft;
                    var amountTotal = amount;

                    // currentRecord.selectLine({
                    //     sublistId: sublistId,
                    //     line:line
                    // })

                    // ê≈î≤ã‡äz
                    currentRecord.setCurrentSublistValue({
                        sublistId: sublistId,
                        fieldId: 'custpage_amount_left',
                        value:amountLeft,
                        ignoreFieldChange:true
                    });
                    // è¡îÔê≈äz
                    currentRecord.setCurrentSublistValue({
                        sublistId: sublistId,
                        fieldId: 'custpage_tax_amount',
                        value:amountTax,
                        ignoreFieldChange:true
                    });
                    // ëçäz
                    currentRecord.setCurrentSublistValue({
                        sublistId: sublistId,
                        fieldId: 'custpage_total_amount',
                        value: amountTotal,
                        ignoreFieldChange:true
                    });

                    // currentRecord.commitLine({
                    //     sublistId: sublistId,
                    // })

                    var numLines = currentRecord.getLineCount({
                        sublistId: 'custpage_diff_sub_list'
                    });
                    var totalAmount = 0;
                    for (var i=0;i<numLines;i++){
                        var amountTmp = currentRecord.getSublistValue({
                            sublistId: 'custpage_diff_sub_list',
                            fieldId: 'custpage_amount',
                            line: i
                        });
                        if (line == i) {
                            amountTmp = amount;
                        }
                        if (!me.isEmpty(amountTmp)) {
                            totalAmount += parseInt(amountTmp);
                        }
                    }
                    if(line + 1 > numLines){
                        totalAmount += amount;
                    }
                    // var adjustmentDiff = parseInt(amountremainingTmp) + parseInt(adjustment) - parseInt(totalAmount);

                    adjustment = parseInt(totalAmount);
                    currentRecord.setValue({
                        "fieldId": "custpage_adjustment",
                        "value": adjustment,
                        ignoreFieldChange:true
                    });
                    // currentRecord.setValue({
                    //     "fieldId": "custpage_diff",
                    //     "value": adjustmentDiff,
                    //     ignoreFieldChange:true
                    // });

                }
            }
        }

        function validateField(scriptContext) {
            var currentRecord = scriptContext.currentRecord;
            var line = scriptContext.line;
            var sublistId = scriptContext.sublistId;
            var payment_id = currentRecord.getValue({
                fieldId: 'custpage_payment_id'
            });
            // í≤êÆäz
            var adjustment = currentRecord.getValue({
                "fieldId": "custpage_adjustment"
            });

            // // ç∑äz
            // var adjustmentDiffTmp = currentRecord.getValue({
            //     "fieldId": "custpage_diff"
            // });

            // êøãÅäz
            var amountremainingTmp = currentRecord.getValue({
                "fieldId": "custpage_amountremaining"
            });

            if (line != null) {

                // ã‡äz
                if (scriptContext.fieldId == 'custpage_amount') {
                    var amount = currentRecord.getCurrentSublistValue({
                        sublistId: sublistId,
                        fieldId: 'custpage_amount',
                        line: line
                    });

                    if (me.isEmpty(amount)) {
                        return true;
                    }
                    amount = parseInt(amount);

                    var numLines = currentRecord.getLineCount({
                        sublistId: 'custpage_diff_sub_list'
                    });
                    var totalAmount = 0;
                    for (var i=0;i<numLines;i++){
                        var amountTmp = currentRecord.getSublistValue({
                            sublistId: 'custpage_diff_sub_list',
                            fieldId: 'custpage_amount',
                            line: i
                        });
                        if (line == i) {
                            amountTmp = amount;
                        }
                        if (!me.isEmpty(amountTmp)) {
                            totalAmount += parseInt(amountTmp);
                        }
                    }
                    if(line + 1 > numLines){
                        totalAmount += amount;
                    }
                    var adjustmentDiff = parseInt(amountremainingTmp, 10) - parseInt(totalAmount, 10);
                    if (adjustmentDiff < 0) {
                        alert('ì¸óÕÇµÇΩã‡äzÇÕêøãÅäzÇÊÇËëÂÇ´Ç≠Ç≈Ç´Ç‹ÇπÇÒÅB');
                        return false;
                    }

                }
            }


            return true;
        }

        function validateLine(scriptContext) {


            return true;
        }

        /**
         * Validation function to be executed when record is saved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @returns {boolean} Return true if record is valid
         *
         * @since 2015.2
         */

        function saveRecord(scriptContext) {

                return true;
        }

        function btnReturnButton() {
            window.history.go(-1);
        }

        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            saveRecord: saveRecord,
            validateField: validateField,
            validateLine: validateLine,
            btnReturnButton: btnReturnButton
        };

    });
