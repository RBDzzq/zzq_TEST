/**
 *    Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define(['./JP_TaxFormjQueryWrapper', './JP_DeductibleTaxFormConstants'],

 (domUtil, formConstants) =>{

    const DEDUCFORM3BOX = formConstants.Form.DEDUCFORM3BOX;
    const DEDUCFORM2BOX = formConstants.Form.DEDUCFORM2BOX;
    const DEDUCFORM1BOX = formConstants.Form.DEDUCFORM1BOX;
    const TAXFORM1SEC3BOX = formConstants.Form.TAXFORM1SEC3BOX;
    const TAXFORM2SEC3BOX = formConstants.Form.TAXFORM2SEC3BOX;

    const TC_8_REDUCED = formConstants.TaxClassification.TC_8_REDUCED;
    const TC_10_STANDARD = formConstants.TaxClassification.TC_10_STANDARD;
    const TC_OTHR_STP_10 = formConstants.TaxClassification.TC_OTHR_STP_10;

    const SALES = formConstants.Type.SALES;
    const PURCHASES = formConstants.Type.PURCHASES;

    return {
        deducform1box1x: {
            compute: () =>{
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'1x',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'1x'})});
            },
            triggers: [DEDUCFORM1BOX+'1f']
        },
        deducform1box1d: {
            compute: () =>{
                const val1_1d = domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'1_1d'});
                const newVal = Math.floor(val1_1d/1000)*1000;
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'1d', value: newVal});
            },
            triggers: [DEDUCFORM1BOX+'1f', DEDUCFORM1BOX+'2d']
        },
        deducform1box1e: {
            compute: () =>{
                const val1_1e = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'1_1e'}));
                const val1_2e = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'1_2e'}));
                const newVal = Math.floor((val1_1e+val1_2e)/1000)*1000;
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'1e', value: newVal});
            },
            triggers: [DEDUCFORM1BOX+'1f', DEDUCFORM1BOX+'2e']
        },
        deducform1box1f: {
            compute: () =>{
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM1BOX,
                    inputs: ['1x', '1d', '1e'], outputs: ['1f']});
            },
            triggers: [TAXFORM1SEC3BOX+'1amount',TAXFORM2SEC3BOX+'1amount']
        },
        deducform1box1_1x: {
            compute: () =>{
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'1_1x',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'1_1x'})});
            },
            triggers: [DEDUCFORM1BOX+'1_1f']
        },
        deducform1box1_1d: {
            compute: (data) =>{
                const val = (data[SALES][TC_8_REDUCED]) ? parseFloat(data[SALES][TC_8_REDUCED].netamount) : 0;
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'1_1d', value: val});
            },
            triggers: [DEDUCFORM1BOX+'1d', DEDUCFORM1BOX+'1_1f',TAXFORM2SEC3BOX+'5amount']
        },
        deducform1box1_1e: {
            compute: (data) =>{
                const val = (data[SALES][TC_10_STANDARD]) ? parseFloat(data[SALES][TC_10_STANDARD].netamount) : 0;
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'1_1e', value: val});
            },
            triggers: [DEDUCFORM1BOX+'1e', DEDUCFORM1BOX+'1_1f',TAXFORM2SEC3BOX+'6amount']
        },
        deducform1box1_1f: {
            compute: () =>{
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM1BOX,
                    inputs: ['1_1x', '1_1d', '1_1e'], outputs: ['1_1f']});
            },
            triggers: [TAXFORM2SEC3BOX+'7amount']
        },
        deducform1box1_2x: {
            compute: () =>{
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'1_2x',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'1_2x'})});
            },
            triggers: [DEDUCFORM1BOX+'1_2f']
        },
        deducform1box1_2e: {
            compute: (data) =>{
                const valdeducform3_8f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'8f'}));
                let val1_2e = 0;
                if (valdeducform3_8f < 95) {
                    util.each(data[PURCHASES], (purchaseMTC) => {
                        val1_2e += (purchaseMTC[TC_OTHR_STP_10]) ? purchaseMTC[TC_OTHR_STP_10].netamount : 0
                    });
                }
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'1_2e', value: val1_2e});
            },
            triggers: [DEDUCFORM1BOX+'1e', DEDUCFORM1BOX+'1_2f',TAXFORM2SEC3BOX+'9amount']
        },
        deducform1box1_2f: {
            compute: () =>{
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM1BOX,
                    inputs: ['1_2x', '1_2e'], outputs: ['1_2f']});
            },
            triggers: [TAXFORM2SEC3BOX+'10amount']
        },
        deducform1box2x: {
            compute: () =>{
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'2x',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'2x'})});
            },
            triggers: [DEDUCFORM1BOX+'2f']
        },
        deducform1box2d: {
            compute: () =>{
                const val1d = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'1d'}));
                const newVal = Math.floor(val1d*6.24/100);
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'2d', value: newVal});
            },
            triggers: [DEDUCFORM1BOX+'2f', DEDUCFORM1BOX+'8d', DEDUCFORM1BOX+'9d', TAXFORM2SEC3BOX+'15amount']
        },
        deducform1box2e: {
            compute: () =>{
                let val1e = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'1e'}));
                let newVal = Math.floor(val1e*7.8/100);
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'2e', value: newVal});
            },
            triggers: [DEDUCFORM1BOX+'2f', DEDUCFORM1BOX+'8e', DEDUCFORM1BOX+'9e', TAXFORM2SEC3BOX+'16amount']
        },
        deducform1box2f: {
            compute: () =>{
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM1BOX,
                    inputs: ['2x', '2d', '2e'], outputs: ['2f']});
            },
            triggers: [TAXFORM1SEC3BOX+'2amount', TAXFORM2SEC3BOX+'11amount']
        },
        deducform1box3x: {
            compute: () =>{
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'3x',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'3x'})});
            },
            triggers: [DEDUCFORM1BOX+'3f']
        },
        deducform1box3d: {
            compute: () =>{
                const sum = domUtil.prototype.sumInputElements({elemIds: [DEDUCFORM3BOX+'24d',
                        DEDUCFORM3BOX+'25d']});
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'3d', value: sum});
            },
            triggers: [DEDUCFORM1BOX+'3f', DEDUCFORM1BOX+'8d', DEDUCFORM1BOX+'9d']
        },
        deducform1box3e: {
            compute: () =>{
                const sum = domUtil.prototype.sumInputElements({elemIds: [DEDUCFORM3BOX+'24e',
                        DEDUCFORM3BOX+'25e']});
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'3e', value: sum});
            },
            triggers: [DEDUCFORM1BOX+'3f', DEDUCFORM1BOX+'8e', DEDUCFORM1BOX+'9e']
        },
        deducform1box3f: {
            compute: () =>{
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM1BOX,
                    inputs: ['3x', '3d', '3e'], outputs: ['3f']});
            },
            triggers: [TAXFORM1SEC3BOX+'3amount']
        },
        deducform1box4x: {
            compute: () =>{
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'4x',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'4x'})});
            },
            triggers: [DEDUCFORM1BOX+'4f']
        },
        deducform1box4d: {
            compute: () =>{
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'4d',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'23d'})});
            },
            triggers: [DEDUCFORM1BOX+'4f', DEDUCFORM1BOX+'7d']
        },
        deducform1box4e: {
            compute: () =>{
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'4e',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'23e'})});
            },
            triggers: [DEDUCFORM1BOX+'4f', DEDUCFORM1BOX+'7e']
        },
        deducform1box4f: {
            compute: () =>{
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM1BOX,
                    inputs: ['4x', '4d', '4e'], outputs: ['4f']});
            },
            triggers: [TAXFORM1SEC3BOX+'4amount']
        },
        deducform1box5x: {
            compute: () =>{
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'5x',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'5x'})});
            },
            triggers: [DEDUCFORM1BOX+'5f']
        },
        deducform1box5d: {
            compute: () =>{
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'5d',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'5_1d'})});
            },
            triggers: [DEDUCFORM1BOX+'5f', DEDUCFORM1BOX+'7d']
        },
        deducform1box5e: {
            compute: () =>{
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM1BOX,
                    inputs: ['5_1e', '5_2e'], outputs: ['5e']});
            },
            triggers: [DEDUCFORM1BOX+'5f', DEDUCFORM1BOX+'7e']
        },
        deducform1box5f: {
            compute: () =>{
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM1BOX, inputs: ['5x', '5d', '5e'], outputs: ['5f']});
            },
            triggers: [TAXFORM2SEC3BOX+'17amount']
        },
        deducform1box5_1x: {
            compute: () =>{
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'5_1x', value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'5_1x'})});
            },
            triggers: [DEDUCFORM1BOX+'5_1f']
        },
        deducform1box5_1d: {
            compute: (data) =>{
                // Change to zero due to removal of refund amounts
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'5_1d', value: 0});
            },
            triggers: [DEDUCFORM1BOX+'5_1f', DEDUCFORM1BOX+'5d']
        },
        deducform1box5_1e: {
            compute: (data) =>{
                // Change to zero due to removal of refund amounts
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'5_1e', value: 0});
            },
            triggers: [DEDUCFORM1BOX+'5_1f', DEDUCFORM1BOX+'5e']
        },
        deducform1box5_1f: {
            compute: () =>{
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM1BOX, inputs: ['5_1x', '5_1d', '5_1e'], outputs: ['5_1f']});
            },
            triggers: [TAXFORM2SEC3BOX+'18amount']
        },
        deducform1box5_2x: {
            compute: () =>{
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'5_2x', value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'5_2x'})});
            },
            triggers: [DEDUCFORM1BOX+'5_2f']
        },
        deducform1box5_2e: {
            compute: (data) =>{
                // Change to zero due to removal of refund amounts
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'5_2e', value: 0});
            },
            triggers: [DEDUCFORM1BOX+'5_2f', DEDUCFORM1BOX+'5e']
        },
        deducform1box5_2f: {
            compute: () =>{
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM1BOX, inputs: ['5_2x', '5_2e'], outputs: ['5_2f']});
            },
            triggers: [TAXFORM2SEC3BOX+'19amount']
        },
        deducform1box6x: {
            compute: () =>{
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'6x', value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'6x'})});
            },
            triggers: [DEDUCFORM1BOX+'6f']
        },
        deducform1box6d: {
            triggers: [DEDUCFORM1BOX+'6f', DEDUCFORM1BOX+'7d']
        },
        deducform1box6e: {
            triggers: [DEDUCFORM1BOX+'6f', DEDUCFORM1BOX+'7e']
        },
        deducform1box6f: {
            compute: () =>{
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM1BOX, inputs: ['6x', '6d', '6e'], outputs: ['6f']});
            },
            triggers: [TAXFORM1SEC3BOX+'6amount']
        },
        deducform1box7x: {
            compute: () =>{
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'7x', value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'7x'})});
            },
            triggers: [DEDUCFORM1BOX+'7f']
        },
        deducform1box7d: {
            compute: () =>{
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM1BOX, inputs: ['4d', '5d', '6d'], outputs: ['7d']});
            },
            triggers: [DEDUCFORM1BOX+'7f', DEDUCFORM1BOX+'8d', DEDUCFORM1BOX+'9d']
        },
        deducform1box7e: {
            compute: () =>{
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM1BOX, inputs: ['4e', '5e', '6e'], outputs: ['7e']});
            },
            triggers: [DEDUCFORM1BOX+'7f', DEDUCFORM1BOX+'8e', DEDUCFORM1BOX+'9e']
        },
        deducform1box7f: {
            compute: () =>{
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM1BOX, inputs: ['7x', '7d', '7e'], outputs: ['7f']});
            },
            triggers: [TAXFORM1SEC3BOX+'7amount']
        },
        deducform1box8x: {
            compute: () =>{
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'8x', value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'8x'})});
            },
            triggers: [DEDUCFORM1BOX+'8f']
        },
        deducform1box8d: {
            compute: () =>{
                const difference = domUtil.prototype.subtractInputElements({elemIds: [DEDUCFORM1BOX+'7d',
                        DEDUCFORM1BOX+'2d', DEDUCFORM1BOX+'3d']});
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'8d', value: (difference > 0) ? difference : 0});
            },
            triggers: [DEDUCFORM1BOX+'8f', DEDUCFORM1BOX+'11e']
        },
        deducform1box8e: {
            compute: () =>{
                const difference = domUtil.prototype.subtractInputElements({elemIds: [DEDUCFORM1BOX+'7e',
                        DEDUCFORM1BOX+'2e', DEDUCFORM1BOX+'3e']});
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'8e', value: (difference > 0) ? difference : 0});
            },
            triggers: [DEDUCFORM1BOX+'8f', DEDUCFORM1BOX+'11e']
        },
        deducform1box8f: {
            compute: () =>{
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM1BOX,
                    inputs: ['8x', '8d', '8e'], outputs: ['8f']});
            },
            triggers: [DEDUCFORM1BOX+'10f']
        },
        deducform1box9x: {
            compute: () =>{
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'9x',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'9x'})});
            },
            triggers: [DEDUCFORM1BOX+'9f']
        },
        deducform1box9d: {
            compute: () =>{
                let val2d = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'2d'}));
                let val3d = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'3d'}));
                let val7d = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'7d'}));
                let newVal = val2d+val3d-val7d;
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'9d', value: (newVal > 0) ? newVal : 0});
            },
            triggers: [DEDUCFORM1BOX+'9f', DEDUCFORM1BOX+'12e']
        },
        deducform1box9e: {
            compute: () =>{
                const val2e = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'2e'}));
                const val3e = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'3e'}));
                const val7e = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'7e'}));
                const newVal = val2e+val3e-val7e;
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'9e', value: (newVal > 0) ? newVal : 0});
            },
            triggers: [DEDUCFORM1BOX+'9f', DEDUCFORM1BOX+'12e']
        },
        deducform1box9f: {
            compute: () =>{
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM1BOX,
                    inputs: ['9x', '9d', '9e'], outputs: ['9f']});
            },
            triggers: [DEDUCFORM1BOX+'10f']
        },
        deducform1box10f: {
            compute: () =>{
                domUtil.prototype.subtractElementsAndSetValues({prefix: DEDUCFORM1BOX,
                    inputs: ['9f', '8f'], outputs: ['10f']});
            },
            triggers: [TAXFORM1SEC3BOX+'8amount',TAXFORM1SEC3BOX+'9amount']
        },
        deducform1box11x: {
            compute: () =>{
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'11x',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'11x'})});
            },
            triggers: [DEDUCFORM1BOX+'11f']
        },
        deducform1box11e: {
            compute: () =>{
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM1BOX,
                    inputs: ['8d', '8e'], outputs: ['11e']});
            },
            triggers: [DEDUCFORM1BOX+'11f', DEDUCFORM1BOX+'13e', DEDUCFORM1BOX+'14e']
        },
        deducform1box11f: {
            compute: () =>{
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM1BOX,
                    inputs: ['11x', '11e'], outputs: ['11f']});
            }
        },
        deducform1box12x: {
            compute: () =>{
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'12x',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'12x'})});
            },
            triggers: [DEDUCFORM1BOX+'12f']
        },
        deducform1box12e: {
            compute: () =>{
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM1BOX,
                    inputs: ['9d', '9e'], outputs: ['12e']});
            },
            triggers: [DEDUCFORM1BOX+'12f', DEDUCFORM1BOX+'13e', DEDUCFORM1BOX+'15e']
        },
        deducform1box12f: {
            compute: () =>{
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM1BOX,
                    inputs: ['12x', '12e'], outputs: ['12f']});
            }
        },
        deducform1box13x: {
            compute: () =>{
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'13x',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'13x'})});
            },
            triggers: [DEDUCFORM1BOX+'13f']
        },
        deducform1box13e: {
            compute: () =>{
                domUtil.prototype.subtractElementsAndSetValues({prefix: DEDUCFORM1BOX,
                    inputs: ['12e', '11e'], outputs: ['13e']});
            },
            triggers: [DEDUCFORM1BOX+'13f', TAXFORM2SEC3BOX+'23amount']
        },
        deducform1box13f: {
            compute: () =>{
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM1BOX, inputs: ['13x', '13e'],
                    outputs: ['13f']});
            },
            triggers: [TAXFORM1SEC3BOX+'17amount', TAXFORM1SEC3BOX+'18amount', TAXFORM2SEC3BOX+'20amount']
        },
        deducform1box14x: {
            compute: () =>{
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'14x',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'14x'})});
            },
            triggers: [DEDUCFORM1BOX+'14f']
        },
        deducform1box14e: {
            compute: () =>{
                const val11e = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'11e'}));
                const newVal = Math.floor(val11e*22/78);
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'14e', value: newVal});
            },
            triggers: [DEDUCFORM1BOX+'14f']
        },
        deducform1box14f: {
            compute: () =>{
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM1BOX,
                    inputs: ['14x', '14e'], outputs: ['14f']});
            },
            triggers: [DEDUCFORM1BOX+'16f']
        },
        deducform1box15x: {
            compute: () =>{
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'15x',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'15x'})});
            },
            triggers: [DEDUCFORM1BOX+'15f']
        },
        deducform1box15e: {
            compute: () =>{
                const val12e = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'12e'}));
                const newVal = Math.floor(val12e*22/78);
                domUtil.prototype.setValue({id: DEDUCFORM1BOX+'15e', value: newVal});
            },
            triggers: [DEDUCFORM1BOX+'15f']
        },
        deducform1box15f: {
            compute: () =>{
                domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM1BOX,
                    inputs: ['15x', '15e'], outputs: ['15f']});
            },
            triggers: [DEDUCFORM1BOX+'16f']
        },
        deducform1box16f: {
            compute: () =>{
                domUtil.prototype.subtractElementsAndSetValues({prefix: DEDUCFORM1BOX,
                    inputs: ['15f', '14f'], outputs: ['16f']});
            },
            triggers: [TAXFORM1SEC3BOX+'19amount',TAXFORM1SEC3BOX+'20amount']
        }
    };

});
