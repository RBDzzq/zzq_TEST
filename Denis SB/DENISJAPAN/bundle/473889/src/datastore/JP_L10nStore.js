/**
 *    Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define(['../lib/JP_TCTranslator'],
 (Translator) => {

    class JP_L10Store{

        constructor() {

            let COMPONENTNAME = 'L10N_RECOVERABILITY_COMPONENT_NAME';
            let STATUS = 'L10N_RECOVERABILITY_STATUS';
            let UPDATEDDATE = 'L10N_RECOVERABILITY_UPDATED_DATE';
            let UPDATEDBY = 'L10N_RECOVERABILITY_UPDATED_BY';
            let ACTION = 'L10N_RECOVERABILITY_ACTION';
            let REINSTALL = 'L10N_RECOVERABILITY_REINSTALL';
            let CONFIRMREINSTALL = 'L10N_RECOVERABILITY_CONFIRM_REINSTALL';
            let RECOVERCONFIRM = 'L10N_RECOVERABILITY_CONFIRM_REINSTALL';
            let REFRESH = 'L10N_RECOVERABILITY_REFRESH';
            let PAGENAME = 'L10N_RECOVERABILITY_PAGE_NAME';

            let strings = new Translator().getTexts([
                COMPONENTNAME, STATUS, UPDATEDDATE, UPDATEDBY,
                ACTION, REINSTALL, CONFIRMREINSTALL, RECOVERCONFIRM,
                REFRESH, PAGENAME], true);

            this.clientScriptFile= 'JP_L10nCS.js';
            this.formTitle= strings[PAGENAME];
            this.refreshLabel= strings[REFRESH];
            this.recordType= 'customrecord_jp_l10n_component';
            this.recordFields= {
                status: 'custrecord_jp_l10n_status',
                targetSuiteApp: 'custrecord_jp_l10n_target_suiteapp',
                details: 'custrecord_jp_l10n_installation_details',
                filename: 'custrecord_jp_l10n_filename'
            };
            this.suiteletScriptId= 'customscript_jp_l10n_recoverability_su';
            this.suiteletDeploymentId= 'customdeploy_jp_l10n_recoverability_su';
            this.suiteletStrings= {
                'recoverability.component_name': strings[COMPONENTNAME],
                    'recoverability.status': strings[STATUS],
                    'recoverability.updated_date': strings[UPDATEDDATE],
                    'recoverability.updated_by': strings[UPDATEDBY],
                    'recoverability.action': strings[ACTION],
                    'recoverability.reinstall': strings[REINSTALL],
                    'recoverability.confirm_reinstall': strings[CONFIRMREINSTALL],
                    'recoverability.confirm': strings[RECOVERCONFIRM]
            };
            this.ssSchedulerScriptId= 'customscript_japan_loc_template_ins_ss';
            this.ssSchedulerDeployment= 'customdeploy_japan_loc_template_ins_ss';
            this.bundleName= 'Japan Localization';
            this.appId= 'com.netsuite.japanlocalization';
            //Script Parameters
            this.scriptBundleId= 'custscript_jp_bundle_id';
            this.scriptBundleName= 'custscript_jp_bundle_name';
            this.scriptAppId = 'custscript_jp_app_id';
            this.scriptFileIds= 'custscript_jp_file_ids'
        }
    }

    return JP_L10Store;
 });
