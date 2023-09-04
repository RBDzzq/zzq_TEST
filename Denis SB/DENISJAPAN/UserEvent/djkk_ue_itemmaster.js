/**
 * アイテムのUserEvent
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/06/02     CPC_苑
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
var TheMinimumdigits = 5;

function userEventBeforeLoad(type, form, request){
		setFieldDisableType('custitem_djkk_automatic', 'hidden');
		var itemType=nlapiGetFieldValue('baserecordtype');
		//20230515 changed by zhou start
		if((type=='create'||type=='copy')&&(itemType=='noninventoryitem'|| itemType=='otherchargeitem'|| itemType=='itemgroup'|| itemType=='discountitem')){

		nlapiSetFieldValue('itemid','自動採番');     
		 setFieldDisableType('itemid', 'disabled');
		}
		//20230515 changed by zhou end
		var subVal = nlapiGetFieldValue('subsidiary');//20230517 changed by zhou
		if(itemType=='noninventoryitem'|| itemType=='otherchargeitem' ||itemType== 'itemgroup'){
			formHiddenTab(form,'itemvendor_splits');
			//20230302 changed by zhou start
			//zhou memo : DEV-1381  その他の手数料はブラケットを設定できます
			if(itemType != 'otherchargeitem'){
				setFieldDisableType('custitem_djkk_class', 'hidden');
			}else if(itemType == 'otherchargeitem' && (subVal == SUB_SCETI || subVal == SUB_DPKK)){
				setFieldDisableType('class', 'hidden');//20230517 changed by zhou 標準フィールドの非表示
			}
			//end
//			setFieldDisableType('class', 'hidden');
			setFieldDisableType('isfulfillable', 'hidden');
		}
		if(itemType=='serviceitem'){
//			setFieldDisableType('custitem_djkk_class', 'hidden');
			setFieldDisableType('class', 'hidden');
			setFieldDisableType('isfulfillable', 'hidden');
		}
		//changed by geng add start U200
		
		//0215システム項目を外す　セクション
		if(itemType=='lotnumberedassemblyitem'){
			setFieldDisableType('department', 'hidden');
		}
		
//		var subVal = nlapiGetFieldValue('subsidiary');//20230517 changed by zhou
		
		if(itemType=='noninventoryitem' && (subVal == SUB_SCETI || subVal == SUB_DPKK)){
			setFieldDisableType('itemid','disabled');
			if(type=='create'||type=='copy'){
				nlapiSetFieldValue('itemid','自動採番');
			}
		}
		//changed by geng add end U200
		setFieldDisableType('amortizationtemplate', 'hidden');
		setFieldDisableType('residual', 'hidden');
		setFieldDisableType('amortizationperiod', 'hidden');
//		nlapiLogExecution('debug', '1')

		var customformID = nlapiGetFieldValue('customform');
	    /***************************/
	    // TODO 承認処理 need to delete
		  // change by ycx 2023/02/20
		  //old
//		nlapiLogExecution('debug', 'customformID', customformID);
//	    if(customformID!='90'&&customformID!='77'){
//	    	nlapiSetFieldValue('custitem_djkk_approval_deal_flg', 'F'); 
//	    	nlapiSetFieldValue('custitem_djkk_effective_recognition', 'T'); 	
//	    }
		 //new
		nlapiSetFieldValue('custitem_djkk_approval_deal_flg', 'T'); 
    	nlapiSetFieldValue('custitem_djkk_effective_recognition', 'F');

	// change end by ycx 2023/02/20
	    /***************************/
		// 優先場所
		setFieldDisableType('preferredlocation', 'hidden');
		var sub=getRoleSubsidiary();
//		nlapiLogExecution('debug', '2')
		//20220523 add by rextec start
		/***************************/
		//アセンブリ&在庫アイテム 廃棄
		if(type=='create'){
			var recordType = nlapiGetFieldValue("baserecordtype");
			if(recordType == "assemblyitem" ){
				throw nlapiCreateError('システムエラー','アセンブリは利用できません。',true);
				return false;
	    	}
			if( recordType == "inventoryitem" ){
				throw nlapiCreateError('システムエラー','在庫アイテムは利用できません。',true);
				return false;
	    	}
			//20230109 add by zhou CH227 start
			 if(sub==SUB_NBKK||sub==SUB_ULKK){
				 nlapiSetFieldValue('custitem_djkk_perunitquantity',1);
			 }
			//end
		}
		//20220523 add by rextec end
	//	nlapiLogExecution('DEBUG', 'show me the information for sub', sub)
		if(type=='create'||type=='copy'){	
			// DPKK 保管棚を使用
			if(sub==SUB_DPKK){
			 nlapiSetFieldValue('usebins', 'T');
			}
			 nlapiSetFieldValue('tracklandedcost', 'T'); 
			 if(sub==SUB_SCETI||sub==SUB_DPKK){
				 if(itemType=='inventoryitem'||itemType=='lotnumberedinventoryitem'||itemType=='serializedinventoryitem'){
					 try{
					 nlapiSetFieldValue('autopreferredstocklevel', 'F');
					 nlapiSetFieldValue('autoreorderpoint', 'F');
					 nlapiSetFieldValue('autoleadtime', 'F');
					 }catch(e){}
				 }
				}
		}
//		nlapiLogExecution('debug', '3')
		var roleSubsidiary=getRoleSubsidiary();
		nlapiLogExecution('debug','sub', sub);
	    nlapiSetFieldValue('custitem_syokuseki', sub);
	//20220511 add by zhou start   
	  //DJ_検品種類
	    if(type=='create'||type=='copy'||type =='view'||type =='edit'){
	    	sub = nlapiGetFieldValue('subsidiary')
	    	var recordType = nlapiGetFieldValue("baserecordtype");
	    	if(customformID =='98'){
	    		setFieldDisableType('custitem_djkk_quantity_type', 'hidden');
	    	}
	    	
	    	if(recordType != "lotnumberedinventoryitem" && recordType != "serializedinventoryitem" ){
		    	setFieldDisableType('custitem_djkk_quantity_type', 'hidden');
	    	}
	    	
	    }
	//20220511 add by zhou end
//		nlapiLogExecution('debug', '4')
	    //U100バリデーション
	    var role=nlapiGetRole();
	    if((sub==SUB_NBKK||sub==SUB_ULKK)&&(itemType=='lotnumberedinventoryitem'||itemType=='lotnumberedassemblyitem')&&(role!='1022'&&role!='3')){
	    	formHiddenTab(form,'accountingtxt');
	    }
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Operation types: create, edit, delete, xedit approve, reject,
 *            cancel (SO, ER, Time Bill, PO & RMA only) pack, ship (IF)
 *            markcomplete (Call, Task) reassign (Case) editforecast (Opp,
 *            Estimate)
 * @returns {Void}
 *
 */
function userEventBeforeSubmit(type) {
	//changed by geng add start U080 20221124
	//old
	//U777 DJ_アイテムPDF表示用 PDF表示のため、アイテムに商品コード（上に商品名（英語））_仕入先商品コード形で保存します。
//	var itemid = nlapiGetFieldValue('itemid');
//	var vendorname = nlapiGetFieldValue('vendorname');
//	var enname = nlapiGetFieldValue('custitem_djkk_product_name_line1');
//	var itemPdf = itemid;
//	if(!isEmpty(enname)){
//		itemPdf+='('+enname+')';
//	}
//	if(!isEmpty(vendorname)){
//		itemPdf+='_'+vendorname;
//	}
//	nlapiSetFieldValue('custitem_dkjj_item_pdf_show', itemPdf);
	
	//new
	//U080 
	//20230516 hidden by zhou start
//	var itemid = nlapiGetFieldValue('itemid');
//	var vendorname = nlapiGetFieldValue('vendorname');
//	var productCode = nlapiGetFieldValue('custitem_djkk_product_code');
//	var enname = nlapiGetFieldValue('displayname');
//	var abbreviationname = nlapiGetFieldValue('custitem_djkk_item_abbreviation_name');//規格
//	var itemPdf = itemid;
//	
//	if(!isEmpty(productCode)){
//		itemPdf+='_'+productCode;
//	}
//	if(!isEmpty(vendorname)){
//		itemPdf+='_'+vendorname;
//	}
//	if(!isEmpty(enname)){
//		itemPdf+='_'+enname;
//	}
//	if(!isEmpty(abbreviationname)){
//		itemPdf+='_'+abbreviationname;
//	}
//	
//	itemPdf+='||'+itemid;
//	if(!isEmpty(productCode)){
//		itemPdf+='_'+productCode;
//	}else{
//		itemPdf+='_'+' ';
//	}
//	if(!isEmpty(vendorname)){
//		itemPdf+='_'+vendorname;
//	}else{
//		itemPdf+='_'+' ';
//	}
//	if(!isEmpty(enname)){
//		itemPdf+='_'+enname;
//	}else{
//		itemPdf+='_'+' ';
//	}
//	//CH197 start
//	if(!isEmpty(abbreviationname)){
//		itemPdf+='_'+abbreviationname;
//	}else{
//		itemPdf+='_'+' ';
//	}
//	//end
//	nlapiSetFieldValue('custitem_dkjj_item_pdf_show', itemPdf);
	//20230516 hidden by zhou end
	//changed by geng add end U080 20221124
	
	//changed by geng fc add start
//	var typerec = nlapiGetFieldValue("baserecordtype");
//	
	var sub = nlapiGetFieldValue("subsidiary");
//	
//
//	
//	//changed by geng add start U200
//	// --- changed by zhou 20221212 U834---
////	if((type=='create'&&typerec=='noninventoryitem')&&(sub==SUB_SCETI || sub==SUB_DPKK)){
//	var subtype = nlapiGetFieldValue("subtype");
//	if(type=='create'&&(typerec=='noninventoryitem'|| typerec=='otherchargeitem'||typerec=='lotnumberedassemblyitem'|| typerec=='serializedassemblyitem'||typerec=='serviceitem'|| typerec == 'itemgroup')){
////		var loadRecord =nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
//		var kitflg;
//		if(typerec=='lotnumberedassemblyitem'|| typerec=='serializedassemblyitem'){
//			typerec = 'assemblyitem';
//	    	kitflg=nlapiGetFieldValue('custitem_djkk_kitflag');        	
//		}
//		var newVendorCode = getNewCodeNo (sub,typerec,subtype,kitflg);
//		nlapiSetFieldValue('itemid',newVendorCode);
//	}
	
	
	//changed by geng add end U200
	//20230109 add by zhou CH227 start
	if((sub==SUB_NBKK||sub==SUB_ULKK) && isEmpty(nlapiGetFieldValue('custitem_djkk_perunitquantity'))){
		nlapiSetFieldValue('custitem_djkk_perunitquantity',1);
	}
	//end
	
	//DENISJAPAN-567
	var purchaseunitValue = nlapiGetFieldValue('purchaseunit');
	nlapiSetFieldValue('custitem_djkk_min_inv_unit',purchaseunitValue,false)
	
	//20230717 add by zhou start CH738
	try{
	var productGroup = nlapiGetFieldText('custitem_djkk_product_group');
	if(!isEmpty(productGroup)){
		productGroup = productGroup.split(' ');
		var productNum = productGroup[0];//xxx
		if(productNum){
			var firstChar = productNum.substring(0, 1);//x
			var firstTwoChars = productNum.substring(0, 2);//xx
			var product = [productNum,firstChar,firstTwoChars];//[xxx,x,xx]
			for (var i = 0; i < product.length; i++) {
				var productGroupsearch = nlapiSearchRecord("customrecord_djkk_product_group",null,
						[
							[ "custrecord_djkk_pg_id", "is", product[i]],// DJ_製品グループID
							"AND",
							[ "custrecord_djkk_pg_subsidiary", "anyof", sub ] ],
						[ 
						    new nlobjSearchColumn("custrecord_djkk_pg_id"), // DJ_製品グループID
						    new nlobjSearchColumn("name") // 名前
						]);
				if (!isEmpty(productGroupsearch)) {

					var productId = productGroupsearch[0].getValue("custrecord_djkk_pg_id");
					var productName = productGroupsearch[0].getValue("name");
					var productIdLength = productId.length;
					if (productIdLength == 4) {
						// xxx
						nlapiSetFieldValue('custitem_djkk_product_group_xxx',productName, false)
					} else if (productIdLength == 2) {
						// xx
						nlapiSetFieldValue('custitem_djkk_product_group_xx',productName, false)
					} else {
						// x
						nlapiSetFieldValue('custitem_djkk_product_group_x',productName, false)
					}
				}
			}
		}
	}
	}catch(e){
		
	}
	//20230717 add by zhou end
	
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
	var typerec = nlapiGetFieldValue("baserecordtype");
	var subtype = nlapiGetFieldValue("subtype");
	var sub = nlapiGetFieldValue("subsidiary");
	            
	if((typerec == "lotnumberedinventoryitem" || typerec == "serializedinventoryitem" || typerec=="lotnumberedassemblyitem"
		||typerec=="serializedassemblyitem"||typerec=="serviceitem"||typerec=="noninventoryitem"||typerec=="InvtPart"||typerec=="Assembly")&&(sub == SUB_SCETI || sub == SUB_DPKK)){
		var itemJudgmentOld = null;
		if(!isEmpty(nlapiGetOldRecord())){
			itemJudgmentOld = nlapiGetOldRecord().getFieldValue('custitem_djkk_business_judgmen_fc');
		}
		var itemJudgmentNew = nlapiGetNewRecord().getFieldValue('custitem_djkk_business_judgmen_fc');
		
		var scheduleparams = new Array();
		var itemId = nlapiGetNewRecord().getFieldValue('id');
		if(itemJudgmentOld !=itemJudgmentNew){
			scheduleparams['custscript_djkk_ss_business_fc_param2'] = JSON.stringify(itemJudgmentNew);
			scheduleparams['custscript_djkk_ss_business_fc_param1'] = JSON.stringify(itemId);
			runBatch('customscript_djkk_ss_business_fc_change', 'customdeploy_djkk_ss_business_fc_change',scheduleparams);
		}else{
			
		}
	}
	
	
	var recordType = nlapiGetRecordType();
	nlapiLogExecution('debug', 'recordType', recordType);
	// DJ_場所/場所セット値	
	
	if(recordType != 'noninventoryresaleitem' && recordType != 'noninventorypurchaseitem' && recordType != 'noninventorysaleitem'){
		var itemRecord=nlapiLoadRecord(recordType, nlapiGetRecordId());
//		
		var djLocation = itemRecord.getFieldValue('custitem_djkk_item_location');
//	
		if(!isEmpty(djLocation)){
			itemRecord.setFieldValue('location', djLocation);
		}else {
			itemRecord.setFieldText('location', '');
		}
//		// DJ_ブランド
		var djClass = itemRecord.getFieldValue('custitem_djkk_class');
		if(!isEmpty(djClass)){
			itemRecord.setFieldValue('class', djClass);
		}else {
			itemRecord.setFieldText('class', '');
		}
		// DJ_セクション
		var djDepartment = itemRecord.getFieldValue('custitem_djkk_department');
		if(!isEmpty(djDepartment)){
			itemRecord.setFieldValue('department', djDepartment);
		}else {
			itemRecord.setFieldText('department', '');
		}
		//20230109 add by zhou CH227 start
		if(type == 'create'){
			 if((sub==SUB_NBKK||sub==SUB_ULKK )&& isEmpty(itemRecord.getFieldValue('custitem_djkk_perunitquantity'))){
				 itemRecord.setFieldValue('custitem_djkk_perunitquantity',1);
			 }
		}
//		//20230109 add by zhou CH227 end
		 try{
			 nlapiSubmitRecord(itemRecord, false, true);
		 }catch(e){
			 nlapiLogExecution('error', e.message);
		 }	
//	
	}
	
	// change by song add 20230403 item自動採番統合  start
	 var itemRecord=nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId()); //Record
	 var currentContext = nlapiGetContext();
	 var typerec = itemRecord.getFieldValue("baserecordtype");  //Type
	 var sub = itemRecord.getFieldValue("subsidiary"); //子会社
	 if(isEmpty(sub)){
		 sub = getRoleSubsidiary();
	 }
	 var subtype = itemRecord.getFieldValue("subtype");
	 var invItemFlag = 'T';//'T':在庫Item
	 if(type == 'create' || type == 'copy' || type == 'edit'){
		 if(typerec=='noninventoryitem'|| typerec=='otherchargeitem'||typerec=='lotnumberedassemblyitem'|| typerec=='serializedassemblyitem'||typerec=='serviceitem'|| typerec == 'itemgroup'|| typerec == 'discountitem'){
			 var kitflg;
			 invItemFlag = 'F';
			 var automatic = itemRecord.getFieldValue('custitem_djkk_automatic'); // DJ_自動採番Flag???
			 if(typerec=='lotnumberedassemblyitem'|| typerec=='serializedassemblyitem'){
				 typerec = 'assemblyitem';
				 kitflg = itemRecord.getFieldValue('custitem_djkk_kitflag');    //DJ_アセンブリタイプ  	
				 var kitflgText = itemRecord.getFieldText('custitem_djkk_kitflag'); 
				 nlapiLogExecution('debug', 'kitflgText', kitflgText);
				 nlapiLogExecution('debug', 'kitflg', kitflg);
			 }
			 nlapiLogExecution('debug', 'typerec',typerec);
			 var itemObj = {
					 sub:sub,          //ITEM.sub
					 typerec:typerec,  //ITEM.baserecordtype
					 subtype:subtype,  //ITEM.subtype
					 kitflg:kitflg	   //ITEM.kitflg
			 }
			 setItemId(itemRecord,type,null,automatic,currentContext,itemObj,invItemFlag);//20230512 changed by zhou 
		 }
		 if(typerec!='noninventoryitem'&& typerec!='otherchargeitem'&&typerec!='assemblyitem'&&typerec!='lotnumberedassemblyitem'&& typerec!='serializedassemblyitem'&&typerec!='serviceitem'&&typerec!='discountitem'){
			 var automatic = itemRecord.getFieldValue('custitem_djkk_automatic'); // DJ_自動採番Flg
			 var vendorname = '';
			 var vcount = itemRecord.getLineItemCount('itemvendor'); //購入明細行
			 for(var vi=1;vi<vcount+1;vi++){
				 if(itemRecord.getLineItemValue('itemvendor', 'preferredvendor', vi)=='T'){
					 vendorname=itemRecord.getLineItemValue('itemvendor', 'vendorcode', vi); //優先仕入先
					 break ;
				 }
			 }
//			 setItemId(itemRecord,type,vendorname,automatic,currentContext)//before
			 setItemId(itemRecord,type,vendorname,automatic,currentContext,null,invItemFlag);//20230512 changed by zhou 
		 }
		//20230516 add by zhou start
//		 try{
//			 nlapiSubmitRecord(itemRecord);
//		 }catch(e){
//			 nlapiLogExecution('error', e.message);
//		 }	 
		//20230516 add by zhou end
	 }
	 //20230516 add by zhou start
		var itemid = itemRecord.getFieldValue('itemid');
		var vendorname = itemRecord.getFieldValue('vendorname');
		var productCode = itemRecord.getFieldValue('custitem_djkk_product_code');
		var enname = itemRecord.getFieldValue('displayname');
		var abbreviationname = itemRecord.getFieldValue('custitem_djkk_item_abbreviation_name');//規格
		var itemPdf = itemid;
		
		if(!isEmpty(productCode)){
			itemPdf+='_'+productCode;
		}
		if(!isEmpty(vendorname)){
			itemPdf+='_'+vendorname;
		}
		if(!isEmpty(enname)){
			itemPdf+='_'+enname;
		}
		if(!isEmpty(abbreviationname)){
			itemPdf+='_'+abbreviationname;
		}
		
		itemPdf+='||'+itemid;
		if(!isEmpty(productCode)){
			itemPdf+='_'+productCode;
		}else{
			itemPdf+='_'+' ';
		}
		if(!isEmpty(vendorname)){
			itemPdf+='_'+vendorname;
		}else{
			itemPdf+='_'+' ';
		}
		if(!isEmpty(enname)){
			itemPdf+='_'+enname;
		}else{
			itemPdf+='_'+' ';
		}
		//CH197 start
		if(!isEmpty(abbreviationname)){
			itemPdf+='_'+abbreviationname;
		}else{
			itemPdf+='_'+' ';
		}
		//end
		itemRecord.setFieldValue('custitem_dkjj_item_pdf_show', itemPdf);
		try{
			 nlapiSubmitRecord(itemRecord);
		 }catch(e){
			 nlapiLogExecution('error', e.message);
		 }	
		//20230516 add by zhou end
}

function setItemId (itemRecord,type,vendorname,automatic,currentContext,itemObj,invItemFlag){
	if(invItemFlag == 'T'){
		//在庫Item場合
		if(currentContext.getExecutionContext() == 'csvimport'){
			nlapiLogExecution('debug', "automatic",automatic);
			if(type == 'create' || type == 'edit'){
				if(automatic == 'F'){
					if(!isEmpty(vendorname)){
						nlapiLogExecution('debug', "vendorname",vendorname);
		            	var itemid = getNumbering(vendorname);
		            	nlapiLogExecution('debug', "itemid",itemid);
		            	itemRecord.setFieldValue('itemid', itemid);	
		            	itemRecord.setFieldValue('custitem_djkk_automatic', "T");
					}
				}
			}
		}else{
			if(type == 'create' || type == 'copy'){
				if(automatic == 'T'){
					if(!isEmpty(vendorname)){
		            	var itemid = getNumbering(vendorname);
		            	itemRecord.setFieldValue('itemid', itemid);
					}
				}
			}
		}
	//20230512 add by zhou start
	}else{
		nlapiLogExecution('debug', "automatic",automatic);
		nlapiLogExecution('debug', '20230515', '1');
		nlapiLogExecution('debug', "sss",JSON.stringify(itemObj));
		//非在庫Item場合
		
		var sub=itemObj.sub;
		var itemType=itemObj.typerec;
		var otherItemType=itemObj.subtype;
//		if(itemType=='lotnumberedassemblyitem'|| itemType=='serializedassemblyitem'){
			var kitflg =itemObj.kitflg;
//		}else{
//			var kitflg = '';
//		}
		
		if(currentContext.getExecutionContext() == 'csvimport'){
			if(type == 'create' || type == 'edit'){
//				if(automatic == 'F'){
					nlapiLogExecution('debug', '20230515', '2');
	            	var itemid = getNewCodeNo(sub,itemType,otherItemType,kitflg);
	            	itemRecord.setFieldValue('itemid', itemid);	
	            	nlapiLogExecution('debug', '20230515', '3');
	            	itemRecord.setFieldValue('custitem_djkk_automatic', "T");
//				}
			}
		}else{
			if(type == 'create' || type == 'copy'){
	            	var itemid = getNewCodeNo(sub,itemType,otherItemType,kitflg);
	            	nlapiLogExecution('debug', "itemid",itemid);
	            	itemRecord.setFieldValue('itemid', itemid);
			}
		}
	}
	//20230512 add by zhou end
}
// change by song add 20230403 item自動採番統合  end

//changed by geng add start U200
	// --- changed by zhou 20221212 U834---
function getNewCodeNo (sub,type,otherItemType,kitflg){
	nlapiLogExecution('debug', '20230515', '4');
	//before:
	//noninventoryitem -- 非在庫アイテム
	//add new:
	//otherchargeitem -- その他の手数料 *
	//lotnumberedassemblyitem -- ロット番号アセンブリ
	//serializedassemblyitem -- シリアル番号付きアセンブリ
	//serviceitem -- サービス
	var no = '';
	try{
		var HeadTxt;
		var TheMinimumdigits;
		var submitId
		var NumberTxt;
		var numbering;
		var customrecordName;
		var custrecordName;
		var filterCustrecordName;
		if(type == 'noninventoryitem'){
			nlapiLogExecution('debug', '20230515', '5');
			//非在庫アイテム
//			HeadTxt='Z';
//			TheMinimumdigits = 5;
//			submitId='';
//			NumberTxt='';
//			numbering='';
			customrecordName = 'nonitem_create_code';
			custrecordName= 'nonitem';
			filterCustrecordName = 'custrecord_djkk_nonitem_subsidiary';
			
			if(otherItemType == 'Resale'){
				//再販用非在庫アイテム
				HeadTxt='ZR';
				TheMinimumdigits = 5;
				submitId='';
				NumberTxt='';
				numbering='';
			}else if(otherItemType == 'Sale'){
				//販売用非在庫アイテム
				HeadTxt='ZS';
				TheMinimumdigits = 5;
				submitId='';
				NumberTxt='';
				numbering='';
			}else if(otherItemType == 'Purchase'){
				//購入用非在庫アイテム
				HeadTxt='ZP';
				TheMinimumdigits = 5;
				submitId='';
				NumberTxt='';
				numbering='';
			}
		}else if(type == 'otherchargeitem'){
			customrecordName = 'otherchargeitem_code';
			custrecordName= 'othercharge';
			filterCustrecordName = 'custrecord_djkk_othercharge_subsidiary';
			//その他の手数料 *
			if(otherItemType == 'Resale'){
				//再販用その他の手数料
				HeadTxt='MC';
				TheMinimumdigits = 5;
				submitId='';
				NumberTxt='';
				numbering='';
			}else if(otherItemType == 'Sale'){
				//販売用その他の手数料
				HeadTxt='MS';
				TheMinimumdigits = 5;
				submitId='';
				NumberTxt='';
				numbering='';
			}else if(otherItemType == 'Purchase'){
				//購入用その他の手数料 
				HeadTxt='MP';
				TheMinimumdigits = 5;
				submitId='';
				NumberTxt='';
				numbering='';
			}
		}else if(type == 'assemblyitem' && Number(kitflg) != Number(4)){
			//20230608 zhou memo :生産品 => 'A' else 'K'
			nlapiLogExecution('debug','製造',Number(kitflg))
			//製造
			HeadTxt='K';
			TheMinimumdigits = 5;
			submitId='';
			NumberTxt='';
			numbering='';
			customrecordName = 'manufactureitem_code';
			custrecordName= 'manufacture';
			filterCustrecordName = 'custrecord_djkk_manufacture_subsidiary';
		}else if(type == 'assemblyitem' && Number(kitflg) == Number(4)){
			nlapiLogExecution('debug','小分け',Number(kitflg))
			//小分け
			HeadTxt='A';
			TheMinimumdigits = 5;
			submitId='';
			NumberTxt='';
			numbering='';
			customrecordName = 'subdivisionitem_code';
			custrecordName= 'subdivision';
			filterCustrecordName = 'custrecord_djkk_subdivision_subsidiary';
		}
		
		else if(type == 'serviceitem'){
			//サービス
//			HeadTxt='W';
//			TheMinimumdigits = 5;
//			submitId='';
//			NumberTxt='';
//			numbering='';
			customrecordName = 'serviceitem_code';
			custrecordName= 'serviceitem';
			filterCustrecordName = 'custrecord_djkk_serviceitem_subsidiary';
		
			if(otherItemType == 'Resale'){
				//再販用サービス
				HeadTxt='WR';
				TheMinimumdigits = 5;
				submitId='';
				NumberTxt='';
				numbering='';
			}else if(otherItemType == 'Sale'){
				//販売用サービス
				HeadTxt='WS';
				TheMinimumdigits = 5;
				submitId='';
				NumberTxt='';
				numbering='';
			}else if(otherItemType == 'Purchase'){
				//購入用サービス
				HeadTxt='WP';
				TheMinimumdigits = 5;
				submitId='';
				NumberTxt='';
				numbering='';
			}
		}else if(type == 'itemgroup'){
			//DJKKグループ DJKK環境?
			HeadTxt='Z';
			TheMinimumdigits = 5;
			submitId='';
			NumberTxt='';
			numbering='';
			customrecordName = 'itemgroup_code';
			custrecordName= 'itemgroup';
			filterCustrecordName = 'custrecord_djkk_itemgroup_tranpefix';
		}else if(type == 'discountitem'){
			//ディスカウント
			HeadTxt='R';
			TheMinimumdigits = 5;
			submitId='';
			NumberTxt='';
			numbering='';
			customrecordName = 'discountitem_code';
			custrecordName= 'discountitem';
			filterCustrecordName = 'custrecord_djkk_discountitem_subsidiary';
		}
		var usersub=sub;
		//20230512 changed by zhou start
		if(type == 'otherchargeitem' || type == 'noninventoryitem' || type == 'serviceitem'){
			nlapiLogExecution('debug', '20230515', '6');
			var filit = new Array();
			if(HeadTxt == 'WP'){
				filit.push(["custrecord_djkk_"+custrecordName+"_othertype","is","WP"]);
			}else if(HeadTxt == 'WR'){
				filit.push(["custrecord_djkk_"+custrecordName+"_othertype","is","WR"]);
			}else if(HeadTxt == 'WS'){
				filit.push(["custrecord_djkk_"+custrecordName+"_othertype","is","WS"]);
			}else if(HeadTxt == 'ZP'){
				filit.push(["custrecord_djkk_"+custrecordName+"_othertype","is","ZP"]);
			}else if(HeadTxt == 'ZR'){
				filit.push(["custrecord_djkk_"+custrecordName+"_othertype","is","ZR"]);
			}else if(HeadTxt == 'ZS'){
				filit.push(["custrecord_djkk_"+custrecordName+"_othertype","is","ZS"]);
			}else if(HeadTxt == 'MC'){
				filit.push(["custrecord_djkk_"+custrecordName+"_othertype","is","MC"]);
			}else if(HeadTxt == 'MS'){
				filit.push(["custrecord_djkk_"+custrecordName+"_othertype","is","MS"]);
			}else if(HeadTxt == 'MP'){
				filit.push(["custrecord_djkk_"+custrecordName+"_othertype","is","MP"]);
			}
			filit.push("AND");
			filit.push([filterCustrecordName,"anyof",usersub]);
			var nbSearch = nlapiSearchRecord("customrecord_djkk_"+customrecordName,null,
					[
					   filit
					], 
					[
	                   new nlobjSearchColumn("internalid"),
	                   new nlobjSearchColumn("custrecord_djkk_"+custrecordName+"_subsidiary"),
	                   new nlobjSearchColumn("custrecord_djkk_"+custrecordName+"_sub_name"),
					   new nlobjSearchColumn("custrecord_djkk_"+custrecordName+"_tranpefix"), 
					   new nlobjSearchColumn("custrecord_djkk_"+custrecordName+"_num"),
	                   new nlobjSearchColumn("custrecord_djkk_"+custrecordName+"_othertype")//add
					]
					);
			if(!isEmpty(nbSearch)){
				nlapiLogExecution('debug', '20230515', '7');
				submitId=nbSearch[0].getValue("internalid");
				NumberTxt=nbSearch[0].getValue("custrecord_djkk_"+custrecordName+"_tranpefix");
				numbering=nbSearch[0].getValue("custrecord_djkk_"+custrecordName+"_num");
				var newVendorCode = NumberTxt + HeadTxt + prefixInteger(parseInt(numbering)+1, parseInt(TheMinimumdigits));
				nlapiSubmitField("customrecord_djkk_"+customrecordName,submitId, "custrecord_djkk_"+custrecordName+"_num",parseInt(numbering)+1);
			}else{
				nlapiLogExecution('debug', '20230515', '8');
				var createRecord = nlapiCreateRecord("customrecord_djkk_"+customrecordName);
				var destinationRecord = nlapiLookupField('subsidiary', usersub,['custrecord_djkk_subsidiary_en','tranprefix']);
				var subname = destinationRecord.custrecord_djkk_subsidiary_en;
				var tranpefix = destinationRecord.tranprefix;
				var newVendorCode = tranpefix + HeadTxt + prefixInteger(parseInt(1), parseInt(TheMinimumdigits));
				createRecord.setFieldValue("custrecord_djkk_"+custrecordName+"_othertype",HeadTxt);
				createRecord.setFieldValue("custrecord_djkk_"+custrecordName+"_subsidiary",usersub);
				createRecord.setFieldValue("custrecord_djkk_"+custrecordName+"_sub_name",subname);
				createRecord.setFieldValue("custrecord_djkk_"+custrecordName+"_tranpefix",tranpefix);
				createRecord.setFieldValue("custrecord_djkk_"+custrecordName+"_num",parseInt(1));
				nlapiSubmitRecord(createRecord);
			}
		//20230512 changed by zhou end
		}else if(type == 'assemblyitem' ){
			var nbSearch = nlapiSearchRecord("customrecord_djkk_"+customrecordName,null,
					[
					   [filterCustrecordName,"anyof",usersub]
					], 
					[
	                   new nlobjSearchColumn("internalid"),
	                   new nlobjSearchColumn("custrecord_djkk_"+custrecordName+"_subsidiary"),
	                   new nlobjSearchColumn("custrecord_djkk_"+custrecordName+"_sub_name"),
					   new nlobjSearchColumn("custrecord_djkk_"+custrecordName+"_tranpefix"), 
					   new nlobjSearchColumn("custrecord_djkk_"+custrecordName+"_num")
					]
					);
			nlapiLogExecution('debug','assemblyitem',HeadTxt)
			if(!isEmpty(nbSearch)){
				submitId=nbSearch[0].getValue("internalid");
				NumberTxt=nbSearch[0].getValue("custrecord_djkk_"+custrecordName+"_tranpefix");
				numbering=nbSearch[0].getValue("custrecord_djkk_"+custrecordName+"_num");
				var newVendorCode = NumberTxt + HeadTxt + prefixInteger(parseInt(numbering)+1, parseInt(TheMinimumdigits));
				nlapiSubmitField("customrecord_djkk_"+customrecordName,submitId, "custrecord_djkk_"+custrecordName+"_num",parseInt(numbering)+1);
			}else{
				var createRecord = nlapiCreateRecord("customrecord_djkk_"+customrecordName);
				var destinationRecord = nlapiLookupField('subsidiary', usersub,['custrecord_djkk_subsidiary_en','tranprefix']);
				var subname = destinationRecord.custrecord_djkk_subsidiary_en;
				var tranpefix = destinationRecord.tranprefix;
				var newVendorCode = tranpefix + HeadTxt + prefixInteger(parseInt(1), parseInt(TheMinimumdigits));
				createRecord.setFieldValue("custrecord_djkk_"+custrecordName+"_subsidiary",usersub);
				createRecord.setFieldValue("custrecord_djkk_"+custrecordName+"_sub_name",subname);
				createRecord.setFieldValue("custrecord_djkk_"+custrecordName+"_tranpefix",tranpefix);
				createRecord.setFieldValue("custrecord_djkk_"+custrecordName+"_num",parseInt(1));
				nlapiSubmitRecord(createRecord);
			}
		}else if(type == 'itemgroup'){
			var filit = new Array();
				filit.push( ["custrecord_djkk_"+custrecordName+"_tranpefix","isnotempty",""]);
			var nbSearch = nlapiSearchRecord("customrecord_djkk_"+customrecordName,null,
					[
					 	filit
					], 
					[
	                   new nlobjSearchColumn("internalid"),
					   new nlobjSearchColumn("custrecord_djkk_"+custrecordName+"_tranpefix"), 
					   new nlobjSearchColumn("custrecord_djkk_"+custrecordName+"_num")
					]
					);
			
			if(!isEmpty(nbSearch)){
				submitId=nbSearch[0].getValue("internalid");
				NumberTxt=nbSearch[0].getValue("custrecord_djkk_"+custrecordName+"_tranpefix");
				numbering=nbSearch[0].getValue("custrecord_djkk_"+custrecordName+"_num");
				var newVendorCode = NumberTxt + HeadTxt + prefixInteger(parseInt(numbering)+1, parseInt(TheMinimumdigits));
				nlapiSubmitField("customrecord_djkk_"+customrecordName,submitId, "custrecord_djkk_"+custrecordName+"_num",parseInt(numbering)+1);
			}else{
				var createRecord = nlapiCreateRecord("customrecord_djkk_"+customrecordName);
				var tranpefix = 'D';
				var newVendorCode = tranpefix + HeadTxt + prefixInteger(parseInt(1), parseInt(TheMinimumdigits));
				createRecord.setFieldValue("custrecord_djkk_"+custrecordName+"_tranpefix",tranpefix);
				createRecord.setFieldValue("custrecord_djkk_"+custrecordName+"_num",parseInt(1));
				nlapiSubmitRecord(createRecord);
			}
		//20230512 add by zhou start
		}else if(type == 'discountitem'){
			var nbSearch = nlapiSearchRecord("customrecord_djkk_"+customrecordName,null,
					[
					    [filterCustrecordName,"anyof",usersub]
					], 
					[
	                   new nlobjSearchColumn("internalid"),
					   new nlobjSearchColumn("custrecord_djkk_"+custrecordName+"_tranpefix"), 
					   new nlobjSearchColumn("custrecord_djkk_"+custrecordName+"_num")
					]
					);
			
			if(!isEmpty(nbSearch)){
				submitId=nbSearch[0].getValue("internalid");
				NumberTxt=nbSearch[0].getValue("custrecord_djkk_"+custrecordName+"_tranpefix");
				numbering=nbSearch[0].getValue("custrecord_djkk_"+custrecordName+"_num");
				var newVendorCode = NumberTxt + HeadTxt + prefixInteger(parseInt(numbering)+1, parseInt(TheMinimumdigits));
				nlapiSubmitField("customrecord_djkk_"+customrecordName,submitId, "custrecord_djkk_"+custrecordName+"_num",parseInt(numbering)+1);
			}else{
				var createRecord = nlapiCreateRecord("customrecord_djkk_"+customrecordName);
				var destinationRecord = nlapiLookupField('subsidiary', usersub,['custrecord_djkk_subsidiary_en','tranprefix']);
				var tranpefix = destinationRecord.tranprefix;
				var newVendorCode = tranpefix + HeadTxt + prefixInteger(parseInt(1), parseInt(TheMinimumdigits));
				createRecord.setFieldValue("custrecord_djkk_"+custrecordName+"_subsidiary",usersub);
				createRecord.setFieldValue("custrecord_djkk_"+custrecordName+"_tranpefix",tranpefix);
				createRecord.setFieldValue("custrecord_djkk_"+custrecordName+"_num",parseInt(1));
				nlapiSubmitRecord(createRecord);
			}
		}
		//20230512 add by zhou end
		nlapiLogExecution('debug', '20230515', '9');
		nlapiLogExecution('debug', 'newVendorCode',newVendorCode)
		return newVendorCode;
		
	}catch(e){
		nlapiLogExecution('debug', '採番エラー', e.message)
	}
	return no;
}

// changed by song add 23030227 start
function getNumbering(vendorname) {
	var searchResult = nlapiSearchRecord("customrecord_djkk_itemmaster_numbering",null,
			[
			   ["custrecord_djkk_itemmaster_nb_name","is",vendorname]
			], 
			[
			   new nlobjSearchColumn("custrecord_djkk_itemmaster_nb_number"), 
			   new nlobjSearchColumn("internalid")
			]
			);
    var name = vendorname;
    if(!isEmpty(searchResult)){
        var ItemidNumber = parseInt(searchResult[0].getValue('custrecord_djkk_itemmaster_nb_number'));
		if(isEmpty(ItemidNumber)){
			ItemidNumber=0;
		}
		ItemidNumber++;
        NumberingID = searchResult[0].getValue('internalid');
        var itemid = name+"-"+prefixInteger(parseInt(ItemidNumber), parseInt(TheMinimumdigits));
        nlapiSubmitField('customrecord_djkk_itemmaster_numbering', NumberingID, 'custrecord_djkk_itemmaster_nb_number',ItemidNumber);	
    }else{
    	
    var newtb=nlapiCreateRecord('customrecord_djkk_itemmaster_numbering');
    newtb.setFieldValue('custrecord_djkk_itemmaster_nb_name', vendorname);
    newtb.setFieldValue('custrecord_djkk_itemmaster_nb_number', '1');
    var upid=nlapiSubmitRecord(newtb, false, true);
    ItemidNumber = 1;
    NumberingID = upid;
    var itemid = name+"-"+prefixInteger(parseInt(ItemidNumber), parseInt(TheMinimumdigits));
    }
    return itemid;
}
// changed by song add 23030227 end