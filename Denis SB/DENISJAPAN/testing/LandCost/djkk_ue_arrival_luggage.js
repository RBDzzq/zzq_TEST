/**
 * 到着荷物のUserEvent
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/05/17     CPC_苑
 *
 */

// 関税借方勘定科目: 225 関税
var  TariffDebitAccount='657';

// 関税貸方勘定科目:1311	Goods in Stock
var TariffCreditAccount='456';

// 作業費借方勘定科目: 226 作業費
var workCostDebitAccount='658';

// 作業費貸方勘定科目:1311	Goods in Stock
var workCostCreditAccount='456';
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
	//setLineItemDisableType('items', 'purchaseorder','disabled');
	var roleSubsidiary=getRoleSubsidiary();
    nlapiSetFieldValue('custrecord_djkk_subsidiary_header', roleSubsidiary);
	form.setScript('customscript_djkk_cs_arrival_luggage');
	if (type == 'edit') {
		form.addButton('custpage_landedcost','DJ_輸入諸掛', 'djkklanedcost();');
		form.addButton('custpage_cost_sheet', 'コストシート', 'sheet();');
//		if(roleSubsidiary == SUB_NBKK || roleSubsidiary == SUB_ULKK){
			form.addButton('custpage_inc_retransmission', '入荷指示再送', 'incRetransmission();');	
//		}
	}
//20220804 ADD BY ZHOU U448
//	if(type == 'edit'){
//
//	}
//END
//changed by geng add start U826
//	if(type == 'edit'){
//	}
//end

	if(type == 'view'){
    var feieldNote = form.addField('custpage_newalert', 'inlinehtml');
	var messageColour = '<font color="red"> 輸送中をマークにすると倉庫に入荷予定が連携されます</font>';
	feieldNote.setLayoutType('outside', 'startrow')
    feieldNote.setDefaultValue(messageColour);
	}
	//var markedbuttom = form.addButton('custpage_text', '<font color="red">輸送中をマークにすると倉庫に入荷予定が連携されます</font>', null);
	//$('n-id-component-862').html("輸送中をマークにすると倉庫に入荷予定が連携されます");
	
//	markedbuttom.isDisabled = true;
//	var markMessage = form.addField('custpage_message_text', 'text','', null);
//	markMessage.setDisplayType('inline');
//	var messageColour = '<font color="red"> 輸送中をマークにすると倉庫に入荷予定が連携されます</font>';
//	markMessage.setDefaultValue(messageColour);
//	var messageColour = '<font color="red"> 輸送中をマークにすると倉庫に入荷予定が連携されます </font>';
//	else if (type == 'view') {
//		//if (nlapiGetFieldValue('status')=='toBeShipped') {
//		form.addButton('custpage_shipmark','輸送中のマークtest', "if(confirm('test123')){document.getElementById('n-id-component-846').onclick()}else{alert('NG')}");
//		//}
//	}
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
	nlapiLogExecution('debug', type);
	if(type=='create'||type=='edit'){
	var inboundshipmentID=nlapiGetRecordId();
	var inboundShipment=nlapiLoadRecord(nlapiGetRecordType(),inboundshipmentID);
	var expectedreceiptdate=inboundShipment.getFieldValue('custrecord_djkk_delivery_date');
	var subsidiaryHeader = inboundShipment.getFieldValue('custrecord_djkk_subsidiary_header');
	var inboundshipmentSearch = nlapiSearchRecord("inboundshipment",null,
			[
			   ["internalid","anyof",inboundshipmentID]
			], 
			[
			   new nlobjSearchColumn("inboundshipmentitemid",null,"GROUP"), 
			   new nlobjSearchColumn("line","purchaseOrder","GROUP"), 
			   new nlobjSearchColumn("internalid","purchaseOrder","GROUP"),
			   new nlobjSearchColumn("custcol_djkk_conversionrate","purchaseOrder","GROUP"), 
			   new nlobjSearchColumn("targetlocation","purchaseOrder","GROUP"),
			   new nlobjSearchColumn("custcol_djkk_customs_duty_rate","purchaseOrder","GROUP"), 
			   new nlobjSearchColumn("custcol_djkk_customs_duty_rate_exp","purchaseOrder","GROUP"),
			   new nlobjSearchColumn("custcol_djkk_work_cost_rate","purchaseOrder","GROUP"),
			   new nlobjSearchColumn("custcol_djkk_min_inv_unit_cus_duty","purchaseOrder","GROUP"),
			   new nlobjSearchColumn("custitem_djkk_min_inv_unit","item","GROUP"),
			   new nlobjSearchColumn("custitem_djkk_product_code","item","GROUP"),
			   new nlobjSearchColumn("custbody_djkk_ship_via","purchaseOrder","GROUP"),
			   new nlobjSearchColumn("location","purchaseOrder","GROUP"),
			   new nlobjSearchColumn("terms","purchaseOrder","GROUP"),
			   new nlobjSearchColumn("amount","purchaseOrder","SUM"),// amount
			   new nlobjSearchColumn("quantity","purchaseOrder","GROUP").setSort(false),//quantity
			   new nlobjSearchColumn("expectedreceiptdate","purchaseOrder","GROUP"),
			   new nlobjSearchColumn("custrecord_djkk_receipt_date","inboundShipmentItem",'GROUP'), 
			   new nlobjSearchColumn("item","purchaseOrder","GROUP"),
			   new nlobjSearchColumn("custitem_djkk_cost_weight","item","GROUP")//0217王追加配賦用重量
			]
			);
	var poIdList=new Array();
	var poconList=new Array();
	var rate=new Array();
	var rateExp=new Array();
	var workCost=new Array();
	var poLocationList=new Array();
	var poTargetlocationList=new Array();
	var poItem=new Array();
	var updatePoIdlist=new Array();
	var updatePolist=new Array();
	var cusDutyList=new Array();
	var invUnit=new Array();
	var catalogcodeList=new Array();
	var poShipVia=new Array();
	var termsArray=new Array();
	var poPriceYenArray=new Array();
	var podiliveryDate = new Array();
	var receiptDate = new Array();
	var costWeight = new Array();//0217王追加配賦用重量
	if(!isEmpty(inboundshipmentSearch)){
		for(var is=0;is<inboundshipmentSearch.length;is++){
			var columnID = inboundshipmentSearch[is].getAllColumns();
			poIdList[inboundshipmentSearch[is].getValue(columnID[0])]=inboundshipmentSearch[is].getValue(columnID[1]);
			poconList[inboundshipmentSearch[is].getValue(columnID[0])]=inboundshipmentSearch[is].getValue(columnID[3]);
			poTargetlocationList[inboundshipmentSearch[is].getValue(columnID[0])]=inboundshipmentSearch[is].getValue(columnID[4]);			
			
			//20221221 changed by zhou CH186 start
//			rate[inboundshipmentSearch[is].getValue(columnID[0])]=inboundshipmentSearch[is].getValue(columnID[5]);
			poItem[inboundshipmentSearch[is].getValue(columnID[0])] = inboundshipmentSearch[is].getValue(columnID[18]);		
			//end
			rateExp[inboundshipmentSearch[is].getValue(columnID[0])]=inboundshipmentSearch[is].getValue(columnID[6]);
			workCost[inboundshipmentSearch[is].getValue(columnID[0])]=inboundshipmentSearch[is].getValue(columnID[7]);
			cusDutyList[inboundshipmentSearch[is].getValue(columnID[0])]=inboundshipmentSearch[is].getValue(columnID[8]);//DJ_最小在庫単位関税
			invUnit[inboundshipmentSearch[is].getValue(columnID[0])]=inboundshipmentSearch[is].getValue(columnID[9]);
			catalogcodeList[inboundshipmentSearch[is].getValue(columnID[0])]=inboundshipmentSearch[is].getValue(columnID[10]);
			poShipVia[inboundshipmentSearch[is].getValue(columnID[0])]=inboundshipmentSearch[is].getValue(columnID[11]);
			poLocationList[inboundshipmentSearch[is].getValue(columnID[0])]=inboundshipmentSearch[is].getValue(columnID[12]);
			termsArray[inboundshipmentSearch[is].getValue(columnID[0])]=inboundshipmentSearch[is].getValue(columnID[13]);
			costWeight[inboundshipmentSearch[is].getValue(columnID[0])]=inboundshipmentSearch[is].getValue(columnID[19]);//0217王追加配賦用重量
			
//			nlapiLogExecution('debug','amount',Number(inboundshipmentSearch[is].getValue(columnID[14])))
//			nlapiLogExecution('debug','quantity',Number(inboundshipmentSearch[is].getValue(columnID[15])))
			poPriceYenArray[inboundshipmentSearch[is].getValue(columnID[0])]=Number(inboundshipmentSearch[is].getValue(columnID[14]))/Number(inboundshipmentSearch[is].getValue(columnID[15]));
//			nlapiLogExecution('debug','poPriceYenArray',poPriceYenArray[inboundshipmentSearch[is].getValue(columnID[0])])
			updatePoIdlist.push(inboundshipmentSearch[is].getValue(columnID[2]));
//			updatePolist.push([inboundshipmentSearch[is].getValue(columnID[2]),inboundshipmentSearch[is].getValue(columnID[1])]);
			podiliveryDate[inboundshipmentSearch[is].getValue(columnID[0])]=inboundshipmentSearch[is].getValue(columnID[16]);
			
			receiptDate[inboundshipmentSearch[is].getValue(columnID[2])]=inboundshipmentSearch[is].getValue(columnID[17]);
			updatePolist.push([inboundshipmentSearch[is].getValue(columnID[2]),inboundshipmentSearch[is].getValue(columnID[1]),inboundshipmentSearch[is].getValue(columnID[17])]);
		}
	}
//	if(type=='create'||type=='edit'){
	var count=inboundShipment.getLineItemCount('items');
	if(count<1){
		return ;
	}
	var rateSum=0;
	var workSum=0;
	var otherSum=0;
	for(var i=1;i<count+1;i++){
	var itemid=inboundShipment.getLineItemValue('items', 'id', i);//line id
//	20221221 change by zhou start CH186
	var shipmentitem =poItem[itemid];//line item id
	//アイテム-諸掛り配賦用（重量）
//	var itemLandCostWeight = nlapiLookupField('item', shipmentitem, 'weight')
	var itemLandCostWeight = nlapiLookupField('item', shipmentitem, 'custitem_djkk_cost_weight')
//	nlapiLogExecution('debug','itemLandCostWeight',Number(itemLandCostWeight))
	if(isEmpty(itemLandCostWeight)){//LSの場合に諸掛重量を入力しないとき、結果を表示ため1をセット
		itemLandCostWeight = 1;
	}
//	var itemSearch = nlapiSearchRecord("item",null,     //
//		[
//		   ["internalid","anyof", shipmentitem]
//		], 
//		[
//		   new nlobjSearchColumn("weight"),
//		]
//		);
//	if(!isEmpty(itemSearch)){
//		itemLandCostWeight = itemSearch[0].getText("weight")
//		nlapiLogExecution('debug','itemLandCostWeight2',Number(itemLandCostWeight))
//	}
//	end
	var lineUnit = inboundShipment.getLineItemValue('items', 'unit', i)//line 単位
//	nlapiLogExecution('debug','lineUnit',lineUnit)
	var itemPoUnit = nlapiLookupField('item', shipmentitem, 'purchaseunit')//主要購入単位
	var unitstype = nlapiLookupField('item', shipmentitem, 'unitstype')
//	nlapiLogExecution('debug','itemPoUnit',itemPoUnit)
//	nlapiLogExecution('error','inboundShipment',inboundShipment);
	var unitArr = [];
	var conversionrate = 1;
	unitArr.push(lineUnit);
	unitArr.push(itemPoUnit);
	if(lineUnit != itemPoUnit && !isEmpty(lineUnit) && !isEmpty(itemPoUnit)){
		var lineUnitConversionrate;
		var itemPoUnitConversionrate;
			var unitSheet = nlapiLoadRecord('unitstype', unitstype);
			var unitstypeCount = unitSheet.getLineItemCount('uom');
			for(var u = 0; u < unitArr.length; u++){
				for (var uni = 1; uni < unitstypeCount + 1; uni++) {
					var unValue = unitSheet.getLineItemValue('uom','internalid', uni);
					if(unValue == unitArr[u] && u == 0 ){
						lineUnitConversionrate=unitSheet.getLineItemValue('uom','conversionrate', uni);
						break;
					}else if(unValue == unitArr[u] && u == 1 ){
						itemPoUnitConversionrate=unitSheet.getLineItemValue('uom','conversionrate', uni);
						break;
					}
				}
			}
//			nlapiLogExecution('debug','lineUnitConversionrate',lineUnitConversionrate)
//			nlapiLogExecution('debug','itemPoUnitConversionrate',itemPoUnitConversionrate)
		conversionrate = lineUnitConversionrate/itemPoUnitConversionrate;//換算率 
//		nlapiLogExecution('debug','conversionrate',conversionrate)
	}
	nlapiLogExecution('error','inboundShipment1',inboundShipment);
    try{
    	//DJ_予定関税2 = DJ_最小在庫単位関税 * 主要購入単位 数量 * 諸掛り配賦用（重量）
    	if(subsidiaryHeader == SUB_SCETI || subsidiaryHeader == SUB_DPKK){
    		var dutyRate2 = inboundShipment.getLineItemValue('items', 'quantityexpected', i)*cusDutyList[itemid];
    	}else{
    		var dutyRate2 = inboundShipment.getLineItemValue('items', 'quantityexpected', i)*cusDutyList[itemid]*Number(itemLandCostWeight);
    	}
    	//20230704 add by zhou start 
    	if(subsidiaryHeader == SUB_NBKK || subsidiaryHeader == SUB_ULKK){
    		var poRate=inboundShipment.getLineItemValue('items','porate',i);//発注書価格
    		var shipmentitemexchangerate=inboundShipment.getLineItemValue('items','shipmentitemexchangerate',i);//為替レート
    		var itemSpend=Number(inboundShipment.getLineItemValue('items','custrecord_djkk_spend',i))//基本単位数量
    		var priceJpy = Math.round(poRate* shipmentitemexchangerate/itemSpend);
    		inboundShipment.setLineItemValue('items','custrecord_djkk_landedcost_ctual_price',i, priceJpy); // DJ_購入単価（円）
    	}
    	//20230704 add by zhou end
    	inboundShipment.setLineItemValue('items', 'custrecord_djkk_po_line_number', i, poIdList[itemid]);
    	inboundShipment.setLineItemValue('items', 'custrecord_djkk_customs_duty_rate_2', i, dutyRate2);   //DJ_予定関税(総金額2)
//    	inboundShipment.setLineItemValue('items', 'custrecord_djkk_customs_duty_rate_2', i, rate[itemid]);   	    	
    	rateSum+=Number(inboundShipment.getLineItemValue('items', 'custrecord_djkk_customs_duty_rate', i));
    	workSum+=Number(inboundShipment.getLineItemValue('items', 'custrecord_djkk_work_cost_rate', i));
    	otherSum+=Number(inboundShipment.getLineItemValue('items', 'custrecord_djkk_other_taxes_rate', i));
//        inboundShipment.setLineItemValue('items', 'custrecord_djkk_customs_duty_exp', i, rateExp[itemid]);
    	inboundShipment.setLineItemValue('items', 'custrecord_djkk_customs_duty_exp', i, Number((rateExp[itemid]).slice(0,-1)));//%を外す
        inboundShipment.setLineItemValue('items', 'custrecord_djkk_work_cost_rate', i, workCost[itemid]);
        inboundShipment.setLineItemValue('items', 'custrecord_djkk_min_inv_unit_cus_duty', i, cusDutyList[itemid]);    
        inboundShipment.setLineItemValue('items', 'custrecord_djkk_ship_via', i, poShipVia[itemid]);
        inboundShipment.setLineItemValue('items', 'custrecord_djkk_min_inv_unit', i, invUnit[itemid]); 
        inboundShipment.setLineItemValue('items', 'custrecord_djkk_cost_weight', i, costWeight[itemid]); //0217王追加配賦用重量
//        inboundShipment.setLineItemValue('items', 'custrecord_djkk_item_payment_term', i, termsArray[itemid]);//todo支払い条件は画面上に外しました
        
        //20230706 changed by zhou start
        //zhou memo :CH603 その他の税金調整後金額は削除
        if(subsidiaryHeader != SUB_SCETI && subsidiaryHeader != SUB_DPKK){
//          inboundShipment.setLineItemValue('items', 'custrecord_djkk_other_taxes_rate', i, cusDutyList[itemid]*inboundShipment.getLineItemValue('items', 'quantityexpected', i));
        }else{
            inboundShipment.setLineItemValue('items', 'custrecord_djkk_other_taxes_rate', i, cusDutyList[itemid]*inboundShipment.getLineItemValue('items', 'quantityexpected', i));
        }
        //20230706 changed by zhou end
        if(!isEmpty(receiptDate[itemid])&&receiptDate[itemid]!='- None -'&&isEmpty(inboundShipment.getLineItemValue('items', 'custrecord_djkk_receipt_date', i))){
         inboundShipment.setLineItemValue('items', 'custrecord_djkk_receipt_date', i, receiptDate[itemid]);
        }
//        inboundShipment.setLineItemValue('items', 'custrecord_djkk_receipt_date', i, podiliveryDate[itemid]);
        if(!isEmpty(catalogcodeList[itemid])&&catalogcodeList[itemid]!='- None -'&&isEmpty(inboundShipment.getLineItemValue('items', 'custrecord_djkk_catalog_code', i))){
        inboundShipment.setLineItemValue('items', 'custrecord_djkk_catalog_code', i, catalogcodeList[itemid]);
         }
//        if(!isEmpty(poPriceYenArray[itemid])&&poPriceYenArray[itemid]!='- None -'){
//            inboundShipment.setLineItemValue('items', 'custrecord_djkk_po_price_yen', i, poPriceYenArray[itemid]);
//             }
    	if(!isEmpty(poconList[itemid])&&poconList[itemid]!='- None -'&&isEmpty(inboundShipment.getLineItemValue('items', 'custrecord_djkk_spend', i))){
    		inboundShipment.setLineItemValue('items', 'custrecord_djkk_spend', i, poconList[itemid]);
    	}
    	if(!isEmpty(poLocationList[itemid])&&poLocationList[itemid]!='- None -'&&isEmpty(inboundShipment.getLineItemValue('items', 'custrecord_djkk_inventory_storage', i))){
    		inboundShipment.setLineItemValue('items', 'custrecord_djkk_inventory_storage', i, poLocationList[itemid]);
    	}
    	if(!isEmpty(poTargetlocationList[itemid])&&poTargetlocationList[itemid]!='- None -'&&isEmpty(inboundShipment.getLineItemValue('items', 'receivinglocation', i))){
    		inboundShipment.setLineItemValue('items', 'receivinglocation', i, poTargetlocationList[itemid]);
    	}
    	inboundShipment.commitLineItem('items');
    }
    catch(e){
    	nlapiLogExecution('error','error',e);
    }
	}

	if(!isEmpty(rateSum)&&rateSum!=0){
	inboundShipment.setFieldValue('custrecord_djkk_customs_duty_exp_sum', rateSum);
	}	
	
	if(!isEmpty(workSum)&&workSum!=0){
		inboundShipment.setFieldValue('custrecord_djkk_work_cost_sum', workSum);
		}
	
	if(!isEmpty(otherSum)&&otherSum!=0){
		inboundShipment.setFieldValue('custrecord_djkk_other_taxes_sum', otherSum);
		}
	nlapiSubmitRecord(inboundShipment, false, true);
//    }
	updatePoIdlist=unique(updatePoIdlist);
	for(var udpi=0;udpi<updatePoIdlist.length;udpi++){
		var updatePoId=updatePoIdlist[udpi];
		var poRecord=nlapiLoadRecord('purchaseorder', updatePoId);
		var poCount=poRecord.getLineItemCount('item');
		var inboundshipment_created_Flag=true;
		for(var udp=0;udp<updatePolist.length;udp++){
			if(updatePoId==updatePolist[udp][0]){
				for(var ip=1;ip<poCount+1;ip++){
//					if(poRecord.getLineItemValue('item', 'custcol_djkk_inboundshipment_created',ip)!='T'){
//						inboundshipment_created_Flag=false;
//					  }										
				if(poRecord.getLineItemValue('item', 'line', ip)==updatePolist[udp][1]){
					poRecord.setLineItemValue('item', 'expectedreceiptdate', ip, updatePolist[udp][2]);
//					poRecord.setLineItemValue('item', 'expectedreceiptdate', ip, expectedreceiptdate);
					//poRecord.setLineItemValue('item', 'custcol_djkk_inboundshipment_created', ip, 'T');
					poRecord.commitLineItem('item');
				}
			   }
			}
		}
//		if(inboundshipment_created_Flag&&poRecord.getFieldValue('custbody_djkk_inboundshipment_created')!='T'){
//			poRecord.setFieldValue('custbody_djkk_inboundshipment_created', 'T');
//		}
		nlapiSubmitRecord(poRecord, false, true);
	}
	
	// DJ_関税差額仕訳
	creatTariffDifference(inboundshipmentID);
	
	// DJ_作業費差額仕訳
	creatWorkCostDifference(inboundshipmentID)
   }
}

/*
 * DJ_関税差額仕訳
 * */
function creatTariffDifference(id) {
	var newInboundShipment=nlapiLoadRecord('inboundShipment',id);
	
	// DJ_関税差額仕訳
	var tariffDifference=newInboundShipment.getFieldValue('custrecord_djkk_tariff_difference');
	// DJ_予定関税合計
	var expSum=newInboundShipment.getFieldValue('custrecord_djkk_customs_duty_exp_sum');
	
	// DJ_実際関税合計
	var actSum=newInboundShipment.getFieldValue('custrecord_djkk_customs_duty_act_sum');
	if(isEmpty(tariffDifference)){
		
		if(!isEmpty(expSum)&&!isEmpty(actSum)&&expSum!=actSum){
			var journalentry=nlapiCreateRecord('journalentry');
			journalentry.setFieldValue('subsidiary', newInboundShipment.getFieldValue('custrecord_djkk_subsidiary_header'));
			journalentry.setFieldValue('currency',newInboundShipment.getFieldValue('shipmentbasecurrency'));
			journalentry.setFieldValue('memo', '到着荷物: '+ newInboundShipment.getFieldValue('shipmentnumber')+' 関税差額仕訳');
			journalentry.setFieldValue('custbody_djkk_customs_duty_exp_sum',expSum);
			journalentry.setFieldValue('custbody_djkk_customs_duty_act_sum',actSum);
			
			// 承認ステータス:承認済み			
			journalentry.setFieldValue('approvalstatus','2');
			
			journalentry.selectNewLineItem('line');
			journalentry.setCurrentLineItemValue('line', 'account', TariffDebitAccount);
			if(expSum>actSum){
				journalentry.setCurrentLineItemValue('line', 'debit', expSum-actSum);
			}else{
				journalentry.setCurrentLineItemValue('line', 'credit', actSum-expSum);
			}
			
			
			journalentry.setCurrentLineItemValue('line', 'memo', '到着荷物: '+ newInboundShipment.getFieldValue('shipmentnumber')+' 関税差額仕訳');		
			journalentry.commitLineItem('line');
			
			journalentry.selectNewLineItem('line');			
			journalentry.setCurrentLineItemValue('line', 'account', TariffCreditAccount);
			if(expSum>actSum){
				journalentry.setCurrentLineItemValue('line', 'credit', expSum-actSum);
			}else{
				journalentry.setCurrentLineItemValue('line', 'debit', actSum-expSum);
			}
			journalentry.setCurrentLineItemValue('line', 'memo', '到着荷物: '+ newInboundShipment.getFieldValue('shipmentnumber')+' 関税差額仕訳');		
			journalentry.commitLineItem('line');
			
			var journalentryid=nlapiSubmitRecord(journalentry, false, true);
			newInboundShipment.setFieldValue('custrecord_djkk_tariff_difference',journalentryid);
            nlapiSubmitRecord(newInboundShipment, false, true);
		}
		
	}else{
		if(!isEmpty(expSum)&&!isEmpty(actSum)&&expSum!=actSum){	
			var tariffDifferenceJournalentry=nlapiLoadRecord('journalentry', tariffDifference);
			if(tariffDifferenceJournalentry.getFieldValue('custbody_djkk_customs_duty_exp_sum')!=expSum
					||tariffDifferenceJournalentry.getFieldValue('custbody_djkk_customs_duty_act_sum')!=actSum){
				
				tariffDifferenceJournalentry.setFieldValue('custbody_djkk_customs_duty_exp_sum',expSum);
				tariffDifferenceJournalentry.setFieldValue('custbody_djkk_customs_duty_act_sum',actSum);
				tariffDifferenceJournalentry.selectLineItem('line', '1'); 
				if(expSum>actSum){
					tariffDifferenceJournalentry.setCurrentLineItemValue('line', 'debit', expSum-actSum);
				}else{
					tariffDifferenceJournalentry.setCurrentLineItemValue('line', 'credit', actSum-expSum);
				}
				
				tariffDifferenceJournalentry.commitLineItem('line');
				
				tariffDifferenceJournalentry.selectLineItem('line', '2'); 
				if(expSum>actSum){
					tariffDifferenceJournalentry.setCurrentLineItemValue('line', 'credit', expSum-actSum);
				}else{
					tariffDifferenceJournalentry.setCurrentLineItemValue('line', 'debit', actSum-expSum);
				}
				tariffDifferenceJournalentry.commitLineItem('line');
				
				nlapiSubmitRecord(tariffDifferenceJournalentry, false, true);
				
			}
		}else{
			nlapiDeleteRecord('journalentry', tariffDifference);
		}		
	}	
}
/*
 * DJ_作業費差額仕訳
 * */
function creatWorkCostDifference(id) {
	var newInboundShipment=nlapiLoadRecord('inboundShipment',id);
	// DJ_作業費差額仕訳
	var workCostDifference=newInboundShipment.getFieldValue('custrecord_djkk_work_cost_difference');
	// DJ_予定作業費合計
	var expSum=newInboundShipment.getFieldValue('custrecord_djkk_work_cost_sum');
	
	// DJ_実際作業費合計
	var actSum=newInboundShipment.getFieldValue('custrecord_djkk_work_cost_sum_act');
	if(isEmpty(workCostDifference)){
		if(!isEmpty(expSum)&&!isEmpty(actSum)&&expSum!=actSum){
			var journalentry=nlapiCreateRecord('journalentry');
			journalentry.setFieldValue('subsidiary', newInboundShipment.getFieldValue('custrecord_djkk_subsidiary_header'));
			journalentry.setFieldValue('currency',newInboundShipment.getFieldValue('shipmentbasecurrency'));
			journalentry.setFieldValue('memo', '到着荷物: '+ newInboundShipment.getFieldValue('shipmentnumber')+' 作業費差額仕訳');
			journalentry.setFieldValue('custbody_djkk_work_cost_sum',expSum);
			journalentry.setFieldValue('custbody_djkk_work_cost_sum_act',actSum);
			
			// 承認ステータス:承認済み			
			journalentry.setFieldValue('approvalstatus','2');
			
			journalentry.selectNewLineItem('line');
			journalentry.setCurrentLineItemValue('line', 'account', workCostDebitAccount);
			if(expSum>actSum){
				journalentry.setCurrentLineItemValue('line', 'debit', expSum-actSum);
			}else{
				journalentry.setCurrentLineItemValue('line', 'credit', actSum-expSum);
			}
			
			
			journalentry.setCurrentLineItemValue('line', 'memo', '到着荷物: '+ newInboundShipment.getFieldValue('shipmentnumber')+' 作業費差額仕訳');		
			journalentry.commitLineItem('line');
			
			journalentry.selectNewLineItem('line');			
			journalentry.setCurrentLineItemValue('line', 'account', workCostCreditAccount);
			if(expSum>actSum){
				journalentry.setCurrentLineItemValue('line', 'credit', expSum-actSum);
			}else{
				journalentry.setCurrentLineItemValue('line', 'debit', actSum-expSum);
			}
			journalentry.setCurrentLineItemValue('line', 'memo', '到着荷物: '+ newInboundShipment.getFieldValue('shipmentnumber')+' 作業費差額仕訳');		
			journalentry.commitLineItem('line');
			
			var journalentryid=nlapiSubmitRecord(journalentry, false, true);
			newInboundShipment.setFieldValue('custrecord_djkk_work_cost_difference',journalentryid);
            nlapiSubmitRecord(newInboundShipment, false, true);
		}
		
	}else{
		if(!isEmpty(expSum)&&!isEmpty(actSum)&&expSum!=actSum){	
			var workCostDifferenceJournalentry=nlapiLoadRecord('journalentry', workCostDifference);
			if(workCostDifferenceJournalentry.getFieldValue('custbody_djkk_work_cost_sum')!=expSum
					||workCostDifferenceJournalentry.getFieldValue('custbody_djkk_work_cost_sum_act')!=actSum){
				
				workCostDifferenceJournalentry.setFieldValue('custbody_djkk_work_cost_sum',expSum);
				workCostDifferenceJournalentry.setFieldValue('custbody_djkk_work_cost_sum_act',actSum);
				workCostDifferenceJournalentry.selectLineItem('line', '1'); 
				if(expSum>actSum){
					workCostDifferenceJournalentry.setCurrentLineItemValue('line', 'debit', expSum-actSum);
				}else{
					workCostDifferenceJournalentry.setCurrentLineItemValue('line', 'credit', actSum-expSum);
				}
				
				workCostDifferenceJournalentry.commitLineItem('line');
				
				workCostDifferenceJournalentry.selectLineItem('line', '2'); 
				if(expSum>actSum){
					workCostDifferenceJournalentry.setCurrentLineItemValue('line', 'credit', expSum-actSum);
				}else{
					workCostDifferenceJournalentry.setCurrentLineItemValue('line', 'debit', actSum-expSum);
				}
				workCostDifferenceJournalentry.commitLineItem('line');
				
				nlapiSubmitRecord(workCostDifferenceJournalentry, false, true);
				
			}
		}else{
			nlapiDeleteRecord('journalentry', workCostDifference);
		}		
	}	
}