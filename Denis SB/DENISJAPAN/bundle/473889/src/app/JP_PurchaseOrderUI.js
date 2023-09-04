/**
 * Copyright (c) 2020, Oracle and/or its affiliates. All rights reserved.
 * otherwise make available this code.
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */

define([
        'N/record',
        'N/runtime',
        'N/ui/serverWidget',
        '../lib/JP_TCTranslator',
        '../data/NQuery/JP_NVendorDAO',
        '../data/NQuery/JP_NPurchaseOrderDAO',
        '../data/NQuery/JP_NPOPrintHistoryDAO',
        '../data/NQuery/JP_NSubsidiaryDAO',
        '../data/NQuery/JP_NClientScriptDAO',
        "../data/JP_CompanyDAO"
    ],
    (record, runtime, widget, translator, VendorDAO,
             PODAO, PrintHistoryDAO, SubsidiaryDao, ClientScriptDAO, CompanyDAO) => {

    let texts = {
        fields: {
            prntCount: "PO_LABEL_PRINTCOUNT"
        },
        button: {
            print: "PO_PRINTBUTTON"
        },
        flh:{
            prntCount:  "PO_FLH_PRINTCOUNT"
        },
        tab : {
            history : "PO_PRINTHISTORYTAB"
        }
    };

    let nonAcceptedStatus = ['rejected', 'pendingApproval',
        'pendingSupApproval', 'rejectedBySup'];

    function JP_PurchaseOrderUI() {
        this.name = 'JP_PurchaseOrderUI';
        this.historySublist = "custpage_printhistorylist";
        this.strings = [];
    }

    JP_PurchaseOrderUI.prototype.constructUI =  function(scriptContext){
        let rec = scriptContext.newRecord;
        let form = scriptContext.form;
        let vendor  = new VendorDAO();
        let purchaseOrder = new PODAO();
        let printHistoryDao = new PrintHistoryDAO();
        let clientScriptDao = new ClientScriptDAO();
        let entityId = rec.getValue('entity');
        let subsidiaryId;

        vendor.getData(entityId);
        printHistoryDao.getData(rec.id);

        let subsidiaryCountry = '';

        if(runtime.isFeatureInEffect({feature:'SUBSIDIARIES'})){
            subsidiaryId = rec.getValue({fieldId: 'subsidiary'});
            let subsidiaryDao = new SubsidiaryDao();
            subsidiaryDao.getData(subsidiaryId);
            subsidiaryCountry = subsidiaryDao.fields.country.val;
        }
        else{
            subsidiaryCountry = new CompanyDAO().getCompValue('country');
        }

        this.strings = new translator().getTexts([
            texts.fields.prntCount,
            texts.button.print,
            texts.flh.prntCount,
            texts.tab.history,
            printHistoryDao.fields.dateTime.id.toUpperCase(),
            printHistoryDao.fields.user.id.toUpperCase(),
            printHistoryDao.fields.fileLink.id.toUpperCase()
        ], true);

        log.debug({title:"Subsidiary", details: "Subsidiary ID: " + subsidiaryId + " Country " + subsidiaryCountry});
        if(subsidiaryCountry === "JP"){
            let tabLabel = this.strings[texts.tab.history];

            form.addTab({
                id: purchaseOrder.subtab.print,
                label : tabLabel
            });

            let fldPrntCount = form.addField({
                id: purchaseOrder.fields.timesPrinted.id,
                type: widget.FieldType.TEXT,
                label: this.strings[texts.fields.prntCount],
                container: purchaseOrder.subtab.print
            });

            if(printHistoryDao.totalPrints > 0){
                fldPrntCount.defaultValue = printHistoryDao.totalPrints.toFixed(0);
            }

            fldPrntCount.setHelpText(this.strings[texts.flh.prntCount]);
            fldPrntCount.updateDisplayType({displayType: widget.FieldDisplayType.INLINE});

            let sublistDefinition = [
                {
                    'id': 'custpage_jpprintdatetime',
                    'label': this.strings[printHistoryDao.fields.dateTime.id.toUpperCase()],
                    'type': widget.FieldType.TEXT
                },
                {
                    'id': 'custpage_jpprintuser',
                    'label': this.strings[printHistoryDao.fields.user.id.toUpperCase()],
                    'type': widget.FieldType.TEXT
                },
                {
                    'id': 'custpage_jpfilelink',
                    'label': this.strings[printHistoryDao.fields.fileLink.id.toUpperCase()],
                    'type': widget.FieldType.URL
                },
            ];

            let sublist = form.addSublist({
                id: this.historySublist,
                type: widget.SublistType.STATICLIST,
                label: tabLabel,
                tab: purchaseOrder.subtab.print
            });

            sublistDefinition.forEach( (field) => {
                sublist.addField(field);
            });

            if(printHistoryDao.totalPrints > 0){

                for(let line = 0; line < printHistoryDao.totalPrints; line++){
                    let item = printHistoryDao.values[line];

                    sublist.setSublistValue({
                        id: sublistDefinition[0].id,
                        line: line,
                        value: item[printHistoryDao.fields.dateTime.id]
                    });

                    let employee = item[printHistoryDao.fields.empFirstName.id] +
                        item[printHistoryDao.fields.empLastName.id];
                    sublist.setSublistValue({
                        id: sublistDefinition[1].id,
                        line: line,
                        value: employee
                    });

                    sublist.setSublistValue({
                        id: sublistDefinition[2].id,
                        line: line,
                        value: item[printHistoryDao.fields.fileLink.id]
                    });
                }
            }

            let button = form.addButton({
                id: purchaseOrder.fields.printBtn.id,
                label: this.strings[texts.button.print],
                functionName: 'jpclickPrint'
            });
            form.clientScriptFileId = clientScriptDao.getPurchaseOrderCSScriptFileId();
            button.isHidden = true;

            let nonprintContext = [
                scriptContext.UserEventType.CREATE,
                scriptContext.UserEventType.EDIT
            ];

            let status = rec.getValue({fieldId: 'statusRef'});
            log.debug({title: "Status", details: status});

            let statusOk = (nonAcceptedStatus.indexOf(status) === -1 );

            if(!vendor.fields.ApplySubcon.val){
                //default NS behavior
                togglePrintButton(false, form);
            }
            else {
                //cases where ApplySubcon = true
                if(!statusOk){
                    //default NS behavior
                    togglePrintButton(false, form);
                }
                else if((nonprintContext.indexOf(scriptContext.type) === -1) ){
                    //view mode and statusok=true
                    button.isHidden = false;
                    togglePrintButton(true, form);
                }
                else if((nonprintContext.indexOf(scriptContext.type) !== -1) ){
                    //create/edit mode + statusOk = true; all print buttons are hidden
                    button.isHidden = true;
                    togglePrintButton(true, form);
                }
            }
        }
        else{//non JP normal mode.
            togglePrintButton(false, form);
        }
    }

    function togglePrintButton(isHidden, form){
        //NS default print buttons.
        let btnPrint = form.getButton({id: 'print'});
        let btnPrintLabel = form.getButton({id: 'printlabel'});
        let btnSavePrint = form.getButton({id: 'saveprint'});

        if(btnPrint) btnPrint.isHidden = isHidden;
        if(btnPrintLabel) btnPrintLabel.isHidden = isHidden;
        if(btnSavePrint) btnSavePrint.isHidden = isHidden;
    }

    return JP_PurchaseOrderUI;
});
