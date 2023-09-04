/**
 * Copyright (c) 2021, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 *
 */

define([
    "N/query",
    "N/record",
    "N/search",
    "N/format",
    "N/email",
    "N/error",
    "../../data/JP_InvoiceSummaryBatchDAO",
    "../../data/JP_InvoiceSummaryRequestDAO",
    "../../data/NQuery/JP_NBatchMigrationStatusDAO",
    "../../lib/JP_TCTranslator",
    "../../lib/JP_StringUtility",
    "../../datastore/JP_RecordTypes",
    "../../datastore/JP_Scripts"
],
(
    query,
    record,
    search,
    format,
    email,
    error,
    BatchDAO,
    RequestDAO,
    MigrationStatusDAO,
    Translator,
    StringUtility,
    JPTypes,
    JPScripts
) =>{
    let BATCH_MIGRATION_MR_TITLE = "Japan Migrate Pending Batches MR";
    let MIGRATE_SUCCESS_TITLE = "MIGRATE_SUCCESS_TITLE";
    let MIGRATE_SUCCESS_BODY = "MIGRATE_SUCCESS_BODY";
    let MIGRATE_FAILED_TITLE = "MIGRATE_FAILED_TITLE";
    let MIGRATE_FAILED_BODY = "MIGRATE_FAILED_BODY";

    function getInputData() {
        let batchesToAdopt = [];
        let statusDAO = new MigrationStatusDAO();

        try {
            if(!statusDAO.instanceId) {
                throw error.create({
                    name : "MISSING_MIGRATION_STATUS_RECORD",
                    message : "Unable to fetch migration status instance",
                    notifyOff:true
                });
            }
            let batchDAO = new BatchDAO();
            batchesToAdopt = batchDAO.getPendingOrphanBatches();
        } catch(e) {
            log.error({ title: "InputData_Error", details: [e.name, " : ", e.message].join("") });
            throw e;
        }

        log.debug({ title: "batch list", details: batchesToAdopt });
        return batchesToAdopt;
    }

    function map(context) {
        try {
            let batchDAO = new BatchDAO();
            let batchObj = JSON.parse(context.value);

            let batchLookup = search.lookupFields({
                type: batchDAO.recordType,
                id: batchObj.id,
                columns: [
                    batchDAO.fields.generationParams,
                    batchDAO.fields.errorDetail
                ]
            });
            batchObj[batchDAO.fields.generationParams] = batchLookup[batchDAO.fields.generationParams];
            batchObj[batchDAO.fields.errorDetail] = batchLookup[batchDAO.fields.errorDetail];

            let requestId = createRequestRecord(batchObj);

            attachBatchToRequest(batchObj.id, requestId);

            context.write({
                key: requestId,
                value: batchObj.id
            });
        } catch(e) {
            log.error({ title: "Map_Error", details: [e.name, " : ", e.message].join("") });
            throw e;
        }
    }

    function summarize(summary) {
        try {
            let statusDAO = new MigrationStatusDAO();
            let inputDataError = summary.inputSummary.error;
            let mapErrors = [];
            summary.mapSummary.errors.iterator().each( (key, error) => {
                mapErrors.push(error);
                return true
            });
            let errorEncountered = !!inputDataError || !!mapErrors.length;

            let completeBatchList = [];
            let successfulBatches = 0;
            summary.mapSummary.keys.iterator().each((key, executionCount, completionState) => {
                completeBatchList.push(key);
                if(completionState === "COMPLETE") {
                    successfulBatches++;
                }
                return true;
            });
            let totalBatches = completeBatchList.length;

            statusDAO.setStatus(successfulBatches === totalBatches);

            let emailContent = getEmailContent(successfulBatches, totalBatches, errorEncountered);
            sendEmailNotifToAdmins(emailContent);
        } catch(e) {
            log.error({ title: "Summarize_Error", details: [e.name, " : ", e.message].join("") });
        }
    }

    function getAdministrators() {
        let administrators = [];
        let ADMIN_ID = 3;

        let employeeQuery = query.create({ type: query.Type.EMPLOYEE });

        employeeQuery.columns = [
            employeeQuery.createColumn({ fieldId: 'id' })
        ];

        let roleJoin = employeeQuery.autoJoin({ fieldId: "rolesforsearch" });
        roleJoin.createCondition({
            fieldId: "id",
            operator: query.Operator.IS,
            values: [ADMIN_ID]
        });

        let results = employeeQuery.run();
        let mappedResult = results.asMappedResults();

        mappedResult.forEach((resultObj) => {
            administrators.push(resultObj["id"]);
        });

        return administrators;
    }

    function getEmailContent(successfulBatches, totalBatches, errorEncountered) {
        let emailStrings = {
            subject: "",
            body: ""
        };
        let template = "";
        let strings = new Translator().getTexts([
            MIGRATE_SUCCESS_TITLE, MIGRATE_SUCCESS_BODY,
            MIGRATE_FAILED_TITLE, MIGRATE_FAILED_BODY,
        ], true);

        if(successfulBatches === totalBatches && !errorEncountered) {
            emailStrings.subject = strings[MIGRATE_SUCCESS_TITLE];
            template = strings[MIGRATE_SUCCESS_BODY];
        } else {
            emailStrings.subject = strings[MIGRATE_FAILED_TITLE];
            template = strings[MIGRATE_FAILED_BODY];
        }
        let stringUtil = new StringUtility(template);
        emailStrings.body = stringUtil.replaceParameters({
            SUCCESS: successfulBatches,
            TOTAL: totalBatches,
            MIGRATE_MR_TITLE: BATCH_MIGRATION_MR_TITLE,
            MIGRATE_MR_ID: JPScripts.BATCH_MIGRATION_MR_DEPLOYMENT
        });

        return emailStrings;
    }

    function sendEmailNotifToAdmins(contentObj) {
        let administrators = getAdministrators();

        email.send({
            author: administrators[0],
            recipients: administrators,
            subject: contentObj.subject,
            body: contentObj.body
        });
    }

    function createRequestRecord(batchObj) {
        let requestDAO = new RequestDAO();
        let request = record.create({
            type: JPTypes.REQUEST_RECORD
        });
        request.setValue({fieldId: requestDAO.fields.customerFilter, value: batchObj[batchDAO.fields.customerFilter]});
        request.setValue({fieldId: requestDAO.fields.customerSavedSearch, value: batchObj[batchDAO.fields.customerSavedSearch]});
        request.setValue({fieldId: requestDAO.fields.closingDate,
            value: format.parse({value:batchObj[batchDAO.fields.closingDate], type: format.Type.DATE}) });
        request.setValue({fieldId: requestDAO.fields.statementDate,
            value: format.parse({value:batchObj[batchDAO.fields.statementDate], type: format.Type.DATE}) });
        request.setValue({fieldId: requestDAO.fields.includeOverdue, value: batchObj[batchDAO.fields.overdueFilter]});
        request.setValue({fieldId: requestDAO.fields.includeNoTransaction, value: batchObj[batchDAO.fields.includeNoTransaction]});
        request.setValue({fieldId: requestDAO.fields.status, value: batchObj[batchDAO.fields.status]});
        request.setValue({fieldId: requestDAO.fields.subsidiary, value: batchObj[batchDAO.fields.subsidiary]});
        request.setValue({fieldId: requestDAO.fields.generationParameters, value: batchObj[batchDAO.fields.generationParams]});
        request.setValue({fieldId: requestDAO.fields.errorFlag, value: batchObj[batchDAO.fields.errorFlag]});
        request.setValue({fieldId: requestDAO.fields.errorDetail, value: batchObj[batchDAO.fields.errorDetail]});
        request.setValue({fieldId: requestDAO.fields.pdfSetting, value: false});
        return request.save();
    }

    function attachBatchToRequest(batchId, requestId) {
        record.submitFields({
            type: JPTypes.BATCH_RECORD,
            id: batchId,
            values: {
                "custrecord_japan_loc_parent_request": requestId
            }
        });
    }

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    }

});
