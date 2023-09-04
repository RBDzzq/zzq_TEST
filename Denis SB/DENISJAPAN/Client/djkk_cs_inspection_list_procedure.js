/**
 * DJ_検品一覧画面-検品手順
 * 
 * Version    Date            Author           Remarks
 * 1.00       25 Jul 2021     gsy95
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
   
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){

    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Boolean} True to continue changing field value, false to abort value change
 */
function clientValidateField(type, name, linenum){
   
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
 var ipr_class=nlapiGetCurrentLineItemValue('procedureresultdetails', 'ipr_class');
 if(ipr_class=='1'){
	 if(name=='ipr_move_reason'){
		 alert('入力不可');
		 nlapiSetCurrentLineItemValue('procedureresultdetails', 'ipr_move_reason', '0',false,true);
	 }
	 if(name=='ipr_detail_reason'){
		 alert('入力不可'); 
		 nlapiSetCurrentLineItemValue('procedureresultdetails', 'ipr_detail_reason', '',false,true);
	 }
 }

 if(name == 'ipr_move_location'){
	 var bin = nlapiGetFieldText('custpage_binnumber');
	 var location = nlapiGetCurrentLineItemValue(type, name);
	 if(!isEmpty(bin)){
		 var binSearch = nlapiSearchRecord("bin",null,
				 [
				    ["binnumber","is",bin], 
				    "AND", 
				    ["location","anyof",location]
				 ], 
				 [
				    new nlobjSearchColumn("internalid")
				 ]
				 );
		 if(!isEmpty(binSearch)){
			 nlapiSetCurrentLineItemValue(type, 'ipr_move_bin', binSearch[0].getValue("internalid"));
		 }
	 }

	
 }
 
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @returns {Void}
 */
function clientPostSourcing(type, name) {
   
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Void}
 */
function clientLineInit(type) {
     
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function clientValidateLine(type){
 
    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Void}
 */
function clientRecalc(type){
 
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to continue line item insert, false to abort insert
 */
function clientValidateInsert(type){
  
    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to continue line item delete, false to abort delete
 */
function clientValidateDelete(type){
   
    return true;
}

//検品済み
function chkok(){
	if(!checkMustInput()){
		return;
	}
	
    var tmoveCount=0;
    var iprCount = nlapiGetLineItemCount('procedureresultdetails');
    var sub = nlapiGetFieldValue('custpage_subsidiary');
    for(var ipq=1;ipq<iprCount+1;ipq++){
    	tmoveCount+=Number(nlapiGetLineItemValue('procedureresultdetails', 'ipr_quantity', ipq));
    	if(nlapiGetFieldValue('custpage_location') == nlapiGetLineItemValue('procedureresultdetails', 'ipr_move_location', ipq)){
    		alert("移動元と移動先一致している。")
    		return ;
    	}
    }
	if(Number(nlapiGetFieldValue('custpage_move_count')) < Number(tmoveCount)){
		alert("数量が超えています。")
		return;
	}
	
	try{
		
		
	var record = nlapiCreateRecord('customrecord_djkk_inv_ip');
	record.setFieldValue('custrecord_djkk_inv_ip_bin',nlapiGetFieldValue('custpage_binnumber') );
	record.setFieldValue('custrecord_djkk_inv_transaction_number',nlapiGetFieldValue('custpage_transactionid') );
	record.setFieldValue('custrecord_djkk_inv_ip_inspection_level',nlapiGetFieldValue('custpage_inspectionlevelid') );
	record.setFieldValue('custrecord_djkk_inv_ip_item',nlapiGetFieldValue('custpage_itemid') );
	record.setFieldValue('custrecord_djkk_inv_ip_invnumber',nlapiGetFieldValue('custpage_invid') );
	record.setFieldValue('custrecord_djkk_inv_ip_locatio',nlapiGetFieldValue('custpage_location') );
	record.setFieldValue('custrecord_djkk_inv_ip_subsidiary',sub );
	
	record.setFieldValue('custrecord_djkk_inv_ip_key',nlapiGetFieldValue('custpage_itemid')+"-" +nlapiGetFieldValue('custpage_invid'));
	
	var checkFlg = 'T';
	
	//LS場合　手順対応する
	if(checkkenpinteijun(nlapiGetFieldValue('custpage_itemid'))){
		var subListCount = nlapiGetLineItemCount('proceduredetails')
		for(var i = 0; i < subListCount ; i++){
			record.selectNewLineItem('recmachcustrecord_djkk_inv_ipl_main');
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipl_main', 'custrecord_djkk_inv_ipl_inspected', nlapiGetLineItemValue('proceduredetails', 'checkbox', i+1))
			
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipl_main', 'custrecord_djkk_inv_ipl_procedure_number', nlapiGetLineItemValue('proceduredetails', 'procedurenumber', i+1))
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipl_main', 'custrecord_djkk_inv_ipl_procedure_co', nlapiGetLineItemValue('proceduredetails', 'procedurecontents', i+1))
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipl_main', 'custrecord_djkk_inv_ipl_person_in_charge', nlapiGetLineItemValue('proceduredetails', 'personincharge_id', i+1))
			record.commitLineItem('recmachcustrecord_djkk_inv_ipl_main')
		
			if(nlapiGetLineItemValue('proceduredetails', 'checkbox', i+1) != 'T'){
				checkFlg = 'F';
			}
		
		}
	}

	

	for(var j = 0; j < iprCount ; j++){
		record.selectNewLineItem('recmachcustrecord_djkk_inv_ipr_main');
		record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_subsidiary', nlapiGetLineItemValue('procedureresultdetails', 'ipr_subsidiary', j+1));	
		record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_class', nlapiGetLineItemValue('procedureresultdetails', 'ipr_class', j+1));
		record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_quantity', nlapiGetLineItemValue('procedureresultdetails', 'ipr_quantity', j+1));
		var move_location=nlapiGetLineItemValue('procedureresultdetails', 'ipr_move_location', j+1);
		if(!isEmpty(move_location)&&move_location!='0'){
		record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_move_location', move_location);
		}
		var move_reason=nlapiGetLineItemValue('procedureresultdetails', 'ipr_move_reason', j+1);
		if(!isEmpty(move_reason)&&move_reason!='0'){
		record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_move_reason',move_reason);
		}
		record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_bin', nlapiGetLineItemValue('procedureresultdetails', 'ipr_move_bin',j+1));
		record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_detail_reason', nlapiGetLineItemValue('procedureresultdetails', 'ipr_detail_reason',j+1));
		record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_lot_remark', nlapiGetLineItemValue('procedureresultdetails', 'lot_remark',j+1));
		record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_lot_memo', nlapiGetLineItemValue('procedureresultdetails', 'lot_memo',j+1));
		
		record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_makern', nlapiGetLineItemValue('procedureresultdetails', 'custpage_makernum',j+1));
		record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_duetime', nlapiGetLineItemValue('procedureresultdetails', 'custpage_duetime',j+1));
		record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_madedate', nlapiGetLineItemValue('procedureresultdetails', 'custpage_date',j+1));
		record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_deliveryperiod', nlapiGetLineItemValue('procedureresultdetails', 'custpage_deliveryperiod',j+1));

		
		record.commitLineItem('recmachcustrecord_djkk_inv_ipr_main');
		
		
		
	}
	
	//選択数量と総数量一致していない場合
	if(Number(nlapiGetFieldValue('custpage_move_count')) != tmoveCount){
		checkFlg = 'F';
	}
	
	record.setFieldValue('custrecord_djkk_inv_ip_inspected',checkFlg );
	nlapiSubmitRecord(record);
	}
	catch(e){
		alert(e.message)
		return '';
	}
	
	var subsidiary = nlapiGetFieldValue('custpage_subsidiary');
	var location = nlapiGetFieldValue('custpage_location');
	
	var parameter = "&subsidiary="+subsidiary;
	parameter += "&location="+location;
	
	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_inspection_list', 'customdeploy_djkk_sl_inspection_list');	

	// 画面条件変更場合、メッセージ出てこないのため
	window.ischanged = false;
	
	https+=parameter

	
	// 画面をリフレッシュする
	window.location.href = https;
}



function up(){
	if(!checkMustInput()){
		return;
	}
	
	
	var tmoveCount=0;
	var sub = nlapiGetFieldValue('custpage_subsidiary');
    var iprCount = nlapiGetLineItemCount('procedureresultdetails');
    for(var ipq=1;ipq<iprCount+1;ipq++){
    	tmoveCount+=Number(nlapiGetLineItemValue('procedureresultdetails', 'ipr_quantity', ipq));
    	if(nlapiGetFieldValue('custpage_location') == nlapiGetLineItemValue('procedureresultdetails', 'ipr_move_location', ipq)){
    		alert("移動元と移動先一致している。")
    		return ;
    	}
    }
	if(Number(nlapiGetFieldValue('custpage_move_count'))< Number(tmoveCount)){
		alert("数量が超えています。")
		return;
	}
	try{
	var record = nlapiLoadRecord('customrecord_djkk_inv_ip', nlapiGetFieldValue('custpage_inspectedid'));
	
	
	record.setFieldValue('custrecord_djkk_inv_ip_bin',nlapiGetFieldValue('custpage_binnumber') );
	record.setFieldValue('custrecord_djkk_inv_transaction_number',nlapiGetFieldValue('custpage_transactionid') );
	record.setFieldValue('custrecord_djkk_inv_ip_inspection_level',nlapiGetFieldValue('custpage_inspectionlevelid') );
	record.setFieldValue('custrecord_djkk_inv_ip_item',nlapiGetFieldValue('custpage_itemid') );
	record.setFieldValue('custrecord_djkk_inv_ip_invnumber',nlapiGetFieldValue('custpage_invid') );
	record.setFieldValue('custrecord_djkk_inv_ip_inspected',nlapiGetFieldValue('custpage_inspected') );
	record.setFieldValue('custrecord_djkk_inv_ip_key',nlapiGetFieldValue('custpage_itemid')+"-" +nlapiGetFieldValue('custpage_invid'));
	record.setFieldValue('custrecord_djkk_inv_ip_locatio',nlapiGetFieldValue('custpage_location') );
	record.setFieldValue('custrecord_djkk_inv_ip_subsidiary',sub );
	
	var checkFlg = 'T';
	
	//LS場合　手順対応する
	if(checkkenpinteijun(nlapiGetFieldValue('custpage_itemid'))){
		var subListCount = nlapiGetLineItemCount('proceduredetails')
		for(var i = 0; i < subListCount ; i++){
			record.selectLineItem('recmachcustrecord_djkk_inv_ipl_main',i+1);
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipl_main', 'custrecord_djkk_inv_ipl_inspected', nlapiGetLineItemValue('proceduredetails', 'checkbox', i+1))
			
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipl_main', 'custrecord_djkk_inv_ipl_procedure_number', nlapiGetLineItemValue('proceduredetails', 'procedurenumber', i+1))
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipl_main', 'custrecord_djkk_inv_ipl_procedure_co', nlapiGetLineItemValue('proceduredetails', 'procedurecontents', i+1))
//			record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipl_main', 'custrecord_djkk_inv_ipl_person_in_charge', nlapiGetLineItemValue('proceduredetails', 'personincharge_id', i+1))
			record.commitLineItem('recmachcustrecord_djkk_inv_ipl_main')
			
			if(nlapiGetLineItemValue('proceduredetails', 'checkbox', i+1) != 'T'){
				checkFlg = 'F';
			}
			
		}
	}
	
	var iprRecordCount=record.getLineItemCount('recmachcustrecord_djkk_inv_ipr_main');
	
	if(iprRecordCount==iprCount){
		for(var j = 0; j < iprCount ; j++){
			record.selectLineItem('recmachcustrecord_djkk_inv_ipr_main',j+1);				
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_subsidiary', nlapiGetLineItemValue('procedureresultdetails', 'ipr_subsidiary', j+1));	
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_class', nlapiGetLineItemValue('procedureresultdetails', 'ipr_class', j+1));
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_quantity', nlapiGetLineItemValue('procedureresultdetails', 'ipr_quantity', j+1));
			var move_location=nlapiGetLineItemValue('procedureresultdetails', 'ipr_move_location', j+1);
			if(!isEmpty(move_location)&&move_location!='0'){
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_move_location', move_location);
			}
			var move_reason=nlapiGetLineItemValue('procedureresultdetails', 'ipr_move_reason', j+1);
			if(!isEmpty(move_reason)&&move_reason!='0'){
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_move_reason',move_reason);
			}
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_bin', nlapiGetLineItemValue('procedureresultdetails', 'ipr_move_bin',j+1));
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_detail_reason', nlapiGetLineItemValue('procedureresultdetails', 'ipr_detail_reason',j+1));
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_lot_remark', nlapiGetLineItemValue('procedureresultdetails', 'lot_remark',j+1));
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_lot_memo', nlapiGetLineItemValue('procedureresultdetails', 'lot_memo',j+1));
			
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_makern', nlapiGetLineItemValue('procedureresultdetails', 'custpage_makernum',j+1));
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_duetime', nlapiGetLineItemValue('procedureresultdetails', 'custpage_duetime',j+1));
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_madedate', nlapiGetLineItemValue('procedureresultdetails', 'custpage_date',j+1));
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_deliveryperiod', nlapiGetLineItemValue('procedureresultdetails', 'custpage_deliveryperiod',j+1));

			
			record.commitLineItem('recmachcustrecord_djkk_inv_ipr_main');
			
		}
	}else{
		for(var rl = iprRecordCount; rl > 0 ; rl--){
		record.removeLineItem('recmachcustrecord_djkk_inv_ipr_main', rl);
		}
		
		for(var j = 0; j < iprCount ; j++){
			record.selectNewLineItem('recmachcustrecord_djkk_inv_ipr_main');
					
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_subsidiary', nlapiGetLineItemValue('procedureresultdetails', 'ipr_subsidiary', j+1));	
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_class', nlapiGetLineItemValue('procedureresultdetails', 'ipr_class', j+1));
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_quantity', nlapiGetLineItemValue('procedureresultdetails', 'ipr_quantity', j+1));
			var move_location=nlapiGetLineItemValue('procedureresultdetails', 'ipr_move_location', j+1);
			if(!isEmpty(move_location)&&move_location!='0'){
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_move_location', move_location);
			}
			var move_reason=nlapiGetLineItemValue('procedureresultdetails', 'ipr_move_reason', j+1);
			if(!isEmpty(move_reason)&&move_reason!='0'){
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_move_reason',move_reason);
			}
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_bin', nlapiGetLineItemValue('procedureresultdetails', 'ipr_move_bin',j+1));
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_detail_reason', nlapiGetLineItemValue('procedureresultdetails', 'ipr_detail_reason',j+1));
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_lot_remark', nlapiGetLineItemValue('procedureresultdetails', 'lot_remark',j+1));
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_lot_memo', nlapiGetLineItemValue('procedureresultdetails', 'lot_memo',j+1));
			
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_makern', nlapiGetLineItemValue('procedureresultdetails', 'custpage_makernum',j+1));
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_duetime', nlapiGetLineItemValue('procedureresultdetails', 'custpage_duetime',j+1));
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_madedate', nlapiGetLineItemValue('procedureresultdetails', 'custpage_date',j+1));
			record.setCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'custrecord_djkk_inv_ipr_deliveryperiod', nlapiGetLineItemValue('procedureresultdetails', 'custpage_deliveryperiod',j+1));

			record.commitLineItem('recmachcustrecord_djkk_inv_ipr_main');
			
		}
	}
	
	//選択数量と総数量一致していない場合
	if(Number(nlapiGetFieldValue('custpage_move_count')) != tmoveCount){
		checkFlg = 'F';
	}
	
	record.setFieldValue('custrecord_djkk_inv_ip_inspected',checkFlg );
	
	nlapiSubmitRecord(record);
	}catch(e){
		alert(e.message);
		return '';
		}
	
	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_inspection_list', 'customdeploy_djkk_sl_inspection_list');	

	// 画面条件変更場合、メッセージ出てこないのため
	window.ischanged = false;

	
	var subsidiary = nlapiGetFieldValue('custpage_subsidiary');
	var location = nlapiGetFieldValue('custpage_location');
	
	var parameter = "&subsidiary="+subsidiary;
	parameter += "&location="+location;

	https+=parameter
	// 画面をリフレッシュする
	window.location.href = https;	
	
		
}

function droup(){
	var recId = nlapiGetFieldValue('custpage_inspectedid')
	var record = nlapiLoadRecord('customrecord_djkk_inv_ip', recId);
	var subListCount = nlapiGetLineItemCount('proceduredetails')
	for(var i = 0; i < subListCount ; i++){
		record.selectLineItem('recmachcustrecord_djkk_inv_ipl_main',i+1);
		var detialId = record.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipl_main', 'id')
		nlapiDeleteRecord('customrecord_djkk_inv_ip_line', detialId);
	}
	var iprCount = nlapiGetLineItemCount('procedureresultdetails')
	for(var j = 0; j < iprCount ; j++){
		record.selectLineItem('recmachcustrecord_djkk_inv_ipr_main',j+1);
		var iprdetialId = record.getCurrentLineItemValue('recmachcustrecord_djkk_inv_ipr_main', 'id')
		nlapiDeleteRecord('customrecord_djkk_inv_ip_result', iprdetialId);
	}
	nlapiDeleteRecord('customrecord_djkk_inv_ip', recId);
	
	
	var https = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_inspection_list', 'customdeploy_djkk_sl_inspection_list');	

	// 画面条件変更場合、メッセージ出てこないのため
	window.ischanged = false;

	
	var subsidiary = nlapiGetFieldValue('custpage_subsidiary');
	var location = nlapiGetFieldValue('custpage_location');
	
	var parameter = "&subsidiary="+subsidiary;
	parameter += "&location="+location;

	https+=parameter
	// 画面をリフレッシュする
	window.location.href = https;	
	
}

function checkMustInput(){
		var item = nlapiGetFieldValue('custpage_itemid');
		var itemText = nlapiGetFieldText('custpage_itemid');
	   var iprCount = nlapiGetLineItemCount('procedureresultdetails');
	   var binFrom = nlapiGetFieldValue('custpage_binnumber');    		
		var binFromUseFlg =nlapiSearchRecord("location",null,[["internalid","anyof",nlapiGetFieldValue('custpage_location')]],[new nlobjSearchColumn("usesbins")])[0].getValue('usesbins');
		var binUseFlgItem = nlapiLookupField('item', item, 'usebins')	   
		
		//在庫移動対応できないため　保管棚使用場合設定していないのでNGです。
		if(binFromUseFlg == 'T' && binUseFlgItem == 'T'){
			if(isEmpty(binFrom)){
				alert('アイテムと倉庫両方保管棚使用場合、移動元保管棚の設定が必要です。受領書を確認してください。')
				return false;
			}
		}
	   
	   
	    for(var ipq=1;ipq<iprCount+1;ipq++){
	    	var div=nlapiGetLineItemValue('procedureresultdetails', 'ipr_class', ipq);
	    	var count=Number(nlapiGetLineItemValue('procedureresultdetails', 'ipr_quantity', ipq));
	    	var location=nlapiGetLineItemValue('procedureresultdetails', 'ipr_move_location', ipq);
	    	var locationText=nlapiGetLineItemText('procedureresultdetails', 'ipr_move_location', ipq);
	    	var reasonId=nlapiGetLineItemValue('procedureresultdetails', 'ipr_move_reason', ipq);
	    	var reasonDetail=nlapiGetLineItemValue('procedureresultdetails', 'ipr_detail_reason', ipq);
	    	var bin = nlapiGetLineItemValue('procedureresultdetails', 'ipr_move_bin', ipq);
	    	
	    	
	    	
	    	//良品場合理由など入力しない
	    	if(div == '1'){
	    		if(reasonId > 0 ||!isEmpty(reasonDetail)){
	    			alert('第'+ipq+'行目の良品場合理由入力不要です。')
	    			return false;
	    		}
	    	}
	    	
	    	if(count<=0){
	    		alert('第'+ipq+'行目の数量を１以上を入力してください。')
	    		return false;
	    	}
	    	if(isEmpty(location) || location == '0'){
	    		alert('第'+ipq+'行目の倉庫を入力してください。')
	    		return false;
	    	}
	    	if(div != '1'){
		    	if(isEmpty(reasonId) || reasonId == '0'){
		    		alert('第'+ipq+'行目の理由を入力してください。')
		    		return false;
		    	}
		    	
		    	if(isEmpty(reasonDetail)){
		    		alert('第'+ipq+'行目の理由詳細を入力してください。')
		    		return false;
		    	}
	    	}
	    	

	    	
	    	//保管棚制御 		
    		var binUseFlg =nlapiSearchRecord("location",null,[["internalid","anyof",location]],[new nlobjSearchColumn("usesbins")])[0].getValue('usesbins');
    		if(binUseFlg == 'T' && binUseFlgItem == 'T'){
    	    	if(!isEmpty(bin)){
		    		if(!locationAndBin(location,bin)){
		    			alert('第'+ipq+'行目の保管棚と場所を確認してください。');
		    			return false;
		    		}
    	    	}else{

	    			alert('第'+ipq+'行目の保管棚を設定してください。');
	    			return false;	
    	    	}
    		}else{
    			if(!isEmpty(bin)){
    				if(binUseFlg == 'F'){
    					alert('第'+ipq+'行目の場所（'+locationText+'）は保管棚管理していません。場所で「保管棚を使用」をチェックオンする必要があります。');
    				}
    				if(binUseFlgItem == 'F'){
    					alert('第'+ipq+'行目のアイテム（'+itemText+'）は保管棚管理していません。アイテムマスタで「保管棚を使用」をチェックオンする必要があります。');
    				}
	    			
	    			return false;	
    			}
    		}

	    	

	    }
	    return true;
}


function checkkenpinteijun(item){
	if(isEmpty(item)){
		return false;
	}
	var rst = nlapiSearchRecord("customrecord_djkk_inspection_procedure",null,
			[
			   ["custrecord_djkk_ip_item","anyof",item],
			   "AND", 
			   ["isinactive","is","F"]
			], 
			[
			 new nlobjSearchColumn("internalid")
			]
			);
	
	if(!isEmpty(rst)){
		if(rst.length>0){
			return true;
		}
	}
	return false;
}

//場所と保管棚チェックする
function locationAndBin(location,bin){
	var rst = nlapiSearchRecord("bin",null,
			[
			 ["location","anyof",location],"AND",["internalid","anyof",bin]
			], 
			[
			   new nlobjSearchColumn("internalid"), 
			   new nlobjSearchColumn("binnumber").setSort(false)
			]
			);
	
	if(!isEmpty(rst)){
		if(rst.length > 0){
			return true;
		}
	}
	return false;
}