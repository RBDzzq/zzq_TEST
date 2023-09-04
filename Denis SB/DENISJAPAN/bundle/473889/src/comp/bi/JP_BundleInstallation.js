/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 *
 * @NApiVersion 2.1
 * @NScriptType BundleInstallationScript
 * @NModuleScope SameAccount
 */

define([
        "N/record",
        "N/runtime",
        "N/task",
        "N/translation",
        "require"
    ],

    function(record, runtime, task, translator, require) {

        let localizationStore;
        let folderDAO;
        let JPScripts;

        function afterUpdate(params) {
            if (isSuiteTaxEnabled()) {
                createSuiteTaxCompatibilityError();
            }

            submitL10nSchedScript();
            exportFolderDao();
            createPrintedPOFolder();
            createDefaultInvSumFolder();
        }

        function beforeInstall(params) {
            if (isSuiteTaxEnabled()) {
                createSuiteTaxCompatibilityError();
            }
        }

        function afterInstall(params) {
            submitL10nSchedScript();
            submitTaxRecordsProvisioningSchedScript();
            exportFolderDao();
            createPrintedPOFolder();
            createDefaultInvSumFolder();
        }

        function beforeUninstall(params) {
            try {
                require(['../../app/JP_L10nEpTemplatesInactivater'], function(L10nEpTemplatesInactivater){
                    new L10nEpTemplatesInactivater().inactivateJPTemplates();
                });
            } catch (ex) {
                log.error('JP_BEFORE_UNINSTALL_LOCALIZATION_ERROR', JSON.stringify(ex));
            }
        }

        function isSuiteTaxEnabled() {
            return runtime.isFeatureInEffect({"feature":"tax_overhauling"});
        }

        function createSuiteTaxCompatibilityError() {
            let alias = 'texts';

            let strings = translator.load({
                collections: [ {
                    alias: alias,
                    collection: 'custcollection_jploc_strings',
                    keys: ["JP_BI_MESSAGE_SUITETAXNOTSUPPORTED"]
                }]
            });

            throw strings[alias]["JP_BI_MESSAGE_SUITETAXNOTSUPPORTED"]();
        }

        function submitL10nSchedScript() {
            try {
                require(["../../datastore/JP_L10nStore"], function (s){
                    localizationStore = new s();
                });

                let ssTask = task.create({taskType: task.TaskType.SCHEDULED_SCRIPT});
                ssTask.scriptId = localizationStore.ssSchedulerScriptId;
                ssTask.deploymentId = localizationStore.ssSchedulerDeployment;

                ssTask.submit();

            } catch (ex) {
                log.error('JP_AFTER_UPDATE_LOCALIZATION_SS_ERROR', JSON.stringify(ex));
            }
        }

        function submitTaxRecordsProvisioningSchedScript() {
            try {
                require(["../../datastore/JP_Scripts"], function (s){
                    JPScripts = s;
                });

                let ssTask = task.create({taskType: task.TaskType.SCHEDULED_SCRIPT});
                ssTask.scriptId = JPScripts.TAX_REC_PROVISIONING_SS_SCRIPT;
                ssTask.deploymentId = JPScripts.TAX_REC_PROVISIONING_SS_DEPLOYMENT;

                ssTask.submit();
            } catch (ex) {
                log.error('JP_AFTER_INSTALL_TAX_REC_PROVISIONING_SS_ERROR', JSON.stringify(ex));
            }
        }

        function exportFolderDao(){
            try{
                if(!folderDAO){
                    require(["../../data/JP_FolderDAO"], function (f){
                        folderDAO = f;
                    });
                }
            }
            catch(e){
                log.error('FOLDER_DAO_REQUIRE_FAILED', JSON.stringify(e));
            }
        }

        function createPrintedPOFolder(){
            try{
                let PRINTED_PO_FOLDER = 'Printed Purchase Orders';
                let poPrintFolder = new folderDAO().getFolderByNameAndParent(PRINTED_PO_FOLDER);
                if(!poPrintFolder){
                    let poFolder = record.create({type: record.Type.FOLDER});
                    poFolder.setValue({fieldId: 'name', value: PRINTED_PO_FOLDER});
                    poFolder.save();
                }
            }catch(e){
                log.error('JP_PRINTED_PO_FOLDER_ERROR', JSON.stringify(e));
            }
        }

        function createDefaultInvSumFolder(){
            try{
                let folderDao = new folderDAO();
                let invsumPrintFolder = folderDao.getFolderByNameAndParent(folderDao.DEFAULT_INVSUM_FOLDER);
                if(!invsumPrintFolder){
                    let invsumFolder = record.create({type: record.Type.FOLDER});
                    invsumFolder.setValue({fieldId: 'name', value: folderDao.DEFAULT_INVSUM_FOLDER});
                    invsumFolder.save();
                }
            }
            catch(e){
                log.error('INV_SUM_FOLDER_CREATION_ERROR', JSON.stringify(e));
            }
        }

        return {
            beforeInstall,
            afterInstall,
            afterUpdate,
            beforeUninstall
        };

    });
