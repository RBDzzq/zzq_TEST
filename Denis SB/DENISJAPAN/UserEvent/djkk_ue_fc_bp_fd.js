/**
 * U122
 * 
 * Version    Date            Author           Remarks
 * 1.00       12 Jul 2022     zhou
 *
 */
var idArray1;
var idArray2;
var idArray3;
var idArray4;
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
	nlapiLogExecution('debug','userEventBeforeLoad',type)
	setFieldDisableType('custrecord_djkk_association_id_s','hidden');
	setFieldDisableType('custrecord_djkk_bp_item_hidden','hidden');
	var fieldType ='hidden';
	setFieldDisableType('custrecord_djkk_product_code_s',fieldType);
	setFieldDisableType('custrecord_djkk_bland_code_s',fieldType);
	setFieldDisableType('custrecord_djkk_bland_name_s',fieldType);
	setFieldDisableType('custrecord_djkk_bp_name_s',fieldType);
	setFieldDisableType('custrecord_djkk_bp_code_s',fieldType);
	setFieldDisableType('custrecord_csvinput_flag','hidden');
//	setFieldDisableType('custrecord_djkk_item_s','hidden');
//	var itemField = nlapiGetField('custrecord_djkk_item_s')
//	itemField.setDisplaySize(2000,100);
//	var item2Field = form.addField('custpage_runbatch_error', 'multiselect', 'item', null);
//	item2Field.setDisplaySize(2000,100);
//	itemField.setLayoutType('outsideabove', 'startcol');
	
	var csvinputFlag = nlapiGetFieldValue('custrecord_csvinput_flag')
	var subsidiary = getRoleSubsidiary();
	var execution = nlapiGetContext().getExecutionContext();
	nlapiLogExecution('debug','execution',execution)
	if(type == 'create'){
		if(subsidiary != SUB_SCETI && subsidiary != SUB_DPKK){
			var recordId = guid();
			nlapiSetFieldValue('custrecord_djkk_association_id_s',recordId);
			if(execution != 'csvimport'){
				
				//20230421 zhou memo :csvを使用してインポートする場合、子会社は現在のロールが存在する子会社を自動的に書き込むのではなく、インポートされたデータです。
				nlapiSetFieldValue('custrecord_djkk_subsidiary_bp_s',subsidiary);
			}
			
		}
	}
	var itemField = form.addField('custpage_item', 'multiselect', 'DJ_アイテム', null, null);
//	itemField.setMandatory(true);
	itemField.setDisplaySize(350,15);
	if(type == 'view' ){
		if(subsidiary != SUB_SCETI && subsidiary != SUB_DPKK){
			setFieldDisableType('custpage_item','hidden');
		}
	}
	if(type == 'create'|| type == 'edit'){
		if(execution != 'csvimport'){
			setFieldDisableType('custrecord_djkk_item_s','hidden');
		}
	}
	

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
	nlapiLogExecution('debug','userEventBeforeSubmit',type)
	if(type == 'create'||type == 'edit'||type == 'delete'){
		//
		var bps = nlapiGetFieldValue('custrecord_djkk_bps_s');//DJ_BP(複数選択)
		if(!isEmpty(bps)){
			var bpArray = bps.split('');//従業員を分割する
		}
		var bpcodeArr = [];
		var bpNameArr = [];
		 var employeeSearch = nlapiSearchRecord("employee",null,
					[
					   ["internalid","anyof",bpArray]
					], 
					[
					   new nlobjSearchColumn("custentity_djkk_employee_id"),
					   new nlobjSearchColumn("lastname"), 
					   new nlobjSearchColumn("firstname")
					]
					);
		 if(!isEmpty(employeeSearch)){
			 for(var ca = 0 ;ca < employeeSearch.length;  ca++){
				 var entityCode = employeeSearch[ca].getValue("custentity_djkk_employee_id");
				 var lastname = employeeSearch[ca].getValue("lastname");
				 var firstname = employeeSearch[ca].getValue("firstname");
				
				 bpcodeArr.push(entityCode);
				 bpNameArr.push(lastname + ' ' + firstname)
			 }
		 }
		nlapiSetFieldValue('custrecord_djkk_bp_code_s',replaceString(JSON.stringify(bpcodeArr)));
		nlapiSetFieldValue('custrecord_djkk_bp_name_s',replaceString(JSON.stringify(bpNameArr)));
		
		
		var item = nlapiGetFieldValue('custrecord_djkk_item_s');//DJ_アイテム
		var itemArray = [];
		if(!isEmpty(item)){
			itemArray = item.split('');//itemを分割する
			if(isEmpty(itemArray)){
				itemArray.push(item);
			}
		}
		
		
		var productcodeArr = [];
			 for(var i = 0 ;i < itemArray.length;  i++){
				 var productcode = nlapiLookupField('item', itemArray[i], 'custitem_djkk_product_code')
				 productcodeArr.push(productcode);
			 }
		nlapiSetFieldValue('custrecord_djkk_product_code_s',replaceString(JSON.stringify(productcodeArr)));

		
		var bland = nlapiGetFieldText('custrecord_djkk_bp_choose_bland_s');//DJ_bland
		var blandCode = '';
		var blandName = '';
		var blandArr = bland.split(" ");
		if(!isEmpty(blandArr)){
			blandCode = blandArr[0];
			for(var b = 1 ; b < blandArr.length ; b++){
				blandName += blandArr[b];
				if(b < blandArr.length){
					blandName += ' ';
				}
			}
		}else{
			blandCode = bland;
		}
		nlapiSetFieldValue('custrecord_djkk_bland_code_s',blandCode);
		nlapiSetFieldValue('custrecord_djkk_bland_name_s',blandName);
	}
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
	var subsidiary = getRoleSubsidiary();
//	subsidiary = nlapiGetFieldValue('custrecord_djkk_subsidiary_bp_s');
//	if(subsidiary == SUB_NBKK || subsidiary == SUB_ULKK){
	if(subsidiary != SUB_SCETI && subsidiary != SUB_DPKK){
		if(type == 'create'||type == 'edit'||type == 'delete'){
			var recordId = nlapiGetFieldValue('custrecord_djkk_association_id_s');//id		
			var csvInputFlag = nlapiGetFieldValue('custrecord_csvinput_flag');//csvInput
			var subsidiary = nlapiGetFieldValue('custrecord_djkk_subsidiary_bp_s');//DJ_連結 
			var bland = nlapiGetFieldValue('custrecord_djkk_bp_choose_bland_s');//DJ_bland
			var item = nlapiGetFieldValue('custrecord_djkk_item_s');//DJ_アイテム
			var itemText = nlapiGetFieldText('custrecord_djkk_item_s');//DJ_アイテムtext
//			var desciption = nlapiGetFieldValue('custrecord_djkk_desciption_s');//DJ_DESCRIPTION
			var bps = nlapiGetFieldValue('custrecord_djkk_bps_s');//DJ_BP(複数選択)
			var bpCode = nlapiGetFieldValue('custrecord_djkk_bp_code_s');//DJ_BPコード(非表示)
			var locationArea = nlapiGetFieldValue('custrecord_djkk_bp_location_area_s');//DJ_場所エリア
			if(!isEmpty(bps)){
				var bpArray = bps.split('');//従業員を分割する
			}
			var itemArray = [];
			if(!isEmpty(item)){
				itemArray = item.split('');//itemを分割する
				if(isEmpty(itemArray)){
					itemArray.push(item);
				}
			}
			if(!isEmpty(locationArea)){
				var locationAreaText = JSON.stringify(locationArea)
			}
			if(!isEmpty(itemText)){
				var str = '';
				itemText = itemText.split('');//itemtextを分割する
				for(var q = 0 ; q < itemText.length ; q++){
					str += itemText[q];
					if(q+1 != itemText.length){
						str += ',';
					}
				}
			}
		
		}
		
			
		if(type == "create"){
			var run =  toBatch(type,subsidiary,bland,subsidiary,itemArray,locationArea,bpArray,locationAreaText,recordId,str);

//			var itemSearch = nlapiSearchRecord("item",null,
//					[
//					   ["internalid","anyof", itemArray]
//					], 
//					[
//					   new nlobjSearchColumn("displayname")
//					]
//			);
//			for(var i = 0 ; i < bpArray.length ; i++){
//			    if(!isEmpty(itemSearch)){
//			    	for(var q = 0 ; q < itemSearch.length ; q++){
//			    		var displayname = itemSearch[q].getValue("displayname");
//						var sendToRadio = nlapiCreateRecord('customrecord_djkk_person_registration');
//						sendToRadio.setFieldValue('custrecord_djkk_subsidiary_bp',subsidiary);
//						sendToRadio.setFieldValue('custrecord_djkk_bp_choose_bland',bland);
//						sendToRadio.setFieldValue('custrecord_djkk_item',itemArray[q]);
//						sendToRadio.setFieldValue('custrecord_djkk_desciption',displayname);
//						sendToRadio.setFieldValue('custrecord_djkk_bp_location_area',locationArea);
//						sendToRadio.setFieldValue('custrecord_djkk_bp',bpArray[i]);
//						sendToRadio.setFieldValue('custrecord_djkk_loc_intermediate_text',locationAreaText);
//						sendToRadio.setFieldValue('custrecord_djkk_association_id',recordId);
//						var submitId =  nlapiSubmitRecord(sendToRadio);
//					}
//			    }
//			}	
			var loadRecord =nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
			loadRecord.setFieldValue('custrecord_djkk_bp_item_hidden',str);
			loadRecord.setFieldValue('custrecord_last_type','T');
		    nlapiSubmitRecord(loadRecord);
		}
		if(type == "edit"){
			var recordIdNew = guid();
//			idArray2 = [];
//			var mainArr = aryJoinAry(itemArray,bpArray);//
//			var bpSearch = nlapiSearchRecord("customrecord_djkk_person_registration",null,
//				[
//				 	["custrecord_djkk_bp","anyof",bpArray],
//				 	"AND",
//				 	["custrecord_djkk_item","anyof",itemArray],
//				 	"AND",
//				 	["custrecord_djkk_loc_intermediate_text","is",locationAreaText],
//				 	"AND",
//				 	["custrecord_djkk_subsidiary_bp","anyof",subsidiary],
//				 	"AND",
//				 	["custrecord_djkk_association_id","is",recordId]
//				], 
//				[
//				    new nlobjSearchColumn("internalid",null,"GROUP"), 
//				    new nlobjSearchColumn("custrecord_djkk_bp",null,"GROUP"),  	//BP
//				    new nlobjSearchColumn("custrecord_djkk_item",null,"GROUP"),   //ITEM	
//				    new nlobjSearchColumn("displayname","custrecord_djkk_item","GROUP")   //ITEM.displayname
//				]
//			);	
//			var newBparr = []
			
			
//			if(!isEmpty(bpSearch)){
//				for(var i = 0 ; i < bpSearch.length ; i++){
//					var internalidBySearch = bpSearch[i].getValue("internalid",null,"GROUP");
//					var bpBySearch = bpSearch[i].getValue("custrecord_djkk_bp",null,"GROUP");
//					var itemBySearch = bpSearch[i].getValue("custrecord_djkk_item",null,"GROUP");
//					var itemNameBySearch = bpSearch[i].getValue("displayname","custrecord_djkk_item","GROUP");
//					var searchObj = {
//							item:itemBySearch,
//							bp:bpBySearch
//					};	
//					nlapiLogExecution('debug','searchObj   '+i,JSON.stringify(searchObj))
//					var includesFlag = aryIncludes(searchObj,mainArr);
//					if(includesFlag == 'F'){
//						nlapiLogExecution('debug','edit3 bpBySearch',bpBySearch)
//						nlapiLogExecution('debug','edit3 itemNameBySearch',itemNameBySearch)
//				    		var sendToRadio2 = nlapiCreateRecord('customrecord_djkk_person_registration');
//							sendToRadio2.setFieldValue('custrecord_djkk_subsidiary_bp',subsidiary);
//							sendToRadio2.setFieldValue('custrecord_djkk_bp_choose_bland',bland);
//							sendToRadio2.setFieldValue('custrecord_djkk_item',itemBySearch);
//							sendToRadio2.setFieldValue('custrecord_djkk_desciption',itemNameBySearch);
//							sendToRadio2.setFieldValue('custrecord_djkk_bp_location_area',locationArea);
//							sendToRadio2.setFieldValue('custrecord_djkk_loc_intermediate_text',locationAreaText);
//							sendToRadio2.setFieldValue('custrecord_djkk_bp',bpBySearch);
//							sendToRadio2.setFieldValue('custrecord_djkk_association_id',recordIdNew);
//							var createdid = nlapiSubmitRecord(sendToRadio2);
//							nlapiLogExecution('debug','createdid',createdid)
//					}else if(includesFlag == 'T'){
//						nlapiLogExecution('debug','update',internalidBySearch)
//						var loadingTheRadioSheet = nlapiLoadRecord('customrecord_djkk_person_registration',internalidBySearch);
//						loadingTheRadioSheet.setFieldValue('custrecord_djkk_association_id',recordIdNew);
//						nlapiSubmitRecord(loadingTheRadioSheet);
//					}
//				}
//			}
//			
//			else{
//				var run =  toBatch(type,subsidiary,bland,subsidiary,itemArray,locationArea,bpArray,locationAreaText,recordIdNew,str);
//			}
			var deleteSearch = nlapiSearchRecord("customrecord_djkk_person_registration",null,
				[
				 	["custrecord_djkk_association_id","is",recordId]
				], 
				[
				    new nlobjSearchColumn("internalid"),  	 	
				]
			);
			if(deleteSearch != null){
				for(var n = 0 ; n < deleteSearch.length ; n++){
					
					var oldInternalid = deleteSearch[n].getValue('internalid');
					nlapiLogExecution('debug','delete',oldInternalid)
					nlapiDeleteRecord('customrecord_djkk_person_registration',oldInternalid);
				}
			}
			var run =  toBatch(type,subsidiary,bland,subsidiary,itemArray,locationArea,bpArray,locationAreaText,recordIdNew,str);
			var loadRecord =nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
			loadRecord.setFieldValue('custrecord_djkk_bp_item_hidden',str);
			loadRecord.setFieldValue('custrecord_djkk_association_id_s',recordIdNew);//update id
		    nlapiSubmitRecord(loadRecord);
			//attention
			
		}
		if(type == "delete"){
			var bpSearch = nlapiSearchRecord("customrecord_djkk_person_registration",null,
				[
				 	["custrecord_djkk_association_id","is",recordId]
				], 
				[
				    new nlobjSearchColumn("internalid"),  	 	
				]
			);	
			if(bpSearch != null){
				for(var n = 0 ; n < bpSearch.length ; n++){
					var internalid = bpSearch[n].getValue('internalid');
					nlapiDeleteRecord('customrecord_djkk_person_registration',internalid);
				}
			}else{
				nlapiLogExecution('debug','111','111')
			}
		}
	}
}
function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}
function guid() {
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}
function defaultEmpty(src){
	return src || '';
}
function replaceString(str){
	return str.replace(/\"/g,"").replace(/\[/g,"").replace(/\]/g,"");
}
//配列要素配列の組合せ
function aryJoinAry(ary,ary2) {
	var itemAry = [];
	var minLength;
	if (ary.length > ary2.length) {
		minLength = ary2.length;
	} else {
		minLength = ary.length;
	}
	var longAry = arguments[0].length > arguments[1].length ? arguments[0]
			: arguments[1];
	for (var i = 0; i < minLength; i++) {
		itemAry.push({
			item : ary[i],
			bp : ary2[i]
		});
	}
	return itemAry.concat(longAry.slice(minLength));
}
//配列内にオブジェクトが存在するかどうかを判断する
function aryIncludes(obj,arr){
	var includeFlag;//not include flag
	if(JSON.stringify(arr).indexOf(JSON.stringify(obj)) == -1){
		includeFlag = 'F'//not include
//	     arr.push(obj)
	}else{
		includeFlag = 'T'//include
	}
	return includeFlag;
}
function toBatch(type,subsidiary,bland,subsidiary,itemArray,locationArea,bpArray,locationAreaText,recordId,str){
	var batchData = {
			subsidiary:subsidiary,
			bland:bland,
			subsidiary:subsidiary,
			itemArray:itemArray,
			locationArea:locationArea,
			bpArray:bpArray,
			locationAreaText:locationAreaText,
			recordId:recordId,
			getRecordId:nlapiGetRecordId(),
			getRecordType:nlapiGetRecordType(),
			str:str
	}
	  batchData = JSON.stringify(batchData);
	  var scheduleparams = new Array();
	  scheduleparams['custscript_djkk_ss_fc_bp_fd_type'] = JSON.stringify(type);
	  scheduleparams['custscript_djkk_ss_fc_bp_fd_data'] = batchData;
	  runBatch('customscript_djkk_ss_fc_bp_fd', 'customdeploy_djkk_ss_fc_bp_fd', scheduleparams);
	  nlapiLogExecution('debug','data5',batchData)
	  var batchStatus = getScheduledScriptRunStatus('customscript_djkk_ss_fc_bp_fd');
	  nlapiLogExecution('debug','runBatch',batchStatus)
	  return true;
}