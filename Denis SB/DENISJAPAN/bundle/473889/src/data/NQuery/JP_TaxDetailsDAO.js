/**
 * Copyright (c) 2022, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define([
    "N/query",
    "N/record",
    'N/ui/serverWidget'],
    (query, record, widget)=>{

    class TaxDetailsDAO{
        constructor() {
            this.recordType = 'customrecord_jp_taxadjdetails';
            this.fields = {
                adjTransID  : {
                    id: 'custrecord_jp_adjtransid',
                    type: widget.FieldType.SELECT,
                    labelid : 'lbl_jp_adjtransid'
                },
                taxISLevel  : {
                    id: 'custrecord_jp_tottaxislevel',
                    type: widget.FieldType.CURRENCY,
                    labelid : 'lbl_jp_tottaxislevel'
                },
                taxStdRate  : {
                    id: 'custrecord_jp_tottaxstdrate',
                    type: widget.FieldType.CURRENCY,
                    labelid : 'lbl_jp_tottaxstdrate'
                },
                taxReducedRate : {
                    id: 'custrecord_jp_tottaxreducedrate',
                    type: widget.FieldType.CURRENCY,
                    labelid : 'lbl_jp_tottaxreducedrate'
                },
                taxStdRateSum  : {
                    id: 'custrecord_jp_tottaxstdratesum',
                    type: widget.FieldType.CURRENCY,
                    labelid : 'lbl_jp_tottaxstdratesum'
                },
                taxReducedRateSum : {
                    id: 'custrecord_jp_tottaxreducedratesum',
                    type: widget.FieldType.CURRENCY,
                    labelid : 'lbl_jp_tottaxreducedratesum'
                },
                diffStdRate : {
                    id: 'custrecord_jp_diffstdrate',
                    type: widget.FieldType.CURRENCY,
                    labelid : 'lbl_jp_diffstdrate'
                },
                diffReducedRate : {
                    id: 'custrecord_jp_diffreducedrate',
                    type: widget.FieldType.CURRENCY,
                    labelid: 'lbl_jp_diffreducedrate'
                },
                linkedIS : {
                    id: 'custrecord_jp_linkedis',
                    type: widget.FieldType.SELECT,
                    labelid : 'lbl_jp_linkedis'
                }
            }
        }


        getTaxDetails(invoiceSummaryId){

            let queryResult = null;

            if(invoiceSummaryId){
                let taxDetailsQuery = query.create({
                    type : this.recordType
                });

                let fieldKeys = Object.keys(this.fields);
                taxDetailsQuery.columns = fieldKeys.map( key =>
                    taxDetailsQuery.createColumn({fieldId: this.fields[key].id }) );

                taxDetailsQuery.condition = taxDetailsQuery.createCondition({
                    fieldId: this.fields.linkedIS.id,
                    operator: query.Operator.ANY_OF,
                    values: [invoiceSummaryId]
                });

                queryResult = taxDetailsQuery.run().asMappedResults();
            }

            return queryResult;
        }

        /**
         *  Similar to getTaxDetails function, only difference is that it only retrieves the id instead of all the
         *  columns.
         * @param invoiceSummaryId
         */
        retrieveTaxDetailsId(invoiceSummaryId){
            let result = null;

            if(invoiceSummaryId){
                let isQuery = query.create({ type: this.recordType});

                isQuery.columns = [isQuery.createColumn({fieldId: 'id'})];
                isQuery.condition = isQuery.and(
                    isQuery.createCondition({
                        fieldId: this.fields.linkedIS.id,
                        operator: query.Operator.ANY_OF,
                        values: invoiceSummaryId}),
                    isQuery.createCondition({
                        fieldId: 'isInactive',
                        operator: query.Operator.IS,
                        values: false
                    })
                );

                let qresult = isQuery.run().asMappedResults();
                result = (qresult && qresult[0]) ? qresult[0]['id'] : null
            }

            return result;
        }

        /**
         * Creates the Tax Details record instance that stores pertinent info. on tax adjustments.
         *
         * @param params object containing the info needed to create the Tax Adjustment, format is as follows:
         *     {
         *         'custrecord_jp_adjtransid' : 1,
         *         'custrecord_jp_tottaxislevel' : 0,
         *         'custrecord_jp_tottaxstdrate' : 0,
         *         'custrecord_jp_tottaxreducedrate' : 0,
         *         'custrecord_jp_tottaxstdratesum' : 0,
         *         'custrecord_jp_tottaxreducedratesum' : 0,
         *         'custrecord_jp_diffstdrate' : 0,
         *         'custrecord_jp_diffreducedrate' : 0,
         *         'custrecord_jp_linkedis' : 0
         *     }
         *
         *  @returns {integer} the id of the tax details record.
         *
         */
        createTaxDetailsRecord(data){
            let newRecId = null;

            if(data){
                try{
                    let newRecord = record.create({
                        type : this.recordType,
                        isDynamic : true
                    });

                    let dataKeys = Object.keys(data);
                    dataKeys.forEach((key)=>{
                       newRecord.setValue({fieldId: key, value: data[key]});
                    });

                    newRecId = newRecord.save();
                    log.debug('created '+ this.recordType, newRecId);
                }
                catch(e){
                    log.error('createTaxDetailsRecord', JSON.stringify(e));
                }
            }

            return newRecId;
        }
    }

    return TaxDetailsDAO;

})