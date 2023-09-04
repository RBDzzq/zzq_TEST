/**
 *    Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define(['./JP_TaxFormjQueryWrapper', './JP_DeductibleTaxFormConstants'],

 (domUtil, formConstants) => {

    const DEDUCFORM3BOX = formConstants.Form.DEDUCFORM3BOX;
    const DEDUCFORM4BOX = formConstants.Form.DEDUCFORM4BOX;
    const DEDUCFORM2BOX = formConstants.Form.DEDUCFORM2BOX;
    const DEDUCFORM1BOX = formConstants.Form.DEDUCFORM1BOX;
    const TAXFORM2SEC3BOX = formConstants.Form.TAXFORM2SEC3BOX;

    const TC_3_LEGACY = formConstants.TaxClassification.TC_3_LEGACY;
    const TC_5_LEGACY = formConstants.TaxClassification.TC_5_LEGACY;
    const TC_8_LEGACY = formConstants.TaxClassification.TC_8_LEGACY;
    const TC_OTHR_STP_8_LEGACY = formConstants.TaxClassification.TC_OTHR_STP_8_LEGACY;

    const SALES = formConstants.Type.SALES;
    const PURCHASES = formConstants.Type.PURCHASES;

    return {
        deducform2box1a: {
            compute: () => {
                let val = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'1_1a'}));
                let newVal = Math.floor(val/1000)*1000;
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'1a', value: newVal});
            },
            triggers: [DEDUCFORM2BOX+'1x', DEDUCFORM2BOX+'2a']
        },
        deducform2box1b: {
            compute: ()=> {
                let val = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'1_1b'}));
                let newVal = Math.floor(val/1000)*1000;
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'1b', value: newVal});
            },
            triggers: [DEDUCFORM2BOX+'1x', DEDUCFORM2BOX+'2b']
        },
        deducform2box1c: {
            compute: ()=> {
                let val1_1c = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'1_1c'}));
                let val1_2c = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'1_2c'}));
                let newVal = Math.floor((val1_1c+val1_2c)/1000)*1000;
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'1c', value: newVal});
            },
            triggers: [DEDUCFORM2BOX+'1x', DEDUCFORM2BOX+'2c']
        },
        deducform2box1x: {
            compute: ()=> {
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM2BOX,
                    inputs: ['1a', '1b', '1c'], outputs: ['1x']});
            },
            triggers: [DEDUCFORM1BOX+'1x']
        },
        deducform2box1_1a: {
            compute: (data)=> {
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'1_1a',
                    value: (data[SALES][TC_3_LEGACY]) ? data[SALES][TC_3_LEGACY].netamount : 0});
            },
            triggers: [DEDUCFORM2BOX+'1a', DEDUCFORM2BOX+'1_1x', TAXFORM2SEC3BOX+'2amount']
        },
        deducform2box1_1b: {
            compute: (data)=> {
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'1_1b',
                    value: (data[SALES][TC_5_LEGACY]) ? data[SALES][TC_5_LEGACY].netamount : 0});
            },
            triggers: [DEDUCFORM2BOX+'1b', DEDUCFORM2BOX+'1_1x', TAXFORM2SEC3BOX+'3amount']
        },
        deducform2box1_1c: {
            compute: (data) => {
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'1_1c',
                    value: (data[SALES][TC_8_LEGACY]) ? data[SALES][TC_8_LEGACY].netamount : 0});
            },
            triggers: [DEDUCFORM2BOX+'1c', DEDUCFORM2BOX+'1_1x', TAXFORM2SEC3BOX+'4amount']
        },
        deducform2box1_1x: {
            compute: () => {
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM2BOX,
                    inputs: ['1_1a', '1_1b', '1_1c'], outputs: ['1_1x']});
            },
            triggers: [DEDUCFORM1BOX+'1_1x']
        },
        deducform2box1_2c: {
            compute: (data) => {
                let valdeducform3_8f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'8f'}));
                let val1_2c = 0;
                if (valdeducform3_8f < 95) {
                    util.each(data[PURCHASES], (purchaseMTC) => {
                        val1_2c += (purchaseMTC[TC_OTHR_STP_8_LEGACY]) ? purchaseMTC[TC_OTHR_STP_8_LEGACY].netamount : 0
                    });
                }
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'1_2c', value: val1_2c});
            },
            triggers: [DEDUCFORM2BOX+'1c', DEDUCFORM2BOX+'1_2x', TAXFORM2SEC3BOX+'8amount']
        },
        deducform2box1_2x: {
            compute: () => {
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'1_2x',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'1_2c'})});
            },
            triggers: [DEDUCFORM1BOX+'1_2x']
        },
        deducform2box2a: {
            compute: () => {
                let val1a = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'1a'}));
                let newVal = Math.floor(val1a*3/100);
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'2a', value: newVal});
            },
            triggers: [DEDUCFORM2BOX+'2x', DEDUCFORM2BOX+'8a', DEDUCFORM2BOX+'9a', TAXFORM2SEC3BOX+'12amount']
        },
        deducform2box2b: {
            compute: () => {
                let val1b = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'1b'}));
                let newVal = Math.floor(val1b*4/100);
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'2b', value: newVal});
            },
            triggers: [DEDUCFORM2BOX+'2x', DEDUCFORM2BOX+'8b', DEDUCFORM2BOX+'9b', TAXFORM2SEC3BOX+'13amount']
        },
        deducform2box2c: {
            compute: () => {
                let val1c = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'1c'}));
                let newVal = Math.floor(val1c*6.3/100);
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'2c', value: newVal});
            },
            triggers: [DEDUCFORM2BOX+'2x', DEDUCFORM2BOX+'8c', DEDUCFORM2BOX+'9c', TAXFORM2SEC3BOX+'14amount']
        },
        deducform2box2x: {
            compute: () => {
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM2BOX, inputs: ['2a', '2b', '2c'], outputs: ['2x']});
            },
            triggers: [DEDUCFORM1BOX+'2x']
        },
        deducform2box3a: {
            compute: () => {
                let valdeducform4_24a = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'24a'}));
                let valdeducform4_25a = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'25a'}));
                let newVal = valdeducform4_24a + valdeducform4_25a;
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'3a', value: newVal});
            },
            triggers: [DEDUCFORM2BOX+'3x', DEDUCFORM2BOX+'8a', DEDUCFORM2BOX+'9a']
        },
        deducform2box3b: {
            compute: () => {
                let valdeducform4_24b = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'24b'}));
                let valdeducform4_25b = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'25b'}));
                let newVal = valdeducform4_24b + valdeducform4_25b;
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'3b', value: newVal});
            },
            triggers: [DEDUCFORM2BOX+'3x', DEDUCFORM2BOX+'8b', DEDUCFORM2BOX+'9b']
        },
        deducform2box3c: {
            compute: () => {
                let valdeducform4_24c = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'24c'}));
                let valdeducform4_25c = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'25c'}));
                let newVal = valdeducform4_24c + valdeducform4_25c;
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'3c', value: newVal});
            },
            triggers: [DEDUCFORM2BOX+'3x', DEDUCFORM2BOX+'8c', DEDUCFORM2BOX+'9c']
        },
        deducform2box3x: {
            compute: () => {
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM2BOX,
                    inputs: ['3a', '3b', '3c'], outputs: ['3x']});
            },
            triggers: [DEDUCFORM1BOX+'3x']
        },
        deducform2box4a: {
            compute: () => {
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'4a',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'23a'})});
            },
            triggers: [DEDUCFORM2BOX+'4x', DEDUCFORM2BOX+'7a']
        },
        deducform2box4b: {
            compute: () => {
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'4b',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'23b'})});
            },
            triggers: [DEDUCFORM2BOX+'4x', DEDUCFORM2BOX+'7b']
        },
        deducform2box4c: {
            compute: () => {
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'4c',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'23c'})});
            },
            triggers: [DEDUCFORM2BOX+'4x', DEDUCFORM2BOX+'7c']
        },
        deducform2box4x: {
            compute: () => {
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM2BOX,
                    inputs: ['4a', '4b', '4c'], outputs: ['4x']});
            },
            triggers: [DEDUCFORM1BOX+'4x']
        },
        deducform2box5a: {
            compute: () => {
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'5a',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'5_1a'})});
            },
            triggers: [DEDUCFORM2BOX+'5x', DEDUCFORM2BOX+'7a']
        },
        deducform2box5b: {
            compute: () => {
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'5b',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'5_1b'})});
            },
            triggers: [DEDUCFORM2BOX+'5x', DEDUCFORM2BOX+'7b']
        },
        deducform2box5c: {
            compute: () => {
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM2BOX,
                    inputs: ['5_1c', '5_2c'], outputs: ['5c']});
            },
            triggers: [DEDUCFORM2BOX+'5x', DEDUCFORM2BOX+'7c']
        },
        deducform2box5x: {
            compute: () => {
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM2BOX,
                    inputs: ['5a', '5b', '5c'], outputs: ['5x']});
            },
            triggers: [DEDUCFORM1BOX+'5x']
        },
        deducform2box5_1a: {
            compute: (data) => {
                // Change to zero due to removal of refund amounts
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'5_1a', value: 0});
            },
            triggers: [DEDUCFORM2BOX+'5a', DEDUCFORM2BOX+'5_1x']
        },
        deducform2box5_1b: {
            compute: (data) => {
                // Change to zero due to removal of refund amounts
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'5_1b', value: 0});
            },
            triggers: [DEDUCFORM2BOX+'5b', DEDUCFORM2BOX+'5_1x']
        },
        deducform2box5_1c: {
            compute: (data) => {
                // Change to zero due to removal of refund amounts
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'5_1c', value: 0});
            },
            triggers: [DEDUCFORM2BOX+'5c', DEDUCFORM2BOX+'5_1x']
        },
        deducform2box5_1x: {
            compute: () => {
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM2BOX,
                    inputs: ['5_1a', '5_1b', '5_1c'], outputs: ['5_1x']});
            },
            triggers: [DEDUCFORM1BOX+'5_1x']
        },
        deducform2box5_2c: {
            compute: (data) => {
                // Change to zero due to removal of refund amounts
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'5_2c', value: 0});
            },
            triggers: [DEDUCFORM2BOX+'5_2x', DEDUCFORM2BOX+'5c']
        },
        deducform2box5_2x: {
            compute: () => {
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'5_2x',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'5_2c'})});
            },
            triggers: [DEDUCFORM1BOX+'5_2x']
        },
        deducform2box6a: {
            triggers: [DEDUCFORM2BOX+'6x', DEDUCFORM2BOX+'7a']
        },
        deducform2box6b: {
            triggers: [DEDUCFORM2BOX+'6x', DEDUCFORM2BOX+'7b']
        },
        deducform2box6c: {
            triggers: [DEDUCFORM2BOX+'6x', DEDUCFORM2BOX+'7c']
        },
        deducform2box6x: {
            compute: () => {
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM2BOX,
                    inputs: ['6a', '6b', '6c'], outputs: ['6x']});
            },
            triggers: [DEDUCFORM1BOX+'6x']
        },
        deducform2box7a: {
            compute: () => {
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM2BOX,
                    inputs: ['4a', '5a', '6a'], outputs: ['7a']});
            },
            triggers: [DEDUCFORM2BOX+'7x', DEDUCFORM2BOX+'8a', DEDUCFORM2BOX+'9a']
        },
        deducform2box7b: {
            compute: () => {
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM2BOX,
                    inputs: ['4b', '5b', '6b'], outputs: ['7b']});
            },
            triggers: [DEDUCFORM2BOX+'7x', DEDUCFORM2BOX+'8b', DEDUCFORM2BOX+'9b']
        },
        deducform2box7c: {
            compute: () => {
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM2BOX,
                    inputs: ['4c', '5c', '6c'], outputs: ['7c']});
            },
            triggers: [DEDUCFORM2BOX+'7x', DEDUCFORM2BOX+'8c', DEDUCFORM2BOX+'9c']
        },
        deducform2box7x: {
            compute: () => {
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM2BOX,
                    inputs: ['7a', '7b', '7c'], outputs: ['7x']});
            },
            triggers: [DEDUCFORM1BOX+'7x']
        },
        deducform2box8a: {
            compute: () => {
                let difference = domUtil.prototype.subtractInputElements({elemIds: [DEDUCFORM2BOX+'7a',
                        DEDUCFORM2BOX+'2a', DEDUCFORM2BOX+'3a']});
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'8a',
                    value: (difference > 0) ? difference : 0});
            },
            triggers: [DEDUCFORM2BOX+'8x']
        },
        deducform2box8b: {
            compute: () => {
                let difference = domUtil.prototype.subtractInputElements({elemIds: [DEDUCFORM2BOX+'7b',
                        DEDUCFORM2BOX+'2b', DEDUCFORM2BOX+'3b']});
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'8b', value: (difference > 0) ? difference : 0});
            },
            triggers: [DEDUCFORM2BOX+'8x', DEDUCFORM2BOX+'11b']
        },
        deducform2box8c: {
            compute: () => {
                let difference = domUtil.prototype.subtractInputElements({elemIds: [DEDUCFORM2BOX+'7c',
                        DEDUCFORM2BOX+'2c', DEDUCFORM2BOX+'3c']});
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'8c', value: (difference > 0) ? difference : 0});
            },
            triggers: [DEDUCFORM2BOX+'8x', DEDUCFORM2BOX+'11c']
        },
        deducform2box8x: {
            compute: () => {
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM2BOX,
                    inputs: ['8a', '8b', '8c'], outputs: ['8x']});
            },
            triggers: [DEDUCFORM1BOX+'8x']
        },
        deducform2box9a: {
            compute: () => {
                let val2a = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'2a'}));
                let val3a = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'3a'}));
                let val7a = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'7a'}));
                let newVal = val2a+val3a-val7a;
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'9a', value: (newVal > 0) ? newVal : 0});
            },
            triggers: [DEDUCFORM2BOX+'9x']
        },
        deducform2box9b: {
            compute: () => {
                let val2b = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'2b'}));
                let val3b = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'3b'}));
                let val7b = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'7b'}));
                let newVal = val2b+val3b-val7b;
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'9b', value: (newVal > 0) ? newVal : 0});
            },
            triggers: [DEDUCFORM2BOX+'9x', DEDUCFORM2BOX+'12b']
        },
        deducform2box9c: {
            compute: () => {
                let val2c = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'2c'}));
                let val3c = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'3c'}));
                let val7c = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'7c'}));
                let newVal = val2c+val3c-val7c;
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'9c', value: (newVal > 0) ? newVal : 0});
            },
            triggers: [DEDUCFORM2BOX+'9x', DEDUCFORM2BOX+'12c']
        },
        deducform2box9x: {
            compute: () => {
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM2BOX,
                    inputs: ['9a', '9b', '9c'], outputs: ['9x']});
            },
            triggers: [DEDUCFORM1BOX+'9x']
        },
        deducform2box11b: {
            compute: () => {
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'11b',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'8b'})});
            },
            triggers: [DEDUCFORM2BOX+'11x', DEDUCFORM2BOX+'13b', DEDUCFORM2BOX+'14b']
        },
        deducform2box11c: {
            compute: () => {
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'11c',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'8c'})});
            },
            triggers: [DEDUCFORM2BOX+'11x', DEDUCFORM2BOX+'13c', DEDUCFORM2BOX+'14c']
        },
        deducform2box11x: {
            compute: () => {
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM2BOX,
                    inputs: ['11b', '11c'], outputs: ['11x']});
            },
            triggers: [DEDUCFORM1BOX+'11x']
        },
        deducform2box12b: {
            compute: () => {
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'12b',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'9b'})});
            },
            triggers: [DEDUCFORM2BOX+'12x', DEDUCFORM2BOX+'13b', DEDUCFORM2BOX+'15b']
        },
        deducform2box12c: {
            compute: () => {
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'12c',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'9c'})});
            },
            triggers: [DEDUCFORM2BOX+'12x', DEDUCFORM2BOX+'13c', DEDUCFORM2BOX+'15c']
        },
        deducform2box12x: {
            compute: () => {
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM2BOX,
                    inputs: ['12b', '12c'], outputs: ['12x']});
            },
            triggers: [DEDUCFORM1BOX+'12x']
        },
        deducform2box13b: {
            compute: () => {
                domUtil.prototype.subtractElementsAndSetValues({prefix: DEDUCFORM2BOX,
                    inputs: ['12b', '11b'], outputs: ['13b']});
            },
            triggers: [DEDUCFORM2BOX+'13x', TAXFORM2SEC3BOX+'21amount']
        },
        deducform2box13c: {
            compute: () => {
                domUtil.prototype.subtractElementsAndSetValues({prefix: DEDUCFORM2BOX,
                    inputs: ['12c', '11c'], outputs: ['13c']});
            },
            triggers: [DEDUCFORM2BOX+'13x', TAXFORM2SEC3BOX+'22amount']
        },
        deducform2box13x: {
            compute: () => {
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM2BOX,
                    inputs: ['13b', '13c'], outputs: ['13x']});
            },
            triggers: [DEDUCFORM1BOX+'13x']
        },
        deducform2box14b: {
            compute: () => {
                let val11b = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'11b'}));
                let newVal = Math.floor(val11b*25/100);
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'14b', value: newVal});
            },
            triggers: [DEDUCFORM2BOX+'14x']
        },
        deducform2box14c: {
            compute: () => {
                let val11c = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'11c'}));
                let newVal = Math.floor(val11c*17/63);
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'14c', value: newVal});
            },
            triggers: [DEDUCFORM2BOX+'14x']
        },
        deducform2box14x: {
            compute: () => {
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM2BOX,
                    inputs: ['14b', '14c'], outputs: ['14x']});
            },
            triggers: [DEDUCFORM1BOX+'14x']
        },
        deducform2box15b: {
            compute: () => {
                let val12b = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'12b'}));
                let newVal = Math.floor(val12b*25/100);
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'15b', value: newVal});
            },
            triggers: [DEDUCFORM2BOX+'15x']
        },
        deducform2box15c: {
            compute: () => {
                let val12c = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'12c'}));
                let newVal = Math.floor(val12c*17/63);
                domUtil.prototype.setValue({id: DEDUCFORM2BOX+'15c', value: newVal});
            },
            triggers: [DEDUCFORM2BOX+'15x']
        },
        deducform2box15x: {
            compute: () => {
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM2BOX,
                    inputs: ['15b', '15c'], outputs: ['15x']});
            },
            triggers: [DEDUCFORM1BOX+'15x']
        }
    };

});
