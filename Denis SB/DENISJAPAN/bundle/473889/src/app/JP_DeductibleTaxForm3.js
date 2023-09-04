/**
 *    Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 *
 */

define([
    './JP_TaxFormjQueryWrapper',
    './JP_DeductibleTaxFormConstants'
],

     (domUtil, formConstants) => {

        let DEDUCFORM3BOX = formConstants.Form.DEDUCFORM3BOX;
        let DEDUCFORM4BOX = formConstants.Form.DEDUCFORM4BOX;
        let DEDUCFORM1BOX = formConstants.Form.DEDUCFORM1BOX;
        let DEDUCFORM2BOX = formConstants.Form.DEDUCFORM2BOX;
        let TAXFORM1SEC3BOX = formConstants.Form.TAXFORM1SEC3BOX;

        let ITEMIZED = formConstants.CalcMethod.ITEMIZED;
        let PROPORTIONAL = formConstants.CalcMethod.PROPORTIONAL;

        let TC_8_REDUCED = formConstants.TaxClassification.TC_8_REDUCED;
        let TC_EXEMPT = formConstants.TaxClassification.TC_EXEMPT;
        let TC_SPECIAL_NON_TAX_SALES = formConstants.TaxClassification.TC_SPECIAL_NON_TAX_SALES;
        let TC_NON_TAXABLE = formConstants.TaxClassification.TC_NON_TAXABLE;
        let TC_OTHR_STP_10 = formConstants.TaxClassification.TC_OTHR_STP_10;
        let TC_OTHR_TF_8_REDUCED = formConstants.TaxClassification.TC_OTHR_TF_8_REDUCED;
        let TC_10_STANDARD = formConstants.TaxClassification.TC_10_STANDARD;
        let TC_OTHR_TF_10_STANDARD = formConstants.TaxClassification.TC_OTHR_TF_10_STANDARD;

        let MTC_TAXABLE = formConstants.TaxCategory.MTC_TAXABLE;
        let MTC_COMMON = formConstants.TaxCategory.MTC_COMMON;
        let MTC_NON_TAXABLE = formConstants.TaxCategory.MTC_NON_TAXABLE;

        let SALES = formConstants.Type.SALES;
        let PURCHASES = formConstants.Type.PURCHASES;

        return {
            deducform3box1x: {
                compute: () => {
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'1x',
                        value: domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'1x'})});
                },
                triggers: [DEDUCFORM3BOX+'1f']
            },
            deducform3box1d: {
                compute: (data) => {
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'1d',
                        value: (data[SALES][TC_8_REDUCED]) ? data[SALES][TC_8_REDUCED].netamount : 0});
                },
                triggers: [DEDUCFORM3BOX+'1f']
            },
            deducform3box1e: {
                compute: (data) => {
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'1e',
                        value: (data[SALES][TC_10_STANDARD]) ? data[SALES][TC_10_STANDARD].netamount : 0});
                },
                triggers: [DEDUCFORM3BOX+'1f']
            },
            deducform3box1f: {
                compute: () => {
                    domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM3BOX,
                        inputs: ['1x', '1d', '1e'], outputs: ['1f']});
                },
                triggers: [
                    DEDUCFORM4BOX+'16a', DEDUCFORM4BOX+'16b', DEDUCFORM4BOX+'16c', DEDUCFORM4BOX+'16x', DEDUCFORM4BOX+'17a',
                    DEDUCFORM4BOX+'17b', DEDUCFORM4BOX+'17c', DEDUCFORM4BOX+'17x', DEDUCFORM4BOX+'18a', DEDUCFORM4BOX+'18b',
                    DEDUCFORM4BOX+'18c', DEDUCFORM4BOX+'18x', DEDUCFORM4BOX+'19a', DEDUCFORM4BOX+'19b', DEDUCFORM4BOX+'19c',
                    DEDUCFORM4BOX+'19x', DEDUCFORM4BOX+'20a', DEDUCFORM4BOX+'20b', DEDUCFORM4BOX+'20c', DEDUCFORM4BOX+'20x',
                    DEDUCFORM3BOX+'4f', DEDUCFORM3BOX+'16x', DEDUCFORM3BOX+'16d', DEDUCFORM3BOX+'16e', DEDUCFORM3BOX+'16f',
                    DEDUCFORM3BOX+'17x', DEDUCFORM3BOX+'17d', DEDUCFORM3BOX+'17e', DEDUCFORM3BOX+'17f', DEDUCFORM3BOX+'18x',
                    DEDUCFORM3BOX+'18d', DEDUCFORM3BOX+'18e', DEDUCFORM3BOX+'18f', DEDUCFORM3BOX+'19x', DEDUCFORM3BOX+'19d',
                    DEDUCFORM3BOX+'19e', DEDUCFORM3BOX+'19f', DEDUCFORM3BOX+'20x', DEDUCFORM3BOX+'20d', DEDUCFORM3BOX+'20e',
                    DEDUCFORM3BOX+'20f'
                ]
            },
            deducform3box2f: {
                compute: (data) => {
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'2f',
                        value: (data[SALES][TC_EXEMPT]) ? data[SALES][TC_EXEMPT].netamount : 0});
                },
                triggers: [DEDUCFORM3BOX+'4f']
            },
            deducform3box3f: {
                compute: (data) => {
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'3f',
                        value: (data[SALES][TC_SPECIAL_NON_TAX_SALES]) ? data[SALES][TC_SPECIAL_NON_TAX_SALES].netamount : 0});
                },
                triggers: [DEDUCFORM3BOX+'4f']
            },
            deducform3box4f: {
                compute: () =>  {
                    domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM3BOX,
                        inputs: ['1f', '2f', '3f'], outputs: ['4f']});
                },
                triggers: [DEDUCFORM4BOX+'4x', DEDUCFORM3BOX+'5f', DEDUCFORM3BOX+'8f',
                    DEDUCFORM3BOX+'19d', DEDUCFORM3BOX+'19e',TAXFORM1SEC3BOX+'15amount']
            },
            deducform3box5f: {
                compute: () => {
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'5f',
                        value: domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'4f'})});
                },
                triggers: [DEDUCFORM3BOX+'7f']
            },
            deducform3box6f: {
                compute: (data) => {
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'6f',
                        value: (data[SALES][TC_NON_TAXABLE]) ? data[SALES][TC_NON_TAXABLE].netamount : 0});
                },
                triggers: [DEDUCFORM3BOX+'7f']
            },
            deducform3box7f: {
                compute: () => {
                    domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM3BOX,
                        inputs: ['5f', '6f'], outputs: ['7f']});
                },
                triggers: [DEDUCFORM4BOX+'7x', DEDUCFORM3BOX+'8f', DEDUCFORM3BOX+'19d',
                    DEDUCFORM3BOX+'19e',TAXFORM1SEC3BOX+'16amount']
            },
            deducform3box8f: {
                compute: () => {
                    let val4f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'4f'}));
                    let val7f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'7f'}));
                    let newVal = Math.floor(val4f/val7f*100) || 0;
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'8f', value: newVal});
                },
                triggers: [
                    DEDUCFORM4BOX+'8x',
                    DEDUCFORM3BOX+'11e', DEDUCFORM3BOX+'16x', DEDUCFORM3BOX+'16d',
                    DEDUCFORM3BOX+'16e', DEDUCFORM3BOX+'16f', DEDUCFORM3BOX+'17x', DEDUCFORM3BOX+'17d',
                    DEDUCFORM3BOX+'17e', DEDUCFORM3BOX+'17f', DEDUCFORM3BOX+'18x', DEDUCFORM3BOX+'18d',
                    DEDUCFORM3BOX+'18e', DEDUCFORM3BOX+'18f', DEDUCFORM3BOX+'19x', DEDUCFORM3BOX+'19d',
                    DEDUCFORM3BOX+'19e', DEDUCFORM3BOX+'19f', DEDUCFORM3BOX+'20x', DEDUCFORM3BOX+'20d',
                    DEDUCFORM3BOX+'20e', DEDUCFORM3BOX+'20f',
                    DEDUCFORM2BOX+'1_2c', DEDUCFORM2BOX+'5_2c',
                    DEDUCFORM1BOX+'1_2e', DEDUCFORM1BOX+'5_2e'
                ]
            },
            deducform3box9x: {
                compute: () => {
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'9x',
                        value: domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'9x'})});
                },
                triggers: [DEDUCFORM3BOX+'9f']
            },
            deducform3box9d: {
                compute: (data) => {
                    let amount = 0;
                    util.each(data[PURCHASES], (purchaseMTC) => {
                        amount += (purchaseMTC[TC_8_REDUCED]) ? purchaseMTC[TC_8_REDUCED].grsamount : 0
                    });
                    domUtil.prototype.setValue({
                        id: DEDUCFORM3BOX+'9d',
                        value: amount
                    });
                },
                triggers: [DEDUCFORM3BOX+'9f', DEDUCFORM3BOX+'10d']
            },
            deducform3box9e: {
                compute: (data) => {
                    let amount = 0;
                    util.each(data[PURCHASES], (purchaseMTC) => {
                        amount += (purchaseMTC[TC_10_STANDARD]) ? purchaseMTC[TC_10_STANDARD].grsamount : 0
                    });
                    domUtil.prototype.setValue({
                        id: DEDUCFORM3BOX+'9e',
                        value: amount
                    });
                },
                triggers: [DEDUCFORM3BOX+'9f', DEDUCFORM3BOX+'10e']
            },
            deducform3box9f: {
                compute: () => {
                    domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM3BOX,
                        inputs: ['9x', '9d', '9e'], outputs: ['9f']});
                }
            },
            deducform3box10x: {
                compute: () => {
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'10x',
                        value: domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'10x'})});
                },
                triggers: [DEDUCFORM3BOX+'10f']
            },
            deducform3box10d: {
                compute: () => {
                    let val9d = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'9d'}));
                    let newVal = Math.floor(val9d*6.24/108);
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'10d', value: newVal});
                },
                triggers: [DEDUCFORM3BOX+'10f', DEDUCFORM3BOX+'15d']
            },
            deducform3box10e: {
                compute: () => {
                    let val9e = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'9e'}));
                    let newVal = Math.floor(val9e*7.8/110);
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'10e', value: newVal});
                },
                triggers: [DEDUCFORM3BOX+'10f', DEDUCFORM3BOX+'15e']
            },
            deducform3box10f: {
                compute: () => {
                    domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM3BOX,
                        inputs: ['10x', '10d', '10e'], outputs: ['10f']});
                }
            },
            deducform3box11x: {
                compute: () => {
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'11x',
                        value: domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'11x'})});
                },
                triggers: [DEDUCFORM3BOX+'11f']
            },
            deducform3box11e: {
                compute: (data) => {
                    let val8f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'8f'}));
                    let val11e = 0;
                    if (val8f < 95) {
                        util.each(data[PURCHASES], (purchaseMTC) => {
                            val11e += (purchaseMTC[TC_OTHR_STP_10]) ? purchaseMTC[TC_OTHR_STP_10].grsamount : 0
                        });
                    }
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'11e', value: val11e});
                },
                triggers: [DEDUCFORM3BOX+'11f', DEDUCFORM3BOX+'12e']
            },
            deducform3box11f: {
                compute: () => {
                    domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM3BOX,
                        inputs: ['11x', '11e'], outputs: ['11f']});
                }
            },
            deducform3box12x: {
                compute: () => {
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'12x',
                        value: domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'12x'})});
                },
                triggers: [DEDUCFORM3BOX+'12f']
            },
            deducform3box12e: {
                compute: () => {
                    let val11e = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'11e'}));
                    let newVal = Math.floor(val11e*7.8/100);
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'12e', value: newVal});
                },
                triggers: [DEDUCFORM3BOX+'12f', DEDUCFORM3BOX+'15e']
            },
            deducform3box12f: {
                compute: () => {
                    domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM3BOX,
                        inputs: ['12x', '12e'], outputs: ['12f']});
                }
            },
            deducform3box13x: {
                compute: () => {
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'13x',
                        value: domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'13x'})});
                },
                triggers: [DEDUCFORM3BOX+'13f']
            },
            deducform3box13d: {
                compute: (data) => {
                    let amount = 0;
                    util.each(data[PURCHASES], (purchaseMTC) => {
                        amount += (purchaseMTC[TC_OTHR_TF_8_REDUCED]) ? purchaseMTC[TC_OTHR_TF_8_REDUCED].grsamount : 0
                    });
                    domUtil.prototype.setValue({
                        id: DEDUCFORM3BOX+'13d',
                        value: amount
                    });
                },
                triggers: [DEDUCFORM3BOX+'13f', DEDUCFORM3BOX+'15d']
            },
            deducform3box13e: {
                compute: (data) => {
                    let amount = 0;
                    util.each(data[PURCHASES], (purchaseMTC) => {
                        amount += (purchaseMTC[TC_OTHR_TF_10_STANDARD]) ?
                            purchaseMTC[TC_OTHR_TF_10_STANDARD].grsamount : 0
                    });
                    domUtil.prototype.setValue({
                        id: DEDUCFORM3BOX+'13e',
                        value: amount
                    });
                },
                triggers: [DEDUCFORM3BOX+'13f', DEDUCFORM3BOX+'15e']
            },
            deducform3box13f: {
                compute: () => {
                    domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM3BOX,
                        inputs: ['13x', '13d', '13e'], outputs: ['13f']});
                }
            },
            deducform3box14x: {
                compute: () => {
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'14x',
                        value: domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'14x'})});
                },
                triggers: [DEDUCFORM3BOX+'14f']
            },
            deducform3box14d: {
                triggers: [DEDUCFORM3BOX+'14f', DEDUCFORM3BOX+'15d']
            },
            deducform3box14e: {
                triggers: [DEDUCFORM3BOX+'14f', DEDUCFORM3BOX+'15e']
            },
            deducform3box14f: {
                compute: () => {
                    domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM3BOX,
                        inputs: ['14x', '14d', '14e'], outputs: ['14f']});
                }
            },
            deducform3box15x: {
                compute: () => {
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'15x',
                        value: domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'15x'})});
                },
                triggers: [DEDUCFORM3BOX+'15f']
            },
            deducform3box15d: {
                compute: () => {
                    domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM3BOX,
                        inputs: ['10d', '12d', '13d', '14d'], outputs: ['15d']});
                },
                triggers: [DEDUCFORM3BOX+'15f', DEDUCFORM3BOX+'16d', DEDUCFORM3BOX+'20d']
            },
            deducform3box15e: {
                compute: () => {
                    domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM3BOX,
                        inputs: ['10e', '12e', '13e', '14e'], outputs: ['15e']});
                },
                triggers: [DEDUCFORM3BOX+'15f', DEDUCFORM3BOX+'16e', DEDUCFORM3BOX+'20e']
            },
            deducform3box15f: {
                compute: () => {
                    domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM3BOX,
                        inputs: ['15x', '15d', '15e'], outputs: ['15f']});
                },
                triggers: [DEDUCFORM3BOX+'16f']
            },
            deducform3box16x: {
                compute: () => {
                    let val1f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'1f'}));
                    let val8f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'8f'}));
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'16x',
                        value: (val1f <= 500000000 && val8f >= 95) ?
                            domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'16x'}) : 0});
                }
            },
            deducform3box16d: {
                compute: () =>  {
                    let val1f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'1f'}));
                    let val8f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'8f'}));
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'16d',
                        value: (val1f <= 500000000 && val8f >= 95) ?
                            domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'15d'}) : 0});
                },
                triggers: [DEDUCFORM3BOX+'23d', DEDUCFORM3BOX+'24d']
            },
            deducform3box16e: {
                compute: () => {
                    let val1f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'1f'}));
                    let val8f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'8f'}));
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'16e',
                        value: (val1f <= 500000000 && val8f >= 95) ?
                            domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'15e'}) : 0});
                },
                triggers: [DEDUCFORM3BOX+'23e', DEDUCFORM3BOX+'24e']
            },
            deducform3box16f: {
                compute: () =>  {
                    let val1f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'1f'}));
                    let val8f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'8f'}));
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'16f',
                        value: (val1f <= 500000000 && val8f >= 95) ?
                            domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'15f'}) : 0});
                }
            },
            deducform3box17x: {
                compute: (data) => {
                    let val1f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'1f'}));
                    let val8f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'8f'}));
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'17x',
                        value: ((val1f > 500000000 || val8f < 95) && data.calcMethod === ITEMIZED) ?
                            domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'17x'}) : 0});
                },
                triggers: [DEDUCFORM3BOX+'17f']
            },
            deducform3box17d: {
                compute: (data) => {
                    let val8f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'8f'}));
                    let val1f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'1f'}));
                    let amount1 = (data[PURCHASES][MTC_TAXABLE] &&
                        data[PURCHASES][MTC_TAXABLE][TC_8_REDUCED]) ?
                        data[PURCHASES][MTC_TAXABLE][TC_8_REDUCED].grsamount : 0;
                    let amount2 = (data[PURCHASES][MTC_TAXABLE] &&
                        data[PURCHASES][MTC_TAXABLE][TC_OTHR_TF_8_REDUCED]) ?
                        data[PURCHASES][MTC_TAXABLE][TC_OTHR_TF_8_REDUCED].grsamount : 0;
                    domUtil.prototype.setValue({
                        id: DEDUCFORM3BOX+'17d',
                        value: ((val1f > 500000000 || val8f < 95) && data.calcMethod === ITEMIZED) ? amount1+amount2 : 0
                    });
                },
                triggers: [DEDUCFORM3BOX+'17f', DEDUCFORM3BOX+'19d']
            },
            deducform3box17e: {
                compute: (data) => {
                    let val8f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'8f'}));
                    let val1f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'1f'}));
                    let amount1 = (data[PURCHASES][MTC_TAXABLE] &&
                        data[PURCHASES][MTC_TAXABLE][TC_10_STANDARD]) ?
                        data[PURCHASES][MTC_TAXABLE][TC_10_STANDARD].grsamount : 0;
                    let amount2 = (data[PURCHASES][MTC_TAXABLE] &&
                        data[PURCHASES][MTC_TAXABLE][TC_OTHR_STP_10]) ?
                        data[PURCHASES][MTC_TAXABLE][TC_OTHR_STP_10].grsamount : 0;
                    let amount3 = (data[PURCHASES][MTC_TAXABLE] &&
                        data[PURCHASES][MTC_TAXABLE][TC_OTHR_TF_10_STANDARD]) ?
                        data[PURCHASES][MTC_TAXABLE][TC_OTHR_TF_10_STANDARD].grsamount : 0;
                    domUtil.prototype.setValue({
                        id: DEDUCFORM3BOX+'17e',
                        value: ((val1f > 500000000 || val8f < 95) && data.calcMethod === ITEMIZED) ?
                            amount1+amount2+amount3 : 0
                    });
                },
                triggers: [DEDUCFORM3BOX+'17f', DEDUCFORM3BOX+'19e']
            },
            deducform3box17f: {
                compute: () => {
                    let sum = domUtil.prototype.sumInputElements({elemIds: [DEDUCFORM3BOX+'17x',
                            DEDUCFORM3BOX+'17d', DEDUCFORM3BOX+'17e']});
                    domUtil.prototype.setValue({
                        id: DEDUCFORM3BOX+'17f',
                        value: sum
                    });
                }
            },
            deducform3box18x: {
                compute: (data) => {
                    let val1f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'1f'}));
                    let val8f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'8f'}));
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'18x',
                        value: ((val1f > 500000000 || val8f < 95) && data.calcMethod === ITEMIZED) ?
                            domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'18x'}) : 0});
                },
                triggers: [DEDUCFORM3BOX+'18f']
            },
            deducform3box18d: {
                compute: (data) =>  {
                    let val8f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'8f'}));
                    let val1f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'1f'}));
                    let amount1 = (data[PURCHASES][MTC_NON_TAXABLE] &&
                        data[PURCHASES][MTC_NON_TAXABLE][TC_8_REDUCED]) ?
                        data[PURCHASES][MTC_NON_TAXABLE][TC_8_REDUCED].grsamount : 0;
                    let amount2 = (data[PURCHASES][MTC_NON_TAXABLE] &&
                        data[PURCHASES][MTC_NON_TAXABLE][TC_OTHR_TF_8_REDUCED]) ?
                        data[PURCHASES][MTC_NON_TAXABLE][TC_OTHR_TF_8_REDUCED].grsamount : 0;
                    let amount3 = (data[PURCHASES][MTC_COMMON] &&
                        data[PURCHASES][MTC_COMMON][TC_8_REDUCED]) ?
                        data[PURCHASES][MTC_COMMON][TC_8_REDUCED].grsamount : 0;
                    let amount4 = (data[PURCHASES][MTC_COMMON] &&
                        data[PURCHASES][MTC_COMMON][TC_OTHR_TF_8_REDUCED]) ?
                        data[PURCHASES][MTC_COMMON][TC_OTHR_TF_8_REDUCED].grsamount : 0;
                    domUtil.prototype.setValue({
                        id: DEDUCFORM3BOX+'18d',
                        value: ((val1f > 500000000 || val8f < 95) && data.calcMethod === ITEMIZED) ?
                            amount1+amount2+amount3+amount4 : 0
                    });
                },
                triggers: [DEDUCFORM3BOX+'18f', DEDUCFORM3BOX+'19d']
            },
            deducform3box18e: {
                compute: (data) => {
                    let val8f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'8f'}));
                    let val1f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'1f'}));
                    let amount1 = (data[PURCHASES][MTC_NON_TAXABLE] &&
                        data[PURCHASES][MTC_NON_TAXABLE][TC_10_STANDARD]) ?
                        data[PURCHASES][MTC_NON_TAXABLE][TC_10_STANDARD].grsamount : 0;
                    let amount2 = (data[PURCHASES][MTC_NON_TAXABLE] &&
                        data[PURCHASES][MTC_NON_TAXABLE][TC_OTHR_TF_10_STANDARD]) ?
                        data[PURCHASES][MTC_NON_TAXABLE][TC_OTHR_TF_10_STANDARD].grsamount : 0;
                    let amount3 = (data[PURCHASES][MTC_COMMON] &&
                        data[PURCHASES][MTC_COMMON][TC_10_STANDARD]) ?
                        data[PURCHASES][MTC_COMMON][TC_10_STANDARD].grsamount : 0;
                    let amount4 = (data[PURCHASES][MTC_COMMON] &&
                        data[PURCHASES][MTC_COMMON][TC_OTHR_TF_10_STANDARD]) ?
                        data[PURCHASES][MTC_COMMON][TC_OTHR_TF_10_STANDARD].grsamount : 0;
                    domUtil.prototype.setValue({
                        id: DEDUCFORM3BOX+'18e',
                        value: ((val1f > 500000000 || val8f < 95) && data.calcMethod === ITEMIZED) ?
                            amount1+amount2+amount3+amount4 : 0
                    });
                },
                triggers: [DEDUCFORM3BOX+'18f', DEDUCFORM3BOX+'19e']
            },
            deducform3box18f: {
                compute: () => {
                    let sum = domUtil.prototype.sumInputElements({elemIds: [DEDUCFORM3BOX+'18x',
                            DEDUCFORM3BOX+'18d', DEDUCFORM3BOX+'18e']});
                    domUtil.prototype.setValue({
                        id: DEDUCFORM3BOX+'18f',
                        value: sum
                    });
                }
            },
            deducform3box19x: {
                compute: (data) => {
                    let val1f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'1f'}));
                    let val8f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'8f'}));
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'19x',
                        value: ((val1f > 500000000 || val8f < 95) && data.calcMethod === ITEMIZED) ?
                            domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'19x'}) : 0});
                },
                triggers: [DEDUCFORM3BOX+'19f']
            },
            deducform3box19d: {
                compute: () => {
                    let val17d = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'17d'}));
                    let val18d = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'18d'}));
                    let val4f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'4f'}));
                    let val7f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'7f'}));
                    let newVal = Math.floor(val17d+(val18d*val4f/val7f)) || 0;
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'19d', value: newVal});
                },
                triggers: [DEDUCFORM3BOX+'19f', DEDUCFORM3BOX+'23d', DEDUCFORM3BOX+'24d']
            },
            deducform3box19e: {
                compute: () => {
                    let val17e = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'17e'}));
                    let val18e = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'18e'}));
                    let val4f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'4f'}));
                    let val7f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'7f'}));
                    let newVal = Math.floor(val17e+(val18e*val4f/val7f)) || 0;
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'19e', value: newVal});
                },
                triggers: [DEDUCFORM3BOX+'19f', DEDUCFORM3BOX+'23e', DEDUCFORM3BOX+'24e']
            },
            deducform3box19f: {
                compute: (data) => {
                    let sum = domUtil.prototype.sumInputElements({elemIds: [DEDUCFORM3BOX+'19x',
                            DEDUCFORM3BOX+'19d', DEDUCFORM3BOX+'19e']});
                    domUtil.prototype.setValue({
                        id: DEDUCFORM3BOX+'19f',
                        value: sum
                    });
                }
            },
            deducform3box20x: {
                compute: (data) =>  {
                    let val1f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'1f'}));
                    let val8f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'8f'}));
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'20x', value:
                            ((val1f > 500000000 || val8f < 95) && data.calcMethod === PROPORTIONAL) ?
                                domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'20x'}) : 0});
                },
                triggers: [DEDUCFORM3BOX+'20f']
            },
            deducform3box20d: {
                compute: (data) => {
                    let val1f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'1f'}));
                    let val8f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'8f'}));
                    let val15d = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'15d'}));
                    let val4f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'4f'}));
                    let val7f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'7f'}));
                    let newVal = Math.floor(val15d*(val4f/val7f)) || 0;
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'20d',
                        value: ((val1f > 500000000 || val8f < 95) && data.calcMethod === PROPORTIONAL) ? newVal : 0});
                },
                triggers: [DEDUCFORM3BOX+'20f', DEDUCFORM3BOX+'23d', DEDUCFORM3BOX+'24d']
            },
            deducform3box20e: {
                compute: (data) => {
                    let val1f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'1f'}));
                    let val8f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'8f'}));
                    let val15e = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'15e'}));
                    let val4f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'4f'}));
                    let val7f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'7f'}));
                    let newVal = Math.floor(val15e*(val4f/val7f)) || 0;
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'20e',
                        value: ((val1f > 500000000 || val8f < 95) && data.calcMethod === PROPORTIONAL) ? newVal : 0});
                },
                triggers: [DEDUCFORM3BOX+'20f', DEDUCFORM3BOX+'23e', DEDUCFORM3BOX+'24e']
            },
            deducform3box20f: {
                compute: (data) => {
                    let val1f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'1f'}));
                    let val8f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'8f'}));
                    let sum = domUtil.prototype.sumInputElements({elemIds: [DEDUCFORM3BOX+'20x',
                            DEDUCFORM3BOX+'20d', DEDUCFORM3BOX+'20e']});
                    domUtil.prototype.setValue({
                        id: DEDUCFORM3BOX+'20f',
                        value: ((val1f > 500000000 || val8f < 95) && data.calcMethod === PROPORTIONAL) ? sum : 0
                    });
                }
            },
            deducform3box21x: {
                compute: () => {
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'21x',
                        value: domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'21x'})});
                },
                triggers: [DEDUCFORM3BOX+'21f']
            },
            deducform3box21d: {
                triggers: [DEDUCFORM3BOX+'21f', DEDUCFORM3BOX+'23d', DEDUCFORM3BOX+'24d']
            },
            deducform3box21e: {
                triggers: [DEDUCFORM3BOX+'21f', DEDUCFORM3BOX+'23e', DEDUCFORM3BOX+'24e']
            },
            deducform3box21f: {
                compute: () => {
                    domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM3BOX,
                        inputs: ['21x', '21d', '21e'], outputs: ['21f']});
                }
            },
            deducform3box22x: {
                compute: () => {
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'22x',
                        value: domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'22x'})});
                },
                triggers: [DEDUCFORM3BOX+'22f']
            },
            deducform3box22d: {
                triggers: [DEDUCFORM3BOX+'22f', DEDUCFORM3BOX+'23d', DEDUCFORM3BOX+'24d']
            },
            deducform3box22e: {
                triggers: [DEDUCFORM3BOX+'22f', DEDUCFORM3BOX+'23e', DEDUCFORM3BOX+'24e']
            },
            deducform3box22f: {
                compute: () => {
                    domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM3BOX,
                        inputs: ['22x', '22d', '22e'], outputs: ['22f']});
                }
            },
            deducform3box23x: {
                compute: () => {
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'23x',
                        value: domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'23x'})});
                },
                triggers: [DEDUCFORM3BOX+'23f']
            },
            deducform3box23d: {
                compute: () => {
                    let sum = domUtil.prototype.sumInputElements({elemIds: [
                        DEDUCFORM3BOX+'16d',
                        DEDUCFORM3BOX+'19d',
                        DEDUCFORM3BOX+'20d',
                        DEDUCFORM3BOX+'21d',
                        DEDUCFORM3BOX+'22d'
                    ]});
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'23d', value: (sum > 0) ? sum : 0})
                },
                triggers: [DEDUCFORM1BOX+'4d', DEDUCFORM3BOX+'23f']
            },
            deducform3box23e: {
                compute: () => {
                    let sum = domUtil.prototype.sumInputElements({elemIds: [
                        DEDUCFORM3BOX+'16e',
                        DEDUCFORM3BOX+'19e',
                        DEDUCFORM3BOX+'20e',
                        DEDUCFORM3BOX+'21e',
                        DEDUCFORM3BOX+'22e'
                    ]});
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'23e', value: (sum > 0) ? sum : 0})
                },
                triggers: [DEDUCFORM1BOX+'4e', DEDUCFORM3BOX+'23f']
            },
            deducform3box23f: {
                compute: () => {
                    domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM3BOX,
                        inputs: ['23x', '23d', '23e'], outputs: ['23f']});
                }
            },
            deducform3box24x: {
                compute: () =>  {
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'24x',
                        value: domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'24x'})});
                },
                triggers: [DEDUCFORM3BOX+'24f']
            },
            deducform3box24d: {
                compute: () => {
                    let sum = domUtil.prototype.sumInputElements({elemIds: [
                        DEDUCFORM3BOX+'16d',
                        DEDUCFORM3BOX+'19d',
                        DEDUCFORM3BOX+'20d',
                        DEDUCFORM3BOX+'21d',
                        DEDUCFORM3BOX+'22d'
                    ]});
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'24d', value: (sum < 0) ? sum : 0});
                },
                triggers: [DEDUCFORM1BOX+'3d', DEDUCFORM3BOX+'24f']
            },
            deducform3box24e: {
                compute: () => {
                    let sum = domUtil.prototype.sumInputElements({elemIds: [
                        DEDUCFORM3BOX+'16e',
                        DEDUCFORM3BOX+'19e',
                        DEDUCFORM3BOX+'20e',
                        DEDUCFORM3BOX+'21e',
                        DEDUCFORM3BOX+'22e'
                    ]});
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'24e', value: (sum < 0) ? sum : 0});
                },
                triggers: [DEDUCFORM1BOX+'3e', DEDUCFORM3BOX+'24f']
            },
            deducform3box24f: {
                compute: () => {
                    domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM3BOX,
                        inputs: ['24x', '24d', '24e'], outputs: ['24f']});
                }
            },
            deducform3box25x: {
                compute: () => {
                    domUtil.prototype.setValue({id: DEDUCFORM3BOX+'25x',
                        value: domUtil.prototype.getInputElementVal({id: DEDUCFORM4BOX+'25x'})});
                },
                triggers: [DEDUCFORM3BOX+'25f']
            },
            deducform3box25d: {
                triggers: [DEDUCFORM3BOX+'25f', DEDUCFORM1BOX+'3d']
            },
            deducform3box25e: {
                triggers: [DEDUCFORM3BOX+'25f', DEDUCFORM1BOX+'3e']
            },
            deducform3box25f: {
                compute: () => {
                    domUtil.prototype.sumElementsAndSetValues({prefix: DEDUCFORM3BOX,
                        inputs: ['25x', '25d', '25e'], outputs: ['25f']});
                }
            }
        };

    });
