/**
 *    Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define(['./JP_TaxFormjQueryWrapper', './JP_DeductibleTaxFormConstants'],

 (domUtil, formConstants) => {
    let DEDUCFORM2BOX = formConstants.Form.DEDUCFORM2BOX;
    let DEDUCFORM1BOX = formConstants.Form.DEDUCFORM1BOX;
    let TAXFORM1SEC3BOX = formConstants.Form.TAXFORM1SEC3BOX;
    let TAXFORM2SEC3BOX = formConstants.Form.TAXFORM2SEC3BOX;

    return {
        taxform2sec3box1amount: {
            compute: ()=> {
                let valDeducForm1Box1f = domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'1f'});
                domUtil.prototype.setValue({id: TAXFORM2SEC3BOX+'1amount',
                    value: Math.floor(valDeducForm1Box1f/1000)*1000});
            }
        },
        taxform2sec3box2amount: {
            compute: ()=> {
                domUtil.prototype.setValue({id: TAXFORM2SEC3BOX+'2amount',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'1_1a'})});
            }
        },
        taxform2sec3box3amount: {
            compute: ()=> {
                domUtil.prototype.setValue({id: TAXFORM2SEC3BOX+'3amount',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'1_1b'})});
            }
        },
        taxform2sec3box4amount: {
            compute: () => {
                domUtil.prototype.setValue({id: TAXFORM2SEC3BOX+'4amount',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'1_1c'})});
            }
        },
        taxform2sec3box5amount: {
            compute: ()=> {
                domUtil.prototype.setValue({id: TAXFORM2SEC3BOX+'5amount',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'1_1d'})});
            }
        },
        taxform2sec3box6amount: {
            compute: ()=> {
                domUtil.prototype.setValue({id: TAXFORM2SEC3BOX+'6amount',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'1_1e'})});
            }
        },
        taxform2sec3box7amount: {
            compute: ()=> {
                domUtil.prototype.setValue({id: TAXFORM2SEC3BOX+'7amount',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'1_1f'})});
            }
        },
        taxform2sec3box8amount: {
            compute: () => {
                domUtil.prototype.setValue({id: TAXFORM2SEC3BOX+'8amount',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'1_2c'})});
            }
        },
        taxform2sec3box9amount: {
            compute: () => {
                domUtil.prototype.setValue({id: TAXFORM2SEC3BOX+'9amount',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'1_2e'})});
            }
        },
        taxform2sec3box10amount: {
            compute: () => {
                domUtil.prototype.setValue({id: TAXFORM2SEC3BOX+'10amount',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'1_2f'})});
            }
        },
        taxform2sec3box11amount: {
            compute: () =>  {
                domUtil.prototype.setValue({id: TAXFORM2SEC3BOX+'11amount',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'2f'})});
            }
        },
        taxform2sec3box12amount: {
            compute: () => {
                domUtil.prototype.setValue({id: TAXFORM2SEC3BOX+'12amount',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'2a'})});
            }
        },
        taxform2sec3box13amount: {
            compute: () => {
                domUtil.prototype.setValue({id: TAXFORM2SEC3BOX+'13amount',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'2b'})});
            }
        },
        taxform2sec3box14amount: {
            compute: () => {
                domUtil.prototype.setValue({id: TAXFORM2SEC3BOX+'14amount',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'2c'})});
            }
        },
        taxform2sec3box15amount: {
            compute: () => {
                domUtil.prototype.setValue({id: TAXFORM2SEC3BOX+'15amount',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'2d'})});
            }
        },
        taxform2sec3box16amount: {
            compute: () => {
                domUtil.prototype.setValue({id: TAXFORM2SEC3BOX+'16amount',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'2e'})});
            }
        },
        taxform2sec3box17amount: {
            compute: () => {
                domUtil.prototype.setValue({id: TAXFORM2SEC3BOX+'17amount',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'5f'})});
            },
            triggers: [TAXFORM1SEC3BOX+'5amount']
        },
        taxform2sec3box18amount: {
            compute: () => {
                domUtil.prototype.setValue({id: TAXFORM2SEC3BOX+'18amount',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'5_1f'})});
            }
        },
        taxform2sec3box19amount: {
            compute: () => {
                domUtil.prototype.setValue({id: TAXFORM2SEC3BOX+'19amount',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'5_2f'})});
            }
        },
        taxform2sec3box20amount: {
            compute: () =>  {
                domUtil.prototype.setValue({id: TAXFORM2SEC3BOX+'20amount',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'13f'})});
            }
        },
        taxform2sec3box21amount: {
            compute: () => {
                domUtil.prototype.setValue({id: TAXFORM2SEC3BOX+'21amount',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'13b'})});
            }
        },
        taxform2sec3box22amount: {
            compute: () => {
                domUtil.prototype.setValue({id: TAXFORM2SEC3BOX+'22amount',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM2BOX+'13c'})});
            }
        },
        taxform2sec3box23amount: {
            compute: () =>  {
                domUtil.prototype.setValue({id: TAXFORM2SEC3BOX+'23amount',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'13e'})});
            }
        },
    };
});
