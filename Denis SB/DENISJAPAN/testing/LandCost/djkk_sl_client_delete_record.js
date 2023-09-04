/**
 * DJ_ÉåÉRÅ[ÉhçÌèú
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/11/18     CPC_âë
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
//			inboundShipment.setLineItemValue('items','custrecord_djkk_baling_generation_per',i,'');//DJ_ç´ïÔë„äÑçáó¶
//			inboundShipment.setLineItemValue('items','custrecord_djkk_baling_generation_price',i,'');//DJ_ç´ïÔë„äÑçáó¶
//			//changed by song add start CH603
//			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount15_cha_m',i,'');//ÇªÇÃëºÇÃê≈ã‡í≤êÆå„ã‡äz
//			//changed by song add end CH603
			
			inboundShipment.setLineItemValue('items','custrecord_djkk_po_exchange_rate',i,'');//DJ_POí ä÷ópà◊ë÷ÉåÅ[Ég
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount15_per',i,'');//DJ_ÇªÇÃëºÇÃê≈ã‡äÑà¯ó¶
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount15_cha_m',i,'');//DJ_ÇªÇÃëºÇÃê≈ã‡í≤êÆå„ã‡äz
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount13_per',i,'');//DJ_ÇªÇÃëºåoîÔäÑà¯ó¶
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcost_ctual_shoake5',i,'');//DJ_ÇªÇÃëºåoîÔé¿ç€èîä|Åiâ~Åj
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount13_cha_m',i,'');//DJ_ÇªÇÃëºåoîÔí≤êÆå„ã‡äz
			inboundShipment.setLineItemValue('items','custrecord_djkk_other_taxes_rate',i,'');//DJ_ó\íËÇªÇÃëºÇÃê≈ã‡
			inboundShipment.setLineItemValue('items','custrecord_djkk_work_cost_rate',i,'');//DJ_ó\íËçÏã∆îÔ
			inboundShipment.setLineItemValue('items','custrecord_djkk_customs_duty_rate_1',i,'');//DJ_ó\íËä÷ê≈(ëçã‡äz1)
			inboundShipment.setLineItemValue('items','custrecord_djkk_customs_duty_rate_2',i,'');//DJ_ó\íËä÷ê≈(ëçã‡äz2)
			inboundShipment.setLineItemValue('items','custrecord_djkk_customs_duty_rate',i,'');//DJ_ó\íËä÷ê≈ã‡äz
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcost_ctual_shoake2',i,'');//DJ_ï€åØóøé¿ç€èîä|Åiâ~Åj
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount6_cha_m',i,'');//DJ_ï€åØóøí≤êÆå„ã‡äz
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount14_per',i,'');//DJ_çëì‡â^í¿éËêîóøäÑà¯ó¶
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount14_cha_m',i,'');//DJ_çëì‡â^í¿éËêîóøí≤êÆå„ã‡äz
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount5_per',i,'');//DJ_çëç€â^ëóóøäÑçáó¶
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcost_ctual_shoake1',i,'');//DJ_çëç€â^ëóóøé¿ç€èîä|Åiâ~Åj
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount5_cha_m',i,'');//DJ_çëç€â^ëóóøí≤êÆå„ã‡äz
			inboundShipment.setLineItemValue('items','custrecord_djkk_other_taxes_act',i,'');//DJ_é¿ç€ÇªÇÃëºÇÃê≈ã‡
			inboundShipment.setLineItemValue('items','custrecord_djkk_work_cost_act',i,'');//DJ_é¿ç€çÏã∆îÔ
			inboundShipment.setLineItemValue('items','custrecord_djkk_customs_duty_act',i,'');//DJ_é¿ç€ä÷ê≈ã‡äz
			inboundShipment.setLineItemValue('items','custrecord_djkk_baling_generation_per',i,'');//DJ_ç´ïÔë„äÑçáó¶
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcost_ctual_shoake3',i,'');//DJ_ç´ïÔë„é¿ç€èîä|Åiâ~Åj
			inboundShipment.setLineItemValue('items','custrecord_djkk_baling_generation_price',i,'');//DJ_ç´ïÔë„í≤êÆå„ã‡äz
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcost_ctual_cost',i,'');//DJ_óAì¸èîä|ÅiíPâø/â~Åj
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount7_per',i,'');//DJ_í ä÷éËêîóøäÑçáó¶
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcost_ctual_shoake4',i,'');//DJ_í ä÷éËêîóøé¿ç€èîä|Åiâ~Åj
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount7_cha_m',i,'');//DJ_í ä÷éËêîóøí≤êÆå„ã‡äz
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcost_ctual_total',i,'');
			
			var ctualPrice = inboundShipment.getLineItemValue('items','custrecord_djkk_landedcost_ctual_price',i);//DJ_çwì¸íPâøÅiâ~Åj
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcost_ctual_total',i,ctualPrice);//DJ_çwì¸å¥âøçáåvÅiâ~Åj
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
