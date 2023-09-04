/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/redirect', 'N/error', 'N/format', 'N/http', 'N/https', 'N/record', 'N/transaction', 'N/ui/serverWidget', 'N/url','N/runtime', 'N/search', 'N/log'],
/**
 * @param {error} error
 * @param {format} format
 * @param {http} http
 * @param {https} https
 * @param {record} record
 * @param {transaction} transaction
 * @param {serverWidget} serverWidget
 * @param {url} url
 */
function(redirect,error, format, http, https, record, transaction, serverWidget, url,runtime,search,log) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	try {
            if (context.request.method === 'GET') {
                var stoptype = context.request.parameters.stoptype;
                var customerid = context.request.parameters.customerid;
                
                var customerRecord = record.load({
                    type : 'customer',
                    id : customerid,
                    isDynamic : false,
                    defaultValues : {}
                });              
                var reasonid = '';
                var reasontxt = '';
                var titleName='';
                var labeReason='';
                var labeReasonTxt='';
                var labeReasonSource='';
                if(stoptype=='T'){
                	titleName='出荷停止';
                	labeReason='DJ_停止理由';
                    labeReasonTxt='DJ_停止理由（入力）';
                    labeReasonSource='customlist_djkk_suspend_reason';
                    reasonid = customerRecord.getValue({
                        fieldId : 'custentity_djkk_suspend_reason'
                    });
                    reasontxt = customerRecord.getValue({
                        fieldId : 'custentity_djkk_suspend_reason_input'
                    });
                }else if(stoptype=='F'){
                	titleName='出荷回復';
                	labeReason='DJ_回復理由';
                    labeReasonTxt='DJ_回復理由（入力）';
                    labeReasonSource='customlist_djkk_reinstate_reason';
                    reasonid = customerRecord.getValue({
                        fieldId : 'custentity_djkk_reinstate_reason'
                    });
                    reasontxt = customerRecord.getValue({
                        fieldId : 'custentity_djkk_reinstate_reason_input'
                    });
                }
                var form = serverWidget.createForm({
                    title: titleName,
                    hideNavBar : true
                });
                
               
                //form.clientScriptModulePath = '../Client/djkk_cs_customer_shipstop.js';
                var salesrep = form.addField({
                    id: 'custom_salesrep',
                    type: serverWidget.FieldType.SELECT,
                    label: ' 販売員（当社担当）'
                });
                salesrep.addSelectOption({
                    value: '',
                    text: ''
                });
                salesrep.isMandatory = true;
                var employeeSearchObj = search.create({
                	   type: "employee",
                	   filters:
                	   [
                	      ["salesrep","is","T"]
                	   ],
                	   columns:
                	   [
                	      search.createColumn({name: "internalid", label: "内部ID"}),
                	      search.createColumn({
                	         name: "entityid",
                	         sort: search.Sort.ASC,
                	         label: "名前"
                	      })
                	   ]
                	});
                	var searchResultCount = employeeSearchObj.runPaged().count;
                	log.debug("employeeSearchObj result count",searchResultCount);
                	employeeSearchObj.run().each(function(result){
                		salesrep.addSelectOption({
                            value: result.getValue('internalid'),
                            text: result.getValue('entityid')
                        });
                	   return true;
                	});
                salesrep.defaultValue =customerRecord.getValue({
                    fieldId : 'salesrep'
                });
                var selectFieldstop = form.addField({
                    id: 'custom_stopid',
                    type: serverWidget.FieldType.SELECT,
                    label: labeReason,
                    source: labeReasonSource
                });
                selectFieldstop.isMandatory = true;
                selectFieldstop.defaultValue =reasonid;
                selectFieldstop.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW
                });
                var field = form.addField({
                    id: 'custom_txtarea',
                    type: serverWidget.FieldType.TEXTAREA,
                    label: labeReasonTxt
                });
                field.defaultValue =reasontxt;
                field.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW
                });
                var customidField= form.addField({
                    id: 'custom_customid',
                    type: serverWidget.FieldType.TEXT,
                    label: 'customid'
                });
                customidField.defaultValue =customerid;
                customidField.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.HIDDEN
                });
               var stoptypeField= form.addField({
                    id: 'custom_stoptype',
                    type: serverWidget.FieldType.TEXT,
                    label: 'stoptype'
                });
               stoptypeField.defaultValue =stoptype;
             stoptypeField.updateDisplayType({
             displayType : serverWidget.FieldDisplayType.HIDDEN
         });
                form.addSubmitButton({label: '更新'});
                context.response.writePage(form);
            } else if (context.request.method === 'POST') {
            	 var stoptype = context.request.parameters.custom_stoptype;
                 var customerid = context.request.parameters.custom_customid;                
                 var salesrep = context.request.parameters.custom_salesrep;                
                 var suspendReason = context.request.parameters.custom_stopid;
                 var txtarea = context.request.parameters.custom_txtarea;
                 var customerRecord = record.load({
                    type : 'customer',
                    id : customerid,
                    isDynamic : false,
                    defaultValues : {}
                });
                customerRecord.setValue({
                    "fieldId": "salesrep",
                    "value": salesrep,
                    ignoreFieldChange:true
                });
                
                if(stoptype=='T'){
                	customerRecord.setValue({
                        "fieldId": "custentity_djkk_suspend_reason",
                        "value": suspendReason,
                        ignoreFieldChange:true
                    });
                    customerRecord.setValue({
                        "fieldId": "custentity_djkk_suspend_reason_input",
                        "value": txtarea,
                        ignoreFieldChange:true
                    });
                }else if(stoptype=='F'){
                	customerRecord.setValue({
                        "fieldId": "custentity_djkk_reinstate_reason",
                        "value": suspendReason,
                        ignoreFieldChange:true
                    });
                    customerRecord.setValue({
                        "fieldId": "custentity_djkk_reinstate_reason_input",
                        "value": txtarea,
                        ignoreFieldChange:true
                    });
                }
               
                var customerRecordId = customerRecord.save({
                    enableSourcing : false,
                    ignoreMandatoryFields : true
                });
                   
                redirect.toSuitelet({
                    scriptId: 'customscript_djkk_sl_sendmail',
                    deploymentId: 'customdeploy_djkk_sl_sendmail',
                    parameters: {
                        'customerid': customerid,
                        'suspend_flag': stoptype,
                        'userid': '114'
                    }
                });
            }
        } catch (e) {
            log.error({
                title: 'DEBUG',
                details: e
            });
        }
    }

    return {
        onRequest: onRequest
    };
    
});
