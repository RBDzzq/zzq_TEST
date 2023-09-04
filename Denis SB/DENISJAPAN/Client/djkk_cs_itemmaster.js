/**
 * itemmasterのclient
 * 
 * Version     日付            担当者       備考
 * 1.00        2021/01/22     YUAN      新規作成
 *
 */

/**
 * 最小桁数
 */
var TheMinimumdigits = 5;
var ItemidNumber = '';
var NumberingID = '';
var formType='';
var NotAutomaticItemTypeName=['販売用その他の手数料','アイテムグループ','キット/パッケージ','販売用サービス','ディスカウント','マークアップ','入金','小計','説明','販売用非在庫アイテム'];
var NotAutomaticItemType=['Group','Kit','Discount','Markup','Payment','Subtotal','Description','NonInvtPart','OthCharge','Service'];
/**
 * 画面の初期化
 */
function clientPageInit(type) {
	
	// change by song add 20230403 item自動採番修正  start
//		if(type == 'creat' || type == 'copy'){
			nlapiSetFieldValue('custitem_djkk_automatic',"T", false, true);
//		}
	// change by song add 20230403 item自動採番修正  end
	
	var itemType=nlapiGetFieldValue('baserecordtype');
	if(itemType=='noninventoryitem'|| itemType=='otherchargeitem' ||itemType== 'itemgroup'){
	setTableHidden('vendorstabtxt')
	}
	nlapiLogExecution('debug', '1')
	//changed by geng add start U548
	if(type == 'create'||type == 'edit'){
		var sub = nlapiGetFieldValue('subsidiary')
		if(sub==SUB_SCETI||sub==SUB_DPKK){
			var Role=nlapiGetRole();
			if(Role!='1022'){
				nlapiDisableField('costcategory', true);
			}		
		}		
	}
	//changed by geng add end U548
	//add by zhou 20230227 start CH344
	if(itemType=='otherchargeitem' && type == 'create'){
		nlapiSetFieldValue('custitem_djkk_automatic','F')
		nlapiSetFieldValue('custitem_djkk_forecast','F')
    }
	//end
	//changed by geng add 
		if(type == 'create'||type == 'edit'){
			var Role=nlapiGetRole();
//		if(Role!='1022'){
//				setFieldDisableType('custitem_djkk_fa_memo', 'hidden');
//			}
		var sub = nlapiGetFieldValue('subsidiary')
		if(sub==SUB_SCETI||sub==SUB_DPKK){
			
			if(Role!='1022'){
				nlapiDisableField('cogsaccount', true);
				nlapiDisableField('assetaccount', true);
				nlapiDisableField('incomeaccount', true);
				nlapiDisableField('gainlossaccount', true);
				nlapiDisableField('intercocogsaccount', true);
				nlapiDisableField('billpricevarianceacct', true);
				nlapiDisableField('billqtyvarianceacct', true);
				nlapiDisableField('billexchratevarianceacct', true);
				nlapiDisableField('custreturnvarianceaccount', true);
				nlapiDisableField('intercoincomeaccount', true);
				nlapiDisableField('vendreturnvarianceaccount', true);
				nlapiDisableField('purchasepricevarianceacct', true);
				nlapiDisableField('dropshipexpenseaccount', true);
			}		
		}		
	}
	//changed by geng end
	
	//食品フォーム、新規場合
	//DJ_出荷可能期間（MONTHS） は0　DJ_出荷可能期間（DAYS）は0

	if(type == 'create'){
		var customform = nlapiGetFieldValue('customform');
		
		if(customform == '98'){
			nlapiSetFieldValue('custitem_djkk_warranty', '0');
			nlapiSetFieldValue('custitem_djkk_warranty_month', '0');
		}
	}
	nlapiLogExecution('debug', '2')
	nlapiDisableField('costingmethod', true);
	var itemType = nlapiGetFieldValue('itemtype');
	var subtype=nlapiGetFieldValue('subtype');
    formType=type;
    if (type == 'edit') {
    	
    	if(subtype!='Sale'&&NotAutomaticItemType.indexOf(itemType)<0){
        nlapiDisableField('custitem_djkk_automatic', true);
        if(nlapiGetFieldValue('custitem_djkk_automatic')== 'T'){
        	
        	//if(itemType != 'Assembly'){
        		nlapiDisableField('itemid', true);
        	//}       
           }
    	}
    }
    nlapiLogExecution('debug', '3')
    if(type=='create'||type=='copy'){
    	
    	   try{
    	   nlapiSetFieldValue('taxschedule', '7');
    	   }catch(ee){}
    	   if(subtype!='Sale'&&NotAutomaticItemType.indexOf(itemType)<0){
    	   nlapiDisableField('custitem_djkk_automatic', true);
    	   if(nlapiGetFieldValue('custitem_djkk_automatic')== 'T'){
   	    	       nlapiSetFieldValue('itemid', '自動採番');
   	    	       nlapiDisableField('itemid', true);

   	       }  
    	   }else{
    		   nlapiDisableField('custitem_djkk_automatic', true);
    		   nlapiSetFieldValue('custitem_djkk_automatic', 'F');
    	   }
    	        	    
    	var type=nlapiGetRecordType();
    	
    	// ロット番号在庫アイテム 
    	if(type=='lotnumberedinventoryitem'){
    		
    		// ロット番号
    		nlapiSetFieldValue('costingmethod', 'FIFO');
    	}
    	
    	// シリアル番号付き在庫アイテム
    	else if(type=='serializedinventoryitem'){
    		
    		// 特定
    		nlapiSetFieldValue('costingmethod', 'LIFO');
    	}
    	else{
    		// 平均
    		nlapiSetFieldValue('costingmethod', 'AVG');
    	}
    }
    nlapiLogExecution('debug', '4')
    // add by ycx DENISJAPAN-134
    // 毒物   add by song DENISJAPAN-635 start
//    var poison=nlapiGetFieldValue('custitem_djkk_poison');
    
    // 	劇物
//    var deleterious=nlapiGetFieldValue('custitem_djkk_deleterious_substance');
//    if(poison=='F'&&deleterious=='F'){
    	
    	// 毒劇物成分名&毒劇物含有量
    	setFieldDisableType('custitem_djkk_poison_ingredient1', 'disabled');
    	setFieldDisableType('custitem_djkk_poison_content1', 'disabled');
    	setFieldDisableType('custitem_djkk_poison_ingredient_sn1', 'disabled');
    	setFieldDisableType('custitem_djkk_poison_ingredient2', 'disabled');
    	setFieldDisableType('custitem_djkk_poison_content2', 'disabled');
    	setFieldDisableType('custitem_djkk_poison_ingredient_sn2', 'disabled');
    	setFieldDisableType('custitem_djkk_poison_ingredient3', 'disabled');
    	setFieldDisableType('custitem_djkk_poison_content3', 'disabled');
    	setFieldDisableType('custitem_djkk_poison_ingredient_sn3', 'disabled');
    	setFieldDisableType('custitem_djkk_poison_ingredient4', 'disabled');
    	setFieldDisableType('custitem_djkk_poison_content4', 'disabled');
    	setFieldDisableType('custitem_djkk_poison_ingredient_sn4', 'disabled');
    	setFieldDisableType('custitem_djkk_poison_ingredient5', 'disabled');
    	setFieldDisableType('custitem_djkk_poison_content5', 'disabled');
    	setFieldDisableType('custitem_djkk_poison_ingredient_sn5', 'disabled');
//    }add by song DENISJAPAN-635 end
    
    // 労安法
    var isAct=nlapiGetFieldValue('custitem_djkk_industrial_safety_act');
    if(isAct=='F'){
    	
    	 // 労働安全衛生法成分名&労働安全衛生法含有量
    	setFieldDisableType('custitem_djkk_is_act_ingredient1', 'disabled');
    	setFieldDisableType('custitem_djkk_is_act_content1', 'disabled');
    	setFieldDisableType('custitem_djkk_is_act_ingredient2', 'disabled');
    	setFieldDisableType('custitem_djkk_is_act_content2', 'disabled');
    	setFieldDisableType('custitem_djkk_is_act_ingredient3', 'disabled');
    	setFieldDisableType('custitem_djkk_is_act_content3', 'disabled');
    	setFieldDisableType('custitem_djkk_is_act_ingredient4', 'disabled');
    	setFieldDisableType('custitem_djkk_is_act_content4', 'disabled');
    	setFieldDisableType('custitem_djkk_is_act_ingredient5', 'disabled');
    	setFieldDisableType('custitem_djkk_is_act_content5', 'disabled');
    }
    nlapiLogExecution('debug', '5')
    // DJ_毒物
//    setFieldDisableType('custitem_djkk_poison', 'disabled');
    
    // DJ_劇物
//	setFieldDisableType('custitem_djkk_deleterious_substance', 'disabled');
	
	// DJ_労安法
	setFieldDisableType('custitem_djkk_industrial_safety_act', 'disabled');

	// 有害物/危険物
	setFieldDisableType('ishazmatitem', 'hidden');

	// ID
	setFieldDisableType('hazmatid', 'hidden');

	// 有害物出荷名
	setFieldDisableType('hazmatshippingname', 'hidden');

	// 有害物の危険度
	setFieldDisableType('hazmathazardclass', 'hidden');

	// 有害物梱包グループ
	setFieldDisableType('hazmatpackinggroup', 'hidden');

	// 有害物アイテム単位
	setFieldDisableType('hazmatitemunits', 'hidden');

	// 有害物アイテム単位数量
	setFieldDisableType('hazmatitemunitsqty', 'hidden');
    // add end
	
    // DJ_検品必要
	if(nlapiGetFieldValue('custitem_djkk_inspection_required')=='F'){
		
		// DJ_検品レベル
		setFieldDisableType('custitem_djkk_inspection_level', 'disabled');
	}else{
		
		// DJ_検品レベル
		setFieldDisableType('custitem_djkk_inspection_level', 'normal');
	}
	 nlapiLogExecution('debug', '6')

	// DENISJAPAN-255 add by ycx 2021/06/02 
	var userRole=nlapiGetRole();
	 nlapiLogExecution('debug', '7')
	// 管理者
	if(userRole!='3'){
	// ロール職責会社の取得
	var roleSubsidiary = nlapiGetFieldValue('custitem_syokuseki');
	// DJ_会社間取引用
	var intercompany = nlapiGetFieldValue('custitem_djkk_intercompany_transac');
	if (type == 'create') {
		if(!isEmpty(roleSubsidiary)){
			
		nlapiSetFieldValue('subsidiary', roleSubsidiary, false, true);
		}
		//if(userRole!='1025'||userRole!='1026'){
		setFieldDisableType('subsidiary', 'disabled');
		//}
	}
	
	if (type == 'copy') {		
		if (intercompany == 'T'&&!isEmpty(roleSubsidiary)) {
			setFieldDisableType('subsidiary', 'normal');

			var subsidiaryArray = nlapiGetFieldValues('subsidiary');
			if (subsidiaryArray.indexOf(roleSubsidiary) < 0) {
				var newSubsidiaryArray = new Array();
				for (var sl = 0; sl < subsidiaryArray.length; sl++) {
					newSubsidiaryArray.push(subsidiaryArray[sl]);
				}
				newSubsidiaryArray.push(roleSubsidiary);
				nlapiSetFieldValues('subsidiary', newSubsidiaryArray, false,
						true);				
			}
		}
	}
	if (type == 'edit') {
		if (intercompany == 'T') {
			setFieldDisableType('subsidiary', 'normal');
		} else {
			setFieldDisableType('subsidiary', 'disabled');
		}
	}
	}
	// add end
	 nlapiLogExecution('debug', '8')
	
	var no_bbd = nlapiGetFieldValue('custitem_djkk_no_bbd');
	if(DJ_NO_BBD_RECORDTYPE_ARY.indexOf(nlapiGetRecordType()) != -1){
		if(no_bbd == 'T'){
			setFieldDisableType('custitem_djkk_warranty_month', 'disabled');
			setFieldDisableType('custitem_djkk_shelf_life', 'disabled');
			
			setFieldDisableType('custitem_djkk_warranty', 'disabled');
			setFieldDisableType('custitem_djkk_shelf_life_months', 'disabled');
		}else{
			setFieldDisableType('custitem_djkk_warranty_month', 'normal');
			setFieldDisableType('custitem_djkk_shelf_life', 'normal');
			
			setFieldDisableType('custitem_djkk_warranty', 'normal');
			setFieldDisableType('custitem_djkk_shelf_life_months', 'normal');
		}
	}
	
	//20220816 add by zhou U779
	if(type == 'create' ||type == 'edit' || type == 'copy'){
		var subsidiary = getRoleSubsidiary();
		if(subsidiary == SUB_NBKK || subsidiary == SUB_ULKK){
			setFieldDisableType('custitem_djkk_receipt_printing','hidden');
		}
	}
	//end
	 nlapiLogExecution('debug', '9')
	 //20221020 add by zhou 会計サブタブは経理のみ参照可能とする   CH058 U135
     var role=nlapiGetRole();
	 var roleSubsidiary = getRoleSubsidiary();
	 var recordType = nlapiGetRecordType();
	 var getSaleType = getQueryVariable('subtype')
     // TODO DJ_経理担当_test|管理者
     if((roleSubsidiary != SUB_SCETI && roleSubsidiary != SUB_DPKK) &&(role!='1022'&&role!='3')){
    	 if((recordType == 'noninventoryitem' ||recordType == 'otherchargeitem')&&(getSaleType =='Sale'||getSaleType =='Purchase')){
    		 setTableHidden('accountingtxt');
    	 }else if(recordType == 'discountitem'){
    		 setTableHidden('accountingtxt');
    	 }
     }
	 //end
	 
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * @param {String}
 *            type Sublist internal id
 * @param {String}
 *            name Field internal id
 * @param {Number}
 *            linenum Optional line item number, starts from 1
 * @returns {Boolean} True to continue changing field value, false to abort
 *          value change
 */
function clientFieldChanged(type, name, linenum) {
	if(name=='custitem_djkk_intercompany_transac'){
		 var sub = nlapiGetFieldValue('subsidiary');
		    //changed by geng add start U796
		    if(sub==SUB_DPKK || sub==SUB_SCETI){
		    	var flag = nlapiGetFieldValue('custitem_djkk_intercompany_transac');
		    	if(flag=='T'){
		    		alert('「会社間取引用」のフラグが有効、「DJ_セクション」登録できません。');
		    		nlapiDisableField('custitem_djkk_department', true);
		    		}else{
		    			nlapiDisableField('custitem_djkk_department', false);
		    		}
		    	}
		    }
	
   
    //changed end
	nlapiLogExecution('debug', 'clientFieldChanged')
	//changed by geng add start CH084
	
	if(name=='purchasedescription'){
		var sub = nlapiGetFieldValue('subsidiary');
		if(sub==SUB_DPKK||sub==SUB_SCETI){
			var memoVal=nlapiGetFieldValue('purchasedescription');
			var StringVal = String(memoVal);
			var encoder = new TextEncoder();
			var bytes = encoder.encode(StringVal);
			var byteCount = bytes.length;
			if(byteCount>100){
				alert('[PO行コメント]フィールドの内容が多すぎます。再入力してください');
				nlapiSetFieldValue('purchasedescription','');
			}
		}
	}
	//changed by geng add start CH084
//20220510 add by zhou start
//DJ_検品種類
if(name =='custitem_djkk_quantity_type'){
	var typeValue = nlapiGetFieldText('custitem_djkk_quantity_type');
	if(!isEmpty(typeValue)){
		var contentSearch = nlapiSearchRecord("customrecord_djkk_quantity_type",null,
				[
				 	["custrecord_djkk_type","is",typeValue]
				], 
				[
				   new nlobjSearchColumn("custrecord_djkk_type"), 
				   new nlobjSearchColumn("custrecord_djkk_content")
				]
				);
		if(contentSearch != null){
			var contentSearchLength = contentSearch.length;
			var contentCounts = nlapiGetLineItemCount('recmachcustrecord_djkk_ip_item');
			if(contentCounts != 0 ){
				if(contentSearchLength > contentCounts){
					for(var n = contentCounts; n < contentSearchLength; n++){
						nlapiInsertLineItem('recmachcustrecord_djkk_ip_item',n);
						nlapiCommitLineItem('recmachcustrecord_djkk_ip_item');
					}
				}else if(contentSearchLength < contentCounts){
					for(var n = contentSearchLength; n < contentCounts; n++){
						nlapiRemoveLineItem('recmachcustrecord_djkk_ip_item',contentSearchLength);
						nlapiCommitLineItem('recmachcustrecord_djkk_ip_item');
					} 
				}
			}else if(contentCounts == 0){
				for(var n = 0; n < contentSearch.length; n++){
					nlapiInsertLineItem('recmachcustrecord_djkk_ip_item',n+1);
					nlapiCommitLineItem('recmachcustrecord_djkk_ip_item');
				}
				var contentCounts2 = nlapiGetLineItemCount('recmachcustrecord_djkk_ip_item');
			}
			for(var i = 0; i < contentSearch.length; i++){
				var getType = contentSearch[i].getValue("custrecord_djkk_type");
				var getContent = contentSearch[i].getValue("custrecord_djkk_content");
				nlapiSetLineItemValue('recmachcustrecord_djkk_ip_item','custrecord_djkk_ip_procedure_contents',i+1,getContent);
				nlapiSetLineItemValue('recmachcustrecord_djkk_ip_item','custrecord_djkk_ip_procedure_number',i+1 ,getType);
			}
		}else{
			alert('システム中に当該検品種類下の手順内容データが存在しない!');
			var contentCounts = nlapiGetLineItemCount('recmachcustrecord_djkk_ip_item');
			if(contentCounts != 0 ){
				for(var n = 0; n < contentCounts; n++){
					nlapiRemoveLineItem('recmachcustrecord_djkk_ip_item',1);
					nlapiCommitLineItem('recmachcustrecord_djkk_ip_item');
				} 	
			}
			contentCounts = nlapiGetLineItemCount('recmachcustrecord_djkk_ip_item');
			if(contentCounts == 1 ){
					nlapiRemoveLineItem('recmachcustrecord_djkk_ip_item',contentCounts);
					nlapiCommitLineItem('recmachcustrecord_djkk_ip_item');
			}
			contentCounts = nlapiGetLineItemCount('recmachcustrecord_djkk_ip_item');
			nlapiLogExecution('debug', 'contentCounts', contentCounts);
		}	
	}
}
//20220510 add by zhou end

if(name=='custitem_djkk_item_kana'){

	var kana=nlapiGetFieldValue('custitem_djkk_item_kana');
	if(!inputCheckKana(kana)){
		alert('半角カナのみ入力可、入力はひっすではありません。');
		nlapiSetFieldValue('custitem_djkk_item_kana', '', false, true);
	}
	
}

// DJ_キット品
if(name=='custitem_djkk_kitflag'){
	var kitflg=nlapiGetFieldValue('custitem_djkk_kitflag');
	var type=nlapiGetRecordType();
	if(type=='assemblyitem'||type=='lotnumberedassemblyitem'||type=='serializedassemblyitem'){
		
		// 小分け
	if(kitflg=='3'){
		// 平均
		nlapiSetFieldValue('costingmethod', 'AVG');
		// ロット番号
		// nlapiSetFieldValue('costingmethod', 'FIFO');
		
		// 生産品
	}else if(kitflg=='4'){
		// 標準
		nlapiSetFieldValue('costingmethod', 'STANDARD');				
	}else{
		// 平均
		nlapiSetFieldValue('costingmethod', 'AVG');
	 }
	}
}
	
    if(type=='itemvendor'&&name=='vendor'){
    	var vid=nlapiGetCurrentLineItemValue('itemvendor', 'vendor');
    	if(!isEmpty(vid)){
    		
    		var vode=nlapiLookupField('vendor', vid, 'entityid');
    		nlapiSetCurrentLineItemValue('itemvendor', 'vendorcode', vode, false, true)
    	}
    }
    if (name == 'custitem_djkk_automatic'&&(formType == 'create'||formType == 'copy')) {
        var automatic = nlapiGetFieldValue('custitem_djkk_automatic');
        var itemType = nlapiGetFieldValue('itemtype');
        if (automatic == 'T' && itemType != 'Assembly') {
            nlapiSetFieldValue('itemid', '自動採番');
            nlapiDisableField('itemid', true);
        }
        if (itemType == 'Service') {
            nlapiSetFieldValue('itemid', '自動採番');
            nlapiDisableField('itemid', true);
        }
        //20230424 changed by zhou start
        //CH451  20230424 zhou memo :非在庫アイテム/ その他の手数料(OthCharge)は自動的に採番しなければならない
//      else if (automatic == 'F' && itemType != 'Assembly') {
//          nlapiSetFieldValue('itemid', ''); 
//            nlapiDisableField('itemid', false);
//      }
      //20230424 changed by zhou end
    }
    // add by ycx DENISJAPAN-134
    
    // DJ_9_労区分
	    if (name == 'custitem_djkk_labor_division') {
		if (nlapiGetFieldValue('custitem_djkk_labor_division') == '1') {
			nlapiSetFieldValue('custitem_djkk_industrial_safety_act', 'T');
		}else{
			nlapiSetFieldValue('custitem_djkk_industrial_safety_act', 'F');
		}
	}

	// DJ_10_毒劇物区分
	if (name == 'custitem_djkk_pad_classification' || name == 'custitem_djkk_pad_classification2' || name == 'custitem_djkk_pad_classification3' || name == 'custitem_djkk_pad_classification4' || name == 'custitem_djkk_pad_classification5') {
		// add by song DENISJAPAN-635 start
		var classification1 = nlapiGetFieldValue('custitem_djkk_pad_classification'); //DJ_10_毒劇物区分1
		var classification2 = nlapiGetFieldValue('custitem_djkk_pad_classification2'); //DJ_10_毒劇物区分2
		var classification3 = nlapiGetFieldValue('custitem_djkk_pad_classification3'); //DJ_10_毒劇物区分3
		var classification4 = nlapiGetFieldValue('custitem_djkk_pad_classification4'); //DJ_10_毒劇物区分4
		var classification5 = nlapiGetFieldValue('custitem_djkk_pad_classification5'); //DJ_10_毒劇物区分5
		
		if(classification1 == '1' || classification1 == '2' || classification1 == '4'){
			setFieldDisableType('custitem_djkk_poison_ingredient1', 'normal');
			setFieldDisableType('custitem_djkk_poison_content1', 'normal');
			setFieldDisableType('custitem_djkk_poison_ingredient_sn1', 'normal');
		}else{
			nlapiSetFieldValue('custitem_djkk_poison_ingredient1', '');
			nlapiSetFieldValue('custitem_djkk_poison_content1', '');
			nlapiSetFieldValue('custitem_djkk_poison_ingredient_sn1', '');
			
			setFieldDisableType('custitem_djkk_poison_ingredient1', 'disabled');
			setFieldDisableType('custitem_djkk_poison_content1', 'disabled');
			setFieldDisableType('custitem_djkk_poison_ingredient_sn1', 'disabled');
		}
		
		if(classification2 == '1' || classification2 == '2' || classification2 == '4'){
			setFieldDisableType('custitem_djkk_poison_ingredient2', 'normal');
			setFieldDisableType('custitem_djkk_poison_content2', 'normal');
			setFieldDisableType('custitem_djkk_poison_ingredient_sn2', 'normal');
		}else{
			nlapiSetFieldValue('custitem_djkk_poison_ingredient2', '');
			nlapiSetFieldValue('custitem_djkk_poison_content2', '');
			nlapiSetFieldValue('custitem_djkk_poison_ingredient_sn2', '');
			
			setFieldDisableType('custitem_djkk_poison_ingredient2', 'disabled');
			setFieldDisableType('custitem_djkk_poison_content2', 'disabled');
			setFieldDisableType('custitem_djkk_poison_ingredient_sn2', 'disabled');
		}
		
		if(classification3 == '1' || classification3 == '2' || classification3 == '4'){
			setFieldDisableType('custitem_djkk_poison_ingredient3', 'normal');
			setFieldDisableType('custitem_djkk_poison_content3', 'normal');
			setFieldDisableType('custitem_djkk_poison_ingredient_sn3', 'normal');
		}else{
			nlapiSetFieldValue('custitem_djkk_poison_ingredient3', '');
			nlapiSetFieldValue('custitem_djkk_poison_content3', '');
			nlapiSetFieldValue('custitem_djkk_poison_ingredient_sn3', '');
			
			setFieldDisableType('custitem_djkk_poison_ingredient3', 'disabled');
			setFieldDisableType('custitem_djkk_poison_content3', 'disabled');
			setFieldDisableType('custitem_djkk_poison_ingredient_sn3', 'disabled');
		}
		
		if(classification4 == '1' || classification4 == '2' || classification4 == '4'){
			setFieldDisableType('custitem_djkk_poison_ingredient4', 'normal');
			setFieldDisableType('custitem_djkk_poison_content4', 'normal');
			setFieldDisableType('custitem_djkk_poison_ingredient_sn4', 'normal');
		}else{
			nlapiSetFieldValue('custitem_djkk_poison_ingredient4', '');
			nlapiSetFieldValue('custitem_djkk_poison_content4', '');
			nlapiSetFieldValue('custitem_djkk_poison_ingredient_sn4', '');
			
			setFieldDisableType('custitem_djkk_poison_ingredient4', 'disabled');
			setFieldDisableType('custitem_djkk_poison_content4', 'disabled');
			setFieldDisableType('custitem_djkk_poison_ingredient_sn4', 'disabled');
		}
		
		if(classification5 == '1' || classification5 == '2' || classification5 == '4'){
			setFieldDisableType('custitem_djkk_poison_ingredient5', 'normal');
			setFieldDisableType('custitem_djkk_poison_content5', 'normal');
			setFieldDisableType('custitem_djkk_poison_ingredient_sn5', 'normal');
		}else{
			nlapiSetFieldValue('custitem_djkk_poison_ingredient5', '');
			nlapiSetFieldValue('custitem_djkk_poison_content5', '');
			nlapiSetFieldValue('custitem_djkk_poison_ingredient_sn5', '');
			
			setFieldDisableType('custitem_djkk_poison_ingredient5', 'disabled');
			setFieldDisableType('custitem_djkk_poison_content5', 'disabled');
			setFieldDisableType('custitem_djkk_poison_ingredient_sn5', 'disabled');
		}
		
		// add by song DENISJAPAN-635 end
	}
        // 毒物|劇物
//	    if (name == 'custitem_djkk_poison' || name == 'custitem_djkk_deleterious_substance') {
//
//		// 毒物
//		var poison = nlapiGetFieldValue('custitem_djkk_poison');
//
//		// 劇物
//		var deleterious = nlapiGetFieldValue('custitem_djkk_deleterious_substance');
//		if (poison == 'T' || deleterious == 'T') {
//
//			// 毒劇物成分名&毒劇物含有量
//			setFieldDisableType('custitem_djkk_poison_ingredient1', 'normal');
//			setFieldDisableType('custitem_djkk_poison_content1', 'normal');
//			setFieldDisableType('custitem_djkk_poison_ingredient_sn1', 'normal');
//			setFieldDisableType('custitem_djkk_poison_ingredient2', 'normal');
//			setFieldDisableType('custitem_djkk_poison_content2', 'normal');
//			setFieldDisableType('custitem_djkk_poison_ingredient_sn2', 'normal');
//			setFieldDisableType('custitem_djkk_poison_ingredient3', 'normal');
//			setFieldDisableType('custitem_djkk_poison_content3', 'normal');
//			setFieldDisableType('custitem_djkk_poison_ingredient_sn3', 'normal');
//			setFieldDisableType('custitem_djkk_poison_ingredient4', 'normal');
//			setFieldDisableType('custitem_djkk_poison_content4', 'normal');
//			setFieldDisableType('custitem_djkk_poison_ingredient_sn4', 'normal');
//			setFieldDisableType('custitem_djkk_poison_ingredient5', 'normal');
//			setFieldDisableType('custitem_djkk_poison_content5', 'normal');
//			setFieldDisableType('custitem_djkk_poison_ingredient_sn5', 'normal');
//		}else{
//			
//			// 毒劇物成分名&毒劇物含有量
//	    	setFieldDisableType('custitem_djkk_poison_ingredient1', 'disabled');
//	    	setFieldDisableType('custitem_djkk_poison_content1', 'disabled');
//	    	setFieldDisableType('custitem_djkk_poison_ingredient_sn1', 'disabled');
//	    	setFieldDisableType('custitem_djkk_poison_ingredient2', 'disabled');
//	    	setFieldDisableType('custitem_djkk_poison_content2', 'disabled');
//	    	setFieldDisableType('custitem_djkk_poison_ingredient_sn2', 'disabled');
//	    	setFieldDisableType('custitem_djkk_poison_ingredient3', 'disabled');
//	    	setFieldDisableType('custitem_djkk_poison_content3', 'disabled');
//	    	setFieldDisableType('custitem_djkk_poison_ingredient_sn3', 'disabled');
//	    	setFieldDisableType('custitem_djkk_poison_ingredient4', 'disabled');
//	    	setFieldDisableType('custitem_djkk_poison_content4', 'disabled');
//	    	setFieldDisableType('custitem_djkk_poison_ingredient_sn4', 'disabled');
//	    	setFieldDisableType('custitem_djkk_poison_ingredient5', 'disabled');
//	    	setFieldDisableType('custitem_djkk_poison_content5', 'disabled');
//	    	setFieldDisableType('custitem_djkk_poison_ingredient_sn5', 'disabled');
//		}
//		if(poison == 'F' && deleterious == 'F'){
//			nlapiSetFieldValue('custitem_djkk_poison_ingredient1', '');
//			nlapiSetFieldValue('custitem_djkk_poison_content1', '');
//			nlapiSetFieldValue('custitem_djkk_poison_ingredient_sn1', '');
//			nlapiSetFieldValue('custitem_djkk_poison_ingredient2', '');
//			nlapiSetFieldValue('custitem_djkk_poison_content2', '');
//			nlapiSetFieldValue('custitem_djkk_poison_ingredient_sn2', '');
//			nlapiSetFieldValue('custitem_djkk_poison_ingredient3', '');
//			nlapiSetFieldValue('custitem_djkk_poison_content3', '');
//			nlapiSetFieldValue('custitem_djkk_poison_ingredient_sn3', '');
//			nlapiSetFieldValue('custitem_djkk_poison_ingredient4', '');
//			nlapiSetFieldValue('custitem_djkk_poison_content4', '');
//			nlapiSetFieldValue('custitem_djkk_poison_ingredient_sn4', '');
//			nlapiSetFieldValue('custitem_djkk_poison_ingredient5', '');
//			nlapiSetFieldValue('custitem_djkk_poison_content5', '');
//			nlapiSetFieldValue('custitem_djkk_poison_ingredient_sn5', '');
//		}
//	}
	    
	    // 労安法
	    if (name == 'custitem_djkk_industrial_safety_act') {
	    	
		// 労安法
		var isAct = nlapiGetFieldValue('custitem_djkk_industrial_safety_act');
		if (isAct == 'T') {
			
			// 労働安全衛生法成分名&労働安全衛生法含有量
			setFieldDisableType('custitem_djkk_is_act_ingredient1', 'normal');
			setFieldDisableType('custitem_djkk_is_act_content1', 'normal');
			setFieldDisableType('custitem_djkk_is_act_ingredient2', 'normal');
			setFieldDisableType('custitem_djkk_is_act_content2', 'normal');
			setFieldDisableType('custitem_djkk_is_act_ingredient3', 'normal');
			setFieldDisableType('custitem_djkk_is_act_content3', 'normal');
			setFieldDisableType('custitem_djkk_is_act_ingredient4', 'normal');
			setFieldDisableType('custitem_djkk_is_act_content4', 'normal');
			setFieldDisableType('custitem_djkk_is_act_ingredient5', 'normal');
			setFieldDisableType('custitem_djkk_is_act_content5', 'normal');
		}else{
			
			// 労働安全衛生法成分名&労働安全衛生法含有量
			setFieldDisableType('custitem_djkk_is_act_ingredient1', 'disabled');
	    	setFieldDisableType('custitem_djkk_is_act_content1', 'disabled');
	    	setFieldDisableType('custitem_djkk_is_act_ingredient2', 'disabled');
	    	setFieldDisableType('custitem_djkk_is_act_content2', 'disabled');
	    	setFieldDisableType('custitem_djkk_is_act_ingredient3', 'disabled');
	    	setFieldDisableType('custitem_djkk_is_act_content3', 'disabled');
	    	setFieldDisableType('custitem_djkk_is_act_ingredient4', 'disabled');
	    	setFieldDisableType('custitem_djkk_is_act_content4', 'disabled');
	    	setFieldDisableType('custitem_djkk_is_act_ingredient5', 'disabled');
	    	setFieldDisableType('custitem_djkk_is_act_content5', 'disabled');
	    	nlapiSetFieldValue('custitem_djkk_is_act_ingredient1', '');
			nlapiSetFieldValue('custitem_djkk_is_act_content1', '');
			nlapiSetFieldValue('custitem_djkk_is_act_ingredient2', '');
			nlapiSetFieldValue('custitem_djkk_is_act_content2', '');
			nlapiSetFieldValue('custitem_djkk_is_act_ingredient3', '');
			nlapiSetFieldValue('custitem_djkk_is_act_content3', '');
			nlapiSetFieldValue('custitem_djkk_is_act_ingredient4', '');
			nlapiSetFieldValue('custitem_djkk_is_act_content4', '');
			nlapiSetFieldValue('custitem_djkk_is_act_ingredient5', '');
			nlapiSetFieldValue('custitem_djkk_is_act_content5', '');
		}
	}
    // add end
	    
	    if(name=='custitem_djkk_inspection_required'){
	    	// DJ_検品必要
	    	if(nlapiGetFieldValue('custitem_djkk_inspection_required')=='F'){
	    		
	    		// DJ_検品レベル
	    		setFieldDisableType('custitem_djkk_inspection_level', 'disabled');
	    		nlapiSetFieldValue('custitem_djkk_inspection_level', '');
	    	}else{
	    		
	    		// DJ_検品レベル
	    		setFieldDisableType('custitem_djkk_inspection_level', 'normal');
	    	}
	    }
	  
	 // DENISJAPAN-255 add by ycx 2021/06/02 
	    if (name == 'custitem_djkk_intercompany_transac'||name == 'subsidiary') {
	    var userRole=nlapiGetRole();
		
		// 管理者
		if(userRole!='3'){
	// DJ_会社間取引用
	if (name == 'custitem_djkk_intercompany_transac') {
		var intercompany = nlapiGetFieldValue('custitem_djkk_intercompany_transac');
		if (intercompany == 'T') {
			setFieldDisableType('subsidiary', 'normal');
		} else {
			setFieldDisableType('subsidiary', 'disabled');
			var roleSubsidiary = nlapiGetFieldValue('custitem_syokuseki');
			nlapiSetFieldValue('subsidiary', roleSubsidiary, false, true);		
		}
	}
	if (name == 'subsidiary') {

		// ロール職責会社の取得
		var roleSubsidiary = nlapiGetFieldValue('custitem_syokuseki');
		var subsidiaryArray = nlapiGetFieldValues('subsidiary');
		if (!isEmpty(roleSubsidiary)) {
			if (subsidiaryArray.indexOf(roleSubsidiary) < 0) {
				alert('少なくとも、'+nlapiGetFieldText('custitem_syokuseki')+'の会社を設定する必要があります。');
				var newSubsidiaryArray = new Array();
				for (var sl = 0; sl < subsidiaryArray.length; sl++) {
					newSubsidiaryArray.push(subsidiaryArray[sl]);
				}
				newSubsidiaryArray.push(roleSubsidiary);
				nlapiSetFieldValues('subsidiary', newSubsidiaryArray, false,true);
			}
		}
	}
		}
}
	// add end
	
	// By LIU 2022/01/17
	// DJ_出荷可能期間（MONTHS）　to DJ_出荷可能期間（DAYS） 
	if(name == 'custitem_djkk_warranty'){
		var date = nlapiGetFieldValue('custitem_djkk_warranty');
		if(!isEmpty(date)){
			nlapiSetFieldValue('custitem_djkk_warranty_month', date * DAYS_FROM_MONTH_TO_DAY, false);
		}
	}
	
	// DJ_SHELF LIFE（MONTHS）　to DJ_SHELF LIFE（DAYS）
	if(name == 'custitem_djkk_shelf_life_months'){
		var date = nlapiGetFieldValue('custitem_djkk_shelf_life_months');
		if(!isEmpty(date)){
			nlapiSetFieldValue('custitem_djkk_shelf_life', date * DAYS_FROM_MONTH_TO_DAY, false);
		}
	}
	
	// DJ_賞味期限月　to DJ_賞味期限日数
	if(name == 'custitem_djkk_expdate_month'){
		var date = nlapiGetFieldValue('custitem_djkk_expdate_month');
		if(!isEmpty(date)){
			nlapiSetFieldValue('custitem_djkk_expdatedays', date * DAYS_FROM_MONTH_TO_DAY, false);
		}
	}
	

	
	if(name == 'custitem_djkk_no_bbd'){
		
		if(DJ_NO_BBD_RECORDTYPE_ARY.indexOf(nlapiGetRecordType()) != -1){
			var no_bbd = nlapiGetFieldValue('custitem_djkk_no_bbd');
			if(no_bbd == 'T'){
				setFieldDisableType('custitem_djkk_warranty_month', 'disabled');
				setFieldDisableType('custitem_djkk_shelf_life', 'disabled');
				
				setFieldDisableType('custitem_djkk_warranty', 'disabled');
				setFieldDisableType('custitem_djkk_shelf_life_months', 'disabled');
			}else{
				setFieldDisableType('custitem_djkk_warranty_month', 'normal');
				setFieldDisableType('custitem_djkk_shelf_life', 'normal');
				
				setFieldDisableType('custitem_djkk_warranty', 'normal');
				setFieldDisableType('custitem_djkk_shelf_life_months', 'normal');
			}
		}
	}
	//DENISJAPAN-567
	if(name == 'unitstype'){
	    debugger;
		var unitstype = nlapiGetFieldValue('unitstype');
		var unitstypeRecord = nlapiLoadRecord('unitstype', unitstype);
		var unValue = unitstypeRecord.getLineItemValue('uom','internalid', 1);
		nlapiSetFieldValue('custitem_djkk_min_inv_unit',unValue,false)
	}
	
	
	if(name == 'purchaseunit'){
		var purchaseunitValue = nlapiGetFieldValue('purchaseunit');
		nlapiSetFieldValue('custitem_djkk_min_inv_unit',purchaseunitValue,false)
	}
	
	
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord() {
    var returnType = true;
    var alertMsg = ''; 
    var sub = nlapiGetFieldValue('subsidiary');
    if(nlapiGetFieldValue('custitem_djkk_drug_medicine')=='T'&&isEmpty(nlapiGetFieldValue('custitem_djkk_qc_category'))){
//    	alert('「DJ_薬物医学」チェックオンの場合、「DJ_QCカテゴリー」を入力してください。');
    	alertMsg += '「DJ_薬物医学」チェックオンの場合、「DJ_QCカテゴリー」を入力してください。 \n';
		returnType = false;
    }
	// DJ_毒物||DJ_劇物
	if (nlapiGetFieldValue('custitem_djkk_poison')=='T'||nlapiGetFieldValue('custitem_djkk_deleterious_substance')=='T') {
		if (isEmpty(nlapiGetFieldValue('custitem_djkk_poison_ingredient1'))
				&& isEmpty(nlapiGetFieldValue('custitem_djkk_poison_ingredient2'))
				&& isEmpty(nlapiGetFieldValue('custitem_djkk_poison_ingredient3'))
				&& isEmpty(nlapiGetFieldValue('custitem_djkk_poison_ingredient4'))
				&& isEmpty(nlapiGetFieldValue('custitem_djkk_poison_ingredient5'))) {
//			alert('「毒劇物成分名1-5」は少なくとも一つを入力する必要があります。');
			alertMsg += '「毒劇物成分名1-5」は少なくとも一つを入力する必要があります。\n';
			returnType = false;
		}
	}

	// DJ_労安法
	if (nlapiGetFieldValue('custitem_djkk_industrial_safety_act')=='T') {
		if (isEmpty(nlapiGetFieldValue('custitem_djkk_is_act_ingredient1'))
				&& isEmpty(nlapiGetFieldValue('custitem_djkk_is_act_ingredient2'))
				&& isEmpty(nlapiGetFieldValue('custitem_djkk_is_act_ingredient3'))
				&& isEmpty(nlapiGetFieldValue('custitem_djkk_is_act_ingredient4'))
				&& isEmpty(nlapiGetFieldValue('custitem_djkk_is_act_ingredient5'))) {
//			alert('「労働安全衛生法成分名1-5」は少なくとも一つを入力する必要があります。');
			alertMsg += '「労働安全衛生法成分名1-5」は少なくとも一つを入力する必要があります。\n';
			returnType = false;
		}
	}
	
	var baserecordtype = nlapiGetFieldValue("baserecordtype");
	if((baserecordtype == "lotnumberedinventoryitem" || type == "serializedinventoryitem" || type=="lotnumberedassemblyitem" || type=="serializedassemblyitem"||type=="serviceitem"||type=="noninventoryitem"||type=="InvtPart"||type=="Assembly")&&(sub == SUB_SCETI || sub == SUB_DPKK)){
		var price1 = nlapiGetLineItemValue("price1","price_1_",1);
		var price2 = nlapiGetLineItemValue("price2","price_1_",1);
		var price3 = nlapiGetLineItemValue("price3","price_1_",1);
		var price4 = nlapiGetLineItemValue("price4","price_1_",1);
		var price5 = nlapiGetLineItemValue("price5","price_1_",1);
		var price6 = nlapiGetLineItemValue("price6","price_1_",1);
		var price7 = nlapiGetLineItemValue("price7","price_1_",1);
		var price8 = nlapiGetLineItemValue("price8","price_1_",1);
		var price9 = nlapiGetLineItemValue("price9","price_1_",1);
		var price10 = nlapiGetLineItemValue("price10","price_1_",1);
		var price11 = nlapiGetLineItemValue("price11","price_1_",1);
		var price12 = nlapiGetLineItemValue("price12","price_1_",1);
		if((!isEmpty(price1))||(!isEmpty(price2))||(!isEmpty(price3))||(!isEmpty(price4))||(!isEmpty(price5))||(!isEmpty(price6))||(!isEmpty(price7))||(!isEmpty(price8))||(!isEmpty(price9))||(!isEmpty(price10))||(!isEmpty(price11))||(!isEmpty(price12))){
			var intercompanyTransac = nlapiGetFieldValue("custitem_djkk_intercompany_transac");
				if(intercompanyTransac == 'T'){
//					alert('会社間取引チェックボックスをチェックオンする場合、販売価格を入力できません。');
					alertMsg += '会社間取引チェックボックスをチェックオンする場合、販売価格を入力できません。\n';
					returnType = false;
					
				}
			}				
	}
	
    var dj_np_bbd = nlapiGetFieldValue('custitem_djkk_no_bbd');
    if(dj_np_bbd == 'F'){
    	if(DJ_NO_BBD_RECORDTYPE_ARY.indexOf(nlapiGetRecordType()) != -1){
    		var warranty_month = nlapiGetFieldValue('custitem_djkk_warranty_month')
        	var shelf_life = nlapiGetFieldValue('custitem_djkk_shelf_life')
        	
        	if(isEmpty(warranty_month) && isEmpty(shelf_life)){
//        		alert('「DJ_NO_BBD」チェックオフなので、「DJ_出荷可能期間（DAYS）」と「DJ_SHELF LIFE（DAYS）」は必須項目になります。');
        		alertMsg += '「DJ_NO_BBD」チェックオフなので、「DJ_出荷可能期間（DAYS）」と「DJ_SHELF LIFE（DAYS）」は必須項目になります。\n';
        		returnType = false;
        	}
        	if(isEmpty(shelf_life)){
//        		alert('「DJ_NO_BBD」チェックオフなので、「DJ_SHELF LIFE（DAYS）」は必ず入力の項目である。');
        		alertMsg += '「DJ_NO_BBD」チェックオフなので、「DJ_SHELF LIFE（DAYS）」は必ず入力の項目である。\n';
        		returnType = false;
        	}
        	if(isEmpty(warranty_month)){
//        		alert('「DJ_NO_BBD」チェックオフなので、「DJ_出荷可能期間（DAYS）」は必ず入力の項目である。');
        		alertMsg += '「DJ_NO_BBD」チェックオフなので、「DJ_出荷可能期間（DAYS）」は必ず入力の項目である。\n';
        		returnType = false;
        	}
    	}
    }
    
    // add by ycx 2022/12/07 CH097 コードの長さの制御（国内：13桁、海外：11桁）
    if(sub==SUB_SCETI||sub==SUB_DPKK){
    	var upccode=nlapiGetFieldValue('upccode');
    	var country=nlapiGetFieldValue('countryofmanufacture');
    	  if(!isEmpty(upccode)){
    	    if(!isEmpty(country)){
    	       if(country=='JP'){
    	       	 if(upccode.length>13){
//    			    alert('「EANコード（JAN）」が長さを超えている（国内：13桁）');
    			    alertMsg += '「EANコード（JAN）」が長さを超えている（国内：13桁）\n';
    			    returnType = false;
    		      }
    	         }else {
    		     if(upccode.length>11){
//    			    alert('「EANコード（JAN）」が長さを超えている（海外：11桁）');
    			    alertMsg += '「EANコード（JAN）」が長さを超えている（海外：11桁）\n';
    			    returnType = false;
    		       }
    	         }
    	     }else{
//    	    	 alert('「EANコード（JAN）」長確認のために「積載地」フィールドを入力してください');
    	    	 alertMsg += '「EANコード（JAN）」長確認のために「積載地」フィールドを入力してください。\n';
 			    returnType = false;
    	     }
          }
    }
    // add end 
    
    // add codes before here
    var itemType = nlapiGetFieldValue('baserecordtype');
    if (returnType&&(formType == 'create'||formType == 'copy')) {
        var automatic = nlapiGetFieldValue('custitem_djkk_automatic');
        //20221212 changed by zhou start
        /*********old********/
		//var itemType = nlapiGetFieldValue('itemtype');
		//if(automatic == 'T'){
		//if (itemType != 'Assembly') {
        /*********old********/
        /*********new********/
        if(automatic == 'T'){
        if (itemType!='noninventoryitem'&& itemType!='otherchargeitem'&&itemType!='lotnumberedassemblyitem'&& itemType!='serializedassemblyitem'&&itemType!='serviceitem') {
    	/*********new********/
        //end
            var vendorname = '';//nlapiGetFieldValue('vendorname');
            var vcount=nlapiGetLineItemCount('itemvendor');//subsidiary
           for(var vi=1;vi<vcount+1;vi++){
        	   if(nlapiGetLineItemValue('itemvendor', 'preferredvendor', vi)=='T'){
        		   vendorname=nlapiGetLineItemValue('itemvendor', 'vendorcode', vi);
        		   break ;
        	   }
            }
            if (!isEmpty(vendorname)) {
            	var itemid = getNumbering(vendorname);
//                nlapiSetFieldValue('itemid', itemid);
                nlapiSetFieldValue('itemid', itemid, false, true);
            }else{
//            	alert('自動採番の場合は商品の仕入先を入力してください、仕入先の１つに優先フラグを有効にしてください');
            	alertMsg += '自動採番の場合は商品の仕入先を入力してください、仕入先の１つに優先フラグを有効にしてください\n';
            	returnType = false;
            }
        }

//        else{
//        	var kitflg=nlapiGetFieldValue('custitem_djkk_kitflag');        	
//        	if(!isEmpty(kitflg)){
//        		// 生産品
//        	if(kitflg=='4'){
//        		var itemid = getNumbering('A');
//                nlapiSetFieldValue('itemid', itemid);
//        		
//        	}else{
//        		var itemid = getNumbering('K');
//                nlapiSetFieldValue('itemid', itemid);
//        	 }
//        	}
//        }
//        if (!isEmpty(ItemidNumber)) {     //change by song add 23030403 item自動採番補正
//            nlapiSubmitField('customrecord_djkk_itemmaster_numbering', NumberingID, 'custrecord_djkk_itemmaster_nb_number', ItemidNumber);
//        }
        }       
    }     
    	//end   
//    if (formType == 'create'&&(itemType=='lotnumberedassemblyitem'|| itemType=='serializedassemblyitem'||itemType=='serviceitem')) { 
//		   console.log('in')
//		   var preferredvendorFlag = false;//仕入先 
//		   var isfulfillableFlag = true;//仕入先 
//			var vcount=nlapiGetLineItemCount('itemvendor');//subsidiary
//			for(var vi=1;vi<vcount+1;vi++){
//			   if(nlapiGetLineItemValue('itemvendor', 'preferredvendor', vi)=='T'){
//				   preferredvendorFlag =true;
//				   break ;
//			   }
//			}
//			var bland = nlapiGetFieldValue('custitem_djkk_class')//bland
//			
//			var alretStr = '自動採番の場合は';
//			if(isEmpty(bland)){
//			   alretStr += '「DJ_ブランド」、';
//			}
//			if(preferredvendorFlag == false){
//			   alretStr += '商品の仕入先、仕入先の１つに優先フラグ';
//			}
//			if(itemType=='lotnumberedassemblyitem'|| itemType=='serializedassemblyitem'){
//			   var isfulfillable = nlapiGetFieldValue('custitem_djkk_isfulfillable')//DJ_受領・配送
//			   if(isfulfillable == 'F'){
//				   isfulfillableFlag = false; 
//				   alretStr += '、「DJ_受領・配送」';
//			   }
//			}
//			 console.log(preferredvendorFlag)
//			  console.log(isfulfillableFlag)
//			   console.log(bland)
//			alretStr += 'を入力してください';
//			if(preferredvendorFlag == false || isfulfillableFlag == false ||isEmpty(bland)){
//				alert(alretStr);
//				return false;
//			}	
//	   }
    
    
    //2022/03/31 geng U327 start

  //changed by geng add end U796
//    var location = nlapiGetFieldValue('custitem_djkk_item_location');
//    var type=nlapiGetRecordType();
//    if((sub == SUB_NBKK || sub == SUB_ULKK) && (type == 'otherchargeitem') && (isEmpty(location))){
//    	alert('DJ_場所を入力してください。');
//    	return false;
//    }
    //end
         
//	var recordType =  nlapiGetRecordType();
//	if(recordType == "lotnumberedinventoryitem"){
//		var itemvendorCount = nlapiGetLineItemCount("itemvendor");
//		var preferredIsEmptyFlag = false ;
//		for(var z = 1 ; z < itemvendorCount+1 ; z++){
//			var preferredvendor = nlapiGetLineItemValue("itemvendor","preferredvendor",z);
//			if(preferredvendor == 'T'){
//				preferredIsEmptyFlag = true;
//			}
//		}
//		if(preferredIsEmptyFlag == false){
//			alert("自動採番のため、仕入先の１つに優先フラグを有効にしてください。");
//			return false
//		}
//	}
    var perunitquantity = Number(nlapiGetFieldValue('custitem_djkk_perunitquantity'));
	if((perunitquantity < 0 ||isEmpty(perunitquantity))&&(sub== SUB_NBKK || sub== SUB_ULKK)){
//		alert('DJ_入り数（入り目）は空ではなく、0より大きくなければなりません')	;
		alertMsg += 'DJ_入り数（入り目）は空ではなく、0より大きくなければなりません\n';
		returnType = false;
	}
    
	//20230329 add by zhou start
	//CH304 start
	if((sub==SUB_SCETI||sub==SUB_DPKK) && nlapiGetFieldValue('custitem_djkk_forecast') == 'T' && isEmpty(nlapiGetFieldValue('custitem_djkk_business_judgmen_fc'))){
//		alert('「DJ_FORECASTの対象」にチェックを入れた場合、「DJ_営業FC週月判断」を空白にすることはできません。');
		alertMsg += '「DJ_FORECASTの対象」にチェックを入れた場合、「DJ_営業FC週月判断」を空白にすることはできません。\n';
		returnType = false;
	}
	//20230329 add by zhou end
	if(!isEmpty(alertMsg)){
		alert(alertMsg)
	}
	
//	var alertMsgtest = '';
//	alertMsgtest += '「DJ_薬物医学」チェックオンの場合、「DJ_QCカテゴリー」を入力してください。 \n';
//	alertMsgtest += '「毒劇物成分名1-5」は少なくとも一つを入力する必要があります。\n';
//	alertMsgtest += '「労働安全衛生法成分名1-5」は少なくとも一つを入力する必要があります。\n';
//	alertMsgtest += '会社間取引チェックボックスをチェックオンする場合、販売価格を入力できません。\n';
//	alertMsgtest += '「DJ_NO_BBD」チェックオフなので、「DJ_出荷可能期間（DAYS）」と「DJ_SHELF LIFE（DAYS）」は必須項目になります。\n';
//	alertMsgtest += '「DJ_NO_BBD」チェックオフなので、「DJ_SHELF LIFE（DAYS）」は必ず入力の項目である。\n';
//	alertMsgtest += '「DJ_NO_BBD」チェックオフなので、「DJ_出荷可能期間（DAYS）」は必ず入力の項目である。\n';
//	alertMsgtest += '「EANコード（JAN）」が長さを超えている（国内：13桁）\n';
//	alertMsgtest += '「EANコード（JAN）」が長さを超えている（海外：11桁）\n';
//	alertMsgtest += '「EANコード（JAN）」長確認のために「積載地」フィールドを入力してください。\n';
//	alertMsgtest += '自動採番の場合は商品の仕入先を入力してください、仕入先の１つに優先フラグを有効にしてください\n';
//	alertMsgtest += 'DJ_入り数（入り目）は空ではなく、0より大きくなければなりません\n';
//	alertMsgtest += '「DJ_FORECASTの対象」にチェックを入れた場合、「DJ_営業FC週月判断」を空白にすることはできません。\n';
//	alert(alertMsgtest)
    return returnType;
}

/**
 * アイテムマスタ採番表を取得
 * 
 * @param recordType
 * @returns itemid
 */
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
        var itemid = name +"-"+prefixInteger(parseInt(ItemidNumber), parseInt(TheMinimumdigits));
    }else{
    	
    var newtb=nlapiCreateRecord('customrecord_djkk_itemmaster_numbering');
    newtb.setFieldValue('custrecord_djkk_itemmaster_nb_name', vendorname);
    newtb.setFieldValue('custrecord_djkk_itemmaster_nb_number', '0');
    var upid=nlapiSubmitRecord(newtb, false, true);
    ItemidNumber = 1;
    NumberingID = upid;
    var itemid = name +"-"+prefixInteger(parseInt(ItemidNumber), parseInt(TheMinimumdigits));
    }
    return itemid;
}