/**
 * Copyright (c) 2020, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define(["N/query"],

    (query) =>{

        class NSubsidiaryDAO {

            constructor() {
                this.name = 'NSubsidiaryDAO';
                this.PRINTED_PO_FOLDER_ID = 'custrecord_jp_loc_sub_printed_po';
                this.HOLIDAY_CHECKING_ID = 'custrecord_suitel10n_jp_sub_use_holiday';
                this.INVOICE_SUMMARY_FOLDER_ID = 'custrecord_jp_loc_invsum_folder';
                this.DOCTITLE_INV = 'custrecord_jp_pdf_title_invoice';
                this.DOCTITLE_SO = 'custrecord_jp_pdf_title_so';
                this.DOCTITLE_PO = 'custrecord_jp_pdf_title_po';
                this.DOCTITLE_JE = 'custrecord_jp_pdf_title_journal';
                this.DOCTITLE_CM = 'custrecord_pdf_memo_title';
                this.GREETING_INV = 'custrecord_jp_pdf_greet_invoice';
                this.GREETING_SO = 'custrecord_jp_pdf_greet_so';
                this.GREETING_PO = 'custrecord_jp_pdf_greet_po';
                this.GREETING_CM = 'custrecord_pdf_memo_greet';
                this.TAXREGNO    = 'custrecord_jp_loc_tax_reg_number';
                this.AR_DEBIT_ADJ_ITEM = 'custrecord_jp_ar_deb_adj_item_ow';
                this.DLC_DEPARTMENT = 'custrecord_jp_department';
                this.DLC_LOCATION = 'custrecord_jp_location';
                this.DLC_CLASS = 'custrecord_jp_class';

                //mapping of the fields and their value,
                //also acts as storage for the field names, so we define them in one place.
                this.fields = {
                    country: {id: 'country', val: ''},
                    printFolder: {id: this.PRINTED_PO_FOLDER_ID, val: ''},
                    useHolidayChecking: {id: this.HOLIDAY_CHECKING_ID, val: false},
                    invSummaryFolder: {id: this.INVOICE_SUMMARY_FOLDER_ID, val: ''},
                    invDocTitle: {id: this.DOCTITLE_INV, val: '', isUI : true},
                    poDocTitle: {id: this.DOCTITLE_PO, val: '', isUI : true},
                    soDocTitle: {id: this.DOCTITLE_SO, val: '', isUI : true},
                    jeDocTitle: {id: this.DOCTITLE_JE, val: '', isUI : true},
                    invGreeting: {id: this.GREETING_INV, val: '', isUI : true},
                    soGreeting: {id: this.GREETING_SO, val: '', isUI : true},
                    poGreeting: {id: this.GREETING_PO, val: '', isUI : true},
                    cmDocTitle : { id: this.DOCTITLE_CM, val: '', isUI : true},
                    cmGreeting : {id: this.GREETING_CM, val: '', isUI : true},
                    taxRegNo : {id: this.TAXREGNO, val: ''},
                    arDebAdjItem : {id: this.AR_DEBIT_ADJ_ITEM, val: ''},
                    dlc_department : {id: this.DLC_DEPARTMENT, val: ''},
                    dlc_location : {id: this.DLC_LOCATION, val: ''},
                    dlc_class : {id: this.DLC_CLASS, val: ''}
                };
                this.recordType = query.Type.SUBSIDIARY;
            }

            /**
             * Functionn getData => gets the subsidiary related data based on the subsidiary id passed.
             * @param id - Subsidiary id.
             * @param {boolean} initialData - optimization, the query affect non-print functions, so for non-print
             *      functions we only retrieve 2 columns, only when we do the actual printing do we query all the
             *      columns needed.
             */
           getData(id, initialData){

               log.debug('NSubsidiaryDAO getData parameters', "id " +id+" initialData " + initialData);
                if(id){
                    let myQuery = query.create({
                        type: this.recordType
                    });

                    this.addColumns(myQuery, initialData);

                    myQuery.condition = myQuery.createCondition({
                        fieldId: 'id',
                        operator: query.Operator.ANY_OF,
                        values: [id]
                    });

                    let resultSet = myQuery.run();
                    let mappedResult = resultSet.asMappedResults();

                    //map to the result to the object
                    if (mappedResult && mappedResult[0]){
                        this.fields.country.val = mappedResult[0].country;

                        if(!initialData) {
                            this.fields.printFolder.val = mappedResult[0][this.PRINTED_PO_FOLDER_ID];
                            this.fields.useHolidayChecking.val = mappedResult[0][this.HOLIDAY_CHECKING_ID];
                            this.fields.invSummaryFolder.val = mappedResult[0][this.INVOICE_SUMMARY_FOLDER_ID];
                            this.fields.invGreeting.val = mappedResult[0][this.GREETING_INV];
                            this.fields.soGreeting.val = mappedResult[0][this.GREETING_SO];
                            this.fields.poGreeting.val = mappedResult[0][this.GREETING_PO];
                            this.fields.invDocTitle.val = mappedResult[0][this.DOCTITLE_INV];
                            this.fields.poDocTitle.val = mappedResult[0][this.DOCTITLE_PO];
                            this.fields.soDocTitle.val = mappedResult[0][this.DOCTITLE_SO];
                            this.fields.jeDocTitle.val = mappedResult[0][this.DOCTITLE_JE];
                            this.fields.cmDocTitle.val = mappedResult[0][this.DOCTITLE_CM];
                            this.fields.cmGreeting.val = mappedResult[0][this.GREETING_CM];
                            this.fields.taxRegNo.val = mappedResult[0][this.TAXREGNO];
                            this.fields.arDebAdjItem.val = mappedResult[0][this.AR_DEBIT_ADJ_ITEM];
                            this.fields.dlc_department.val = mappedResult[0][this.DLC_DEPARTMENT];
                            this.fields.dlc_location.val = mappedResult[0][this.DLC_LOCATION];
                            this.fields.dlc_class.val = mappedResult[0][this.DLC_CLASS];
                        }
                    }
                }
                else{
                    this.fields.country.val = 'JP';
                }
                log.debug('get data results: ', JSON.stringify(this.fields));
            };

            /**
             * Functionn getData => gets the subsidiary related data based on the list of subsidiary ids passed.
             * @param {array} id - array of Subsidiary ids.
             * @param {boolean} initialData - for optimization, set to true to only retrieve country.
             * if false, will retrieve additional subsidiary related data
             */
            getMultipleData(id, initialData){
                log.debug('JP_NSubsidiaryDAO.getMultipleData parameters', "id " + JSON.stringify(id) + " initialData " + initialData);
                if(id){
                    let myQuery = query.create({
                        type: this.recordType
                    });

                    this.addColumns(myQuery, initialData);

                    myQuery.condition = myQuery.createCondition({
                        fieldId: 'id',
                        operator: query.Operator.ANY_OF,
                        values: id
                    });

                    let resultSet = myQuery.run();
                    let mappedResult = resultSet.asMappedResults();

                    log.debug('JP_NSubsidiaryDAO.getMultipleData result: ', JSON.stringify(mappedResult));

                    if (mappedResult.length > 0){
                        return mappedResult;
                    }
                }
                return [];
            }

            addColumns(myQuery, initialData){
                let columns = [
                    myQuery.createColumn({fieldId: 'id'}),
                    myQuery.createColumn({fieldId: this.fields.country.id})
                ];

                if(!initialData){
                    let flds = Object.keys(this.fields);
                    flds.shift(); //remove country since it is already included above.

                    flds.forEach((fld)=>{
                        if(this.fields[fld].isUI){
                            columns.push(myQuery.createColumn({fieldId: this.fields[fld].id,
                                context:query.FieldContext.DISPLAY}) );
                        }
                        else{
                            columns.push(myQuery.createColumn({fieldId: this.fields[fld].id}));
                        }
                    });
                }
                myQuery.columns = columns;
            }
        }

        return NSubsidiaryDAO;
    });
