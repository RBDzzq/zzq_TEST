/**
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */
define([], () => {
    return {
        Type: {
            SALES: 'Sales',
            PURCHASES: 'Purchases'
        },
        TaxCategory: {
            MTC_TAXABLE: '1',
            MTC_NON_TAXABLE: '2',
            MTC_COMMON: '3'
        },
        TaxClassification: {
            TC_NON_TAXABLE: '2',
            TC_EXEMPT: '3',
            TC_10_STANDARD: '4',
            TC_8_REDUCED: '5',
            TC_3_LEGACY: '6',
            TC_5_LEGACY: '7',
            TC_8_LEGACY: '8',
            TC_SPECIAL_NON_TAX_SALES: '9',
            TC_OTHR_TF_10_STANDARD: '10',
            TC_OTHR_TF_8_REDUCED: '11',
            TC_OTHR_TF_8_LEGACY: '12',
            TC_OTHR_STP_10: '13',
            TC_OTHR_STP_8_LEGACY: '14'
        },
        Form: {
            DEDUCFORM1BOX: 'deducform1box',
            DEDUCFORM2BOX: 'deducform2box',
            DEDUCFORM3BOX: 'deducform3box',
            DEDUCFORM4BOX: 'deducform4box',
            TAXFORM1SEC3BOX: 'taxform1sec3box',
            TAXFORM2SEC3BOX: 'taxform2sec3box'
        },
        CalcMethod: {
            ITEMIZED: '1',
            PROPORTIONAL: '2'
        }
    };
});
