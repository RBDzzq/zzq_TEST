/**
 *    Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define(['./JP_TaxFormjQueryWrapper', './JP_DeductibleTaxFormConstants'],

 (domUtil, formConstants) => {
    let DEDUCFORM3BOX = formConstants.Form.DEDUCFORM3BOX;
    let DEDUCFORM1BOX = formConstants.Form.DEDUCFORM1BOX;
    let TAXFORM1SEC3BOX = formConstants.Form.TAXFORM1SEC3BOX;
    let TAXFORM2SEC3BOX = formConstants.Form.TAXFORM2SEC3BOX;

    return {
        taxform1sec3box1amount: {
            compute: ()=> {
                let valDeducForm1Box1f = domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'1f'});
                domUtil.prototype.setValue({id: TAXFORM1SEC3BOX+'1amount',
                    value: Math.floor(valDeducForm1Box1f/1000)*1000});
            }
        },
        taxform1sec3box2amount: {
            compute: ()=> {
                domUtil.prototype.setValue({id: TAXFORM1SEC3BOX+'2amount',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'2f'})});
            }
        },
        taxform1sec3box3amount: {
            compute: ()=> {
                domUtil.prototype.setValue({id: TAXFORM1SEC3BOX+'3amount',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'3f'})});
            }
        },
        taxform1sec3box4amount: {
            compute: () => {
                domUtil.prototype.setValue({id: TAXFORM1SEC3BOX+'4amount',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'4f'})});
            }
        },
        taxform1sec3box5amount: {
            compute: ()=> {
                domUtil.prototype.setValue({id: TAXFORM1SEC3BOX+'5amount',
                    value: domUtil.prototype.getInputElementVal({id: TAXFORM2SEC3BOX+'17amount'})});
            }
        },
        taxform1sec3box6amount: {
            compute: ()=> {
                domUtil.prototype.setValue({id: TAXFORM1SEC3BOX+'6amount',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'6f'})});
            }
        },
        taxform1sec3box7amount: {
            compute: ()=> {
                domUtil.prototype.setValue({id: TAXFORM1SEC3BOX+'7amount',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'7f'})});
            }
        },
        taxform1sec3box8amount: {
            compute: () => {
                let valDeducForm1Box10f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'10f'}));
                let val_8 = (valDeducForm1Box10f < 0) ? valDeducForm1Box10f : 0;
                domUtil.prototype.setValue({id: TAXFORM1SEC3BOX+'8amount', value: val_8});
            },
            triggers: [TAXFORM1SEC3BOX+'26amount']
        },
        taxform1sec3box9amount: {
            compute: ()=> {
                let valDeducForm1Box10f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'10f'}));
                let val_9 = (valDeducForm1Box10f > 0) ? Math.floor(valDeducForm1Box10f/100)*100 : 0;
                domUtil.prototype.setValue({id: TAXFORM1SEC3BOX+'9amount', value: val_9});
            },
            triggers: [TAXFORM1SEC3BOX+'11amount', TAXFORM1SEC3BOX+'12amount']
        },
        taxform1sec3box10amount: {
            compute: ()=> {
                let val_10 = parseFloat(domUtil.prototype.getInputElementVal({id: TAXFORM1SEC3BOX+'10amount'}));
                domUtil.prototype.setValue({id: TAXFORM1SEC3BOX+'10amount', value: Math.floor(val_10/100)*100});
            },
            triggers: [TAXFORM1SEC3BOX+'10amount', TAXFORM1SEC3BOX+'11amount', TAXFORM1SEC3BOX+'12amount']
        },
        taxform1sec3box11amount: {
            compute: ()=> {
                let val_9 = parseFloat(domUtil.prototype.getInputElementVal({id: TAXFORM1SEC3BOX+'9amount'}));
                let val_10 = parseFloat(domUtil.prototype.getInputElementVal({id: TAXFORM1SEC3BOX+'10amount'}));
                let val_11 = (val_9 > val_10) ? Math.floor((val_9-val_10)/100)*100 : 0;

                domUtil.prototype.setValue({id: TAXFORM1SEC3BOX+'11amount', value: val_11});
            },
            triggers: [TAXFORM1SEC3BOX+'26amount']
        },
        taxform1sec3box12amount: {
            compute: ()=> {
                let val_9 = parseFloat(domUtil.prototype.getInputElementVal({id: TAXFORM1SEC3BOX+'9amount'}));
                let val_10 = parseFloat(domUtil.prototype.getInputElementVal({id: TAXFORM1SEC3BOX+'10amount'}));
                let val_12 = (val_10 > val_9) ? Math.floor((val_10-val_9)/100)*100 : 0;

                domUtil.prototype.setValue({id: TAXFORM1SEC3BOX+'12amount', value: val_12});
            },
            triggers: [TAXFORM1SEC3BOX+'26amount']
        },
        taxform1sec3box14amount: {
            compute: ()=> {
                let val_14 = parseFloat(domUtil.prototype.getInputElementVal({id: TAXFORM1SEC3BOX+'14amount'}));
                domUtil.prototype.setValue({id: TAXFORM1SEC3BOX+'14amount', value: Math.floor(val_14/100)*100});
            },
            triggers: [TAXFORM1SEC3BOX+'14amount']
        },
        taxform1sec3box15amount: {
            compute: ()=> {
                domUtil.prototype.setValue({id: TAXFORM1SEC3BOX+'15amount',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'4f'})});
            }
        },
        taxform1sec3box16amount: {
            compute: ()=> {
                domUtil.prototype.setValue({id: TAXFORM1SEC3BOX+'16amount',
                    value: domUtil.prototype.getInputElementVal({id: DEDUCFORM3BOX+'7f'})});
            }
        },
        taxform1sec3box17amount: {
            compute: ()=> {
                let valDeducForm1Box13f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'13f'}));
                let val_17 = (valDeducForm1Box13f < 0) ? valDeducForm1Box13f : 0;
                domUtil.prototype.setValue({id: TAXFORM1SEC3BOX+'17amount', value: val_17});
            }
        },
        taxform1sec3box18amount: {
            compute: ()=> {
                let valDeducForm1Box13f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'13f'}));
                let val_18 = (valDeducForm1Box13f > 0) ? Math.floor(valDeducForm1Box13f/100)*100 : 0;
                domUtil.prototype.setValue({id: TAXFORM1SEC3BOX+'18amount', value: val_18});
            }
        },
        taxform1sec3box19amount: {
            compute: ()=> {
                let valDeducForm1Box16f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'16f'}));
                let val_19 = (valDeducForm1Box16f < 0) ? valDeducForm1Box16f : 0;
                domUtil.prototype.setValue({id: TAXFORM1SEC3BOX+'19amount', value: val_19});
            },
            triggers: [TAXFORM1SEC3BOX+'26amount']
        },
        taxform1sec3box20amount: {
            compute: () => {
                let valDeducForm1Box16f = parseFloat(domUtil.prototype.getInputElementVal({id: DEDUCFORM1BOX+'16f'}));
                let val_20 = (valDeducForm1Box16f > 0) ? Math.floor(valDeducForm1Box16f/100)*100 : 0;
                domUtil.prototype.setValue({id: TAXFORM1SEC3BOX+'20amount', value: val_20});
            },
            triggers: [TAXFORM1SEC3BOX+'22amount',TAXFORM1SEC3BOX+'23amount']
        },
        taxform1sec3box21amount: {
            compute: ()=> {
                let val_21 = parseFloat(domUtil.prototype.getInputElementVal({id: TAXFORM1SEC3BOX+'21amount'}));
                val_21 = Math.floor(val_21/100)*100;
                domUtil.prototype.setValue({id: TAXFORM1SEC3BOX+'21amount', value: val_21});
            },
            triggers: [TAXFORM1SEC3BOX+'21amount',TAXFORM1SEC3BOX+'22amount',TAXFORM1SEC3BOX+'23amount']},
        taxform1sec3box22amount: {
            compute: ()=> {
                let val_20 = parseFloat(domUtil.prototype.getInputElementVal({id: TAXFORM1SEC3BOX+'20amount'}));
                let val_21 = parseFloat(domUtil.prototype.getInputElementVal({id: TAXFORM1SEC3BOX+'21amount'}));
                let val_22 = (val_20 > val_21) ? Math.floor((val_20-val_21)/100)*100 : 0;

                domUtil.prototype.setValue({id: TAXFORM1SEC3BOX+'22amount', value: val_22});
            },
            triggers: [TAXFORM1SEC3BOX+'26amount']
        },
        taxform1sec3box23amount: {
            compute: ()=> {
                let val_20 = parseFloat(domUtil.prototype.getInputElementVal({id: TAXFORM1SEC3BOX+'20amount'}));
                let val_21 = parseFloat(domUtil.prototype.getInputElementVal({id: TAXFORM1SEC3BOX+'21amount'}));
                let val_23 = (val_21 > val_20) ? Math.floor((val_21-val_20)/100)*100 : 0;

                domUtil.prototype.setValue({id: TAXFORM1SEC3BOX+'23amount', value: val_23});
            },
            triggers: [TAXFORM1SEC3BOX+'26amount']
        },
        taxform1sec3box25amount: {
            compute: () => {
                let val_25 = parseFloat(domUtil.prototype.getInputElementVal({id: TAXFORM1SEC3BOX+'25amount'}));
                domUtil.prototype.setValue({id: TAXFORM1SEC3BOX+'25amount', value: Math.floor(val_25/100)*100});
            },
            triggers: [TAXFORM1SEC3BOX+'25amount']
        },
        taxform1sec3box26amount: {
            compute: ()=> {
                let val_11 = parseFloat(domUtil.prototype.getInputElementVal({id: TAXFORM1SEC3BOX+'11amount'}));
                let val_22 = parseFloat(domUtil.prototype.getInputElementVal({id: TAXFORM1SEC3BOX+'22amount'}));
                let val_8 = parseFloat(domUtil.prototype.getInputElementVal({id: TAXFORM1SEC3BOX+'8amount'}));
                let val_12 = parseFloat(domUtil.prototype.getInputElementVal({id: TAXFORM1SEC3BOX+'12amount'}));
                let val_19 = parseFloat(domUtil.prototype.getInputElementVal({id: TAXFORM1SEC3BOX+'19amount'}));
                let val_23 = parseFloat(domUtil.prototype.getInputElementVal({id: TAXFORM1SEC3BOX+'23amount'}));

                let val_26 = (val_11+val_22)-(val_8+val_12+val_19+val_23);

                domUtil.prototype.setValue({id: TAXFORM1SEC3BOX+'26amount', value: val_26});
            }
        }
    };
});
