/**
 * DJ_レコード削除
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/11/18     CPC_苑
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	var RecordType = request.getParameter('RecordType');
	var RecordId = request.getParameter('RecordId');
	if(RecordType=='customrecord_djkk_landed_cost'){
    var delectRecord=nlapiLoadRecord(RecordType, RecordId);
	   var inboundshipmentID = delectRecord.getFieldValue('custrecord_djkk_arrival_luggage');
		var inboundShipment=nlapiLoadRecord('inboundShipment',inboundshipmentID);	
		var tariff_differenceId=inboundShipment.getFieldValue('custrecord_djkk_tariff_difference');
		inboundShipment.setFieldValue('custrecord_djkk_landed_cost','');
		inboundShipment.setFieldValue('custrecord_djkk_tariff_difference','');
		inboundShipment.setFieldValue('custrecord_djkk_quantityexpected_sum','');
		inboundShipment.setFieldValue('custrecord_djkk_customs_duty_act_sum','');		
		inboundShipment.setFieldValue('custrecord_djkk_other_taxes_sum_act','');		
		var counts=inboundShipment.getLineItemCount('items');
		for(var i=1;i<counts+1;i++){
//			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount5_per',i,'');
//			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount5_cha_m',i,'');
//			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount6_per',i,'');
//			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount6_cha_m',i,'');
//			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount7_per',i,'');
//			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount7_cha_m',i,'');
//			inboundShipment.setLineItemValue('items','custrecord_djkk_customs_duty_act',i,'');	
//			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount13_per',i,'');
//			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount13_cha_m',i,'');
//			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount14_per',i,'');
//			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount14_cha_m',i,'');
//			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount15_per',i,'');
//			inboundShipment.setLineItemValue('items','custrecord_djkk_other_taxes_act',i,'');
//			inboundShipment.setLineItemValue('items','custrecord_djkk_work_cost_act',i,'');
//			inboundShipment.setLineItemValue('items','custrecord_djkk_baling_generation_per',i,'');//DJ_梱包代割合率
//			inboundShipment.setLineItemValue('items','custrecord_djkk_baling_generation_price',i,'');//DJ_梱包代割合率
//			//changed by song add start CH603
//			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount15_cha_m',i,'');//その他の税金調整後金額
//			//changed by song add end CH603
			
			inboundShipment.setLineItemValue('items','custrecord_djkk_po_exchange_rate',i,'');//DJ_PO通関用為替レート
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount15_per',i,'');//DJ_その他の税金割引率
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount15_cha_m',i,'');//DJ_その他の税金調整後金額
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount13_per',i,'');//DJ_その他経費割引率
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcost_ctual_shoake5',i,'');//DJ_その他経費実際諸掛（円）
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount13_cha_m',i,'');//DJ_その他経費調整後金額
			inboundShipment.setLineItemValue('items','custrecord_djkk_other_taxes_rate',i,'');//DJ_予定その他の税金
			inboundShipment.setLineItemValue('items','custrecord_djkk_work_cost_rate',i,'');//DJ_予定作業費
			inboundShipment.setLineItemValue('items','custrecord_djkk_customs_duty_rate_1',i,'');//DJ_予定関税(総金額1)
			inboundShipment.setLineItemValue('items','custrecord_djkk_customs_duty_rate_2',i,'');//DJ_予定関税(総金額2)
			inboundShipment.setLineItemValue('items','custrecord_djkk_customs_duty_rate',i,'');//DJ_予定関税金額
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcost_ctual_shoake2',i,'');//DJ_保険料実際諸掛（円）
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount6_cha_m',i,'');//DJ_保険料調整後金額
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount14_per',i,'');//DJ_国内運賃手数料割引率
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount14_cha_m',i,'');//DJ_国内運賃手数料調整後金額
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount5_per',i,'');//DJ_国際運送料割合率
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcost_ctual_shoake1',i,'');//DJ_国際運送料実際諸掛（円）
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount5_cha_m',i,'');//DJ_国際運送料調整後金額
			inboundShipment.setLineItemValue('items','custrecord_djkk_other_taxes_act',i,'');//DJ_実際その他の税金
			inboundShipment.setLineItemValue('items','custrecord_djkk_work_cost_act',i,'');//DJ_実際作業費
			inboundShipment.setLineItemValue('items','custrecord_djkk_customs_duty_act',i,'');//DJ_実際関税金額
			inboundShipment.setLineItemValue('items','custrecord_djkk_baling_generation_per',i,'');//DJ_梱包代割合率
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcost_ctual_shoake3',i,'');//DJ_梱包代実際諸掛（円）
			inboundShipment.setLineItemValue('items','custrecord_djkk_baling_generation_price',i,'');//DJ_梱包代調整後金額
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcost_ctual_cost',i,'');//DJ_輸入諸掛（単価/円）
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount7_per',i,'');//DJ_通関手数料割合率
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcost_ctual_shoake4',i,'');//DJ_通関手数料実際諸掛（円）
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount7_cha_m',i,'');//DJ_通関手数料調整後金額
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcost_ctual_total',i,'');
			
			var ctualPrice = inboundShipment.getLineItemValue('items','custrecord_djkk_landedcost_ctual_price',i);//DJ_購入単価（円）
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcost_ctual_total',i,ctualPrice);//DJ_購入原価合計（円）
			inboundShipment.commitLineItem('items');
		}
		nlapiSubmitRecord(inboundShipment,true,true);
		if(!isEmpty(tariff_differenceId)){
			nlapiDeleteRecord('journalentry', tariff_differenceId);
		}
	}
	try{
	nlapiDeleteRecord(RecordType, RecordId);
	response.write('T');
	}catch(e){
	response.write(e);
	}
}
