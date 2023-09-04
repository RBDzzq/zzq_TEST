/**
 * DJ_修理品Client
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/09/24     CPC_苑
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type){
	//修理品ステータス：初期は未受領の状態です。
	if(type == 'create'){
		nlapiSetFieldValue('custrecord_djkk_re_status', '1');
	}
	
	//初期連結設定する
	if(isEmpty( nlapiGetFieldValue('custrecord_djkk_re_subsidiary'))){
		nlapiSetFieldValue('custrecord_djkk_re_subsidiary',getRoleSubsidiary());
	}
	
	//20220907 add by zhou U723
	//食品Gの場合はフィールドを隠す
	var subsidiary = getRoleSubsidiary();
	if(subsidiary == SUB_NBKK || subsidiary == SUB_ULKK){
		setFieldDisableType('custrecord_djkk_repair_answer_1','hidden');//20PPM→
		setFieldDisableType('custrecord_djkk_repair_answer_2','hidden');//8PPM→
		setFieldDisableType('custrecord_djkk_repair_answer_3','hidden');//3PPM→
		setFieldDisableType('custrecord_djkk_inmeasurable','hidden');// DJ_測定不可
		setFieldDisableType('custrecord_djkk_repair_answer_5','hidden');//電池プラグ（破損のため交換必須）
		setFieldDisableType('custrecord_djkk_repair_answer_6','hidden');//センサー（故障しておりCALができません。信頼性ある測定値が得られない為、交換必須となります。）
		setFieldDisableType('custrecord_djkk_repair_answer_7','hidden');//センサー（故障ではありませんが劣化が考えられます。購入後または前回センサー交換時期より３年以上経過されている方に推奨しています。）
		setFieldDisableType('custrecord_djkk_repair_answer_8','hidden');//その他
	}
	//end
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){
	var inspectionFlg = nlapiGetFieldValue('custrecord_djkk_re_inspection_end')
	var status = nlapiGetFieldValue('custrecord_djkk_re_status')
	var eatimateSendFlg = nlapiGetFieldValue('custrecord_djkk_re_estimate_sent')
	var eatimateAnswerFlg = nlapiGetFieldValue('custrecord_djkk_re_estimate_answer')
	
	//修理品ステータス：　ステータスが入庫、未受領し、検品済みチェック場合　検品済みへ設定
	if(inspectionFlg == 'T' && status < 3){
		nlapiSetFieldValue('custrecord_djkk_re_status', '3');
	}
	
	//修理品ステータス：　ステータスが入庫、未受領、検品済みし、見積書書送信済みチェック場合　見積書書送信済みへ設定
	if(eatimateSendFlg == 'T' && status < 4){
		nlapiSetFieldValue('custrecord_djkk_re_status', '4');
	}
	
	//修理品ステータス：　ステータスが入庫、未受領、検品済み、見積書書送信済みし、見積書書回答済みチェック場合　見積書書回答済みへ設定
	if(eatimateAnswerFlg == 'T' && status < 5){
		nlapiSetFieldValue('custrecord_djkk_re_status', '5');
	}
    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum){
 
}

/*
 * 見積
 * */
function createstimate(){
	var repaireRec = nlapiLoadRecord('customrecord_djkk_repair', nlapiGetRecordId())
	var id=nlapiGetRecordId();
	var theLink = nlapiResolveURL('RECORD', 'estimate','', 'EDIT');
	//20220907 add by zhou U723
	var subsidiary = getRoleSubsidiary();
	if(subsidiary != SUB_NBKK && subsidiary != SUB_ULKK){
		//食品G時にurlリンクのスプライスを停止する
		var answer1 = repaireRec.getFieldValue('custrecord_djkk_repair_answer_1');//20PPM→
		var answer2 = repaireRec.getFieldValue('custrecord_djkk_repair_answer_2');//8PPM→
		var answer3 = repaireRec.getFieldValue('custrecord_djkk_repair_answer_3');//3PPM→
		var answer4 = repaireRec.getFieldValue('custrecord_djkk_inmeasurable');// DJ_測定不可
		var answer5 = repaireRec.getFieldValue('custrecord_djkk_repair_answer_5');//電池プラグ（破損のため交換必須）
		var answer6 = repaireRec.getFieldValue('custrecord_djkk_repair_answer_6');//センサー（故障しておりCALができません。信頼性ある測定値が得られない為、交換必須となります。）
		var answer7 = repaireRec.getFieldValue('custrecord_djkk_repair_answer_7');//センサー（故障ではありませんが劣化が考えられます。購入後または前回センサー交換時期より３年以上経過されている方に推奨しています。）
		var answer8 = repaireRec.getFieldValue('custrecord_djkk_repair_answer_8');//その他
		theLink += '&answer1=' + answer1;
		theLink += '&answer2=' + answer2;
		theLink += '&answer3=' + answer3;
		theLink += '&answer4=' + answer4;
		theLink += '&answer5=' + answer5;
		theLink += '&answer6=' + answer6;
		theLink += '&answer7=' + answer7;
		theLink += '&answer8=' + answer8;
	}
	//end
	
	
	
	// パラメータの追加
	theLink += '&repairid=' + id;
	window.ischanged = false;
	location.href = theLink;			 
}

/*
 * 修理品PDF
 * */
function repairPDF(){
	var theLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_repair','customdeploy_djkk_sl_repair');
	theLink+='&repairid='+nlapiGetRecordId();
	window.open(theLink);		 
}

/*
 * 入庫
 * */
function inlocationazukari(){
	nlapiLogExecution('DEBUG', '入庫', 'start')
	//修理品ステータス：入庫ボタン押下後、受領済みへ変更
	var repaireRec = nlapiLoadRecord('customrecord_djkk_repair', nlapiGetRecordId())
	if(repaireRec.getFieldValue('custrecord_djkk_re_status') < 2){
		repaireRec.setFieldValue('custrecord_djkk_re_status', 2);
		nlapiSubmitRecord(repaireRec);
	}
	var theLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_repair','customdeploy_djkk_sl_repair');
	theLink+='&inlocationid='+nlapiGetRecordId();
	 var rse = nlapiRequestURL(theLink);
     var inloRecordId = rse.getBody();
     nlapiLogExecution('DEBUG', 'rse', rse)
     nlapiLogExecution('DEBUG', 'inloRecordId', inloRecordId)
     if (!isEmpty(inloRecordId)) {
    	 var inloRecordIdLink= nlapiResolveURL('RECORD', 'customrecord_djkk_inventory_in_custody',inloRecordId, 'EDIT');
    	 nlapiLogExecution('DEBUG', 'URL', inloRecordIdLink)
    	 window.ischanged = false;
 		 location.href = inloRecordIdLink;	
     } else{
    	 alert('入庫失敗');
     }
}

/*
 * 出庫
 * */
function outlocation(){
	
	//修理品ステータス：出庫ボタン押下後、発送済み変更
	var repaireRec = nlapiLoadRecord('customrecord_djkk_repair', nlapiGetRecordId())
	if(repaireRec.getFieldValue('custrecord_djkk_re_status') < 7){
		repaireRec.setFieldValue('custrecord_djkk_re_status', 7);
		nlapiSubmitRecord(repaireRec);
	}
	var theLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_repair','customdeploy_djkk_sl_repair');
	theLink+='&outlocationid='+nlapiGetRecordId();
	var rse = nlapiRequestURL(theLink);
    var outloRecordId = rse.getBody();
    if (!isEmpty(outloRecordId)) {
   	 var outloRecordIdLink= nlapiResolveURL('RECORD', 'customrecord_djkk_ic_change',outloRecordId, 'EDIT');
   	 window.ischanged = false;
	location.href = outloRecordIdLink;	
    } else{
   	 alert('出庫失敗');
    }
}

function statusClose(){
	//修理品ステータス：完了ボタン押下後、完了変更
	var repaireRec = nlapiLoadRecord('customrecord_djkk_repair', nlapiGetRecordId())
	if(repaireRec.getFieldValue('custrecord_djkk_re_status') < 10){
		repaireRec.setFieldValue('custrecord_djkk_re_status', 10);
		nlapiSubmitRecord(repaireRec);
	}
	var link= nlapiResolveURL('RECORD', 'customrecord_djkk_repair',nlapiGetRecordId(), 'VIEW');
  	 window.ischanged = false;
	location.href = link;	
}

function searchso(){
	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_repair_search_so', 'customdeploy_djkk_sl_repair_search_so','EDIT');
	//https += '&workorderId='+nlapiGetRecordId();
//	open(https, 'newwindow', 1200, 720, this, false, '注文書を検索する')
	//nlExtOpenWindow(https, 'newwindow', 1200, 720, this, false, '注文書を検索する');
		https += '&searchType='+'S';	//'S' =>注文書
		open(https, 'newwindow', 1200, 720, this, false, '注文書を検索する')
		//20220909 add by zhou U721
}
function searchrepair(){
	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_repair_search_so', 'customdeploy_djkk_sl_repair_search_so','EDIT');
	//https += '&workorderId='+nlapiGetRecordId();
//	open(https, 'newwindow', 1200, 720, this, false, '注文書を検索する')
	//nlExtOpenWindow(https, 'newwindow', 1200, 720, this, false, '注文書を検索する');
		https += '&searchType='+'R';	//'R' =>修理品
		open(https, 'newwindow', 1200, 720, this, false, '修理品を検索する')	
		//20220909 add by zhou U721
}
function setsoinfo(serilNo, item, so, sono, location, irime, unit,inventorydetail_id) {
	nlapiSetFieldValue('custrecord_djkk_re_serial_no', serilNo);
	nlapiSetFieldValue('custrecord_djkk_re_item', item);
	nlapiSetFieldValue('custrecord_djkk_re_salesorder_id', so);
	nlapiSetFieldValue('custrecord_djkk_re_salesorder', sono);
	
	
	var count = nlapiGetLineItemCount('recmachcustrecord_djkk_rd_repair');
	
	if(count > 0){
		nlapiSelectLineItem('recmachcustrecord_djkk_rd_repair', 1)
	}else{
		nlapiSelectNewLineItem('recmachcustrecord_djkk_rd_repair');
	}
	nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_rd_repair','custrecord_djkk_rd_item', item);
	nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_rd_repair','custrecord_djkk_rd_quantity', '1');
	nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_rd_repair','custrecord__djkk_rd_conversionrate', irime)
	nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_rd_repair','custrecord_djkk_rd_unit', unit)
	nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_rd_repair','custrecord_djkk_rd_place', location)
	nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_inventorydetails',inventorydetail_id);


}
//20220913 add by zhou
function setreinfo(serilNo, item, so, sono, location, cuslocationid, unit,inventorydetail_id,quantity,irime) {
	nlapiSetFieldValue('custrecord_djkk_re_serial_no', serilNo);
	nlapiSetFieldValue('custrecord_djkk_re_item', item);
	nlapiSetFieldValue('custrecord_djkk_re_salesorder_id', so);
	nlapiSetFieldValue('custrecord_djkk_re_salesorder', sono);
	
	
	var count = nlapiGetLineItemCount('recmachcustrecord_djkk_rd_repair');
	
	if(count > 0){
		nlapiSelectLineItem('recmachcustrecord_djkk_rd_repair', 1)
	}else{
		nlapiSelectNewLineItem('recmachcustrecord_djkk_rd_repair');
	}
	nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_rd_repair','custrecord_djkk_rd_conversionrate', irime);
	nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_rd_repair','custrecord_djkk_rd_item', item);
	nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_rd_repair','custrecord_djkk_rd_quantity', quantity);
	nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_rd_repair','custrecord_djkk_rd_cuslocation', cuslocationid)
	nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_rd_repair','custrecord_djkk_rd_unit', unit)
	nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_rd_repair','custrecord_djkk_rd_place', location)
	nlapiSetCurrentLineItemValue('recmachcustrecord_djkk_rd_repair', 'custrecord_djkk_rd_inventorydetails',inventorydetail_id);


}
//end