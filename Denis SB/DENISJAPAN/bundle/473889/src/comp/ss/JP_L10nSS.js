/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 *
 *
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define([
    'N/runtime',
    'N/error',
    '../../data/JP_FileDAO',
    '../../datastore/JP_L10nStore',
    '../../app/JP_L10nEpApiWrapper',
    '../../data/JP_L10nDAO',
    '../../data/JP_L10nComponentStatusList'
], (runtime, error, FileDAO, LocalizationStore,
            L10nEpApiWrapper, LocalizationDAO, ComponentStatusList)=>{

    let API_RETURN_RESULT = {
        FAILED: 0,
        PASSED: 1
    };

    let localStore;

    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext){
        let currentScript = runtime.getCurrentScript();
        localStore = new LocalizationStore();
        try {
            let params = {
                bundleId: currentScript.getParameter(localStore.scriptBundleId),
                bundleName: currentScript.getParameter(localStore.scriptBundleName),
                appId: currentScript.getParameter(localStore.scriptAppId),
                componentIdsAndFileIds: JSON.parse(currentScript.getParameter(localStore.scriptFileIds)),
            };

            runUpsertTemplates(params);
        }
        catch (ex) {
            throw error.create({
                name: 'JP_L10N_INSTALLATION_ERROR',
                message: JSON.stringify(ex)
            });
        }
    }

    /**
     * Upserts all of the EP templates to EP
     *
     * @param {String} params.bundleId - Bundle ID
     * @param {String} params.bundleName - Bundle Name
     * @param {String} params.appId - App ID of the Bundle
     * @param {Array} params.componentIdsAndFileIds - Array of Objects {id, fileId}
     *
     * @returns {Object}
     *
     */
    function runUpsertTemplates(params){
        let localizationDao = new LocalizationDAO();

        let componentIdsAndFileIds;
        if (params.componentIdsAndFileIds) {
            componentIdsAndFileIds = params.componentIdsAndFileIds
        } else {
            componentIdsAndFileIds = localizationDao.getAllEpComponentIdsAndFileIds();
        }

        if (componentIdsAndFileIds.length == 0) {
            return 'No EP template to upsert.';
        }

        log.debug({title: 'epFileIds for processing in SS', details: JSON.stringify(componentIdsAndFileIds)});

        if (!params.bundleId) {
            params.bundleId = new LocalizationDAO().getBundleId();
        }

        if (!params.bundleName) {
            params.bundleName = localStore.bundleName;
        }

        if (!params.appId) {
            params.appId = localStore.appId;
        }

        util.each(componentIdsAndFileIds, (epComponentIdAndFileId)=>{
            try {
                let l10nEpApiWrapper = new L10nEpApiWrapper();
                let upsertResult = l10nEpApiWrapper.upsertTemplate({
                    bundleId: params.bundleId,
                    bundleName: params.bundleName,
                    appId: params.appId,
                    fileId: epComponentIdAndFileId.fileId
                });

                log.debug({title: 'runUpsertTemplates', details: JSON.stringify(upsertResult)});

                //Update JP L10N Component status
                if (upsertResult.result === API_RETURN_RESULT.PASSED) {
                    localizationDao.setL10nComponentStatus({
                        id: epComponentIdAndFileId.id,
                        status: ComponentStatusList.INSTALLED
                    })
                }
                else {
                    localizationDao.setL10nComponentStatus({
                        id: epComponentIdAndFileId.id,
                        status: ComponentStatusList.INSTALL_FAILURE,
                        details: upsertResult.message
                    });
                }
            } catch (ex) {
                log.error({
                    title: ex.result,
                    details: ex.message
                });
                if (ex.result && ex.result === 'SUITEAPP_UNAVAILABLE') {
                    localizationDao.setL10nComponentStatus({
                        id: epComponentIdAndFileId.id,
                        status: ComponentStatusList.SUITEAPP_UNAVAILABLE,
                        details: ex.message
                    });
                } else {
                    localizationDao.setL10nComponentStatus({
                        id: epComponentIdAndFileId.id,
                        status: ComponentStatusList.INSTALL_FAILURE,
                        details: ex.message || (util.isString(ex) && ex) || JSON.stringify(ex)
                    });
                }
            }
        });
    }

    return {execute};

});
