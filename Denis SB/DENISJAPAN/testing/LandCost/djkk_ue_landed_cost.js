/**
 * DJ_輸入諸掛のUserEvent
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/05/17     CPC_苑
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm}
 *            form Current form
 * @param {nlobjRequest}
 *            request Request object
 * @returns {Void}
 */
function userEventBeforeLoad(type, form, request) {
    try{
	form.setScript('customscript_djkk_cs_landed_cost');
	
//	form.addFieldGroup('custpage_requestday_group', '請求日');
//	var orgType=form.addField('custpage_flag', 'radio','高','hi');
//	form.addField('custpage_flag', 'radio', '低', 'lo')
//
//	
//
//	var landedcost_hol=nlapiGetFieldValue('custrecord_djkk_landedcost_hol');
//	 if(landedcost_hol=='T'){
//    		orgType.setDefaultValue('hi');
//    	}else{
//    		orgType.setDefaultValue('lo');
//    	}	
	
	/********************************PO配賦********************************************/
	var mainSubList = form.addSubList('custpage_main_sublist', 'list', 'PO配賦');
	 var mainPoField= mainSubList.addField('custpage_main_po', 'select', '発注書','purchaseorder');
	 mainPoField.setDisplayType('inline');
	 
	 var mainHdType='inline';//hidden
	 var main_quantity= mainSubList.addField('custpage_djkk_main_quantity', 'text', '数量');
	 main_quantity.setDisplayType(mainHdType);
	 var main_weight= mainSubList.addField('custpage_djkk_main_weight', 'text', '重量');
	 main_weight.setDisplayType(mainHdType);
	 var main_acount= mainSubList.addField('custpage_djkk_main_acount', 'text', '金額');
	 main_acount.setDisplayType(mainHdType);
	 
	 var mld5_per= mainSubList.addField('custpage_djkk_main_landedcostamount5_per', 'percent','<font color="red">AIR/SEA運賃割引率</font>');
	 mld5_per.setDisplayType('entry');
	 mld5_per.setDisplaySize(30,10);
	 
	 var mld7_per= mainSubList.addField('custpage_djkk_main_landedcostamount7_per', 'percent', '<font color="red">通関手数料割合率</font>');
	 mld7_per.setDisplayType('entry');
	 mld7_per.setDisplaySize(30,10);
	 
	 var mld13_per= mainSubList.addField('custpage_djkk_main_landedcostamount13_per', 'percent', '<font color="red">その他経費割引率</font>');
	 mld13_per.setDisplayType('entry');
	 mld13_per.setDisplaySize(30,10); 
	 var mld14_per= mainSubList.addField('custpage_djkk_main_landedcostamount14_per', 'percent', '<font color="red">国内運賃手数料割引率</font>');
	 mld14_per.setDisplayType('entry');
	 mld14_per.setDisplaySize(30,10);
	 
	 var mld6_per= mainSubList.addField('custpage_djkk_main_landedcostamount6_per', 'percent', '<font color="red">保険料割合率</font>');
	 mld6_per.setDisplayType('hidden');
	 mld6_per.setDisplaySize(30,10); 
	 
	 var premium= mainSubList.addField('custpage_djkk_main_premium', 'text', '<font color="red">保険料</font>');
	 premium.setDisplayType('entry');
	 premium.setDisplaySize(30,10); 
	 
	 //changed by geng add start U583
	 var baling_generation= mainSubList.addField('custpage_djkk_main_baling_generation', 'percent', '<font color="red">梱包代割合率</font>');
	 baling_generation.setDisplayType('hidden');
	 baling_generation.setDisplaySize(30,10);
	//changed by geng add end U583
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 /********************************PO明細配賦********************************************/
	var subList = form.addSubList('custpage_sublist', 'list', 'PO明細配賦');
    var poField= subList.addField('custpage_po', 'select', '発注書','purchaseorder');
    poField.setDisplayType('inline');
    var linenum= subList.addField('custpage_djkk_linenum', 'text', 'LINE_No');
    linenum.setDisplayType('inline');
    var lc_item= subList.addField('custpage_djkk_lc_item', 'select', 'ITEM','item');
    lc_item.setDisplayType('inline');
    var quantity= subList.addField('custpage_djkk_quantity', 'text', '数量');
    quantity.setDisplayType('inline');
    var weight= subList.addField('custpage_djkk_weight', 'text', '重量');
    weight.setDisplayType('inline');
    var acount= subList.addField('custpage_djkk_acount', 'text', '金額');
    acount.setDisplayType('inline');
    var displayType='entry';//inline disabled readonly entry hidden
    if(type=='create'||type=='edit'){
    	displayType='hidden';
    	//hidden
    	
    }else if(type=='view'){
    	displayType='disabled';
    }
    //changed by geng add start U581
    var poRate = subList.addField('custpage_djkk_po_rate', 'text', '為替レート');
    poRate.setDisplayType('entry');
    poRate.setDisplaySize(13,10);
  //changed by geng add end U581
                     /***AIR/SEA運賃*****/
    var ld5_per= subList.addField('custpage_djkk_landedcostamount5_per', 'percent','<font color="red">AIR/SEA運賃割合率</font>');
    ld5_per.setDisplayType('entry');
    ld5_per.setDisplaySize(13,10);
    var ld5_m= subList.addField('custpage_djkk_landedcostamount5_m', 'text', '<font color="blue">AIR/SEA運賃割合金額</font>');
    ld5_m.setDisplayType(displayType);
    ld5_m.setDisplaySize(13,10);
    var ld5_cha_m = subList.addField('custpage_djkk_landedcostamount5_cha_m', 'text', 'AIR/SEA調整後金額');
    ld5_cha_m.setDisplayType('entry');
    ld5_cha_m.setDisplaySize(13,10);
    
                  /***通関手数料*****/
    var ld7_per= subList.addField('custpage_djkk_landedcostamount7_per', 'percent', '<font color="red">通関手数料割合率</font>');
    ld7_per.setDisplayType('entry');
    ld7_per.setDisplaySize(13,10);
    var ld7_m= subList.addField('custpage_djkk_landedcostamount7_m', 'text', '<font color="blue">通関手数料割合金額</font>');
    ld7_m.setDisplayType(displayType);
    ld7_m.setDisplaySize(13,10);
    var ld7_cha_m= subList.addField('custpage_djkk_landedcostamount7_cha_m', 'text', '通関手数料調整後金額');
    ld7_cha_m.setDisplayType('entry');
    ld7_cha_m.setDisplaySize(13,10);
    
    /***その他経費*****/
    var ld13_per= subList.addField('custpage_djkk_landedcostamount13_per', 'percent', '<font color="red">その他経費割合率</font>');
    ld13_per.setDisplayType('entry');
    ld13_per.setDisplaySize(13,10);
    var ld13_m= subList.addField('custpage_djkk_landedcostamount13_m', 'text', '<font color="blue">その他経費割合金額</font>');
    ld13_m.setDisplayType(displayType);
    ld13_m.setDisplaySize(13,10);
    var ld13_cha_m= subList.addField('custpage_djkk_landedcostamount13_cha_m', 'text', 'その他経費調整後金額');
    ld13_cha_m.setDisplayType('entry');
    ld13_cha_m.setDisplaySize(13,10);
    
    /***国内運賃*****/         
    var ld14_per= subList.addField('custpage_djkk_landedcostamount14_per', 'percent', '<font color="red">国内運賃割合率</font>');
    ld14_per.setDisplayType('entry');
    ld14_per.setDisplaySize(13,10);
    var ld14_m= subList.addField('custpage_djkk_landedcostamount14_m', 'text', '<font color="blue">国内運賃割合金額</font>');
    ld14_m.setDisplayType(displayType);
    ld14_m.setDisplaySize(13,10);
    var ld14_cha_m= subList.addField('custpage_djkk_landedcostamount14_cha_m', 'text', '国内運賃調整後金額');
    ld14_cha_m.setDisplayType('entry');
    ld14_cha_m.setDisplaySize(13,10);
    
    /***保険料*****/    
    var ld6_per= subList.addField('custpage_djkk_landedcostamount6_per', 'percent', '<font color="red">保険料割合率</font>');
    ld6_per.setDisplayType('hidden');
    ld6_per.setDisplaySize(13,10);
    var ld6_m= subList.addField('custpage_djkk_landedcostamount6_m', 'text', '<font color="blue">保険料割合金額</font>');
    ld6_m.setDisplayType(displayType);
    ld6_m.setDisplaySize(13,10);
    var ld6_cha_m= subList.addField('custpage_djkk_landedcostamount6_cha_m', 'text', '保険料調整後金額');
    ld6_cha_m.setDisplayType('entry');
    ld6_cha_m.setDisplaySize(13,10);
    //changed by geng add start U584
    /***梱包代*****/
    var packingTape_per= subList.addField('custpage_djkk_landedcostamountpack_per', 'percent', '<font color="red">梱包代割合率</font>');
    packingTape_per.setDisplayType('entry');
    packingTape_per.setDisplaySize(13,10);
    var packingTape_m= subList.addField('custpage_djkk_landedcostamountpack_m', 'text', '<font color="blue">梱包代割合金額</font>');
    packingTape_m.setDisplayType(displayType);
    packingTape_m.setDisplaySize(13,10);
    var packingTape_cha_m= subList.addField('custpage_djkk_landedcostamountpack_cha_m', 'text', '梱包代調整後金額');
    packingTape_cha_m.setDisplayType('entry');
    packingTape_cha_m.setDisplaySize(13,10);
    //changed by geng add end U584
    
    /***関税*****/
    var duty_rate= subList.addField('custpage_djkk_customs_duty_exp', 'percent', '<font color="red">関税率</font>');
    duty_rate.setDisplayType('disabled');
    duty_rate.setDisplaySize(13,10);
    
    var duty_min_invun= subList.addField('custpage_djkk_customs_duty_min_invun', 'text', '最小購買単位関税');
    duty_min_invun.setDisplayType('disabled');
    duty_min_invun.setDisplaySize(13,10);
    var min_invun= subList.addField('custpage_djkk_min_invun', 'text', '最小購買単位');
    min_invun.setDisplayType('disabled');
    var cost_weight= subList.addField('custpage_djkk_cost_weight', 'text', '諸掛配賦用重量');//0217王より追加計算式２の計算用
    min_invun.setDisplayType('disabled');
    
    /***総金額*****/
    var sumAmount1=subList.addField('custpage_djkk_landedcost_sun_amount_1', 'text', '総金額_関税率_％');
    sumAmount1.setDisplayType('entry');
    sumAmount1.setDisplaySize(13,10);
    
    var sumAmount2=subList.addField('custpage_djkk_landedcost_sun_amount_2', 'text', '総金額_関税率_UOM Factor');
    sumAmount2.setDisplayType('disabled');
    sumAmount2.setDisplaySize(13,10);
    
    /***U585*****/
    //changed by geng add start U585
    var expressField = subList.addField('custpage_express', 'select', '関税金額計算式',null);
     expressField.addSelectOption('', '');
     expressField.addSelectOption('one', '関税率_％');
	 expressField.addSelectOption('two', '関税率_UOM Factor');
	 expressField.addSelectOption('three', '計算式合計');
  //changed by geng add end U585
    
    var duty_exp= subList.addField('custpage_djkk_customs_duty_rate', 'text', '<font color="blue">予定関税金額</font>');
    duty_exp.setDisplayType('entry');
    duty_exp.setDisplaySize(13,10);
    var duty_act= subList.addField('custpage_djkk_customs_duty_act', 'text', '実際関税金額');
    duty_act.setDisplayType('entry');
    duty_act.setDisplaySize(13,10);
    var duty_dif= subList.addField('custpage_djkk_customs_duty_dif', 'text', '関税差異');
    duty_dif.setDisplayType(displayType);
    duty_dif.setDisplaySize(13,10);
    
    /***その他の税金*****/         
    var ld15_per= subList.addField('custpage_djkk_landedcostamount15_per', 'percent', '<font color="red">その他の税金割合率</font>');
    ld15_per.setDisplayType('entry');
    ld15_per.setDisplaySize(13,10);
	var otax_exp= subList.addField('custpage_djkk_other_taxes_rate', 'text', '<font color="blue">予定その他の税金</font>');
	otax_exp.setDisplayType('entry');
	otax_exp.setDisplaySize(13,10);
    var ld15_m= subList.addField('custpage_djkk_landedcostamount15_m', 'text', '<font color="blue">その他の税金割合金額</font>');
    ld15_m.setDisplayType('hidden');
    ld15_m.setDisplaySize(13,10);
    var ld15_cha_m= subList.addField('custpage_djkk_other_taxes_act', 'text', 'その他の税金調整後金額');
    ld15_cha_m.setDisplayType('entry');
    ld15_cha_m.setDisplaySize(13,10);
    
    /***その他の税金*****/
//    var otax_exp= subList.addField('custpage_djkk_other_taxes_rate', 'text', '<font color="blue">予定その他の税金</font>');
//    otax_exp.setDisplayType('disabled');
//    otax_exp.setDisplaySize(13,10);
//    var otax_act= subList.addField('custpage_djkk_other_taxes_act', 'text', '実際その他の税金');
//    otax_act.setDisplayType('entry');
//    otax_act.setDisplaySize(13,10);
    var otax_dif= subList.addField('custpage_djkk_other_taxes_dif', 'text', 'その他の税金差異');
    otax_dif.setDisplayType(displayType);
    otax_dif.setDisplaySize(13,10);
    
    /***作業費*****/
    var wcost_exp= subList.addField('custpage_djkk_work_cost_rate', 'text', '<font color="blue">予定作業費</font>');
    wcost_exp.setDisplayType('disabled');
    wcost_exp.setDisplaySize(13,10);
    var wcost_act= subList.addField('custpage_djkk_work_cost_act', 'text', '実際作業費');
    wcost_act.setDisplayType('entry');
    wcost_act.setDisplaySize(13,10);
    var wcost_dif= subList.addField('custpage_djkk_work_cost_dif', 'text', '作業費差異');
    wcost_dif.setDisplayType(displayType);
    wcost_dif.setDisplaySize(13,10);

    
    

    
		var inboundshipmentID = request.getParameter('inboundshipmentID');
		nlapiSetFieldValue('custrecord_djkk_arrival_luggage', inboundshipmentID);
		
		var alrecord=nlapiLoadRecord('inboundShipment', nlapiGetFieldValue('custrecord_djkk_arrival_luggage'));

		// DJ_実際関税合計
		var dutye_sum=alrecord.getFieldValue('custrecord_djkk_customs_duty_act_sum');
		nlapiSetFieldValue('custrecord_djkk_landedcostamount8', dutye_sum);
		
		// DJ_実際その他の税金合計
		var otax_sum=alrecord.getFieldValue('custrecord_djkk_other_taxes_sum_act');
		nlapiSetFieldValue('custrecord_djkk_landedcostamount15', otax_sum);
		
		// DJ_実際作業費合計
		var wcost_sum=alrecord.getFieldValue('custrecord_djkk_work_cost_sum_act');
		nlapiSetFieldValue('custrecord_djkk_landedcostamount16', wcost_sum);
		
		 //changed by song add start U378
		var subsidiary = alrecord.getFieldValue('custrecord_djkk_subsidiary_header'); //子会社
		nlapiSetFieldValue('custrecord_djkk_landedcost_subsidiary', subsidiary);
		var roleValue = nlapiGetRole();
		var userValue = nlapiGetUser();
		nlapiSetFieldValue('custrecord_djkk_landedcost_createuser', userValue);//DJ_作成者
		var approvalSearch = nlapiSearchRecord("customrecord_djkk_trans_approval_manage",null,//トランザクション承認管理表
				[
				   ["isinactive","is","F"], 
				   "AND", 
				   ["custrecord_djkk_trans_appr_obj","anyof",20],
				   "AND",
				   ["custrecord_djkk_trans_appr_subsidiary","anyof",subsidiary],
				], 
				[
				   new nlobjSearchColumn("custrecord_djkk_trans_appr_create_role"), //作成ロール
				   new nlobjSearchColumn("custrecord_djkk_trans_appr1_role"), //第一承認ロール
				   
				]
				);
		if(!isEmpty(approvalSearch)){
			for(var j = 0; j < approvalSearch.length; j++){
				var createRole = approvalSearch[j].getValue("custrecord_djkk_trans_appr_create_role");//作成ロール
				var appr1_role = approvalSearch[j].getValue("custrecord_djkk_trans_appr1_role");//第一承認ロール
				if(createRole == roleValue){
					nlapiSetFieldValue('custrecord_djkk_landedcost_createrole', createRole); //DJ_作成ロール
					nlapiSetFieldValue('custrecord_djkk_landedcost_next_role', appr1_role);//DJ_次の承認ロール
				}
			}
		}
		//changed by song add end U378

		var count=alrecord.getLineItemCount('items');
		var mainLineCode=1;
		var lineCode = 1;
		var itemAmount = 0;
		var poArray=new Array();
		var popArray=new Array();
		for(var m=1;m<count+1;m++){
			itemAmount +=  Number(alrecord.getLineItemValue('items','shipmentitemamount',m));
		}
		var tempamount6_per = 0;
		for(var i=1;i<count+1;i++){
		    var polId=alrecord.getLineItemValue('items','purchaseorder',i)
			subList.setLineItemValue('custpage_po', lineCode,polId);		
			poArray.push(polId);
			subList.setLineItemValue('custpage_djkk_linenum', lineCode,alrecord.getLineItemValue('items','custrecord_djkk_po_line_number',i));
			subList.setLineItemValue('custpage_djkk_lc_item', lineCode,alrecord.getLineItemValue('items','itemid',i));
			var itemId = alrecord.getLineItemValue('items','itemid',i);
//			nlapiLogExecution('DEBUG', 'itemId', itemId);
			var weightValue = nlapiLookupField('item', itemId, 'custitem_djkk_cost_weight');
//			nlapiLogExecution('DEBUG', 'weightValue', weightValue);
			if(isEmpty(weightValue)){//LSの場合に諸掛重量を入力しないとき、結果を表示ため1をセット
				weightValue = 1;
			}
			var lcQuantity=alrecord.getLineItemValue('items','quantityexpected',i);
			subList.setLineItemValue('custpage_djkk_quantity', lineCode,lcQuantity);
			var lcweight=Number(alrecord.getLineItemValue('items','quantityexpected',i))*
			Number(alrecord.getLineItemValue('items','custrecord_djkk_spend',i))*
			Number(weightValue);
			subList.setLineItemValue('custpage_djkk_weight', lineCode,lcweight);
			var lcAcount=alrecord.getLineItemValue('items','shipmentitemamount',i);
			subList.setLineItemValue('custpage_djkk_acount', lineCode,lcAcount);
//			nlapiLogExecution('DEBUG', 'Number1=', Number(alrecord.getLineItemValue('items','quantityexpected',i)));
//			nlapiLogExecution('DEBUG', 'Number2=', Number(alrecord.getLineItemValue('items','custrecord_djkk_spend',i)));
//			nlapiLogExecution('DEBUG', 'Number3=', Number(weightValue));
			var amount5_per=alrecord.getLineItemValue('items','custrecord_djkk_landedcostamount5_per',i);
			subList.setLineItemValue('custpage_djkk_landedcostamount5_per', lineCode,amount5_per);
			if(isEmpty(amount5_per)){
				amount5_per='0';
			}
			//start
			var poRateValue=alrecord.getLineItemValue('items','shipmentitemexchangerate',i);
//			nlapiLogExecution('DEBUG', 'poRateValue', poRateValue);
			subList.setLineItemValue('custpage_djkk_po_rate', lineCode,poRateValue);
			//end
			var amount5_m=Number(nlapiGetFieldValue('custrecord_djkk_landedcostamount5'))*(Number(amount5_per.split('%')[0])/100);
			amount5_m=(amount5_m.toString()== 'NaN') ? "" : amount5_m.toFixed(2);
//			amount5_m=(amount5_m.toString()== 'NaN') ? "" : amount5_m;
			subList.setLineItemValue('custpage_djkk_landedcostamount5_m', lineCode,amount5_m);			
			subList.setLineItemValue('custpage_djkk_landedcostamount5_cha_m', lineCode,alrecord.getLineItemValue('items','custrecord_djkk_landedcostamount5_cha_m',i));
			
			//20221202 changed by zhou start		
			if(i != count){
			var amount6_per = (Number(lcAcount) / itemAmount) * 100;
			tempamount6_per = parseFloatAdd(tempamount6_per,amount6_per)
			nlapiLogExecution('DEBUG', 'tempamount6_per', tempamount6_per);
			amount6_per = (amount6_per.toString() == 'NaN') ? "0" : Number(amount6_per.toFixed(2))+ '%';	
//			var amount6_per=alrecord.getLineItemValue('items','custrecord_djkk_landedcostamount6_per',i);
			}else{			
				amount6_per = Number(100-tempamount6_per)
				amount6_per = (amount6_per.toString() == 'NaN') ? "0" : Number(amount6_per.toFixed(2))+ '%';
			}
//			nlapiLogExecution('DEBUG', 'amount6_per='+amount6_per, 'count='+i);
			subList.setLineItemValue('custpage_djkk_landedcostamount6_per', lineCode,amount6_per );
			if(isEmpty(amount6_per)){	
				amount6_per='0';
			}
			//end
			var amount6_m=Number(nlapiGetFieldValue('custrecord_djkk_landedcostamount6'))*(Number(amount6_per.split('%')[0])/100);
			amount6_m=(amount6_m.toString() == 'NaN') ? "" : amount6_m.toFixed(2);
			subList.setLineItemValue('custpage_djkk_landedcostamount6_m', lineCode,amount6_m);
			subList.setLineItemValue('custpage_djkk_landedcostamount6_cha_m', lineCode,alrecord.getLineItemValue('items','custrecord_djkk_landedcostamount6_cha_m',i));
			
			//changed by geng add start U584
			var pack_per=alrecord.getLineItemValue('items','custrecord_djkk_baling_generation_per',i);
			subList.setLineItemValue('custpage_djkk_landedcostamountpack_per', lineCode,pack_per);
			if(isEmpty(pack_per)){
				pack_per='0';
			}
			var pack_m=Number(nlapiGetFieldValue('custrecord_djkk_baling_generation'))*(Number(pack_per.split('%')[0])/100);
			pack_m=(pack_m.toString() == 'NaN') ? "" : pack_m.toFixed(2);
			subList.setLineItemValue('custpage_djkk_landedcostamountpack_m', lineCode,pack_m);
			subList.setLineItemValue('custpage_djkk_landedcostamountpack_cha_m', lineCode,alrecord.getLineItemValue('items','custrecord_djkk_baling_generation_price',i));
			//changed by geng add end U584
			
			var amount7_per=alrecord.getLineItemValue('items','custrecord_djkk_landedcostamount7_per',i);
			subList.setLineItemValue('custpage_djkk_landedcostamount7_per', lineCode,amount7_per);
			if(isEmpty(amount7_per)){
				amount7_per='0';
			}
			var amount7_m=Number(nlapiGetFieldValue('custrecord_djkk_landedcostamount7'))*(Number(amount7_per.split('%')[0])/100);
			amount7_m=(amount7_m.toString() == 'NaN') ? "" : amount7_m.toFixed(2);
			subList.setLineItemValue('custpage_djkk_landedcostamount7_m', lineCode,amount7_m);
			subList.setLineItemValue('custpage_djkk_landedcostamount7_cha_m', lineCode,alrecord.getLineItemValue('items','custrecord_djkk_landedcostamount7_cha_m',i));
			
			var amount13_per=alrecord.getLineItemValue('items','custrecord_djkk_landedcostamount13_per',i);
			subList.setLineItemValue('custpage_djkk_landedcostamount13_per', lineCode,amount13_per);
			if(isEmpty(amount13_per)){
				amount13_per='0';
			}
			var amount13_m=Number(nlapiGetFieldValue('custrecord_djkk_landedcostamount13'))*(Number(amount13_per.split('%')[0])/100);
			amount13_m=(amount13_m.toString() == 'NaN') ? "" : amount13_m.toFixed(2);
			subList.setLineItemValue('custpage_djkk_landedcostamount13_m', lineCode,amount13_m);
			subList.setLineItemValue('custpage_djkk_landedcostamount13_cha_m', lineCode,alrecord.getLineItemValue('items','custrecord_djkk_landedcostamount13_cha_m',i));
			
			var amount14_per=alrecord.getLineItemValue('items','custrecord_djkk_landedcostamount14_per',i);
			subList.setLineItemValue('custpage_djkk_landedcostamount14_per', lineCode,amount14_per);
			if(isEmpty(amount14_per)){
				amount14_per='0';
			}
			var amount14_m=Number(nlapiGetFieldValue('custrecord_djkk_landedcostamount14'))*(Number(amount14_per.split('%')[0])/100);
			amount14_m=(amount14_m.toString() == 'NaN') ? "" : amount14_m.toFixed(2);
			subList.setLineItemValue('custpage_djkk_landedcostamount14_m', lineCode,amount14_m);
			subList.setLineItemValue('custpage_djkk_landedcostamount14_cha_m', lineCode,alrecord.getLineItemValue('items','custrecord_djkk_landedcostamount14_cha_m',i));

			//23/02/15その他の税金を追加
			var amount15_per=alrecord.getLineItemValue('items','custrecord_djkk_landedcostamount15_per',i);
			subList.setLineItemValue('custpage_djkk_landedcostamount15_per', lineCode,amount15_per);
			if(isEmpty(amount15_per)){
				amount15_per='0';
			}
			var amount15_m=Number(nlapiGetFieldValue('custrecord_djkk_landedcostamount15'))*(Number(amount15_per.split('%')[0])/100);
			amount15_m=(amount15_m.toString() == 'NaN') ? "" : amount15_m.toFixed(2);
//			subList.setLineItemValue('custpage_djkk_landedcostamount15_m', lineCode,amount15_m);
			subList.setLineItemValue('custpage_djkk_other_taxes_act', lineCode,alrecord.getLineItemValue('items','custrecord_djkk_landedcostamount15_cha_m',i));

			//DJ_関税金額計算式start
			subList.setLineItemValue('custpage_express', lineCode,alrecord.getLineItemValue('items','custrecord_djkk_calculating_tariff',i));
			//end
//			subList.setLineItemValue('custpage_djkk_po_rate', lineCode,alrecord.getLineItemValue('items','custrecord_djkk_po_exchange_rate',i));
			// 関税
			subList.setLineItemValue('custpage_djkk_customs_duty_exp', lineCode,alrecord.getLineItemValue('items','custrecord_djkk_customs_duty_exp',i));
			var dutyRate=alrecord.getLineItemValue('items','custrecord_djkk_customs_duty_rate',i);
			if(!isEmpty(dutyRate)){
			subList.setLineItemValue('custpage_djkk_customs_duty_rate', lineCode,dutyRate);
			}
			subList.setLineItemValue('custpage_djkk_customs_duty_act', lineCode,alrecord.getLineItemValue('items','custrecord_djkk_customs_duty_act',i));
			
			// changed by song add CH603 start 
			var sunAmount1 = parseFloat(alrecord.getLineItemValue('items','custrecord_djkk_customs_duty_rate_1',i)).toFixed(3);
			if(!isEmpty(sunAmount1)&& sunAmount1!= 'NaN'){
				subList.setLineItemValue('custpage_djkk_landedcost_sun_amount_1', lineCode,sunAmount1);
			}
			// changed by song add CH603 end 			
//			subList.setLineItemValue('custpage_djkk_landedcost_sun_amount_1', lineCode,alrecord.getLineItemValue('items','custrecord_djkk_customs_duty_rate_1',i));
			subList.setLineItemValue('custpage_djkk_landedcost_sun_amount_2', lineCode,alrecord.getLineItemValue('items','custrecord_djkk_customs_duty_rate_2',i));
			subList.setLineItemValue('custpage_djkk_min_invun', lineCode,alrecord.getLineItemText('items','custrecord_djkk_min_inv_unit',i));
			subList.setLineItemValue('custpage_djkk_cost_weight', lineCode,alrecord.getLineItemValue('items','custrecord_djkk_cost_weight',i));
			subList.setLineItemValue('custpage_djkk_customs_duty_min_invun', lineCode,alrecord.getLineItemValue('items','custrecord_djkk_min_inv_unit_cus_duty',i));
			var lduty_dif=Number(alrecord.getLineItemValue('items','custrecord_djkk_customs_duty_act',i))-Number(alrecord.getLineItemValue('items','custrecord_djkk_customs_duty_rate',i));
			subList.setLineItemValue('custpage_djkk_customs_duty_dif', lineCode,lduty_dif);	
			
			// その他の税金
			//changed by geng add start U582
			var itemName = nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_lc_item', lineCode);
			var check = nlapiLookupField('item',itemName,'custitem_djkk_other_tax_targets');
//			nlapiLogExecution('debug','check',check);
//			nlapiLogExecution('debug','item',itemName);
			if(check=='F'){
				subList.setLineItemValue('custpage_djkk_other_taxes_rate', lineCode,'');
				subList.setLineItemValue('custpage_djkk_other_taxes_act', lineCode,'');
				subList.setLineItemValue('custpage_djkk_other_taxes_dif', lineCode,'');
			}else{
				
			
			//changed by geng add end U582
			subList.setLineItemValue('custpage_djkk_other_taxes_rate', lineCode,alrecord.getLineItemValue('items','custrecord_djkk_other_taxes_rate',i));
			var taxAct=alrecord.getLineItemValue('items','custrecord_djkk_landedcostamount15_cha_m',i);
			if(isEmpty(taxAct)){
//				subList.setLineItemValue('custpage_djkk_other_taxes_act', lineCode,alrecord.getLineItemValue('items','custrecord_djkk_other_taxes_rate',i));
				subList.setLineItemValue('custpage_djkk_other_taxes_dif', lineCode,'0');
			}else{
//				subList.setLineItemValue('custpage_djkk_other_taxes_act', lineCode,taxAct);
				var otax_dif=Number(alrecord.getLineItemValue('items','custrecord_djkk_landedcostamount15_cha_m',i))-Number(alrecord.getLineItemValue('items','custrecord_djkk_other_taxes_rate',i));
//				subList.setLineItemValue('custpage_djkk_other_taxes_dif', lineCode,otax_dif);
//				nlapiLogExecution('DEBUG', i+'Number1', Number(alrecord.getLineItemValue('items','custrecord_djkk_other_taxes_act',i)));
//				nlapiLogExecution('DEBUG', i+'Number2', Number(alrecord.getLineItemValue('items','custrecord_djkk_other_taxes_rate',i)));
				subList.setLineItemValue('custpage_djkk_other_taxes_dif', lineCode,otax_dif);
			}
			}
			// 作業費
			subList.setLineItemValue('custpage_djkk_work_cost_rate', lineCode,alrecord.getLineItemValue('items','custrecord_djkk_work_cost_rate',i));
			var wcrate=alrecord.getLineItemValue('items','custrecord_djkk_work_cost_act',i);
			if(isEmpty(taxAct)){
				subList.setLineItemValue('custpage_djkk_work_cost_act', lineCode,alrecord.getLineItemValue('items','custrecord_djkk_work_cost_rate',i));
				subList.setLineItemValue('custpage_djkk_work_cost_dif', lineCode,'0');
			}else{
			subList.setLineItemValue('custpage_djkk_work_cost_act', lineCode,wcrate);
			var wcost_dif=Number(alrecord.getLineItemValue('items','custrecord_djkk_work_cost_act',i))-Number(alrecord.getLineItemValue('items','custrecord_djkk_work_cost_rate',i));
			subList.setLineItemValue('custpage_djkk_work_cost_dif', lineCode,wcost_dif);	
			}
			//PO通関用為替レート
			
			//changed by geng add start U583
			var baling_generation_per=alrecord.getLineItemValue('items','custrecord_djkk_baling_generation_per',i);
	//		subList.setLineItemValue('custpage_djkk_landedcostamount14_per', lineCode,amount14_per);
			if(isEmpty(amount14_per)){
				baling_generation_per='0';
			}
			//changed by geng add end U583
			//20221201 add by zhou
			var poMainpremiumAmount = alrecord.getLineItemValue('items','custrecord_djkk_landedcostamount6_cha_m',i);//popo明細配賦保険料total
			//end
			popArray.push([polId,amount5_per,amount6_per,amount7_per,amount13_per,amount14_per,lcQuantity,lcweight,lcAcount,baling_generation_per,poMainpremiumAmount]);
	        lineCode++;
			}

		poArray=unique(poArray);
		for(var mp=0;mp<poArray.length;mp++){
			var mppoid=poArray[mp];
			mainSubList.setLineItemValue('custpage_main_po', mainLineCode,mppoid);
			var pop5=0;
			var pop6=0;
			var pop7=0;
			var pop13=0;
			var pop14=0;
			var popQ=0;
			var popW=0;
			var popA=0;
			var popPremium = 0;
			//changed by geng add start U583
			var baling_generation_value = 0;
			//changed by geng add end U583
			for(var ppc=0;ppc<popArray.length;ppc++){
				if(popArray[ppc][0]==mppoid){
					
					var p5='0';
					if(!isEmpty(popArray[ppc][1])){p5=popArray[ppc][1].split('%')[0];}
//					pop5+=Number(p5);
					pop5=parseFloatAdd(pop5,p5)
					var p6='0';
					if(!isEmpty(popArray[ppc][2])){p6=popArray[ppc][2].split('%')[0];}
//					pop6+=Number(p6);
					pop6=parseFloatAdd(pop6,p6)
					
					var p7='0';
					if(!isEmpty(popArray[ppc][3])){p7=popArray[ppc][3].split('%')[0];}
//					pop7+=Number(p7);
					pop7=parseFloatAdd(pop7,p7)
					
					var p13='0';
					if(!isEmpty(popArray[ppc][4])){p13=popArray[ppc][4].split('%')[0];}
//					pop13+=Number(p13);
					pop13=parseFloatAdd(pop13,p13)
					
					var p14='0';
					if(!isEmpty(popArray[ppc][5])){p14=popArray[ppc][5].split('%')[0];}
//					pop14+=Number(p14);
					pop14=parseFloatAdd(pop14,p14)
					
					var pQ='0';
					if(!isEmpty(popArray[ppc][6])){pQ=popArray[ppc][6]}
//					popQ+=Number(pQ);
					popQ=parseFloatAdd(popQ,pQ)
					
					var pW='0';
					if(!isEmpty(popArray[ppc][7])){pW=popArray[ppc][7]}
//					popW+=Number(pW);
					popW=parseFloatAdd(popW,pW)
					
					var pA='0';
					if(!isEmpty(popArray[ppc][8])){pA=popArray[ppc][8]}
//					popA+=Number(pA);
					popA=parseFloatAdd(popA,pA)

					//changed by geng add start U583
					var baling ='0';
					if(!isEmpty(popArray[ppc][9])){baling = popArray[ppc][9].split('%')[0];}
//					baling_generation_value+=Number(baling);
					baling_generation_value=parseFloatAdd(baling_generation_value,baling)
					//changed by geng add end U583
					
					var pP='0';
					if(!isEmpty(popArray[ppc][10])){pP=popArray[ppc][10]}
//					popPremium+=Number(pP);
					popPremium=parseFloatAdd(popPremium,pP)
					
//					pop5+=((Number(parseInt(popArray[ppc][1]))).toString() == 'NaN') ? 0 : Number(parseInt(popArray[ppc][1]));
//					pop6+=((Number(parseInt(popArray[ppc][2]))).toString() == 'NaN') ? 0 : Number(parseInt(popArray[ppc][2]));
//					pop7+=((Number(parseInt(popArray[ppc][3]))).toString() == 'NaN') ? 0 : Number(parseInt(popArray[ppc][3]));
//					pop13+=((Number(parseInt(popArray[ppc][4]))).toString() == 'NaN') ? 0 : Number(parseInt(popArray[ppc][4]));
//					pop14+=((Number(parseInt(popArray[ppc][5]))).toString() == 'NaN') ? 0 : Number(parseInt(popArray[ppc][5]));
//					popQ+=((Number(parseInt(popArray[ppc][6]))).toString() == 'NaN') ? 0 : Number(parseInt(popArray[ppc][6]));
//					popW+=((Number(parseInt(popArray[ppc][7]))).toString() == 'NaN') ? 0 : Number(parseInt(popArray[ppc][7]));
//					popA+=((Number(parseInt(popArray[ppc][8]))).toString() == 'NaN') ? 0 : Number(parseInt(popArray[ppc][8]));
					
				}				
			}
		      
			mainSubList.setLineItemValue('custpage_djkk_main_landedcostamount5_per', mainLineCode,pop5);
			mainSubList.setLineItemValue('custpage_djkk_main_landedcostamount6_per', mainLineCode,pop6);
			mainSubList.setLineItemValue('custpage_djkk_main_landedcostamount7_per', mainLineCode,pop7);
			mainSubList.setLineItemValue('custpage_djkk_main_landedcostamount13_per', mainLineCode,pop13);
			mainSubList.setLineItemValue('custpage_djkk_main_landedcostamount14_per', mainLineCode,pop14);
			mainSubList.setLineItemValue('custpage_djkk_main_premium', mainLineCode,rounding(popPremium));
			mainSubList.setLineItemValue('custpage_djkk_main_quantity', mainLineCode,popQ);
			mainSubList.setLineItemValue('custpage_djkk_main_weight', mainLineCode,popW);
			mainSubList.setLineItemValue('custpage_djkk_main_acount', mainLineCode,popA);
			//changed by geng add start U583
			mainSubList.setLineItemValue('custpage_djkk_main_baling_generation', mainLineCode,baling_generation_value);
			//changed by geng add end U583
			mainLineCode++;
		}
	if(type =='view'){
		form.addButton('custpage_landedcost','到着荷物更新', 'backTOlanedcost();');
		//changed by song add start U378
		var landStatus = nlapiGetFieldValue('custrecord_djkk_landedcost_status');
		if(landStatus != '2'){
			form.addButton('custpage_deletelanedcost','DJ_輸入諸掛削除', 'deletelanedcost();');		
		}
		//changed by song add end U378
	}
	else {
    form.addButton('custpage_cuscancle','キャンセル', 'backTOlanedcost();');
	subList.addButton('custpage_po_allocation', 'PO配賦', 'poAllocation();');
	mainSubList.addButton('custpage_po_line_allocation','PO明細配賦', 'poLineAllocation();');
	subList.addButton('custpage_po_line_amount_sum','総金額1再計算', 'getAmount1();');
	}
	// test
//	if(nlapiGetUser()==developers_employee_id){
//	form.addButton('custpage_refsh','更新BUTTON', 'window.ischanged = false;location=location;');
//	}
    }catch(e){}
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
	
	if(type=='create'||type=='edit'){
//		try{
//			
//			if(nlapiGetFieldValue('custpage_flag')=='hi'){
//			nlapiSetFieldValue('custrecord_djkk_landedcost_hol','T');
//			}else if(nlapiGetFieldValue('custpage_flag')=='lo'){
//			nlapiSetFieldValue('custrecord_djkk_landedcost_hol','F');
//			}
//		}catch(e){
//				
//			}
		
		var count=nlapiGetLineItemCount('custpage_sublist');
		var alrecord=nlapiLoadRecord('inboundShipment', nlapiGetFieldValue('custrecord_djkk_arrival_luggage'));
		var counts=alrecord.getLineItemCount('items');
		for(var i=1;i<counts+1;i++){
		var poId=alrecord.getLineItemValue('items','purchaseorder',i);
		var poLineId=alrecord.getLineItemValue('items','custrecord_djkk_po_line_number',i)
		
		var shipmentitemexchangerate=alrecord.getLineItemValue('items','shipmentitemexchangerate',i);//為替レート
		var poRate=alrecord.getLineItemValue('items','porate',i);//発注書価格
		var itemSpend=Number(alrecord.getLineItemValue('items','custrecord_djkk_spend',i))//基本単位数量
//		nlapiLogExecution('debug','shipmentitemexchangerate',shipmentitemexchangerate);
		
		 for(var j=1;j<count+1;j++){
			var lcPoId=nlapiGetLineItemValue('custpage_sublist', 'custpage_po', j);
			var lcPoLineId=nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_linenum', j);
			if(poId==lcPoId&&poLineId==lcPoLineId){
			alrecord.setLineItemValue('items','custrecord_djkk_landedcostamount5_per',i,nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount5_per', j));
			alrecord.setLineItemValue('items','custrecord_djkk_landedcostamount5_cha_m',i,nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount5_cha_m', j));
			alrecord.setLineItemValue('items','custrecord_djkk_landedcostamount6_per',i,nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount6_per', j));
			alrecord.setLineItemValue('items','custrecord_djkk_landedcostamount6_cha_m',i,nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount6_cha_m', j));
			alrecord.setLineItemValue('items','custrecord_djkk_landedcostamount7_per',i,nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount7_per', j));
			alrecord.setLineItemValue('items','custrecord_djkk_landedcostamount7_cha_m',i,nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount7_cha_m', j));
			alrecord.setLineItemValue('items','custrecord_djkk_landedcostamount13_per',i,nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount13_per', j));
			alrecord.setLineItemValue('items','custrecord_djkk_landedcostamount13_cha_m',i,nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount13_cha_m', j));
			alrecord.setLineItemValue('items','custrecord_djkk_landedcostamount14_per',i,nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount14_per', j));
			alrecord.setLineItemValue('items','custrecord_djkk_landedcostamount14_cha_m',i,nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount14_cha_m', j));

			//23/02/15その他の税金を追加
			alrecord.setLineItemValue('items','custrecord_djkk_landedcostamount15_per',i,nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount15_per', j));
			alrecord.setLineItemValue('items','custrecord_djkk_landedcostamount15_cha_m',i,nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_other_taxes_act', j));
//			alrecord.setLineItemValue('items','custrecord_djkk_landedcostamount15_cha_m',i,nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_other_taxes_rate', j));//20230707 changed by zhou
			alrecord.setLineItemValue('items','custrecord_djkk_other_taxes_rate',i,nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_other_taxes_rate', j));//20230707 add by zhou
			
			alrecord.setLineItemValue('items','custrecord_djkk_customs_duty_rate_1',i,nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcost_sun_amount_1', j));
			alrecord.setLineItemValue('items','custrecord_djkk_customs_duty_rate_2',i,nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcost_sun_amount_2', j));
			alrecord.setLineItemValue('items','custrecord_djkk_customs_duty_rate',i,nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_customs_duty_rate', j));
			alrecord.setLineItemValue('items','custrecord_djkk_customs_duty_act',i,nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_customs_duty_act', j));
//			alrecord.setLineItemValue('items','custrecord_djkk_other_taxes_act',i,nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_other_taxes_act', j));
			alrecord.setLineItemValue('items','custrecord_djkk_work_cost_act',i,nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_work_cost_act', j));
			//changed by geng add start U583
			alrecord.setLineItemValue('items','custrecord_djkk_baling_generation_per',i,nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamountpack_per', j));
			alrecord.setLineItemValue('items','custrecord_djkk_baling_generation_price',i,nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamountpack_cha_m', j));			
			alrecord.setLineItemValue('items','custrecord_djkk_calculating_tariff',i,nlapiGetLineItemValue('custpage_sublist', 'custpage_express', j));
			alrecord.setLineItemValue('items','custrecord_djkk_po_exchange_rate',i,nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_po_rate', j));
			//changed by geng add end U583
			
			//changed by song add start CH226
//			var adjustedAmount1 = Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount5_cha_m', j) * shipmentitemexchangerate);//DJ_国際運送料調整後金額
//			var adjustedAmount2 = Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount6_cha_m', j) * shipmentitemexchangerate);//DJ_保険料調整後金額
//			var adjustedAmount3 = Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamountpack_cha_m', j) * shipmentitemexchangerate);//DJ_梱包代調整後金額
//			var adjustedAmount4 = Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount7_cha_m', j) * shipmentitemexchangerate);//DJ_通関手数料調整後金額	
//			var adjustedAmount5 = Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount13_cha_m', j) * shipmentitemexchangerate);//DJ_その他経費調整後金額
			//為替レートの掛け算を外す
			var adjustedAmount1 = Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount5_cha_m', j));//DJ_国際運送料調整後金額
			var adjustedAmount2 = Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount6_cha_m', j));//DJ_保険料調整後金額
			var adjustedAmount3 = Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamountpack_cha_m', j));//DJ_梱包代調整後金額
			var adjustedAmount4 = Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount7_cha_m', j));//DJ_通関手数料調整後金額	
			var adjustedAmount5 = Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount13_cha_m', j));//DJ_その他経費調整
			alrecord.setLineItemValue('items','custrecord_djkk_landedcost_ctual_shoake1',i,adjustedAmount1);
			alrecord.setLineItemValue('items','custrecord_djkk_landedcost_ctual_shoake2',i,adjustedAmount2);
			alrecord.setLineItemValue('items','custrecord_djkk_landedcost_ctual_shoake3',i,adjustedAmount3);
			alrecord.setLineItemValue('items','custrecord_djkk_landedcost_ctual_shoake4',i,adjustedAmount4);
			alrecord.setLineItemValue('items','custrecord_djkk_landedcost_ctual_shoake5',i,adjustedAmount5);
			
			//changed by song add end CH226
			
			//add by zhou add start CH182
			var quantity = Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_quantity', j));
			var amount = Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_acount', j));
			var landedcostamount5_cha_m  = Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount5_cha_m', j))//AIR/SEA調整後金額
			var duty_min_invun = Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_customs_duty_min_invun', j))//最小在庫単位関税 
			var landedcostamount7_cha_m= Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount7_cha_m', j))//通関手数料調整後金額
			var landedcostamount13_cha_m  = Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount13_cha_m', j))//その他経費調整後金額
			var landedcostamount14_cha_m  = Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount14_cha_m', j))//国内運賃調整後金額
			var landedcostamount15_cha_m  = Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_other_taxes_act', j))//230215その他の税金を追加
			var landedcostamount6_cha_m = Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamount6_cha_m', j))//保険料調整後金額
			var landedcostamountpack_cha_m = Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_landedcostamountpack_cha_m', j))//梱包代調整後金額
			var customs_duty_act = Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_customs_duty_act', j))//実際関税金額
//			var other_taxes_act = Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_other_taxes_act', j))//実際その他の税金
			var work_cost_act = Number(nlapiGetLineItemValue('custpage_sublist', 'custpage_djkk_work_cost_act', j))//実際作業費
			var po_price_yen = Number(amount+landedcostamount5_cha_m+landedcostamount7_cha_m+landedcostamount13_cha_m+landedcostamount14_cha_m+landedcostamount15_cha_m+landedcostamount6_cha_m+landedcostamountpack_cha_m+customs_duty_act+work_cost_act);//other_taxes_actを外す、最小在庫単位を外す
//			 nlapiLogExecution('debug','po_price_yen',po_price_yen)/quantity;
			alrecord.setLineItemValue('items','custrecord_djkk_po_price_yen',i, po_price_yen/quantity);
			//changed by song add start CH226
//			var priceJpy = Number(poRate * shipmentitemexchangerate);
			var costValue = Math.round(landedcostamount5_cha_m+landedcostamount7_cha_m+landedcostamount13_cha_m+landedcostamount14_cha_m+landedcostamount15_cha_m+landedcostamount6_cha_m+landedcostamountpack_cha_m+customs_duty_act+work_cost_act)//諸掛金額合計(最小在庫単位を外す)
			if(isEmpty(itemSpend)||(itemSpend == 0)){
				itemSpend = 1;
			}
			var costValuePar = Math.round(costValue/quantity/itemSpend);
//			var priceJpy = Math.round(poRate/quantity* shipmentitemexchangerate);
			var priceJpy = Math.round(poRate* shipmentitemexchangerate/itemSpend);
//			nlapiLogExecution('debug','priceJpy',priceJpy);
//			var priceJpy2 = Number(poRate * shipmentitemexchangerate);
//			alrecord.setLineItemValue('items','custrecord_djkk_landedcost_ctual_price',i, priceJpy); // DJ_購入単価（円）20230704 changed by zhou
			alrecord.setLineItemValue('items','custrecord_djkk_landedcost_ctual_cost',i, costValuePar);// DJ_輸入諸掛（単価/円）
			alrecord.setLineItemValue('items','custrecord_djkk_landedcost_ctual_total',i, (priceJpy+costValuePar));// DJ_輸入諸掛（単価/円）
			//changed by song add end CH226
			//add by zhou add end CH182
			alrecord.commitLineItem('items');
			  }	
		    }	
	    }
		alrecord.setFieldValue('custrecord_djkk_customs_duty_act_sum', nlapiGetFieldValue('custrecord_djkk_landedcostamount8'));
		alrecord.setFieldValue('custrecord_djkk_other_taxes_sum_act', nlapiGetFieldValue('custrecord_djkk_landedcostamount15'));
		alrecord.setFieldValue('custrecord_djkk_work_cost_sum_act', nlapiGetFieldValue('custrecord_djkk_landedcostamount16'));
		var quantityexpected_sum=0;
		for(var s=1;s<counts+1;s++){
		 quantityexpected_sum+=Number(alrecord.getLineItemValue('items', 'quantityexpected',s));
		}
		if(!isEmpty(alrecord.getFieldValue('custrecord_djkk_landed_cost'))&&isEmpty(alrecord.getFieldValue('custrecord_djkk_quantityexpected_sum'))){
			alrecord.setFieldValue('custrecord_djkk_quantityexpected_sum', quantityexpected_sum);
		}
		nlapiSubmitRecord(alrecord, true, true);
	}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Operation types: create, edit, delete, xedit, approve,
 *            cancel, reject (SO, ER, Time Bill, PO & RMA only) pack, ship (IF
 *            only) dropship, specialorder, orderitems (PO only) paybills
 *            (vendor payments)
 * @returns {Void}
 */
function userEventAfterSubmit(type) {
	if (type == 'create') {
		var inboundshipmentID = nlapiGetFieldValue('custrecord_djkk_arrival_luggage');
		var inboundShipment=nlapiLoadRecord('inboundShipment',inboundshipmentID);
		inboundShipment.setFieldValue('custrecord_djkk_landed_cost',nlapiGetRecordId());
		nlapiSubmitRecord(inboundShipment,false,true);
	}
	
//	   if(type=='edit'){
			   var landedId=nlapiGetRecordId();
			   var inboundshipmentID = nlapiGetFieldValue('custrecord_djkk_arrival_luggage');
			   nlapiLogExecution('debug','inboundshipmentID',inboundshipmentID);
			   var itemreceiptSearch = getSearchResults("itemreceipt",null,
					   [
					      ["type","anyof","ItemRcpt"], 
					      "AND", 
//					      ["custbody_djkk_landed_cost","anyof",landedId]
					      ["custbody_djkk_inboundshipment_intid","anyof",inboundshipmentID] ////changed by song add end U378
					   ], 
					   [
					      new nlobjSearchColumn("internalid",null,"GROUP").setSort(false)
					   ]
					   );
			   nlapiLogExecution('debug','isEmpty(itemreceiptSearch)',isEmpty(itemreceiptSearch));
			   if(!isEmpty(itemreceiptSearch)){
				   for(var s=0;s<itemreceiptSearch.length;s++){
					var internalid= itemreceiptSearch[s].getValue("internalid",null,"GROUP");
					nlapiLogExecution('error','internalid',internalid);
					try{
					submitItemreceipt(internalid);
					}catch(e){
						nlapiLogExecution('debug','error',e);
					}
				   }
			   }
			   
}
/*
 * */
function submitItemreceipt(internalid){
	nlapiLogExecution('debug','accessBeforeInternaild',internalid);
	var notsingleflag=true;
	var itemreceiptRecord=nlapiLoadRecord('itemreceipt', internalid); //受領書
	var counts=itemreceiptRecord.getLineItemCount('item');
	var itArray=new Array();
	var itQuantity=0;
	var itAmount=0;
	var itWeight=0;
	var createdfrom=itemreceiptRecord.getFieldValue('createdfrom');	
	var inboundshipmentId=itemreceiptRecord.getFieldValue('inboundshipment');
	if(!isEmpty(inboundshipmentId)){
		var alrecord=nlapiLoadRecord('inboundShipment', inboundshipmentId); //到着荷物
		var inboundShipmentid=alrecord.getFieldValue('custrecord_djkk_landed_cost');//到着荷物-DJ_輸入諸掛
		nlapiLogExecution('debug','inboundShipmentid',inboundShipmentid);
		if(!isEmpty(inboundShipmentid)){
			//changed by song add start U378	
			var landedRecord=nlapiLoadRecord('customrecord_djkk_landed_cost', inboundShipmentid); //受領書
			var landedStatus = landedRecord.getFieldValue('custrecord_djkk_landedcost_status');
			nlapiLogExecution('debug','custrecord_djkk_landedcost_status',landedStatus);
			if(landedStatus == '2'){
			//changed by song add end U378
			itemreceiptRecord.setFieldValue('custbody_djkk_landed_cost',inboundShipmentid);
			var alrecordCount=alrecord.getLineItemCount('items');
			nlapiLogExecution('debug','alrecordCount',alrecordCount);
			//var landedCost=nlapiLoadRecord('customrecord_djkk_landed_cost',inboundShipmentid);
			for(var i=1;i<counts+1;i++){
				 itemreceiptRecord.selectLineItem('item', i);
				 var orderline=itemreceiptRecord.getLineItemValue('item', 'orderline', i);
				for(var j=1;j<alrecordCount+1;j++){
					var purchaseorder=alrecord.getLineItemValue('items','purchaseorder',j);
					var lineid=alrecord.getLineItemValue('items','custrecord_djkk_po_line_number',j);
					if(purchaseorder==createdfrom&&lineid==orderline){
						itemreceiptRecord.removeCurrentLineItemSubrecord('item', 'landedcost');
						var landedcost = itemreceiptRecord.createCurrentLineItemSubrecord('item', 'landedcost');
						var poRateValue=alrecord.getLineItemValue('items','shipmentitemexchangerate',j);
						var landedcostamount5=alrecord.getLineItemValue('items','custrecord_djkk_landedcostamount5_cha_m',j);
						landedcostamount5=(Number(landedcostamount5/poRateValue)).toFixed(2);
						if (!isEmpty(landedcostamount5)) {
						landedcost.selectNewLineItem('landedcostdata');
						landedcost.setCurrentLineItemValue('landedcostdata','costcategory', '5');
						landedcost.setCurrentLineItemValue('landedcostdata', 'amount',landedcostamount5);
						landedcost.commitLineItem('landedcostdata');
						}
						
						var landedcostamount7=alrecord.getLineItemValue('items','custrecord_djkk_landedcostamount7_cha_m',j);
						landedcostamount7=(Number(landedcostamount7/poRateValue)).toFixed(2);
						if (!isEmpty(landedcostamount7)) {
						landedcost.selectNewLineItem('landedcostdata');
						landedcost.setCurrentLineItemValue('landedcostdata','costcategory', '7');
						landedcost.setCurrentLineItemValue('landedcostdata', 'amount',landedcostamount7);
						landedcost.commitLineItem('landedcostdata');
					    }	
						
						var landedcostamount13=alrecord.getLineItemValue('items','custrecord_djkk_landedcostamount13_cha_m',j);
						landedcostamount13=(Number(landedcostamount13/poRateValue)).toFixed(2);
						if (!isEmpty(landedcostamount13)) {
						landedcost.selectNewLineItem('landedcostdata');
						landedcost.setCurrentLineItemValue('landedcostdata','costcategory', '13');
						landedcost.setCurrentLineItemValue('landedcostdata', 'amount',landedcostamount13);
						landedcost.commitLineItem('landedcostdata');
						}
						
						var landedcostamount14=alrecord.getLineItemValue('items','custrecord_djkk_landedcostamount14_cha_m',j);
						landedcostamount14=(Number(landedcostamount14/poRateValue)).toFixed(2);
						if (!isEmpty(landedcostamount14)) {
						landedcost.selectNewLineItem('landedcostdata');
						landedcost.setCurrentLineItemValue('landedcostdata','costcategory', '14');
						landedcost.setCurrentLineItemValue('landedcostdata', 'amount',landedcostamount14);
						landedcost.commitLineItem('landedcostdata');
					    }

//						var landedcostamount15=alrecord.getLineItemValue('items','custrecord_djkk_other_taxes_act',j);
//						if (!isEmpty(landedcostamount15)) {
//							landedcost.selectNewLineItem('landedcostdata');
//							landedcost.setCurrentLineItemValue('landedcostdata','costcategory', '15');
//							landedcost.setCurrentLineItemValue('landedcostdata', 'amount',landedcostamount15);
//							landedcost.commitLineItem('landedcostdata');
//						}
						
						
						
						var landedcostamount6=alrecord.getLineItemValue('items','custrecord_djkk_landedcostamount6_cha_m',j);
						landedcostamount6=(Number(landedcostamount6/poRateValue)).toFixed(2);
						if (!isEmpty(landedcostamount6)) {
						landedcost.selectNewLineItem('landedcostdata');
						landedcost.setCurrentLineItemValue('landedcostdata','costcategory', '6');
						landedcost.setCurrentLineItemValue('landedcostdata', 'amount',landedcostamount6);
						landedcost.commitLineItem('landedcostdata');
					    }
						
						var landedcostamount8=alrecord.getLineItemValue('items','custrecord_djkk_customs_duty_act',j);
						landedcostamount8=(Number(landedcostamount8/poRateValue)).toFixed(2);
						if (!isEmpty(landedcostamount8)) {
						landedcost.selectNewLineItem('landedcostdata');
						landedcost.setCurrentLineItemValue('landedcostdata','costcategory', '8');
						landedcost.setCurrentLineItemValue('landedcostdata', 'amount',landedcostamount8);
						landedcost.commitLineItem('landedcostdata');
					    }
						
						var landedcostamount15=alrecord.getLineItemValue('items','custrecord_djkk_other_taxes_act',j);
						landedcostamount15=(Number(landedcostamount15/poRateValue)).toFixed(2);
						if (!isEmpty(landedcostamount15)) {
						landedcost.selectNewLineItem('landedcostdata');
						landedcost.setCurrentLineItemValue('landedcostdata','costcategory', '15');
						landedcost.setCurrentLineItemValue('landedcostdata', 'amount',landedcostamount15);
						landedcost.commitLineItem('landedcostdata');
					    }
						
						var landedcostamount16=alrecord.getLineItemValue('items','custrecord_djkk_work_cost_act',j);
						landedcostamount16=(Number(landedcostamount16/poRateValue)).toFixed(2);
						if (!isEmpty(landedcostamount16)) {
						landedcost.selectNewLineItem('landedcostdata');
						landedcost.setCurrentLineItemValue('landedcostdata','costcategory', '16');
						landedcost.setCurrentLineItemValue('landedcostdata', 'amount',landedcostamount16);
						landedcost.commitLineItem('landedcostdata');
					    }
						nlapiLogExecution('debug','access1');
						landedcost.commit();				
						nlapiLogExecution('debug','access2');
					}
				}
				nlapiLogExecution('debug','access3');
				itemreceiptRecord.commitLineItem('item');
				nlapiLogExecution('debug','access4');
			}
			nlapiLogExecution('debug','access5');
			nlapiSubmitRecord(itemreceiptRecord, false, true);
			nlapiLogExecution('debug','access6');
			}
		}
	  }
   }
//test
function rounding(num){
  var result = parseFloat(num);
  result = Math.round(num * 100) / 100;
  var s_x = result.toString();
  var pos_decimal = s_x.indexOf('.');
  if (pos_decimal < 0) {
    pos_decimal = s_x.length;
    s_x += '.';
  }
  while (s_x.length <= pos_decimal + 2) {
    s_x += '0';
  }
  return s_x;
}

function parseFloatAdd(a, b) {
	return Number((parseFloat(a) + parseFloat(b)).toFixed(2));
	}