/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 *
 */

define([
    '../datastore/JP_L10nStore',
    './JP_BaseDAO',
    './JP_L10nAppList',
    'N/runtime'
], (
    jpLocStore,
    BaseDAO,
    L10nAppList,
    runtime
)=>{

    let locStore;

    function LocalizationDAO(){
            BaseDAO.call(this);
            locStore = new jpLocStore()
            this.recordType = locStore.recordType;
        }

        util.extend(LocalizationDAO.prototype, BaseDAO.prototype);

        /**
         * Get all L10n Components having target app as EP
         * @returns {Array} of Objects {templateName, fileId, id}
         */
        LocalizationDAO.prototype.getAllEpComponentIdsAndFileIds=function(){
            let fileIdsNames = [];

            this.filters = [{name: locStore.recordFields.targetSuiteApp, operator: 'is',
                values: L10nAppList.ELECTRONIC_PAYMENTS}];
            this.columns = [locStore.recordFields.filename, 'name'];
            let searchForAllEPItems = this.createSearch();

            let iterator = this.getResultsIterator(searchForAllEPItems);

            while (iterator.hasNext()) {
                let epItem = iterator.next();
                fileIdsNames.push({
                    templateName: epItem.getValue({name: 'name'}),
                    fileId: epItem.getValue({name: locStore.recordFields.filename}),
                    id: epItem.id
                });
            }

            return fileIdsNames;
        };

        /**
         * @param params.details {String} details to set
         * @param params.status {Number} id of the status to set
         * @param params.id {Number} id of the component to update
         */
        LocalizationDAO.prototype.setL10nComponentStatus=function(params){
            let values = {};
            values[locStore.recordFields.status] = params.status;
            values[locStore.recordFields.details] = params.details || '';
            this.submitFields({
                id: params.id,
                values: values
            });
        };

        /**
         * Gets the bundle ID of the first bundle returned from runtime.getCurrentScript().bundleIds
         *
         * @returns {String} the bundleId if found, or "Bundle" if no bundle owns the script
         */
        LocalizationDAO.prototype.getBundleId=function() {
            let currentBundleIDs = runtime.getCurrentScript().bundleIds;
            return (currentBundleIDs.length > 0) ? currentBundleIDs[0] : 'Bundle';
        };

    return LocalizationDAO;
});
