/**
 * DJ_���R�[�h�폜
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/11/18     CPC_��
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
//			inboundShipment.setLineItemValue('items','custrecord_djkk_baling_generation_per',i,'');//DJ_����㊄����
//			inboundShipment.setLineItemValue('items','custrecord_djkk_baling_generation_price',i,'');//DJ_����㊄����
//			//changed by song add start CH603
//			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount15_cha_m',i,'');//���̑��̐ŋ���������z
//			//changed by song add end CH603
			
			inboundShipment.setLineItemValue('items','custrecord_djkk_po_exchange_rate',i,'');//DJ_PO�ʊ֗p�בփ��[�g
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount15_per',i,'');//DJ_���̑��̐ŋ�������
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount15_cha_m',i,'');//DJ_���̑��̐ŋ���������z
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount13_per',i,'');//DJ_���̑��o�����
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcost_ctual_shoake5',i,'');//DJ_���̑��o����ۏ��|�i�~�j
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount13_cha_m',i,'');//DJ_���̑��o�������z
			inboundShipment.setLineItemValue('items','custrecord_djkk_other_taxes_rate',i,'');//DJ_�\�肻�̑��̐ŋ�
			inboundShipment.setLineItemValue('items','custrecord_djkk_work_cost_rate',i,'');//DJ_�\���Ɣ�
			inboundShipment.setLineItemValue('items','custrecord_djkk_customs_duty_rate_1',i,'');//DJ_�\��֐�(�����z1)
			inboundShipment.setLineItemValue('items','custrecord_djkk_customs_duty_rate_2',i,'');//DJ_�\��֐�(�����z2)
			inboundShipment.setLineItemValue('items','custrecord_djkk_customs_duty_rate',i,'');//DJ_�\��֐ŋ��z
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcost_ctual_shoake2',i,'');//DJ_�ی������ۏ��|�i�~�j
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount6_cha_m',i,'');//DJ_�ی�����������z
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount14_per',i,'');//DJ_�����^���萔��������
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount14_cha_m',i,'');//DJ_�����^���萔����������z
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount5_per',i,'');//DJ_���ۉ^����������
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcost_ctual_shoake1',i,'');//DJ_���ۉ^�������ۏ��|�i�~�j
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount5_cha_m',i,'');//DJ_���ۉ^������������z
			inboundShipment.setLineItemValue('items','custrecord_djkk_other_taxes_act',i,'');//DJ_���ۂ��̑��̐ŋ�
			inboundShipment.setLineItemValue('items','custrecord_djkk_work_cost_act',i,'');//DJ_���ۍ�Ɣ�
			inboundShipment.setLineItemValue('items','custrecord_djkk_customs_duty_act',i,'');//DJ_���ۊ֐ŋ��z
			inboundShipment.setLineItemValue('items','custrecord_djkk_baling_generation_per',i,'');//DJ_����㊄����
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcost_ctual_shoake3',i,'');//DJ_�������ۏ��|�i�~�j
			inboundShipment.setLineItemValue('items','custrecord_djkk_baling_generation_price',i,'');//DJ_����㒲������z
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcost_ctual_cost',i,'');//DJ_�A�����|�i�P��/�~�j
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount7_per',i,'');//DJ_�ʊ֎萔��������
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcost_ctual_shoake4',i,'');//DJ_�ʊ֎萔�����ۏ��|�i�~�j
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcostamount7_cha_m',i,'');//DJ_�ʊ֎萔����������z
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcost_ctual_total',i,'');
			
			var ctualPrice = inboundShipment.getLineItemValue('items','custrecord_djkk_landedcost_ctual_price',i);//DJ_�w���P���i�~�j
			inboundShipment.setLineItemValue('items','custrecord_djkk_landedcost_ctual_total',i,ctualPrice);//DJ_�w���������v�i�~�j
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
