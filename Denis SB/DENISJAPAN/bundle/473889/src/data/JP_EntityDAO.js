/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define(["./JP_BaseDAO", "N/search", "N/runtime", "./JP_PaymentTermDAO", 'N/record'],
    (BaseDAO, search, runtime, PaymentTermDAO, record) => {

	function EntityDAO(params){
            BaseDAO.call(this);
            this.fields = {
                computeDueDate: 'custentity_jp_duedatecompute',
                includeIS: 'custentity_4392_useids',
                taxISLaw : 'custentity_jp_taxinvchckbox',
                coreTerms : 'terms',
                taxExemptEntity: 'custentity_jp_vendtaxexempent'
            };
            this.searchId = '';
            this.recordType = (params && params.type) ? params.type : search.Type.ENTITY;
        }

        util.extend(EntityDAO.prototype, BaseDAO.prototype);

        EntityDAO.prototype.retrieveEntityById = function(id, includeInactive=false) {
            let entityModel = {};
            
            if(id){
                let columns = [{name:'custentity_jp_due_date_adjustment'}];

                if (this.recordType === search.Type.ENTITY || this.recordType === search.Type.CUSTOMER) {
                    columns.push({name: this.fields.includeIS});
                }

                columns.push({name: this.fields.computeDueDate});

                if (this.recordType === record.Type.CUSTOMER) {
                    columns.push({name: this.fields.taxISLaw});
                }

                if (this.recordType === record.Type.VENDOR) {
                    columns.push({name: this.fields.taxExemptEntity});
                }

                if([record.Type.CUSTOMER, record.Type.VENDOR].indexOf(this.recordType) !== -1){
                    //only customer and vendor related transactions have core terms.
                    columns.push({name: this.fields.coreTerms});
                }

                let filters = [
                    {name:'internalid', operator:search.Operator.IS, values:id}
                ];

                if(!includeInactive){
                    filters.push({name:'isinactive', operator:search.Operator.IS, values:"F"});
                }

                let isOW = runtime.isFeatureInEffect("SUBSIDIARIES");
                if (isOW) {
                    columns.push({name:'subsidiary'});
                }

                let entitySearch = this.createSearch();
                entitySearch.filters = filters;
                entitySearch.columns = columns;

                let iterator = this.getResultsIterator(entitySearch);

                if (iterator.hasNext()){
                    let result = iterator.next();
                    log.debug('JP_EntityDAO result',JSON.stringify(result));

                    entityModel.id = result.id;
                    entityModel.entityType = result.recordType;
                    entityModel.dueDateAdj = result.getValue({name:"custentity_jp_due_date_adjustment"});
                    let isEntityAndCustomer = (this.recordType === search.Type.ENTITY ||
                        this.recordType === search.Type.CUSTOMER)
                    entityModel.useInvoiceSummary =  isEntityAndCustomer ?
                        result.getValue({name: this.fields.includeIS}) : false;
                    entityModel.useTaxISLaw = isEntityAndCustomer ?
                        result.getValue({name: this.fields.taxISLaw}) : false;

                    let isEntityAndVendor = (this.recordType === search.Type.ENTITY ||
                        this.recordType === search.Type.VENDOR);
                    entityModel.taxExemptEntity = isEntityAndVendor ?
                        result.getValue({name: this.fields.taxExemptEntity}) : false;

                    entityModel.computeDueDate = result.getValue({name: this.fields.computeDueDate});
                    entityModel.coreTerms = result.getValue({name: this.fields.coreTerms});

                    if (isOW) {
                        entityModel.subsidiary = result.getValue({name:"subsidiary"});
                    }

                    let paymentTermsDao = new PaymentTermDAO();
                    entityModel.terms = paymentTermsDao.getTermsByEntity(id, entityModel.entityType);
                }
            }

            log.debug('JP_EntityDAO entityModel',JSON.stringify(entityModel));
            return entityModel;
        }

        EntityDAO.prototype.getSubsidiary=function(id) {
            if(runtime.isFeatureInEffect('SUBSIDIARIES')){
                let searchResult = search.lookupFields({
                    type: search.Type.ENTITY,
                    id: id,
                    columns: 'subsidiary'
                });
                return searchResult['subsidiary'][0].value;
            }else{
                return '';
            }
        }

        EntityDAO.prototype.autoComputeDueDate=function(id){
            let lookupResult = search.lookupFields({
                type: search.Type.ENTITY,
                id: id,
                columns : this.fields.computeDueDate
            });

            return (lookupResult && lookupResult[this.fields.computeDueDate]) ?
                lookupResult[this.fields.computeDueDate] : false;
        }

    return EntityDAO;

});
