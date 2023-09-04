/**
 * DJ_�C���iClient
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/09/24     CPC_��
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
	//�C���i�X�e�[�^�X�F�����͖���̂̏�Ԃł��B
	if(type == 'create'){
		nlapiSetFieldValue('custrecord_djkk_re_status', '1');
	}
	
	//�����A���ݒ肷��
	if(isEmpty( nlapiGetFieldValue('custrecord_djkk_re_subsidiary'))){
		nlapiSetFieldValue('custrecord_djkk_re_subsidiary',getRoleSubsidiary());
	}
	
	//20220907 add by zhou U723
	//�H�iG�̏ꍇ�̓t�B�[���h���B��
	var subsidiary = getRoleSubsidiary();
	if(subsidiary == SUB_NBKK || subsidiary == SUB_ULKK){
		setFieldDisableType('custrecord_djkk_repair_answer_1','hidden');//20PPM��
		setFieldDisableType('custrecord_djkk_repair_answer_2','hidden');//8PPM��
		setFieldDisableType('custrecord_djkk_repair_answer_3','hidden');//3PPM��
		setFieldDisableType('custrecord_djkk_inmeasurable','hidden');// DJ_����s��
		setFieldDisableType('custrecord_djkk_repair_answer_5','hidden');//�d�r�v���O�i�j���̂��ߌ����K�{�j
		setFieldDisableType('custrecord_djkk_repair_answer_6','hidden');//�Z���T�[�i�̏Ⴕ�Ă���CAL���ł��܂���B�M�������鑪��l�������Ȃ��ׁA�����K�{�ƂȂ�܂��B�j
		setFieldDisableType('custrecord_djkk_repair_answer_7','hidden');//�Z���T�[�i�̏�ł͂���܂��񂪗򉻂��l�����܂��B�w����܂��͑O��Z���T�[�����������R�N�ȏ�o�߂���Ă�����ɐ������Ă��܂��B�j
		setFieldDisableType('custrecord_djkk_repair_answer_8','hidden');//���̑�
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
	
	//�C���i�X�e�[�^�X�F�@�X�e�[�^�X�����ɁA����̂��A���i�ς݃`�F�b�N�ꍇ�@���i�ς݂֐ݒ�
	if(inspectionFlg == 'T' && status < 3){
		nlapiSetFieldValue('custrecord_djkk_re_status', '3');
	}
	
	//�C���i�X�e�[�^�X�F�@�X�e�[�^�X�����ɁA����́A���i�ς݂��A���Ϗ������M�ς݃`�F�b�N�ꍇ�@���Ϗ������M�ς݂֐ݒ�
	if(eatimateSendFlg == 'T' && status < 4){
		nlapiSetFieldValue('custrecord_djkk_re_status', '4');
	}
	
	//�C���i�X�e�[�^�X�F�@�X�e�[�^�X�����ɁA����́A���i�ς݁A���Ϗ������M�ς݂��A���Ϗ����񓚍ς݃`�F�b�N�ꍇ�@���Ϗ����񓚍ς݂֐ݒ�
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
 * ����
 * */
function createstimate(){
	var repaireRec = nlapiLoadRecord('customrecord_djkk_repair', nlapiGetRecordId())
	var id=nlapiGetRecordId();
	var theLink = nlapiResolveURL('RECORD', 'estimate','', 'EDIT');
	//20220907 add by zhou U723
	var subsidiary = getRoleSubsidiary();
	if(subsidiary != SUB_NBKK && subsidiary != SUB_ULKK){
		//�H�iG����url�����N�̃X�v���C�X���~����
		var answer1 = repaireRec.getFieldValue('custrecord_djkk_repair_answer_1');//20PPM��
		var answer2 = repaireRec.getFieldValue('custrecord_djkk_repair_answer_2');//8PPM��
		var answer3 = repaireRec.getFieldValue('custrecord_djkk_repair_answer_3');//3PPM��
		var answer4 = repaireRec.getFieldValue('custrecord_djkk_inmeasurable');// DJ_����s��
		var answer5 = repaireRec.getFieldValue('custrecord_djkk_repair_answer_5');//�d�r�v���O�i�j���̂��ߌ����K�{�j
		var answer6 = repaireRec.getFieldValue('custrecord_djkk_repair_answer_6');//�Z���T�[�i�̏Ⴕ�Ă���CAL���ł��܂���B�M�������鑪��l�������Ȃ��ׁA�����K�{�ƂȂ�܂��B�j
		var answer7 = repaireRec.getFieldValue('custrecord_djkk_repair_answer_7');//�Z���T�[�i�̏�ł͂���܂��񂪗򉻂��l�����܂��B�w����܂��͑O��Z���T�[�����������R�N�ȏ�o�߂���Ă�����ɐ������Ă��܂��B�j
		var answer8 = repaireRec.getFieldValue('custrecord_djkk_repair_answer_8');//���̑�
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
	
	
	
	// �p�����[�^�̒ǉ�
	theLink += '&repairid=' + id;
	window.ischanged = false;
	location.href = theLink;			 
}

/*
 * �C���iPDF
 * */
function repairPDF(){
	var theLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_repair','customdeploy_djkk_sl_repair');
	theLink+='&repairid='+nlapiGetRecordId();
	window.open(theLink);		 
}

/*
 * ����
 * */
function inlocationazukari(){
	nlapiLogExecution('DEBUG', '����', 'start')
	//�C���i�X�e�[�^�X�F���Ƀ{�^��������A��̍ς݂֕ύX
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
    	 alert('���Ɏ��s');
     }
}

/*
 * �o��
 * */
function outlocation(){
	
	//�C���i�X�e�[�^�X�F�o�Ƀ{�^��������A�����ςݕύX
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
   	 alert('�o�Ɏ��s');
    }
}

function statusClose(){
	//�C���i�X�e�[�^�X�F�����{�^��������A�����ύX
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
//	open(https, 'newwindow', 1200, 720, this, false, '����������������')
	//nlExtOpenWindow(https, 'newwindow', 1200, 720, this, false, '����������������');
		https += '&searchType='+'S';	//'S' =>������
		open(https, 'newwindow', 1200, 720, this, false, '����������������')
		//20220909 add by zhou U721
}
function searchrepair(){
	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_repair_search_so', 'customdeploy_djkk_sl_repair_search_so','EDIT');
	//https += '&workorderId='+nlapiGetRecordId();
//	open(https, 'newwindow', 1200, 720, this, false, '����������������')
	//nlExtOpenWindow(https, 'newwindow', 1200, 720, this, false, '����������������');
		https += '&searchType='+'R';	//'R' =>�C���i
		open(https, 'newwindow', 1200, 720, this, false, '�C���i����������')	
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