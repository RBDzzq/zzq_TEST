/**
 *    Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define([
    './JP_L10nEpApiWrapper', '../datastore/JP_L10nStore', '../data/JP_L10nDAO'
], (L10nEpApiWrapper, jpLocStore, L10nDAO) => {

    class L10nEpApiInactivater{

        inactivateJPTemplates(){
            let l10nEpApiWrapper = new L10nEpApiWrapper();
            let localizationDAO = new L10nDAO();

            util.each(localizationDAO.getAllEpComponentIdsAndFileIds(), (item)=> {
                let result;
                try {
                    let locStore = new jpLocStore();
                    result = l10nEpApiWrapper.inactivateTemplate({
                        bundleId: localizationDAO.getBundleId(),
                        bundleName: locStore.bundleName,
                        appId: locStore.appId,
                        templateName: item.templateName
                    });
                } catch (ex) {
                    log.error({
                        title: 'JP_INACTIVATE_ERROR',
                        details: JSON.stringify(ex)
                    });
                }

                log.debug({title: 'inactivateEPTemplate', details: item.templateName + ' result: '
                        + JSON.stringify(result)});

            });
        };

    }

    return L10nEpApiInactivater;

});
