/**
 *    Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define([
    './JP_TaxFormjQueryWrapper',
    './JP_DeductibleTaxFormConstants'
],

 (domUtil, formConstants) => {

    let DEDUCFORM3BOX = formConstants.Form.DEDUCFORM3BOX;
    let DEDUCFORM4BOX = formConstants.Form.DEDUCFORM4BOX;
    let DEDUCFORM2BOX = formConstants.Form.DEDUCFORM2BOX;

    let ITEMIZED = formConstants.CalcMethod.ITEMIZED;
    let PROPORTIONAL = formConstants.CalcMethod.PROPORTIONAL;

    let TC_3_LEGACY = formConstants.TaxClassification.TC_3_LEGACY;
    let TC_5_LEGACY = formConstants.TaxClassification.TC_5_LEGACY;
    let TC_8_LEGACY = formConstants.TaxClassification.TC_8_LEGACY;
    let TC_OTHR_STP_8_LEGACY = formConstants.TaxClassification.TC_OTHR_STP_8_LEGACY;
    let TC_OTHR_TF_8_LEGACY = formConstants.TaxClassification.TC_OTHR_TF_8_LEGACY;

    let MTC_TAXABLE = formConstants.TaxCategory.MTC_TAXABLE;
    let MTC_COMMON = formConstants.TaxCategory.MTC_COMMON;
    let MTC_NON_TAXABLE = formConstants.TaxCategory.MTC_NON_TAXABLE;

    let SALES = formConstants.Type.SALES;
    let PURCHASES = formConstants.Type.PURCHASES;

    return {
        deducform4box1a: {
            compute: (data) =>  {
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'1a',
                    value: (data[SALES][TC_3_LEGACY]) ? data[SALES][TC_3_LEGACY].netamount : 0});
            },
            triggers: [DEDUCFORM4BOX+'1x', DEDUCFORM3BOX+'1x']
        },
        deducform4box1b: {
            compute: (data) =>{
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'1b',
                    value: (data[SALES][TC_5_LEGACY]) ? data[SALES][TC_5_LEGACY].netamount : 0});
            },
            triggers: [DEDUCFORM4BOX+'1x']
        },
        deducform4box1c: {
            compute: (data) => {
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'1c',
                    value: (data[SALES][TC_8_LEGACY]) ? data[SALES][TC_8_LEGACY].netamount : 0});
            },
            triggers: [DEDUCFORM4BOX+'1x']
        },
        deducform4box1x: {
            compute: () => {
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM4BOX,
                    inputs: ['1a', '1b', '1c'], outputs: ['1x']});
            },
            triggers: [DEDUCFORM3BOX+'1x']
        },
        deducform4box4x: {
            compute: ()=> {
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'4x',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'4f'})});
            },
            triggers: [DEDUCFORM4BOX+'19a', DEDUCFORM4BOX+'19b',
                DEDUCFORM4BOX+'19c', DEDUCFORM4BOX+'20a', DEDUCFORM4BOX+'20b', DEDUCFORM4BOX+'20c']
        },
        deducform4box7x: {
            compute: () => {
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'7x',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'7f'})});
            },
            triggers: [DEDUCFORM4BOX+'19a', DEDUCFORM4BOX+'19b', DEDUCFORM4BOX+'19c',
                DEDUCFORM4BOX+'20a', DEDUCFORM4BOX+'20b', DEDUCFORM4BOX+'20c']
        },
        deducform4box8x: {
            compute: () => {
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'8x',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'8f'})});
            },
            triggers: [
                DEDUCFORM4BOX+'11c', DEDUCFORM4BOX+'16a', DEDUCFORM4BOX+'16b', DEDUCFORM4BOX+'16c',
                DEDUCFORM4BOX+'16x', DEDUCFORM4BOX+'17a', DEDUCFORM4BOX+'17b', DEDUCFORM4BOX+'17c',
                DEDUCFORM4BOX+'17x', DEDUCFORM4BOX+'18a', DEDUCFORM4BOX+'18b', DEDUCFORM4BOX+'18c',
                DEDUCFORM4BOX+'18x', DEDUCFORM4BOX+'19a', DEDUCFORM4BOX+'19b', DEDUCFORM4BOX+'19c',
                DEDUCFORM4BOX+'19x', DEDUCFORM4BOX+'20a', DEDUCFORM4BOX+'20b', DEDUCFORM4BOX+'20c',
                DEDUCFORM4BOX+'20x'
            ]
        },
        deducform4box9a: {
            compute: (data) =>  {
                let val9a = 0;
                util.each(data[PURCHASES], function(purchaseMTC) {
                    val9a += (purchaseMTC[TC_3_LEGACY]) ? purchaseMTC[TC_3_LEGACY].grsamount : 0
                });
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'9a', value: val9a});
            },
            triggers: [DEDUCFORM4BOX+'9x', DEDUCFORM4BOX+'10a']
        },
        deducform4box9b: {
            compute: (data) => {
                let val9b = 0;
                util.each(data[PURCHASES], (purchaseMTC) => {
                    val9b += (purchaseMTC[TC_5_LEGACY]) ? purchaseMTC[TC_5_LEGACY].grsamount : 0
                });
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'9b', value: val9b});
            },
            triggers: [DEDUCFORM4BOX+'9x', DEDUCFORM4BOX+'10b']
        },
        deducform4box9c: {
            compute: (data) => {
                let val9c = 0;
                util.each(data[PURCHASES], (purchaseMTC) => {
                    val9c += (purchaseMTC[TC_8_LEGACY]) ? purchaseMTC[TC_8_LEGACY].grsamount : 0
                });
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'9c', value: val9c});
            },
            triggers: [DEDUCFORM4BOX+'9x', DEDUCFORM4BOX+'10c']
        },
        deducform4box9x: {
            compute: () => {
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM4BOX,
                    inputs: ['9a', '9b', '9c'], outputs: ['9x']});
            },
            triggers: [DEDUCFORM3BOX+'9x']
        },
        deducform4box10a: {
            compute: () => {
                let val9a = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'9a'}));
                let newVal = Math.floor(val9a*3/103);
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'10a', value: newVal});
            },
            triggers: [DEDUCFORM4BOX+'10x', DEDUCFORM4BOX+'15a']
        },
        deducform4box10b: {
            compute: () => {
                let val9b = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'9b'}));
                let newVal = Math.floor(val9b*4/105);
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'10b', value: newVal});
            },
            triggers: [DEDUCFORM4BOX+'10x', DEDUCFORM4BOX+'15b']
        },
        deducform4box10c: {
            compute: () => {
                let val9c = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'9c'}));
                let newVal = Math.floor(val9c*6.3/108);
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'10c', value: newVal});
            },
            triggers: [DEDUCFORM4BOX+'10x', DEDUCFORM4BOX+'15c']
        },
        deducform4box10x: {
            compute: () => {
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM4BOX,
                    inputs: ['10a', '10b', '10c'], outputs: ['10x']});
            },
            triggers: [DEDUCFORM3BOX+'10x']
        },
        deducform4box11c: {
            compute: (data) => {
                let val11c = 0;
                util.each(data[PURCHASES], (purchaseMTC) => {
                    val11c += (purchaseMTC[TC_OTHR_STP_8_LEGACY]) ? purchaseMTC[TC_OTHR_STP_8_LEGACY].grsamount : 0
                });
                let val8x = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'8x'}));
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'11c', value: val8x < 95 ? val11c : 0});
            },
            triggers: [DEDUCFORM4BOX+'11x', DEDUCFORM4BOX+'12c']
        },
        deducform4box11x: {
            compute: () => {
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'11x',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'11c'})});
            },
            triggers: [DEDUCFORM3BOX+'11x']
        },
        deducform4box12a: {
            triggers: [DEDUCFORM4BOX+'15a']
        },
        deducform4box12b: {
            triggers: [DEDUCFORM4BOX+'15b']
        },
        deducform4box12c: {
            compute: () => {
                let val11c = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'11c'}));
                let newVal = Math.floor(val11c*6.3/100);
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'12c', value: newVal});
            },
            triggers: [DEDUCFORM4BOX+'12x', DEDUCFORM4BOX+'15c']
        },
        deducform4box12x: {
            compute: () => {
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'12x',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'12c'})});
            },
            triggers: [DEDUCFORM3BOX+'12x']
        },
        deducform4box13a: {
            triggers: [DEDUCFORM4BOX+'15a']
        },
        deducform4box13b: {
            triggers: [DEDUCFORM4BOX+'15b']
        },
        deducform4box13c: {
            compute: (data) => {
                let val13c = 0;
                util.each(data[PURCHASES], (purchaseMTC) => {
                    val13c += (purchaseMTC[TC_OTHR_TF_8_LEGACY]) ? purchaseMTC[TC_OTHR_TF_8_LEGACY].grsamount : 0
                });
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'13c', value: val13c});
            },
            triggers: [DEDUCFORM4BOX+'13x', DEDUCFORM4BOX+'15c']
        },
        deducform4box13x: {
            compute: ()=> {
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'13x',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'13c'})});
            },
            triggers: [DEDUCFORM3BOX+'13x']
        },
        deducform4box14a: {
            triggers: [DEDUCFORM4BOX+'14x', DEDUCFORM4BOX+'15a']
        },
        deducform4box14b: {
            triggers: [DEDUCFORM4BOX+'14x', DEDUCFORM4BOX+'15b']
        },
        deducform4box14c: {
            triggers: [DEDUCFORM4BOX+'14x', DEDUCFORM4BOX+'15c']
        },
        deducform4box14x: {
            compute: () => {
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM4BOX,
                    inputs: ['14a', '14b', '14c'], outputs: ['14x']});
            },
            triggers: [DEDUCFORM3BOX+'14x']
        },
        deducform4box15a: {
            compute: () => {
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM4BOX,
                    inputs: ['10a', '12a', '13a', '14a'], outputs: ['15a']});
            },
            triggers: [DEDUCFORM4BOX+'15x', DEDUCFORM4BOX+'16a', DEDUCFORM4BOX+'20a']
        },
        deducform4box15b: {
            compute: () => {
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM4BOX,
                    inputs: ['10b', '12b', '13b', '14b'], outputs: ['15b']});
            },
            triggers: [DEDUCFORM4BOX+'15x', DEDUCFORM4BOX+'16b', DEDUCFORM4BOX+'20b']
        },
        deducform4box15c: {
            compute: () => {
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM4BOX,
                    inputs: ['10c', '12c', '13c', '14c'], outputs: ['15c']});
            },
            triggers: [DEDUCFORM4BOX+'15x', DEDUCFORM4BOX+'16c', DEDUCFORM4BOX+'20c']
        },
        deducform4box15x: {
            compute: () => {
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM4BOX,
                    inputs: ['15a', '15b', '15c'], outputs: ['15x']});
            },
            triggers: [DEDUCFORM4BOX+'16x', DEDUCFORM3BOX+'15x']
        },
        deducform4box16a: {
            compute: () => {
                let valdeducform3_1f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'1f'}));
                let val8x = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'8x'}));
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'16a',
                    value: (valdeducform3_1f <= 500000000 && val8x >= 95) ?
                        domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'15a'}) : 0});
            },
            triggers: [DEDUCFORM4BOX+'23a', DEDUCFORM4BOX+'24a']
        },
        deducform4box16b: {
            compute: () => {
                let valdeducform3_1f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'1f'}));
                let val8x = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'8x'}));
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'16b',
                    value: (valdeducform3_1f <= 500000000 && val8x >= 95) ?
                        domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'15b'}) : 0});
            },
            triggers: [DEDUCFORM4BOX+'23b', DEDUCFORM4BOX+'24b']
        },
        deducform4box16c: {
            compute: () => {
                let valdeducform3_1f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'1f'}));
                let val8x = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'8x'}));
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'16c',
                    value: (valdeducform3_1f <= 500000000 && val8x >= 95) ?
                        domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'15c'}) : 0});
            },
            triggers: [DEDUCFORM4BOX+'23c', DEDUCFORM4BOX+'24c']
        },
        deducform4box16x: {
            compute: () =>  {
                let valdeducform3_1f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'1f'}));
                let val8x = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'8x'}));
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'16x',
                    value: (valdeducform3_1f <= 500000000 && val8x >= 95) ?
                        domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'15x'}) : 0});
            },
            triggers: [DEDUCFORM3BOX+'16x']
        },
        deducform4box17a: {
            compute: (data) => {
                let val8x = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'8x'}));
                let valdeducform3_1f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'1f'}));
                if ((valdeducform3_1f > 500000000 || val8x < 95) && data.calcMethod === ITEMIZED) {
                    domUtil.prototype.setValue({id: DEDUCFORM4BOX+'17a',
                        value: (data[PURCHASES][MTC_TAXABLE] && data[PURCHASES][MTC_TAXABLE][TC_3_LEGACY]) ?
                            data[PURCHASES][MTC_TAXABLE][TC_3_LEGACY].grsamount : 0});
                }
                else {
                    domUtil.prototype.setValue({id: DEDUCFORM4BOX+'17a', value: 0});
                }
            },
            triggers: [DEDUCFORM4BOX+'17x', DEDUCFORM4BOX+'19a']
        },
        deducform4box17b: {
            compute: (data) => {
                let val8x = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'8x'}));
                let valdeducform3_1f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'1f'}));
                if ((valdeducform3_1f > 500000000 || val8x < 95) && data.calcMethod === ITEMIZED) {
                    domUtil.prototype.setValue({id: DEDUCFORM4BOX+'17b',
                        value: (data[PURCHASES][MTC_TAXABLE] && data[PURCHASES][MTC_TAXABLE][TC_5_LEGACY]) ?
                            data[PURCHASES][MTC_TAXABLE][TC_5_LEGACY].grsamount : 0});
                }
                else {
                    domUtil.prototype.setValue({id: DEDUCFORM4BOX+'17b', value: 0});
                }
            },
            triggers: [DEDUCFORM4BOX+'17x', DEDUCFORM4BOX+'19b']
        },
        deducform4box17c: {
            compute: (data) => {
                let val8x = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'8x'}));
                let valdeducform3_1f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'1f'}));
                if ((valdeducform3_1f > 500000000 || val8x < 95) && data.calcMethod === ITEMIZED) {
                    domUtil.prototype.setValue({id: DEDUCFORM4BOX+'17c',
                        value: (data[PURCHASES][MTC_TAXABLE] && data[PURCHASES][MTC_TAXABLE][TC_8_LEGACY]) ?
                            data[PURCHASES][MTC_TAXABLE][TC_8_LEGACY].grsamount : 0});
                }
                else {
                    domUtil.prototype.setValue({id: DEDUCFORM4BOX+'17c', value: 0});
                }
            },
            triggers: [DEDUCFORM4BOX+'17x', DEDUCFORM4BOX+'19c']
        },
        deducform4box17x: {
            compute: () => {
                let sum = domUtil.prototype.sumInputElements({elemIds: [
                    DEDUCFORM4BOX+'17a',
                    DEDUCFORM4BOX+'17b',
                    DEDUCFORM4BOX+'17c'
                ]});
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'17x', value: sum});
            },
            triggers: [DEDUCFORM3BOX+'17x']
        },
        deducform4box18a: {
            compute: (data) => {
                let val8x = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'8x'}));
                let valdeducform3_1f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'1f'}));
                let amount1 = (data[PURCHASES][MTC_COMMON] && data[PURCHASES][MTC_COMMON][TC_3_LEGACY]) ?
                    data[PURCHASES][MTC_COMMON][TC_3_LEGACY].grsamount : 0;
                let amount2 = (data[PURCHASES][MTC_COMMON] && data[PURCHASES][MTC_NON_TAXABLE][TC_3_LEGACY]) ?
                    data[PURCHASES][MTC_NON_TAXABLE][TC_3_LEGACY].grsamount : 0;
                domUtil.prototype.setValue({
                    id: DEDUCFORM4BOX+'18a',
                    value: ((valdeducform3_1f > 500000000 || val8x < 95) && data.calcMethod === ITEMIZED) ?
                        amount1+amount2 : 0
                });
            },
            triggers: [DEDUCFORM4BOX+'18x', DEDUCFORM4BOX+'19a']
        },
        deducform4box18b: {
            compute: (data) => {
                let val8x = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'8x'}));
                let valdeducform3_1f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'1f'}));
                let amount1 = (data[PURCHASES][MTC_COMMON] && data[PURCHASES][MTC_COMMON][TC_5_LEGACY]) ?
                    data[PURCHASES][MTC_COMMON][TC_5_LEGACY].grsamount : 0;
                let amount2 = (data[PURCHASES][MTC_NON_TAXABLE] && data[PURCHASES][MTC_NON_TAXABLE][TC_5_LEGACY]) ?
                    data[PURCHASES][MTC_NON_TAXABLE][TC_5_LEGACY].grsamount : 0;
                domUtil.prototype.setValue({
                    id: DEDUCFORM4BOX+'18b',
                    value: ((valdeducform3_1f > 500000000 || val8x < 95) && data.calcMethod === ITEMIZED) ?
                        amount1+amount2 : 0
                });
            },
            triggers: [DEDUCFORM4BOX+'18x', DEDUCFORM4BOX+'19b']
        },
        deducform4box18c: {
            compute: (data) => {
                let val8x = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'8x'}));
                let valdeducform3_1f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'1f'}));
                let amount1 = (data[PURCHASES][MTC_COMMON] && data[PURCHASES][MTC_COMMON][TC_8_LEGACY]) ?
                    data[PURCHASES][MTC_COMMON][TC_8_LEGACY].grsamount : 0;
                let amount2 = (data[PURCHASES][MTC_NON_TAXABLE] && data[PURCHASES][MTC_NON_TAXABLE][TC_8_LEGACY]) ?
                    data[PURCHASES][MTC_NON_TAXABLE][TC_8_LEGACY].grsamount : 0;
                domUtil.prototype.setValue({
                    id: DEDUCFORM4BOX+'18c',
                    value: ((valdeducform3_1f > 500000000 || val8x < 95) && data.calcMethod === ITEMIZED) ? amount1+amount2 : 0
                });
            },
            triggers: [DEDUCFORM4BOX+'18x', DEDUCFORM4BOX+'19c']
        },
        deducform4box18x: {
            compute: () => {
                let sum = domUtil.prototype.sumInputElements({elemIds: [
                    DEDUCFORM4BOX+'18a',
                    DEDUCFORM4BOX+'18b',
                    DEDUCFORM4BOX+'18c'
                ]});
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'18x', value: sum});
            },
            triggers: [DEDUCFORM3BOX+'18x']
        },
        deducform4box19a: {
            compute: () => {
                let val17a = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'17a'}));
                let val18a = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'18a'}));
                let val4x = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'4x'}));
                let val7x = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'7x'}));
                let newVal = Math.floor(val17a+(val18a*val4x/val7x)) || 0;
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'19a', value: newVal});
            },
            triggers: [DEDUCFORM4BOX+'19x', DEDUCFORM4BOX+'23a', DEDUCFORM4BOX+'24a']
        },
        deducform4box19b: {
            compute: () => {
                let val17b = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'17b'}));
                let val18b = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'18b'}));
                let val4x = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'4x'}));
                let val7x = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'7x'}));
                let newVal = Math.floor(val17b+(val18b*val4x/val7x)) || 0;
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'19b', value: newVal});
            },
            triggers: [DEDUCFORM4BOX+'19x', DEDUCFORM4BOX+'23b', DEDUCFORM4BOX+'24b']
        },
        deducform4box19c: {
            compute: () => {
                let val17c = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'17c'}));
                let val18c = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'18c'}));
                let val4x = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'4x'}));
                let val7x = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'7x'}));
                let newVal = Math.floor(val17c+(val18c*val4x/val7x)) || 0;
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'19c', value: newVal});
            },
            triggers: [DEDUCFORM4BOX+'19x', DEDUCFORM4BOX+'23c', DEDUCFORM4BOX+'24c']
        },
        deducform4box19x: {
            compute: () => {
                let sum = domUtil.prototype.sumInputElements({elemIds: [
                    DEDUCFORM4BOX+'19a',
                    DEDUCFORM4BOX+'19b',
                    DEDUCFORM4BOX+'19c'
                ]});
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'19x', value: sum});
            },
            triggers: [DEDUCFORM3BOX+'19x']
        },
        deducform4box20a: {
            compute: (data) => {
                let valdeducform3_1f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'1f'}));
                let val8x = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'8x'}));
                let val15a = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'15a'}));
                let val4x = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'4x'}));
                let val7x = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'7x'}));
                let newVal = Math.floor(val15a*(val4x/val7x)) || 0;
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'20a',
                    value: ((valdeducform3_1f > 500000000 || val8x < 95) && data.calcMethod === PROPORTIONAL) ?
                        newVal : 0});
            },
            triggers: [DEDUCFORM4BOX+'20x', DEDUCFORM4BOX+'23a', DEDUCFORM4BOX+'24a']
        },
        deducform4box20b: {
            compute: (data) => {
                let valdeducform3_1f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'1f'}));
                let val8x = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'8x'}));
                let val15b = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'15b'}));
                let val4x = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'4x'}));
                let val7x = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'7x'}));
                let newVal = Math.floor(val15b*(val4x/val7x)) || 0;
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'20b',
                    value: ((valdeducform3_1f > 500000000 || val8x < 95) && data.calcMethod === PROPORTIONAL) ? newVal : 0});
            },
            triggers: [DEDUCFORM4BOX+'20x', DEDUCFORM4BOX+'23b', DEDUCFORM4BOX+'24b']
        },
        deducform4box20c: {
            compute: (data) => {
                let valdeducform3_1f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'1f'}));
                let val8x = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'8x'}));
                let val15c = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'15c'}));
                let val4x = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'4x'}));
                let val7x = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'7x'}));
                let newVal = Math.floor(val15c*(val4x/val7x)) || 0;
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'20c',
                    value: ((valdeducform3_1f > 500000000 || val8x < 95) && data.calcMethod === PROPORTIONAL) ? newVal : 0});
            },
            triggers: [DEDUCFORM4BOX+'20x', DEDUCFORM4BOX+'23c', DEDUCFORM4BOX+'24c']
        },
        deducform4box20x: {
            compute: (data)=>{
                let val8x = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'8x'}));
                let valdeducform3_1f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'1f'}));
                let sum = domUtil.prototype.sumInputElements({elemIds: [
                    DEDUCFORM4BOX+'20a',
                    DEDUCFORM4BOX+'20b',
                    DEDUCFORM4BOX+'20c'
                ]});
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'20x',
                    value: ((valdeducform3_1f > 500000000 || val8x < 95) && data.calcMethod === PROPORTIONAL) ? sum : 0});
            },
            triggers: [DEDUCFORM3BOX+'20x']
        },
        deducform4box21a: {
            triggers: [DEDUCFORM4BOX+'21x', DEDUCFORM4BOX+'23a', DEDUCFORM4BOX+'24a']
        },
        deducform4box21b: {
            triggers: [DEDUCFORM4BOX+'21x', DEDUCFORM4BOX+'23b', DEDUCFORM4BOX+'24b']
        },
        deducform4box21c: {
            triggers: [DEDUCFORM4BOX+'21x', DEDUCFORM4BOX+'23c', DEDUCFORM4BOX+'24c']
        },
        deducform4box21x: {
            compute: ()=>{
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM4BOX,
                    inputs: ['21a', '21b', '21c'], outputs: ['21x']});
            },
            triggers: [DEDUCFORM3BOX+'21x']
        },
        deducform4box22a: {
            triggers: [DEDUCFORM4BOX+'22x', DEDUCFORM4BOX+'23a', DEDUCFORM4BOX+'24a']
        },
        deducform4box22b: {
            triggers: [DEDUCFORM4BOX+'22x', DEDUCFORM4BOX+'23b', DEDUCFORM4BOX+'24b']
        },
        deducform4box22c: {
            triggers: [DEDUCFORM4BOX+'22x', DEDUCFORM4BOX+'23c', DEDUCFORM4BOX+'24c']
        },
        deducform4box22x: {
            compute: ()=>{
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM4BOX,
                    inputs: ['22a', '22b', '22c'], outputs: ['22x']});
            },
            triggers: [DEDUCFORM3BOX+'22x']
        },
        deducform4box23a: {
            compute: () => {
                let sum = domUtil.prototype.sumInputElements({elemIds: [
                    DEDUCFORM4BOX+'16a',
                    DEDUCFORM4BOX+'19a',
                    DEDUCFORM4BOX+'20a',
                    DEDUCFORM4BOX+'21a',
                    DEDUCFORM4BOX+'22a'
                ]});
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'23a', value: (sum > 0) ? sum : 0});
            },
            triggers: [DEDUCFORM2BOX+'4a', DEDUCFORM4BOX+'23x']
        },
        deducform4box23b: {
            compute: () => {
                let sum = domUtil.prototype.sumInputElements({elemIds: [
                    DEDUCFORM4BOX+'16b',
                    DEDUCFORM4BOX+'19b',
                    DEDUCFORM4BOX+'20b',
                    DEDUCFORM4BOX+'21b',
                    DEDUCFORM4BOX+'22b'
                ]});
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'23b', value: (sum > 0) ? sum : 0});
            },
            triggers: [DEDUCFORM2BOX+'4b', DEDUCFORM4BOX+'23x']
        },
        deducform4box23c: {
            compute: () => {
                let sum = domUtil.prototype.sumInputElements({elemIds: [
                    DEDUCFORM4BOX+'16c',
                    DEDUCFORM4BOX+'19c',
                    DEDUCFORM4BOX+'20c',
                    DEDUCFORM4BOX+'21c',
                    DEDUCFORM4BOX+'22c'
                ]});
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'23c', value: (sum > 0) ? sum : 0});
            },
            triggers: [DEDUCFORM2BOX+'4c', DEDUCFORM4BOX+'23x']
        },
        deducform4box23x: {
            compute: () => {
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM4BOX,
                    inputs: ['23a', '23b', '23c'], outputs: ['23x']});
            },
            triggers: [DEDUCFORM3BOX+'23x']
        },
        deducform4box24a: {
            compute: () => {
                let sum = domUtil.prototype.sumInputElements({elemIds: [
                    DEDUCFORM4BOX+'16a',
                    DEDUCFORM4BOX+'19a',
                    DEDUCFORM4BOX+'20a',
                    DEDUCFORM4BOX+'21a',
                    DEDUCFORM4BOX+'22a'
                ]});
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'24a', value: (sum < 0) ? sum : 0});
            },
            triggers: [DEDUCFORM2BOX+'3a', DEDUCFORM4BOX+'24x']
        },
        deducform4box24b: {
            compute: () => {
                let sum = domUtil.prototype.sumInputElements({elemIds: [
                    DEDUCFORM4BOX+'16b',
                    DEDUCFORM4BOX+'19b',
                    DEDUCFORM4BOX+'20b',
                    DEDUCFORM4BOX+'21b',
                    DEDUCFORM4BOX+'22b'
                ]});
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'24b', value: (sum < 0) ? sum : 0});
            },
            triggers: [DEDUCFORM2BOX+'3b', DEDUCFORM4BOX+'24x']
        },
        deducform4box24c: {
            compute: () => {
                let sum = domUtil.prototype.sumInputElements({elemIds: [
                    DEDUCFORM4BOX+'16c',
                    DEDUCFORM4BOX+'19c',
                    DEDUCFORM4BOX+'20c',
                    DEDUCFORM4BOX+'21c',
                    DEDUCFORM4BOX+'22c'
                ]});
                domUtil.prototype.setValue({id: DEDUCFORM4BOX+'24c', value: (sum < 0) ? sum : 0});
            },
            triggers: [DEDUCFORM2BOX+'3c', DEDUCFORM4BOX+'24x']
        },
        deducform4box24x: {
            compute: () => {
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM4BOX,
                    inputs: ['24a', '24b', '24c'], outputs: ['24x']});
            },
            triggers: [DEDUCFORM3BOX+'24x']
        },
        deducform4box25a: {
            triggers: [DEDUCFORM2BOX+'3a', DEDUCFORM4BOX+'25x']
        },
        deducform4box25b: {
            triggers: [DEDUCFORM2BOX+'3b', DEDUCFORM4BOX+'25x']
        },
        deducform4box25c: {
            triggers: [DEDUCFORM2BOX+'3c', DEDUCFORM4BOX+'25x']
        },
        deducform4box25x: {
            compute: ()=>{
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM4BOX,
                    inputs: ['25a', '25b', '25c'], outputs: ['25x']});
            },
            triggers: [DEDUCFORM3BOX+'25x']
        }
    };

});
