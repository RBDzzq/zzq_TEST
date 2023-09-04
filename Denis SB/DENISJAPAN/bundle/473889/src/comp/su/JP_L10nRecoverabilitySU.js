/**
 *    Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @NApiVersion 2.1
 */
define([
    "N/record",
    "N/https",
    "N/ui/serverWidget",
    "N/search",
    "N/render",
    "N/file",
    "../../datastore/JP_L10nStore",
    "../../app/JP_L10nEpScheduler",
    "../../data/JP_L10nComponentStatusList",
    "../../data/JP_L10nAppList",
    "../../lib/JP_TCTranslator",
   "../../lib/JP_StringUtility"
],  function(
     record,
     https,
     serverWidget,
     search,
     render,
     file,
     l10nstore,
     L10nEpScheduler,
     ComponentStatusList,
     L10nAppList,
     Translator,
     StringUtility
) {

    let RUNNING = "L10N_RECOVERABILITY_RUNNING";
    let REINSTALLFAILEDREQUEST = 'L10N_RECOVERABILITY_REINSTALL_REQUEST_FAILED';
    let FAILEDSTATUS = 'L10N_RECOVERABILITY_REQUEST_FAILED';
    let NOTSUPPORTED = 'L10N_RECOVERABILITY_NOT_SUPPORTED';

    let strings, l10Store;

    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context){
        strings = new Translator().getTexts([RUNNING, FAILEDSTATUS, REINSTALLFAILEDREQUEST, NOTSUPPORTED],
            true);

        l10Store = new l10nstore();

        if (context.request.method === https.Method.POST) {
            handlePOSTRequest(context);
        } else {
            createForm(context);
        }
    }

    function createForm(context){

        let TEMPLATE = "<style type=\"text/css\">\n" +
            "    .localization-components {\n" +
            "        margin-top: 5px;\n" +
            "        padding: 5px;\n" +
            "    }\n" +
            "    .localization-components th {\n" +
            "        font-size: 13px;\n" +
            "        font-weight: bold;\n" +
            "        text-transform: uppercase;\n" +
            "    }\n" +
            "    .localization-components td {\n" +
            "        font-size: 14px;\n" +
            "    }\n" +
            "    .localization-components td.result-status a {\n" +
            "        cursor: default;\n" +
            "        text-decoration: none;\n" +
            "    }\n" +
            "    .localization-components td.result-status a.error-status {\n" +
            "        border-bottom: 1px dotted black;\n" +
            "        cursor: help;\n" +
            "    }\n" +
            "    .localization-components tbody tr:hover {\n" +
            "        background: #EAEAEA;\n" +
            "    }\n" +
            "    .localization-header {\n" +
            "        padding: 5px;\n" +
            "        font-size: 14px;\n" +
            "        color: #607799;\n" +
            "        font-weight: bold;\n" +
            "        background: #E0E6EF;\n" +
            "    }\n" +
            "    .localization-container {\n" +
            "        margin-bottom: 20px;\n" +
            "    }\n" +
            "</style>\n" +
            "<script type=\"text/javascript\">\n" +
            "    function l10nReinstall(obj, params) {\n" +
            "        require(['${templateData.csFilePath}'], (clientScript)=> {\n" +
            "            params.confirm = '{recoverability.confirm}';\n" +
            "            params.confirmMessage = '{recoverability.confirm_reinstall}';\n" +
            "            clientScript.reinstall(obj, params);\n" +
            "        });\n" +
            "        return false;\n" +
            "    }\n" +
            "    function l10nShowDetails(obj, params) {\n" +
            "        require(['${templateData.csFilePath}'], (clientScript)=> {\n" +
            "            clientScript.showDetails(obj, params);\n" +
            "        });\n" +
            "        return false;\n" +
            "    }\n" +
            "</script>\n" +
            "<div>\n" +
            " \n" +
            "    <#list templateData.targets as target>\n" +
            "    <div class=\"localization-container\">\n" +
            "        <div class=\"localization-header\">${target}</div>\n" +
            "        <table class=\"localization-components\" width=\"100%\" cellpadding=\"1\" cellspacing=\"0\">\n" +
            "            <thead>\n" +
            "                <tr>\n" +
            "                    <th width=\"25%\">{recoverability.component_name}</th>\n" +
            "                    <th width=\"15%\">{recoverability.status}</th>\n" +
            "                    <th width=\"20%\">{recoverability.updated_date}</th>\n" +
            "                    <th width=\"20%\">{recoverability.updated_by}</th>\n" +
            "                    <th width=\"20%\">{recoverability.action}</th>\n" +
            "                </tr>\n" +
            "            </thead>\n" +
            "            <tbody>\n" +
            "                <#list templateData.results as result>\n" +
            "                    <#if target == result.target>\n" +
            "                <tr id=\"localizationComponent${result.id}\">\n" +
            "                    <td>${result.name}</td>\n" +
            "                    <td class=\"result-status\">\n" +
            "                        <a href=\"#\" class=\"<#if result.errorStatus=='true'>error-status</#if>\" onClick=\"return l10nShowDetails(this);\" data-details=\"${result.details}\">${result.status}</a>\n" +
            "                    </td>\n" +
            "                    <td class=\"result-modifieddate\">${result.modifieddate}</td>\n" +
            "                    <td class=\"result-modifiedby\">${result.modifiedby}</td>\n" +
            "                    <td><a href=\"#\" onClick=\"return l10nReinstall(this, {id: ${result.id}, name: '${result.name}'})\">{recoverability.reinstall}</a></td>\n" +
            "                </tr>\n" +
            "                    </#if>\n" +
            "                </#list>\n" +
            "            </tbody>\n" +
            "        </table>\n" +
            "    </div>\n" +
            "    </#list>\n" +
            "</div>";

        let resultFiles = {
            csFile: getFilePath(l10Store.clientScriptFile)
        };

        let myForm = serverWidget.createForm({
            title: l10Store.formTitle
        });

        if (l10Store.refreshLabel) {
            myForm.addButton({
                id: 'custbtn_refresh_btn',
                label: l10Store.refreshLabel,
                functionName: 'refreshPage'
            });
        }

        myForm.clientScriptModulePath = resultFiles.csFile.path;

        let mySearch = search.create({
            type: l10Store.recordType,
            columns: [
                'lastmodified',
                'lastmodifiedby',
                'name',
                'internalid',
                l10Store.recordFields.status,
                l10Store.recordFields.details,
                l10Store.recordFields.targetSuiteApp
            ]
        });

        let templateData = {
            targets: [],
            results: [],
            csFilePath: resultFiles.csFile.path
        };

        mySearch.run().each((result)=> {

            let target = result.getText({
                name: l10Store.recordFields.targetSuiteApp
            });

            if (templateData.targets.indexOf(target) < 0) {
                templateData.targets.push(target);
            }

            templateData.results.push({
                name: result.getValue({name: 'name'}),
                id: result.id,
                status: result.getText(l10Store.recordFields.status),
                errorStatus: (["3", "4"].indexOf(result.getValue({name: l10Store.recordFields.status})) >= 0),
                // If Status is "Installation Failed" or "SuiteApp Unavailable"
                details: result.getValue({name: l10Store.recordFields.details}),
                modifiedby: result.getText({name: 'lastmodifiedby'}),
                modifieddate: result.getValue({name: 'lastmodified'}),
                target: target
            });

            return true;
        });

        let myField = myForm.addField({
            id: 'html',
            type: serverWidget.FieldType.INLINEHTML,
            label: 'html'
        });

        let myRenderer = render.create();
        myRenderer.templateContent = TEMPLATE;

        myRenderer.addCustomDataSource({
            alias: 'templateData',
            format: render.DataSource.OBJECT,
            data: templateData
        });

        let stringMap = {
            'recoverability.component_name': 'Component Name',
            'recoverability.status': 'Status',
            'recoverability.updated_date': 'Last Updated Date',
            'recoverability.updated_by': 'Last Updated By',
            'recoverability.action': 'Action',
            'recoverability.reinstall': 'Reinstall',
            'recoverability.confirm_reinstall': 'Are you sure you want to reinstall {COMPONENTNAME}?',
            'recoverability.confirm': 'Confirm'
        }

        let fieldValue = myRenderer.renderAsString();
        util.each(stringMap, (value, code) => {
            let stringValue = l10Store.suiteletStrings[code] || value;
            let re = new RegExp("\\{" + code + "\\}", "g");
            fieldValue = fieldValue.replace(re, stringValue);
        });
        myField.defaultValue = fieldValue;

        context.response.writePage({
            pageObject: myForm
        });
    }

    function handlePOSTRequest(context){
        let response = context.response;
        response.setHeader({
            name: 'Content-Type',
            value: 'application/json'
        });

        // We are assuming here that all requests coming in have valid id parameter
        // Handling invalid parameters is out of scope
        let componentRecord = record.load({
            type: l10Store.recordType,
            id: context.request.parameters.id
        });

        if (componentRecord.getValue({fieldId: l10Store.recordFields.targetSuiteApp}) ==
            L10nAppList.ELECTRONIC_PAYMENTS) {
            let fileId = componentRecord.getValue({fieldId: l10Store.recordFields.filename});
            try {
                new L10nEpScheduler().submitL10nSchedScriptUpsert([
                    {fileId: fileId, id: context.request.parameters.id}
                ]);
                // The submit call will throw an error when task cannot be submitted.
                let values = {};
                values[l10Store.recordFields.status] = ComponentStatusList.RUNNING;
                record.submitFields({
                    type: l10Store.recordType,
                    id: context.request.parameters.id,
                    values: values
                });

                writeComponentRecordValues({
                    componentId: context.request.parameters.id,
                    componentValues: {
                        result: 'PASSED',
                        status: strings[RUNNING],
                        errorStatus: false,
                        details: ''
                    },
                    response
                });

            }
            catch (ex) {
                log.error({
                    title: 'handlePOSTRequest',
                    details: 'An error was encountered while processing request: ' + context.request.parameters
                });
                log.error({title: 'handlePOSTRequest', details: 'Error details' + JSON.stringify(ex)});
                // record.load is used here instead of search.lookupFields because getText does not work
                // with search result and we need the text value of lastmodified and lastmodifiedby
                writeComponentRecordValues({
                    componentId: context.request.parameters.id,
                    componentValues: {
                        result: 'FAILED',
                        errorStatus: true,
                        details: strings[REINSTALLFAILEDREQUEST] +
                            ' ' + (ex.message || (util.isString(ex) && ex) || JSON.stringify(ex)),
                        status: strings[FAILEDSTATUS]
                    },
                    response
                });
            }
        }
        else {
            let message = strings[NOTSUPPORTED];
            let stringUtil = new StringUtility(message);
            message = stringUtil.replaceParameters({
                SUITEAPPNAME: l10Store.recordFields.targetSuiteApp
            });
            writeComponentRecordValues({
                componentId: context.request.parameters.id,
                componentValues: {
                    result: 'FAILED',
                    errorStatus: true,
                    details: message,
                    status: strings[FAILEDSTATUS]
                },
                response
            });
        }
    }

    /**
     * Get the current component record values, merge its values with the values passed as params, then write
     * them as one merged stringified object into context.response.
     *
     * @param params.componentId
     * @param params.componentValues
     * @param params.response
     * @param params.status
     */
    function writeComponentRecordValues(params){
        // record.load is used here instead of search.lookupFields because getText does not work
        // with search result and we need the text value of lastmodified and lastmodifiedby
        let componentRecord = record.load({
            type: l10Store.recordType,
            id: params.componentId
        });

        let values = util.extend(params.componentValues, {
            updateddate: componentRecord.getText('lastmodified'),
            updatedby: componentRecord.getText('lastmodifiedby'),
            status: params.componentValues.status || componentRecord.getText(l10Store.recordFields.status)
        });
        params.response.write({
            output: JSON.stringify(values)
        });
    }

    /**
     * Search the file cabinet for path of specified file
     *
     * @param {String} name
     * @returns {Object}
     */
    function getFilePath(name){

        let fileResult;

        let fileSearch = search.create({
            type: 'file',
            filters: ['name', search.Operator.IS, name]
        });

        fileSearch.run().each((result)=> {
            let fileObj = file.load({
                id: result.id
            });

            fileResult = {
                id: result.id,
                path: fileObj.path
            };
        });

        return fileResult;
    }


    return {
        onRequest
    }
});
