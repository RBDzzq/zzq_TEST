/**
 *    Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */
define(["../../lib/l10n/JP_L10nLibCS"], (CreateClientScriptFromConfig)=> {

    let csConfig = {
        suiteletScriptId: 'customscript_jp_l10n_recoverability_su',
        suiteletDeploymentId: 'customdeploy_jp_l10n_recoverability_su',
    };

    return new CreateClientScriptFromConfig(csConfig);
});
