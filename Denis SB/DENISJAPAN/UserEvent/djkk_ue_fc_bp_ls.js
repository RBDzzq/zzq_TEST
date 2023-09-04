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
	setFieldDisableType('custrecord_djkk_association_id_ls_s','hidden');
	var subsidiary = getRoleSubsidiary();
	if(subsidiary != SUB_NBKK && subsidiary != SUB_ULKK){
		if(type == 'create'){
				var recordId = guid();
				nlapiSetFieldValue('custrecord_djkk_association_id_ls_s',recordId);
				nlapiSetFieldValue('custrecord_djkk_bp_location_area_ls_s','3');
		}
		if(type == 'create'||type == 'edit'||type == 'cpoy'){
			setFieldDisableType('custrecord_djkk_item_new_ls_s','hidden');
			var transferSearch = nlapiSearchRecord("customrecord_bp_destinationtext_transfer",null,
					[
					   ["custrecord_djkk_itemtext_ls_s","isnotempty",""]
					], 
					[
					   new nlobjSearchColumn("internalid")
					]
					);
			if(transferSearch != null){
				for(var n = 0 ; n < transferSearch.length ; n++){
					var internalid = transferSearch[n].getValue('internalid');
					nlapiDeleteRecord('customrecord_bp_destinationtext_transfer',internalid);
				}
			}
		}
		if(type == 'view'){
			setFieldDisableType('custrecord_djkk_item_ls_s','hidden');
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
	if(type == 'create'||type == 'edit'||type == 'cpoy'){
//		var itemName = nlapiGetFieldText('custrecord_djkk_item_ls_s');//DJ_アイテムName
//		var itemArray = new Array();//アイテム
//		if(!isEmpty(itemName)){
//			var itemNameArray = itemName.split('');//itemを分割する
//			nlapiLogExecution('debug','itemNameArray',itemNameArray)
//			for(var i = 0 ; i < itemNameArray.length ; i++){
//				var itemIdSearch = nlapiSearchRecord("customrecord_bp_destinationtext_transfer",null,
//						[
//						   ["name","haskeywords",itemNameArray[i]]
//						], 
//						[
//						   new nlobjSearchColumn("custrecord_djkk_itemtext_ls_s"),
//						]
//				);
//				if(itemIdSearch != null){
//					var item =  itemIdSearch[0].getValue("custrecord_djkk_itemtext_ls_s");
//					if(isEmpty(item)){
//						item = '';
//					}
//					itemArray.push(item);
//					nlapiLogExecution('debug','running',i)
//					nlapiLogExecution('debug','item',item)
//				}
//			}
////			var loadRecord = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
//			nlapiLogExecution('debug','itemArray',itemArray);
//			nlapiSetFieldValues('custrecord_djkk_item_new_ls_s',itemArray);
////			nlapiSubmitRecord(loadRecord);
//		}
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
	if(subsidiary != SUB_NBKK && subsidiary != SUB_ULKK){
		if(type == 'create'||type == 'edit'||type == 'cpoy'){
			var subsidiary = nlapiGetFieldValue('custrecord_djkk_subsidiary_bp_ls_s');//DJ_連結 
			var bland = nlapiGetFieldValue('custrecord_djkk_bp_choose_bland_ls_s');//DJ_bland
			var itemName = nlapiGetFieldText('custrecord_djkk_item_ls_s');//DJ_アイテムName
//			var desciption = nlapiGetFieldValue('custrecord_djkk_desciption_s');//DJ_DESCRIPTION
			var locationArea = nlapiGetFieldValue('custrecord_djkk_bp_location_area_ls_s');//DJ_場所エリア
			var bps = nlapiGetFieldValue('custrecord_djkk_bp_ls_s');//DJ_BP(複数選択)
			var recordId = nlapiGetFieldValue('custrecord_djkk_association_id_ls_s');//id
			var vendorId = nlapiGetFieldValue('custrecord_djkk_vendor_ls_s');//DJ_仕入先
			var productGroup = nlapiGetFieldValue('custrecord_djkk_product_group');
//			var productGroupArray;
//			var vendorArray;
			var blandArray ;
			var bpArray;
			var itemArray = new Array();//アイテム
//			if(!isEmpty(productGroup)){
//				productGroupArray = productGroup.split('');
//			}else{
//				productGroupArray = [];
//				productGroupArray.push(' ');
//			}
//			if(!isEmpty(vendorId)){
//				vendorArray = vendorId.split('');//venderを分割する
//			}else{
//				vendorArray = []
//				vendorArray.push(' ');
//			}
			if(!isEmpty(bland)){
				blandArray = bland.split('');//venderを分割する
			}
			if(!isEmpty(bps)){
				bpArray = bps.split('');//従業員を分割する
			}
			if(!isEmpty(itemName)){
				var itemNameArray = itemName.split('');//itemを分割する
				nlapiLogExecution('debug','itemNameArray',itemNameArray)
				for(var i = 0 ; i < itemNameArray.length ; i++){
					var itemIdSearch = nlapiSearchRecord("customrecord_bp_destinationtext_transfer",null,
							[
							   ["name","haskeywords",itemNameArray[i]]
							], 
							[
							   new nlobjSearchColumn("custrecord_djkk_itemtext_ls_s"),
							]
					);
					if(itemIdSearch != null){
						var item =  itemIdSearch[0].getValue("custrecord_djkk_itemtext_ls_s");
						itemArray.push(item);
						nlapiLogExecution('debug','running',i)
						nlapiLogExecution('debug','item',item)
					}
				}
//				var loadRecord = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
//				nlapiLogExecution('debug','itemArray',itemArray);
//				loadRecord.setFieldValues('custrecord_djkk_item_new_ls_s',itemArray);
//				nlapiSubmitRecord(loadRecord);
			}
			if(!isEmpty(locationArea)){
				var locationAreaText = JSON.stringify(locationArea)
			}
		}
		if(type == 'create'){
			nlapiLogExecution('debug','start1','start1')	
			for(var i = 0 ; i < bpArray.length ; i++){
				for(var q = 0 ; q < itemArray.length ; q++){
//					for(var n = 0 ; n < vendorArray.length ; n++){
						for(var z = 0 ; z < blandArray.length ; z++){
//							for(var v = 0 ; v < productGroupArray.length ; v++){
								var itemSearch = nlapiSearchRecord("item",null,
										[
										   ["internalid","anyof",itemArray[q]]
										], 
										[
										   new nlobjSearchColumn("custitem_djkk_business_judgmen_fc"),
										   new nlobjSearchColumn("displayname")
										]
								);
								if(itemSearch != null){
									nlapiLogExecution('debug','start create',q)
									var businessJudgmenFc = itemSearch[0].getValue("custitem_djkk_business_judgmen_fc");
									var displayname = itemSearch[0].getValue("displayname");
									var sendToRadio = nlapiCreateRecord('customrecord_djkk_person_registration_ls');
									sendToRadio.setFieldValue('custrecord_djkk_subsidiary_bp_ls',subsidiary);
									sendToRadio.setFieldValue('custrecord_djkk_bp_choose_bland_ls',blandArray[z]);
//									sendToRadio.setFieldValue('custrecord_djkk_vendor_ls',vendorArray[n]);
//									sendToRadio.setFieldValue('custrecord_djkk_product_group_ls',productGroupArray[v])
									sendToRadio.setFieldValue('custrecord_djkk_item_ls',itemArray[q]);
									sendToRadio.setFieldValue('custrecord_djkk_desciption_ls',displayname);
									sendToRadio.setFieldValue('custrecord_djkk_bp_location_area_ls',locationArea);
									sendToRadio.setFieldValue('custrecord_djkk_bp_ls',bpArray[i]);
									sendToRadio.setFieldValue('custrecord_djkk_loc_intermediate_text_ls',locationAreaText);
									sendToRadio.setFieldValue('custrecord_djkk_association_id_ls',recordId);
									sendToRadio.setFieldValue('custrecord_djkk_business_judgmen_fc',businessJudgmenFc);
									nlapiSubmitRecord(sendToRadio);
									nlapiLogExecution('debug','end create',q)
								}
//							}
						}
//					}
				}
			}nlapiLogExecution('debug','ddd','ddd')	
		}
		if(type == 'edit'||type == 'cpoy'){
			var recordIdNew = guid();
			nlapiLogExecution('debug','start edit','start edit')
			idArray2 = [];
			for(var i = 0 ; i < bpArray.length ; i++){
				for(var q = 0 ; q < itemArray.length ; q++){
//					for(var n = 0 ; n < vendorArray.length ; n++){
						for(var z = 0 ; z < blandArray.length ; z++){
//							for(var v = 0 ; v < productGroupArray.length ; v++){
								var bpSearch = nlapiSearchRecord("customrecord_djkk_person_registration_ls",null,
									[
									 	["custrecord_djkk_bp_ls","anyof",bpArray[i]],
									 	"AND",
									 	["custrecord_djkk_item_ls","anyof",itemArray[q]],
									 	"AND",
//									 	["custrecord_djkk_vendor_ls","anyof",vendorArray[n]],
//									 	"AND",
									 	["custrecord_djkk_bp_choose_bland_ls","anyof",blandArray[z]],
									 	"AND",
									 	["custrecord_djkk_loc_intermediate_text_ls","is",locationAreaText],
									 	"AND",
									 	["custrecord_djkk_subsidiary_bp_ls","anyof",subsidiary],
									 	"AND",
									 	["custrecord_djkk_association_id_ls","is",recordId],
//									 	"AND", 
//										["custrecord_djkk_product_group_ls","anyof",productGroupArray[v]]
									], 
									[
									    new nlobjSearchColumn("internalid"),  	 	
									]
								);	
								if(bpSearch == null){
									var itemSearch = nlapiSearchRecord("item",null,
											[
											   ["internalid","anyof", itemArray[q]]
//											   "AND", 
//											   ["othervendor","anyof",vendorArray[n]],
											], 
											[
											   new nlobjSearchColumn("custitem_djkk_business_judgmen_fc"),
											   new nlobjSearchColumn("displayname")
											]
									);
									if(itemSearch != null){
										var businessJudgmenFc = itemSearch[0].getValue("custitem_djkk_business_judgmen_fc");
										var displayname = itemSearch[0].getValue("displayname");
										nlapiLogExecution('debug','edit displayname','displayname')
									}
									var sendToRadio2 = nlapiCreateRecord('customrecord_djkk_person_registration_ls');
									sendToRadio2.setFieldValue('custrecord_djkk_subsidiary_bp_ls',subsidiary);
									sendToRadio2.setFieldValue('custrecord_djkk_bp_choose_bland_ls',blandArray[z]);
									sendToRadio2.setFieldValue('custrecord_djkk_item_ls',itemArray[q]);
									sendToRadio2.setFieldValue('custrecord_djkk_desciption_ls',displayname);
									sendToRadio2.setFieldValue('custrecord_djkk_bp_location_area_ls',locationArea);
									sendToRadio2.setFieldValue('custrecord_djkk_loc_intermediate_text_ls',locationAreaText);
									sendToRadio2.setFieldValue('custrecord_djkk_bp_ls',bpArray[i]);
//									sendToRadio2.setFieldValue('custrecord_djkk_vendor_ls',vendorArray[n]);
//									sendToRadio2.setFieldValue('custrecord_djkk_product_group_ls',productGroupArray[v])
									sendToRadio2.setFieldValue('custrecord_djkk_association_id_ls',recordIdNew);
									sendToRadio2.setFieldValue('custrecord_djkk_business_judgmen_fc',businessJudgmenFc);
									nlapiSubmitRecord(sendToRadio2);
								}else{
									var internalid = bpSearch[0].getValue("internalid");
									var loadingTheRadioSheet = nlapiLoadRecord('customrecord_djkk_person_registration_ls',internalid);
									loadingTheRadioSheet.setFieldValue('custrecord_djkk_association_id_ls',recordIdNew);
									nlapiSubmitRecord(loadingTheRadioSheet);
								}
//							}
						}
//					}
				}
			}
			var deleteSearch = nlapiSearchRecord("customrecord_djkk_person_registration_ls",null,
					[
					 	["custrecord_djkk_association_id_ls","is",recordId]
					], 
					[
					    new nlobjSearchColumn("internalid"),  	 	
					]
				);
			if(deleteSearch != null){
				for(var n = 0 ; n < deleteSearch.length ; n++){
					var oldInternalid = deleteSearch[n].getValue('internalid');
					nlapiDeleteRecord('customrecord_djkk_person_registration_ls',oldInternalid);
				}
			}
			var loadRecord =nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
			loadRecord.setFieldValue('custrecord_djkk_association_id_ls_s',recordIdNew);//update id
		    nlapiSubmitRecord(loadRecord);
			//attention
			
		}
		if(type == 'delete'){
			var recordId = nlapiGetFieldValue('custrecord_djkk_association_id_ls_s');//id
			nlapiLogExecution('debug','recordId',recordId)
			var bpSearch = nlapiSearchRecord("customrecord_djkk_person_registration_ls",null,
				[
				 	["custrecord_djkk_association_id_ls","is",recordId]
				], 
				[
				    new nlobjSearchColumn("internalid"),  	 	
				]
			);	
			if(bpSearch != null){
				nlapiLogExecution('debug','delete s',bpSearch.length)
				for(var n = 0 ; n < bpSearch.length ; n++){
					var internalid = bpSearch[n].getValue('internalid');
					nlapiDeleteRecord('customrecord_djkk_person_registration_ls',internalid);
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