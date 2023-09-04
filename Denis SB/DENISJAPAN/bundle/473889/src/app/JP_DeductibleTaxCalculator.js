/**
 * Copyright (c) 2023, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define([
    'N/record',
    './JP_TaxPrefSUCaller'
],(
    record,
    TaxPrefSUCaller
) => {
    const TAX_CODE = 'taxcode';
    const GROSS_AMT = 'grossamt';
    const TAX_AMT = 'tax1amt';
    const AMOUNT = 'amount';
    const RATE = 'rate';
    const ENTITY = 'entity';
    const TAX_DEDUCT = 'custrecord_jp_tax_deduct';

    class JP_DeductibleTaxCalculator{

        constructor() {
            //TODO: similar logic with JP_TaxPreferencesDAO, to optimize soon.
            this.roundingLookup = {
                "DOWN" : Math.floor,
                "UP" : Math.ceil,
                "OFF" : Math.round
            };
        }

        calculateTaxDeductible(currentRecord, sublist){
            if([record.Type.PURCHASE_ORDER, record.Type.VENDOR_BILL, record.Type.VENDOR_CREDIT]
                .indexOf(currentRecord.type) >= 0) {
                let taxCode = currentRecord.getCurrentSublistValue({sublistId: sublist, fieldId: TAX_CODE});
                let origAmt = currentRecord.getCurrentSublistValue({sublistId: sublist, fieldId: AMOUNT});
                let taxCodeRecord;

                try {
                    taxCodeRecord = record.load({
                        type: record.Type.SALES_TAX_ITEM,
                        id: parseInt(taxCode)
                    });
                } catch(e) {
                    return;
                }

                let taxDeductRate = taxCodeRecord.getText({fieldId: TAX_DEDUCT});

                if (taxDeductRate && origAmt){
                    taxDeductRate = taxDeductRate.replace(/[^\d.]/g, '');

                    let taxRate = taxCodeRecord.getValue({fieldId: RATE})/100;

                    let grossAmt = currentRecord.getCurrentSublistValue({sublistId: sublist, fieldId: GROSS_AMT});
                    origAmt = grossAmt * (1/(1+taxRate)); //same as grossAmt/(1+taxRate)
                    let origTaxAmt = origAmt * taxRate;

                    //get vendor rounding method
                    let entityID = currentRecord.getValue({fieldId: ENTITY});
                    let taxPref = TaxPrefSUCaller.getTaxPref({
                        entityid: entityID,
                        entityType: record.Type.VENDOR
                    });
                    let roundingMethod = this.roundingLookup[taxPref.roundingMethod];

                    let newTaxAmt = roundingMethod(origTaxAmt * (taxDeductRate/100));
                    let newAmt = grossAmt - newTaxAmt;

                    currentRecord.setCurrentSublistValue({
                        sublistId: sublist,
                        fieldId: AMOUNT,
                        value: newAmt
                    });

                    currentRecord.setCurrentSublistValue({
                        sublistId: sublist,
                        fieldId: TAX_AMT,
                        value: newTaxAmt
                    });

                    let data = {
                        'origAmt': origAmt,
                        'origTaxAmt': origTaxAmt,
                        'newAmt': newAmt,
                        'newTaxAmt': newTaxAmt,
                        'grossAmt': grossAmt
                    };

                    log.debug('JP_DeductibleTaxCalculator.calculateTaxDeductible',JSON.stringify(data));
                }
            }

        }
    }

    return JP_DeductibleTaxCalculator;

});