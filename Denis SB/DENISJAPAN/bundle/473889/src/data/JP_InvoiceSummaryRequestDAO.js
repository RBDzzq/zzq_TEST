/**
 * Copyright (c) 2020, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define(["./JP_BaseDAO",
    "N/search",
    "N/runtime",
    "N/record",
    "N/task",
    "./JP_SubsidiaryDAO",
    "./JP_CompanyDAO",
    "../datastore/JP_ListStore",
    "../datastore/JP_RecordTypes"
    ],
    (BaseDAO, search,
             runtime, record, task, SubsidiaryDAO, CompanyDAO,
             ListStore, JP_Types) => {

    function JP_ISRequestDAO(props){
            BaseDAO.call(this);
            this.recordType = JP_Types.REQUEST_RECORD;

            //mapping of the fields, acts as storage for the field names, so we define them in one place.
            this.fields = {
                id: "internalid",
                status : "custrecord_jp_loc_gen_req_status",
                closingDate : "custrecord_jp_loc_gen_req_cd",
                subsidiary: "custrecord_jp_loc_gen_req_sub",
                customerFilter : "custrecord_jp_loc_gen_req_cust",
                includeOverdue : "custrecord_jp_loc_gen_req_overdue",
                statementDate : "custrecord_jp_loc_gen_req_sd",
                generationParameters : "custrecord_jp_loc_gen_req_params",
                errorFlag: "custrecord_jp_loc_gen_req_err_flag",
                triggerFlag: "custrecord_jp_loc_gen_req_trig_flag",
                includeNoTransaction : "custrecord_jp_loc_gen_req_no_trans",
                currentTaskId : "custrecord_jp_loc_gen_req_task_id",
                customerSavedSearch : "custrecord_jp_loc_gen_req_savedsearch",
                errorDetail: "custrecord_jp_loc_gen_req_err_detail",
                lastRequestRun : "custrecord_jp_loc_gen_req_lastrun",
                owner : 'owner', //needed when sending notification emails.
                pdfSetting : 'custrecord_jp_loc_pdfpercust_setting',
                dateCreated : 'created',
                hierarchyid : 'custrecord_jp_loc_hierarchy_id'
            };
            this.record = null; //where we store the loaded record.

            //needed for the getBatchesForEmail function
            //perhaps this should be moved to the batchDAO.
            this.batchRecord = JP_Types.BATCH_RECORD;
            this.batchFields = {
                id: "internalid",
                document : "custrecord_suitel10n_jp_ids_doc",
                status : "custrecord_suitel10n_jp_ids_gen_b_stat",
                requestParent : "custrecord_japan_loc_parent_request",
                customerFilter : "custrecord_suitel10n_jp_ids_su_cust",
                generationParams : "custrecord_suitel10n_jp_ids_su_params",
                subsidiary: "custrecord_suitel10n_jp_ids_su_sub",
                errorFlag: "custrecord_suitel10n_jp_ids_errorflag",
                errorDetail: "custrecord_suitel10n_jp_ids_err_detail"
            }

            this.batchData = null;

            //file related variables
            this.fileFields = {
                name : 'name',
                url : 'url'
            };
            this.fileAttributes = null;

            this.generationStat = {
                generated : 0,
                total : 0
            };

            this.STATUS = new ListStore().BATCH_STATUS;
        }

        util.extend(JP_ISRequestDAO.prototype, BaseDAO.prototype);

        /**
         * checkIfFailedRequestExists searches for a request record with the same parameters
         * and has an ERROR status
         *
         * @param parameters {object} IS generation parameters
         */
        JP_ISRequestDAO.prototype.checkIfFailedRequestExists=function(parameters) {
            let isOW = runtime.isFeatureInEffect('SUBSIDIARIES');

            let closingDate = parameters.closingDate;
            let subsidiary = parameters.subsidiary;
            let customer = parameters.customer;

            let filters = [];
            let columns = [];
            let requestId;

            if (isOW) {
                filters.push({name: this.fields.subsidiary, operator:search.Operator.ANYOF, values: subsidiary});
            }

            if (customer) {
                filters.push({name: this.fields.customerFilter, operator:search.Operator.ANYOF, values: customer});
            }

            filters.push({name: this.fields.closingDate, operator:search.Operator.ON, values: closingDate});
            columns.push({name: this.fields.status});

            let srch = this.createSearch();
            srch.filters = filters;
            srch.columns = columns;
            let iterator = this.getResultsIterator(srch);

            while (iterator.hasNext()){
                let result = iterator.next();
                let id = result.id;
                let status = result.getValue({name: this.fields.status});

                if (status === this.STATUS.ERROR.toString()) {
                    requestId = id;
                    break;
                }
            }

            return requestId;
        };

        /**
         * getData loads the request record given the parameter id.
         * assigns the result to this.record, otherwise it remains null
         *
         * @param recordId {int} id of the request record who's data we want to load
         */
        JP_ISRequestDAO.prototype.getData=function(recordId){
            let loader = this.createSearch();
            let columns = [];

            for(let field in this.fields){
                columns.push({name: this.fields[field]});
            }

            loader.columns = columns;
            loader.filters = [ {name:this.fields.id, operator:search.Operator.ANYOF, values:[recordId]} ];

            this.record = {};
            loader.run().each((rec)=>{
                for(let fieldKey in this.fields){
                    this.record[this.fields[fieldKey]] = rec.getValue({name: this.fields[fieldKey]});
                }
            });
        };

        /**
         * Retrieve field values to be displayed on the IS Generation Status SU
         *
         * @param settings {obj} Contains sort and display filters
         * @returns {obj} Key-value pairs of batch field ids and values
         */
        JP_ISRequestDAO.prototype.getRequestData=function(settings){

            let requestSearch = search.create({ type : this.recordType });

            let searchFields = [
                this.fields.owner,
                this.fields.dateCreated,
                this.fields.closingDate,
                this.fields.subsidiary,
                this.fields.customerFilter,
                this.fields.customerSavedSearch,
                this.fields.includeNoTransaction,
                this.fields.includeOverdue,
                this.fields.generationParameters,
                this.fields.status,
                this.fields.lastRequestRun,
                this.fields.id
            ];

            requestSearch.columns = [];
            searchFields.forEach((column)=>{
                if(this.fields.closingDate === column){
                    requestSearch.columns.push(search.createColumn({
                        name: column,
                        sort : search.Sort.ASC
                    }));
                }
                else{
                    requestSearch.columns.push(search.createColumn({name: column}));
                }
            });

            requestSearch.filterExpression = [this.fields.status, search.Operator.ANYOF, settings.statusFilter];
            let iterator = this.getResultsIterator(requestSearch);
            let requests = [];

            while(iterator.hasNext()){
                let request = iterator.next();
                let tmp = {};

                searchFields.forEach((column)=>{
                    let getTexts = [
                        this.fields.customerFilter,
                        this.fields.owner,
                        this.fields.subsidiary
                    ];
                    let getBoth = [this.fields.status];
                    if(getTexts.indexOf(column) !== -1){
                        tmp[column] = request.getText({name: column});
                    }
                    else if(getBoth.indexOf(column) !== -1){
                        tmp[column] = {
                            text: request.getText({name: column}),
                            value: request.getValue({name: column})
                        }
                    }
                    else{
                        tmp[column] = request.getValue({name: column});
                    }

                });
                requests.push(tmp);
            }

            return requests;
        }

        /**
         * getBatchesForEmail loads child batch records linked to the request record.
         * it then gets the files of the generated pdfs linked to the batches
         * gets the filename and url link that will be used in the email notification.
         *
         * @param requestId {int} id of the request record who's data we want to load
         */
        JP_ISRequestDAO.prototype.getBatchesForEmail=function(requestId){
            this.getChildBatches(requestId);

            let fileIds = this.batchData.map((batch)=>{
                return batch[this.batchFields.document];
            });

            //get the file attributes
            let fileSearch = search.create({type: 'file'});

            fileSearch.columns = [{name: this.fileFields.name}, {name: this.fileFields.url}];
            fileSearch.filters = [{name:"internalid", operator:search.Operator.ANYOF, values: fileIds}];

            let fileIterator = this.getResultsIterator(fileSearch);
            this.fileAttributes = [];

            while(fileIterator.hasNext()){
                let currFile = fileIterator.next();

                this.fileAttributes.push({
                    file : currFile.getValue({name: this.fileFields.name}),
                    url : currFile.getValue({name: this.fileFields.url})
                });
            }
        };

        /**
         * getBatchesForEmail loads child batch records linked to the request record.
         * it then gets the files of the generated pdfs linked to the batches
         * gets the filename and url link that will be used in the email notification.
         *
         * @param requestId {int} id of the request record who's data we want to load
         */
        JP_ISRequestDAO.prototype.getChildBatches=function(requestId){
            let batchQuery = search.create({
                type : this.batchRecord
            });

            let columns = [];
            for(let field in this.batchFields){
                columns.push({name: this.batchFields[field]});
            }

            batchQuery.columns = columns;
            batchQuery.filters = [
                {name:this.batchFields.requestParent, operator:search.Operator.ANYOF, values:[requestId]}
            ];

            let iterator = this.getResultsIterator(batchQuery);
            this.batchData = [];

            while (iterator.hasNext()){
                let batch = iterator.next();
                let tmpBatch = {};

                for(let fieldKey in this.batchFields){
                    tmpBatch[this.batchFields[fieldKey]] = batch.getValue({name: this.batchFields[fieldKey]});
                }

                this.batchData.push(tmpBatch);
            }
        };

        /**
         * getGenerationStat gets the generation status of the child batches
         * figures how many failed and how many succeeded.
         *
         * @param requestId {int} id of the request record who's data we want to load
         * @param subsidiaryId {int} id of the subsidiary record who's data we want to load
         *
         * Sample Generation Params:
         * {"forGeneration":[
         *      {"id":"10021","type":"CustInvc","entity":"113"},
         *      {"id":"10022","type":"CustInvc","entity":"1363"},
         *      {"id":"10023","type":"CustInvc","entity":"1362"}
         * ],
         * "template":"31452","subsidiary":"2"
         *
         */
        JP_ISRequestDAO.prototype.getGenerationStat=function(requestId, subsidiaryId){
            this.getChildBatches(requestId);

            let isIndividualPDF = (subsidiaryId) ? new SubsidiaryDAO().isIndividualPDFEnabled(subsidiaryId) :
                new CompanyDAO().getPDFCustomerSetting();

            //group the batches based on status
            let groupedBatch = {};
            for(let x=0; x<this.batchData.length; x++){

                let batchStatus = this.batchData[x][this.batchFields.status];

                if(!groupedBatch[batchStatus]){
                    groupedBatch[batchStatus] = [];
                }
                groupedBatch[batchStatus].push(this.batchData[x]);
            }

            if(!isIndividualPDF){ //individual PDF Generation Feature disabled
                this.generationStat.generated = (groupedBatch[this.STATUS.ERROR] &&
                    groupedBatch[this.STATUS.ERROR].length === 0) ? 1 : 0;
                this.generationStat.total = 1;
            }
            else{ //individual PDF Generation Feature enabled
                this.generationStat.total = this.batchData.length;
                this.generationStat.generated = (groupedBatch[this.STATUS.PROCESSED]) ?
                    groupedBatch[this.STATUS.PROCESSED].length : 0;
            }

        }

        /**
         * JP_ISRequestDAO.updateError : updates the request and specific batch record statuses to error
         * given the parameters.
         *
         * @param {object} passes that list of values needed for the update. It follows the format:
         * {
         *      batchId : batchId,
         *      requestId : requestId,
         *      status : error status from JP_ListStore.BATCH_STATUS,
         *      errorFlag : boolean (true|false),
         *      errorDetail : error details
         * }
         */
        JP_ISRequestDAO.prototype.updateError=function(params){

            let batchValues = {};
            batchValues[this.batchFields.status] = params.status;
            batchValues[this.batchFields.errorFlag] = params.errorFlag;
            batchValues[this.batchFields.errorDetail] = params.errorDetail;
            record.submitFields({
                type: JP_Types.BATCH_RECORD,
                id: params.batchId,
                values: batchValues
            });

            let reqValues = {};
            reqValues[this.fields.status] = params.status;
            reqValues[this.fields.errorFlag] = params.errorFlag;
            reqValues[this.fields.errorDetail] = params.errorDetail;

            record.submitFields({
                type: JP_Types.REQUEST_RECORD,
                id: params.requestId,
                values: reqValues
            });
        }

        /**
         * JP_ISRequestDAO.getFailedRequests : gets the ids of requests with Error or Invalid status
         *
         * @returns array of request ids with a status of error or invalid
         */
        JP_ISRequestDAO.prototype.getFailedRequests=function() {
            return this.getRequestBasedOnStatus([this.STATUS.ERROR, this.STATUS.INVALID]);
        }

        JP_ISRequestDAO.prototype.getQueuedRequests=function() {
            return this.getRequestBasedOnStatus([this.STATUS.QUEUED]);
        }

        /**
         * JP_ISRequestDAO.getRequestBasedOnStatus : returns the request records given the specified status.
         *
         * @param {Arrya} Array of status.
         * @returns array of request ids whose status is specified in the parameters.
         */
        JP_ISRequestDAO.prototype.getRequestBasedOnStatus=function(status){

            let requestIds = [];

            let requestSearch = search.create({ type: this.recordType });

            requestSearch.filters = [{
                name: this.fields.status,
                operator:search.Operator.ANYOF,
                values: status
            }];
            requestSearch.columns = [{ name: 'internalid' }];
            let searchIterator = this.getResultsIterator(requestSearch);
            while(searchIterator.hasNext()){
                requestIds.push(searchIterator.next().id);
            }

            return requestIds;
        }

    return JP_ISRequestDAO;
});
