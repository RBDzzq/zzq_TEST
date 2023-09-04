/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([], function() {
	 /**
     * Function to be executed after page is initialized.
     * 
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     * @since 2015.2
     */
    function pageInit(scriptContext) {
    	var mode = scriptContext.mode;
    	 var curRec = scriptContext.currentRecord;
    	  var dealType = getApprovalObj(curRec.type);
  if (mode == 'edit') {
    	var apprFlag = curRec.getValue('custrecord_djkk_body_flg');
   if(apprFlag){
    if(curRec.getValue('custrecord_djkk_body_status')&&curRec.getValue('custrecord_djkk_body_status')!='4'){
    	setTableHIDDEN('item_splits');
    	setTableHIDDEN('tbl_item_addmultiple');
    	setTableHIDDEN('tbl_upsellpopup');
    	setTableHIDDEN('tbl_item_addprojectitems');
    	setTableHIDDEN('tbl_clearsplitsitem');
    	setTableHIDDEN('custom59lnk');
    	// カスタム
    	setTableHIDDEN('customlnk');
    	
    	// 関連レコード
    	setTableHIDDEN('rlrcdstablnk');
    	
        // コミュニケーション
    	setTableHIDDEN('cmmnctntablnk');
    	
    	// 関係
    	setTableHIDDEN('rltnshptablnk');
    		}
    	}
    	  }
    }
	
	
	
    function setTableHIDDEN(table) {
    	try {
    		document.getElementById(table).style.display = 'none';
    		//document.getElementById(table).style.visibility = "hidden";
    	} catch (e) {
    	}
    }
    
    /**
     * Function to be executed when field is changed.
     * 
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {

        var curRec = scriptContext.currentRecord;
        if (scriptContext.fieldId == 'custpage_djkk_trans_appr_user') {
            var customApprUser = curRec.getValue('custpage_djkk_trans_appr_user');
            var dealType = getApprovalObj(curRec.type);
            if (dealType != '10') {
                curRec.setValue({
                    fieldId : 'custrecord_djkk_body_next_user',
                    value : customApprUser,
                    ignoreFieldChange : true
                });
            } else {
                curRec.setValue({
                    fieldId : 'custrecord_djkk_arriv_appr_user',
                    value : customApprUser,
                    ignoreFieldChange : true
                });
            }
        }
    }

    /**
     * 承認対象を取得する
     */
    function getApprovalObj(recType) {

        var result = '10';

        if (recType == 'estimate') {
            result = '1';
        } else if (recType == 'salesorder') {
            result = '2';
        } else if (recType == 'customerdeposit') {
            result = '3';
        } else if (recType == 'returnauthorization') {
            result = '4';
        } else if (recType == 'creditmemo') {
            result = '5';
        } else if (recType == 'purchaseorder') {
            result = '6';
        } else if (recType == 'vendorbill') {
            result = '7';
        } else if (recType == 'vendorreturnauthorization') {
            result = '8';
        } else if (recType == 'vendorcredit') {
            result = '9';
        } else if (recType == 'invoice') {
            result = '11';
        }else if (recType == 'customrecord_djkk_custbody_shedunloading') {
            result = '14';
        }
        return result;
    }

    return {
    	pageInit : pageInit,
    	setTableHIDDEN: setTableHIDDEN,
        fieldChanged : fieldChanged
    };
});
