/**
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define([
    "./JP_BaseDAO",
    "N/search",
    "N/record"
], (
    BaseDAO,
    search,
    record
) =>{

    function NexusDAO(props){
            BaseDAO.call(this);
            this.fields = {};
            this.searchId = '';
            this.recordType = record.Type.NEXUS;
        }

        util.extend(NexusDAO.prototype, BaseDAO.prototype);

    NexusDAO.prototype.retrieveNexusByCountry=function(country) {
            let nexus;

            let filters = [
                {name:'isinactive', operator:search.Operator.IS, values:"F"},
                {name:'country', operator:search.Operator.IS, values:country}
            ];

            let nexusSearch = this.createSearch();
            nexusSearch.filters = filters;

            let iterator = this.getResultsIterator(nexusSearch);
            if (iterator.hasNext()){
                nexus = iterator.next();
            }

            return nexus;
        };

    NexusDAO.prototype.createNexus=function() {
            let nexusRec = record.create({type: record.Type.NEXUS});
            nexusRec.setValue({fieldId:"country", value:"JP"});
            return nexusRec.save();
        }

    return NexusDAO;

});
