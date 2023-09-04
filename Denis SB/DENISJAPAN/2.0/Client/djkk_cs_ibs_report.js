/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 * @NAmdConfig ../Common/myconfig.json
 *
 * DJ_�����ו��X�V�i��́j
 * Version    Date            Author           Remarks
 * 1.00       2021/09/26      RUI.YX           Initial
 *
 */
var formRecord='';
define(['N/search','N/currentRecord', 'N/url', 'N/util', 'me'],

    function(search, currentRecord, url , util , me) {

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
	function pageInit(scriptContext){
		formRecord = scriptContext.currentRecord;
	}
	
	
	
    function fieldChanged(scriptContext) {
    	

    	
    	if(scriptContext.fieldId == 'custpage_subsidiary' || scriptContext.fieldId ==  'custpage_shippingid'||scriptContext.fieldId ==  'custpage_status'||
    	scriptContext.fieldId == 'custpage_poid'||scriptContext.fieldId == 'custpage_activity'||scriptContext.fieldId == 'custpage_itemid'||scriptContext.fieldId=='custpage_entryperson'||
    	scriptContext.fieldId == 'custpage_seaair'){
          var currentRecord = scriptContext.currentRecord;
          var condition_data = getSearchConditionData(currentRecord, false);
          condition_data.op ='';
          window.ischanged = false;
          window.location.href = getGetConditionUrl(condition_data);
    	}
    	
        //���׍s�́u�I���v���O��
//        if (scriptContext.line === undefined) {
//            var currentRecord = scriptContext.currentRecord;
//            var condition_data = getSearchConditionData(currentRecord, false);
//            condition_data.op ='';
//            window.ischanged = false;
//            window.location.href = getGetConditionUrl(condition_data);
//        }
    }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {
        var currentRecord = scriptContext.currentRecord;

        var numLines = currentRecord.getLineCount({
            sublistId: 'custpage_result_list'
        });

        var checkCounts = 0;
        for (i = 0; i < numLines; i++) {
            var checked = currentRecord.getSublistValue({
                sublistId: 'custpage_result_list',
                fieldId: 'sub_list_checkbox',
                line: i
            });

            if (checked) checkCounts++;
        }

        if (checkCounts == 0) {
            alert('�ΏۑI�����Ă��������B');
            return false;
        }

        return true;

    }

    /**
     * �����{�^���N���b�N
     *
     */
    function btnSearchButton() {
        var currentRecordData = currentRecord.get();
        
        
        var sub = currentRecordData.getValue({
            fieldId: 'custpage_subsidiary'
        });
        if(me.isEmpty(sub)){
        	alert("�A������͂��Ă��������B")
        	return ;
        }
        
        var condition_data = getSearchConditionData(currentRecordData, false);
        condition_data.op = 's';
        window.ischanged = false;
        window.location.href = getGetConditionUrl(condition_data);
    }

    /**
     * �N���A�{�^���N���b�N
     *
     */
    function btnClearButton() {
        var condition_data = {};
        window.ischanged = false;
        window.location.href = getGetConditionUrl(condition_data);
    }

    /**
     * �����ɖ߂�{�^���N���b�N
     *
     */
    function btnBackButton() {
        var currentRecordData = currentRecord.get();
        var condition_data = getSearchConditionData(currentRecordData, true);
        condition_data.op = '';
        window.ischanged = false;
        window.location.href = getGetConditionUrl(condition_data);
    }

    // �ΏۑI���̃`�F�b�N
    function chkMarkItem(currentRecord_data) {
        var numLines = currentRecord_data.getLineCount({
            sublistId: 'custpage_result_list'
        });

        var checkCounts = 0;
        for (i = 0; i < numLines; i++) {
            var checked = currentRecord_data.getSublistValue({
                sublistId: 'custpage_result_list',
                fieldId: 'sub_list_check',
                line: i
            });

            if (checked) checkCounts++;
        }

        if (checkCounts == 0) {
            alert('�ΏۑI�����Ă��������B');
            return false;
        }

        return true;
    }

    /**
     * PDF�o�̓{�^���N���b�N
     *
     */
//    function btnPDFButton(fileUrl) {
//        window.open(fileUrl,'_blank')
//    }
    function btnOverButton(){
    	 var currentRecordData = currentRecord.get();
         var condition_data = getSearchConditionDataOver(currentRecordData, false);
         condition_data.op = 's';
         window.ischanged = false;
         window.location.href = getGetConditionUrl(condition_data);
    }
    function btnPDFButton(fileUrl) {
    	window.open(fileUrl,'_blank')
//       var lineCount = formRecord.getLineCount({
//			sublistId : 'custpage_result_list'
//		});
//       var asblArr = [];
//       for (var i = 0; i < lineCount; i++) {
//			var checkboxFlag = formRecord.getSublistValue({
//				sublistId : 'custpage_result_list',
//				fieldId : 'sub_list_checkbox',
//				line : i
//			});
//			if(checkboxFlag==true){
//				asblArr.push(i);	
//			}								
//		}
//		if(asblArr.length==0){
//			alert("�ڍ׃��C���f�[�^���`�F�b�N����Ă��܂���");
//			return false;
//		}
//		var str=''
//		for(var a=0;a<asblArr.length;a++){
//			var val = asblArr[a];
//			str=str+val+','
//		}
//		var currentRecordData = currentRecord.get();
//		 var condition_data = getSearchConditionData(currentRecordData, false);
//	        condition_data.op = 's';
//	        condition_data.pdf = str;
//	        window.ischanged = false;
//	        window.location.href = getGetConditionUrl(condition_data);
		
    }

    /**
     * CSV�o�̓{�^���N���b�N
     *
     */
    function btnCSVButton(fileUrl) {
        window.open(fileUrl,'_blank')
    }

    /**
     * ���GET�pURL�쐬
     *
     */
    function getGetConditionUrl(condition_data) {
        var linkUrl = url.resolveScript({
            scriptId: 'customscript_djkk_sl_ibs_report',
            deploymentId: 'customdeploy_djkk_sl_ibs_report',
            returnExternalUrl: false,
            params: condition_data
        });

        return linkUrl;
    }

    /**
     * ���������f�[�^�̎擾
     *
     */
    function getSearchConditionData(currentRecord, hidden) {
        var condition_data = {};
        var split_mark = ",";

//        if (!hidden) {
//            //��̏ꏊ
//            condition_data.recLocation = currentRecord.getValue({
//                fieldId: 'custpage_receivinglocation'
//            }).join(split_mark);
//
//            //�o�הԍ�
//            condition_data.shipNo = currentRecord.getValue({
//                fieldId: 'custpage_shipmentnumber'
//            }).join(split_mark);
//            
//            //�A�C�e��
//            condition_data.item = currentRecord.getValue({
//                fieldId: 'custpage_item'
//            }).join(split_mark);

            
            //�A��
            condition_data.subsidiary = currentRecord.getValue({
                fieldId: 'custpage_subsidiary'
            });
            //�����ו�ID
            condition_data.shippingid = currentRecord.getValue({
                fieldId: 'custpage_shippingid'
            });
          //����
            condition_data.poid = currentRecord.getValue({
                fieldId: 'custpage_poid'
            });
          //�Z�N�V����
            condition_data.activity = currentRecord.getValue({
                fieldId: 'custpage_activity'
            });
          //�d����(�R�[�h)
            condition_data.vendorcode = currentRecord.getValue({
                fieldId: 'custpage_vendorcode'
            });
          //�d����(���O)
            condition_data.vendorname = currentRecord.getValue({
                fieldId: 'custpage_vendorname'
            });
          //�A�C�e��ID
            condition_data.itemid = currentRecord.getValue({
                fieldId: 'custpage_itemid'
            });
          //���i��(ENGLISH)
            condition_data.shopenglish = currentRecord.getValue({
                fieldId: 'custpage_shopenglish'
            });
          //���i��(���{��)
            condition_data.shopjapan = currentRecord.getValue({
                fieldId: 'custpage_shopjapan'
            });
          //�d���揤�i�R�[�h
            condition_data.vendorshopcode = currentRecord.getValue({
                fieldId: 'custpage_vendorshopcode'
            });
            //�t�H�[���[�_�[
            condition_data.forwarder = currentRecord.getValue({
                fieldId: 'custpage_forwarder'
            });
          //SEA�EAIR
            condition_data.seaair = currentRecord.getValue({
                fieldId: 'custpage_seaair'
            });
          //�ʊ֋Ǝ�
            condition_data.customsbroker = currentRecord.getValue({
                fieldId: 'custpage_customsbroker'
            });
          //��̗\���
            condition_data.receiptdate = currentRecord.getText({
                fieldId: 'custpage_receiptdate'
            });
          //��̗\���to
            condition_data.receiptdateend = currentRecord.getText({
                fieldId: 'custpage_receiptdate_end'
            });
            //���͎�
            condition_data.entryperson = currentRecord.getValue({
                fieldId: 'custpage_entryperson'
            });
//            
//            condition_data.expectedshippingdate = currentRecord.getText({
//                fieldId: 'custpage_expectedshippingdate'
//            });
//            
//            condition_data.actualshippingdate = currentRecord.getText({
//                fieldId: 'custpage_actualshippingdate'
//            });
//            
//            condition_data.expecteddeliverydate = currentRecord.getText({
//                fieldId: 'custpage_expecteddeliverydate'
//            });
//            
//            condition_data.actualdeliverydate = currentRecord.getText({
//                fieldId: 'custpage_actualdeliverydate'
//            });
//            
//            condition_data.vesselnumber = currentRecord.getValue({
//                fieldId: 'custpage_vesselnumber'
//            });
//            
//            condition_data.billoflading = currentRecord.getValue({
//                fieldId: 'custpage_billoflading'
//            });
//            
//            condition_data.delivery_date = currentRecord.getText({
//                fieldId: 'custpage_delivery_date'
//            });
            //staus
            condition_data.status = currentRecord.getValue({
                fieldId: 'custpage_status'
            });
            condition_data.statusText = currentRecord.getText({
                fieldId: 'custpage_status'
            });
            
                
//        } else {
//            //��̏ꏊ
//            condition_data.recLocation = currentRecord.getValue({
//                fieldId: 'hidden_reclocation'
//            });
//
//            //�o�הԍ�
//            condition_data.shipNo = currentRecord.getValue({
//                fieldId: 'hidden_shipno'
//            });
//            
//            //�A�C�e��
//            condition_data.item = currentRecord.getValue({
//                fieldId: 'hidden_item'
//            });
//            
//            //�A��
//            condition_data.subsidiary = currentRecord.getValue({
//                fieldId: 'custpage_subsidiary'
//            })
//            
//            condition_data.expectedshippingdate = currentRecord.getText({
//                fieldId: 'custpage_expectedshippingdate'
//            });
//            
//            condition_data.actualshippingdate = currentRecord.getText({
//                fieldId: 'custpage_actualshippingdate'
//            });
//            
//            condition_data.expecteddeliverydate = currentRecord.getText({
//                fieldId: 'custpage_expecteddeliverydate'
//            });
//            
//            condition_data.actualdeliverydate = currentRecord.getText({
//                fieldId: 'custpage_actualdeliverydate'
//            });
//            
//            condition_data.vesselnumber = currentRecord.getValue({
//                fieldId: 'custpage_vesselnumber'
//            });
//            
//            condition_data.billoflading = currentRecord.getValue({
//                fieldId: 'custpage_billoflading'
//            });
//            
//            condition_data.delivery_date = currentRecord.getText({
//                fieldId: 'custpage_delivery_date'
//            });
//            
//            condition_data.status = currentRecord.getValue({
//                fieldId: 'custpage_status'
//            });
//            condition_data.statusText = currentRecord.getText({
//                fieldId: 'custpage_status'
//            });
//            
//        }

        return condition_data;
    }
    function getSearchConditionDataOver(currentRecord, hidden) {
        var condition_data = {};
        var split_mark = ",";

            
            //�A��
            condition_data.subsidiary = currentRecord.getValue({
                fieldId: 'custpage_subsidiary_over'
            });
            //�����ו�ID
            condition_data.shippingid = currentRecord.getValue({
                fieldId: 'custpage_shippingid_over'
            });
          //����
            condition_data.poid = currentRecord.getValue({
                fieldId: 'custpage_poid_over'
            });
          //�Z�N�V����
            condition_data.activity = currentRecord.getValue({
                fieldId: 'custpage_activity_over'
            });
          //�d����(�R�[�h)
            condition_data.vendorcode = currentRecord.getValue({
                fieldId: 'custpage_vendorcode_over'
            });
          //�d����(���O)
            condition_data.vendorname = currentRecord.getValue({
                fieldId: 'custpage_vendorname_over'
            });
          //�A�C�e��ID
            condition_data.itemid = currentRecord.getValue({
                fieldId: 'custpage_itemid_over'
            });
          //���i��(ENGLISH)
            condition_data.shopenglish = currentRecord.getValue({
                fieldId: 'custpage_shopenglish_over'
            });
          //���i��(���{��)
            condition_data.shopjapan = currentRecord.getValue({
                fieldId: 'custpage_shopjapan_over'
            });
          //�d���揤�i�R�[�h
            condition_data.vendorshopcode = currentRecord.getValue({
                fieldId: 'custpage_vendorshopcode_over'
            });
            //�t�H�[���[�_�[
            condition_data.forwarder = currentRecord.getValue({
                fieldId: 'custpage_forwarder_over'
            });
          //SEA�EAIR
            condition_data.seaair = currentRecord.getValue({
                fieldId: 'custpage_seaair_over'
            });
          //�ʊ֋Ǝ�
            condition_data.customsbroker = currentRecord.getValue({
                fieldId: 'custpage_customsbroker_over'
            });
          //��̗\���
            condition_data.receiptdate = currentRecord.getText({
                fieldId: 'custpage_receiptdate_over'
            });
          //��̗\���to
            condition_data.receiptdateend = currentRecord.getText({
                fieldId: 'custpage_receiptdate_end_over'
            });
            //���͎�
            condition_data.entryperson = currentRecord.getValue({
                fieldId: 'custpage_entryperson_over'
            });

            condition_data.status = currentRecord.getValue({
                fieldId: 'custpage_status_over'
            });
        return condition_data;
    }

    return {
        fieldChanged: fieldChanged,
        saveRecord: saveRecord,
        btnSearchButton: btnSearchButton,
        btnClearButton: btnClearButton,
        btnBackButton: btnBackButton,
        btnPDFButton: btnPDFButton,
        btnCSVButton: btnCSVButton,
        pageInit:pageInit,
        btnOverButton:btnOverButton
    };
    
});
