/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define(['N/search', 'N/record', '../lib/JP_SearchIterator'],
    (search, record, SearchIterator) =>{

    function BaseDAO() {
        this.searchId = '';
        this.fields = {};
        this.columns = [];
        this.filters = [];
        this.settings = [];
        this.recordType = '';
    }


        /**
         * Creates the search object
         *
         * @returns {Object}
         */
        BaseDAO.prototype.createSearch = function(){

            let searchObj;

            if (this.searchId) {

                searchObj = search.load({
                    id: this.searchId
                });

            } else {
                searchObj = search.create({
                    type: this.recordType,
                    columns: this.columns,
                    filters: this.filters,
                    settings: this.settings
                });
            }

            return searchObj;

        };


        /**
         * Creates the search object from saved search
         *
         * @returns {Object}
         */
        BaseDAO.prototype.loadSearch = function(savedSearchId){
            return search.load({
                id: savedSearchId
            });
        };

        /**
         * Executes saved search ans returns results
         *
         * @returns Array<{Object}>
         */
        BaseDAO.prototype.executeSavedSearch = function(params){
            let srch = this.loadSearch(params.searchId);

            if (params.filterExpression) {
                srch.filterExpression = params.filterExpression;
            }

            if (params.filters) {
                srch.filters = srch.filters.concat(params.filters);
            }

            let iterator = this.getResultsIterator(srch);

            let results = [];

            while (iterator.hasNext()){
                let result = iterator.next();
                results.push(result);
            }

            return results;
        };


        /**
         * Returns the Results Iterator for specified object
         *
         * @returns {Object}
         */
        BaseDAO.prototype.getResultsIterator = function(searchObject){
            return new SearchIterator(searchObject);
        };


        /**
         * Get Sublist Values of record
         *
         * @param {Object} params Parameter Object contains record/recordId, sublistId, array of fields
         * @returns {Object}
         */
        BaseDAO.prototype.getSublistValues = function(params){

            let sublistValues = [];
            let recordObj = params.record;

            if (!recordObj.hasOwnProperty('id')) {
                recordObj = record.load({
                    type: this.recordType,
                    id: params.record
                });
            }

            let lineCount = recordObj.getLineCount({
                sublistId: params.sublistId
            });

            if (lineCount > 0) {
                for (let i = 0; i < lineCount; i++) {
                    let resultLine = {};
                    util.each(params.fields, (field) => {
                        resultLine[field] = recordObj.getSublistValue({
                            sublistId: params.sublistId,
                            fieldId: field,
                            line: i
                        });
                    });

                    sublistValues.push(resultLine);

                }
            }

            return sublistValues;

        };

        /**
         * Updates the record given a values Object
         *
         * @param params.id {Integer} Id of the record to update
         * @param params.values {Object} values to set to the record
         */
        BaseDAO.prototype.submitFields = function(params){
            record.submitFields({
                type: this.recordType,
                id: params.id,
                values: params.values
            })
        };


        BaseDAO.prototype.getRecordDuplicates = function(params){
            let columns = [params.field];
            let filterExpression = [];
            filterExpression.push([params.field, search.Operator.IS, params.value]);
            filterExpression.push("OR");
            filterExpression.push([params.field, search.Operator.STARTSWITH, params.value+" [%]"]);

            let srch = this.createSearch();
            srch.filterExpression = filterExpression;
            srch.columns = columns;
            let iterator = this.getResultsIterator(srch);

            let records = [];
            while (iterator.hasNext()) {
                records.push(iterator.next());
            }

            return records;
        };

        BaseDAO.prototype.getRecordLabelSuffix = function(params){
            let dupRecords = params.duplicateRecords;
            let field = params.field;
            let existingNumericSuffixes = [];

            for(let i = 0; i < dupRecords.length; i++) {
                let label = dupRecords[i].getValue(field);
                let suff = label.substr(label.lastIndexOf("[")+1);
                suff = suff.substr(0,suff.lastIndexOf("]"));
                if(parseInt(suff, 10)) existingNumericSuffixes.push(parseInt(suff, 10));
            }

            let newSuffix;
            if (existingNumericSuffixes.length == 0 && dupRecords.length > 0) {
                /* on creation of first duplicate */
                newSuffix = "[1]";
            } else if (existingNumericSuffixes.length > 0) {
                newSuffix = Math.max.apply(null,existingNumericSuffixes) + 1;
                newSuffix ="["+newSuffix+"]";
            }

            return newSuffix;
        };

        BaseDAO.prototype.parseTaxDetails = function(result){
            let parsedResult = null;
            if(result){
                parsedResult = result.map((res)=> {
                    return {
                        id: res.getValue({ name: "internalid", join:'taxItem', summary: search.Summary.GROUP}),
                        name: res.getValue({
                            name: 'name', join: 'taxItem',
                            summary: search.Summary.GROUP
                        }),
                        rate: parseFloat(res.getValue({
                            name: 'rate',
                            join: 'taxItem',
                            summary: search.Summary.GROUP
                        })),
                        netamountnotax: parseFloat(res.getValue({
                            name: 'netamountnotax',
                            summary: search.Summary.SUM
                        })),
                        taxamount: parseFloat(res.getValue({
                            name: 'taxamount',
                            summary: search.Summary.SUM
                        }))
                    }
                });
            }

            return parsedResult;
        }

    return BaseDAO;

});
