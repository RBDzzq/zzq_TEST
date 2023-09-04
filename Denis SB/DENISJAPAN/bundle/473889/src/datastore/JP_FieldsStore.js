/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */
define(['N/record'],  (record) =>{


    function JP_FieldsStore(){

            let AR_ADJ_CREDIT_IS_TYPE = 'customsale_jp_loc_cred_bal_adj';
            let AR_ADJ_DEBIT_IS_TYPE = 'customsale_jp_loc_debit_bal_adj';

            // Transaction Category values are those available in the 'Applies To' tab of a field
            // Each checkbox in that page should have one key-value pair here
            this.TransactionCategory = {
                SALE: 'sale',
                PURCHASE: 'purchase',
                EXPENSE_REPORT: 'expensereport',
                CUSTOMER_PAYMENT: 'customerpayment',
                JOURNAL: 'journal',
                CUSTOM: 'custom'
            };

            // This mapping is used to identify what transaction types are under each transaction category
            // This is useful when identifying fields that are applied to a transaction category but shouldn't
            // show on a specific transaction type
            this.TransactionCategoryMap = {};
            this.TransactionCategoryMap[this.TransactionCategory.SALE] = [
                record.Type.SALES_ORDER,
                record.Type.CREDIT_MEMO,
                record.Type.INVOICE
            ];
            this.TransactionCategoryMap[this.TransactionCategory.PURCHASE] = [
                record.Type.VENDOR_BILL,
                record.Type.VENDOR_CREDIT,
                record.Type.PURCHASE_ORDER
            ];
            this.TransactionCategoryMap[this.TransactionCategory.EXPENSE_REPORT] = [
                record.Type.EXPENSE_REPORT
            ];
            this.TransactionCategoryMap[this.TransactionCategory.CUSTOMER_PAYMENT] = [
                record.Type.CUSTOMER_PAYMENT,
                record.Type.CUSTOMER_DEPOSIT
            ];
            this.TransactionCategoryMap[this.TransactionCategory.JOURNAL] = [
                record.Type.JOURNAL_ENTRY
            ];
            this.TransactionCategoryMap[this.TransactionCategory.CUSTOM] = [
                AR_ADJ_CREDIT_IS_TYPE,
                AR_ADJ_DEBIT_IS_TYPE
            ];

            // List of Japan-specific fields
            this.fields = [{
                id: 'custentity_jp_due_date_adjustment',
                records: [
                    record.Type.CUSTOMER,
                    record.Type.EMPLOYEE,
                    record.Type.VENDOR
                ]
            },
                {
                    id: 'custentity_jp4030_due_day',
                    records: [record.Type.CUSTOMER]
                },
                {
                    id: 'custentity_jp4030_due_month',
                    records: [record.Type.CUSTOMER]
                },
                {
                    id: 'custentity_4392_useids',
                    records: [record.Type.CUSTOMER]
                },
                {
                    id: 'custentity_jp_duedatecompute',
                    records : [
                        record.Type.CUSTOMER,
                        record.Type.EMPLOYEE,
                        record.Type.VENDOR
                    ]
                },
                {
                    id: 'custbody_4392_includeids',
                    appliedTo: [
                        this.TransactionCategory.SALE,
                        this.TransactionCategory.CUSTOMER_PAYMENT,
                        this.TransactionCategory.JOURNAL,
                        this.TransactionCategory.CUSTOM
                    ],
                    records: [
                        record.Type.INVOICE,
                        record.Type.CREDIT_MEMO,
                        record.Type.SALES_ORDER,
                        record.Type.JOURNAL_ENTRY,
                        record.Type.CUSTOMER_DEPOSIT,
                        AR_ADJ_CREDIT_IS_TYPE,
                        AR_ADJ_DEBIT_IS_TYPE
                    ]
                },
                {
                    id: 'custbody_jp_bank_acct_info',
                    appliedTo: [
                        this.TransactionCategory.SALE,
                        this.TransactionCategory.PURCHASE
                    ],
                    records: [
                        record.Type.VENDOR_BILL,
                        record.Type.INVOICE,
                        record.Type.CREDIT_MEMO,
                        record.Type.SALES_ORDER
                    ]
                },
                {
                    id: 'custbody_suitel10n_inv_closing_date',
                    appliedTo: [
                        this.TransactionCategory.SALE,
                        this.TransactionCategory.PURCHASE,
                        this.TransactionCategory.EXPENSE_REPORT,
                        this.TransactionCategory.CUSTOM
                    ],
                    records: [
                        record.Type.VENDOR_BILL,
                        record.Type.EXPENSE_REPORT,
                        record.Type.INVOICE,
                        AR_ADJ_CREDIT_IS_TYPE,
                        AR_ADJ_DEBIT_IS_TYPE
                    ]
                },
                {
                    id: 'custbody_jp_invoice_summary_due_date',
                    appliedTo: [this.TransactionCategory.SALE],
                    records: [record.Type.CREDIT_MEMO]
                },
                {
                    id: 'custbody_suitel10n_jp_ids_date',
                    appliedTo: [
                        this.TransactionCategory.SALE,
                        this.TransactionCategory.CUSTOM
                    ],
                    records: [
                        record.Type.CREDIT_MEMO,
                        record.Type.SALES_ORDER
                    ]
                },
                {
                    id: 'custbody_5185_idslink',
                    appliedTo: [this.TransactionCategory.SALE],
                    records: [
                        record.Type.CREDIT_MEMO,
                        record.Type.INVOICE,
                        record.Type.SALES_ORDER
                    ]
                },
                {
                    id: 'custbody_5185_idsnumber',
                    appliedTo: [this.TransactionCategory.SALE],
                    records: [
                        record.Type.CREDIT_MEMO,
                        record.Type.INVOICE,
                        record.Type.SALES_ORDER
                    ]
                },
                {
                    id: 'custbody_suitel10n_jp_ids_rec',
                    appliedTo: [this.TransactionCategory.SALE],
                    records: [
                        record.Type.CREDIT_MEMO,
                        record.Type.INVOICE,
                        record.Type.SALES_ORDER
                    ]
                },
                {
                    id: 'custentity_jp_posubcontract_act',
                    records: [
                        record.Type.VENDOR
                    ]
                },
                {
                    id: 'custentity_jp_vendtaxexempent',
                    records: [
                        record.Type.VENDOR
                    ]
                },
                {
                    id: 'custbody_jp_message',
                    appliedTo: [
                        this.TransactionCategory.SALE,
                        this.TransactionCategory.PURCHASE
                    ],
                    records: [
                        record.Type.SALES_ORDER,
                        record.Type.INVOICE,
                        record.Type.PURCHASE_ORDER
                    ]
                },
                {
                    id: 'custbody_jp_deliverydate',
                    appliedTo: [
                        this.TransactionCategory.SALE,
                        this.TransactionCategory.PURCHASE
                    ],
                    records: [
                        record.Type.SALES_ORDER,
                        record.Type.PURCHASE_ORDER
                    ]
                },
                {
                    id: 'custbody_jp_estimateinfo',
                    appliedTo: [this.TransactionCategory.PURCHASE],
                    records: [record.Type.PURCHASE_ORDER ]
                },
                {
                    id: 'custbody_jp_journal_type',
                    appliedTo: [this.TransactionCategory.JOURNAL],
                    records: [record.Type.JOURNAL_ENTRY]
                },
                {
                    id: 'custentity_jp_taxinvchckbox',
                    records: [record.Type.CUSTOMER]
                },
                {
                    id: 'custbody_jp_vendtaxexempent',
                    appliedTo: [this.TransactionCategory.PURCHASE],
                    records: [
                        record.Type.VENDOR_BILL,
                        record.Type.VENDOR_CREDIT,
                        record.Type.PURCHASE_ORDER
                    ]
                },
                {
                    id: 'custentity_jp_vendtaxregnum',
                    records: [record.Type.VENDOR]
                },
                {
                    id: 'custbody_jp_vendtaxregnum',
                    appliedTo: [this.TransactionCategory.PURCHASE],
                    records: [
                        record.Type.VENDOR_BILL,
                        record.Type.VENDOR_CREDIT,
                        record.Type.PURCHASE_ORDER
                    ]
                }];

            this.pdfFormats = {
                custname_closingdate : 1, //  option available and default if individual pdf is checked)
                is_recordnumber : 2,
                is_recordnumber_closingdate : 3,   // default if individual pdf unchecked
                statementdate_batchid : 4,
                statementdate_subsidiary_batchid : 5,
                statementdate_istext_ISnumber : 6
            }
        }

        /**
         * Get the transaction category using transaction record type
         *
         * @param {String} recordType Transaction record type
         * @returns {String}
         */
        JP_FieldsStore.prototype.getTransactionCategory = function(recordType){
            let tranCategory = '';
            for (let category in this.TransactionCategoryMap) {
                if (this.TransactionCategoryMap.hasOwnProperty(category)) {
                    if (this.TransactionCategoryMap[category].indexOf(recordType) >= 0) {
                        tranCategory = category;
                        break;
                    }
                }
            }
            return tranCategory;
        }


        /**
         * Returns an object of containing display status of the fields
         *
         * @param {Object} recordObj record parameters
         * @returns {Object}
         */
        JP_FieldsStore.prototype.getFieldsToShowHide = function(recordObj){
            let fieldsObject = {};
            let JAPAN = "JP";
            let subsidiariesCountry = recordObj.countries || [];
            let tranCategory = this.getTransactionCategory(recordObj.type);

            let displayField = subsidiariesCountry.indexOf(JAPAN) >= 0;
            for (let field in this.fields) {
                let fieldObj = this.fields[field];
                let isCorrectType = fieldObj['records'].indexOf(recordObj.type) >= 0;
                if (fieldObj.appliedTo) {

                    let appliedToTransaction = fieldObj.appliedTo.indexOf(tranCategory) >= 0;
                    if (appliedToTransaction) {
                        fieldsObject[fieldObj.id] = {
                            display: displayField && isCorrectType
                        }
                    }

                } else if (isCorrectType) {
                    fieldsObject[fieldObj.id] = {
                        display: displayField
                    };
                }
            }
            return fieldsObject;
        }

    return JP_FieldsStore;

});
