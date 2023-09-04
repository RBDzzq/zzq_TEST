/**
 * 見積書のUserEvent
 * 
 * Version    Date            Author           Remarks
 * 1.00       20 Jul 2021     gsy95
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function userEventBeforeLoad(type, form, request){
	try{
	var repairid=request.getParameter('repairid');
	//20220907 add by zhou U723
	var answer1 = request.getParameter('answer1');//20PPM→
	var answer2 = request.getParameter('answer2');//8PPM→
	var answer3 = request.getParameter('answer3');//3PPM→
	var answer4 = request.getParameter('answer4');// DJ_測定不可
	var answer5 = request.getParameter('answer5');//電池プラグ（破損のため交換必須）
	var answer6 = request.getParameter('answer6');//センサー（故障しておりCALができません。信頼性ある測定値が得られない為、交換必須となります。）
	var answer7 = request.getParameter('answer7');//センサー（故障ではありませんが劣化が考えられます。購入後または前回センサー交換時期より３年以上経過されている方に推奨しています。）
	var answer8 = request.getParameter('answer8');//その他
	//end
	if(!isEmpty(repairid)){
		
		// DJ_修理品レコード
		nlapiSetFieldValue('custbody_djkk_estimate_re',repairid);
		var repair=nlapiLoadRecord('customrecord_djkk_repair', repairid);
		nlapiSetFieldValue('entity', repair.getFieldValue('custrecord_djkk_re_customer'));
		nlapiSetFieldValue('subsidiary', repair.getFieldValue('custrecord_djkk_re_subsidiary'));	
		//20220907 add by zhou U723
		var customform = nlapiGetFieldValue('customform');
		if(customform == '144'){
			nlapiSetFieldValue('custbody_djkk_repair_answer_1',answer1);//20PPM→
			nlapiSetFieldValue('custbody_djkk_repair_answer_2',answer2);//8PPM→
			nlapiSetFieldValue('custbody_djkk_repair_answer_3',answer3);//3PPM→
			nlapiSetFieldValue('custbody_djkk_repair_answer_4',answer4);// DJ_測定不可
			nlapiSetFieldValue('custbody_djkk_repair_answer_5',answer5);//電池プラグ（破損のため交換必須）
			nlapiSetFieldValue('custbody_djkk_repair_answer_6',answer6);//センサー（故障しておりCALができません。信頼性ある測定値が得られない為、交換必須となります。）
			nlapiSetFieldValue('custbody_djkk_repair_answer_7',answer7);//センサー（故障ではありませんが劣化が考えられます。購入後または前回センサー交換時期より３年以上経過されている方に推奨しています。）
			nlapiSetFieldValue('custbody_djkk_repair_answer_8',answer8);//その他
		}
		//end
	}
	}catch(e){
		
	}

		if(!isEmpty(nlapiGetFieldValue('custbody_djkk_estimate_re'))&&type=='view'){
		form.setScript('customscript_djkk_cs_estimate');
		form.addButton('custpage_repairestimatepdf', '修理品の見積書PDF出力','repairestimatePDF();');
		}
		
	//プロジェクト非表示
	setFieldDisableType('job','hidden')
 
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function userEventBeforeSubmit(type){
 
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function userEventAfterSubmit(type){
	if(type == 'create'||type == 'edit'){
		//20220901 add by zhou U063 見積送信
		nlapiLogExecution('debug', 'aaa','aaa');
		var sendmailFlag = nlapiGetFieldValue('custbody_djkk_sendmail_ready');
		nlapiLogExecution('debug', 'sendmailFlag',sendmailFlag);
		var entity =  nlapiGetFieldValue('entity');
		var repairEstimateId =  nlapiGetRecordId();
		if(sendmailFlag == 'T' && !isEmpty(entity)){
			var scheduleparams = new Array();
			var idParam ={
					repairEstimateId:repairEstimateId,
					entity:entity
				}
			scheduleparams['custscript_djkk_pdfid'] = JSON.stringify(idParam);
			runBatch('customscript_djkk_ss_estimate_sendmail', 'customdeploy_djkk_ss_estimate_sendmail',scheduleparams);
		}
		//end
	}
}
