/**
 *DJ_ó—Ì‘‚ÌUserEvent(—A“ü”Š|)
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/02/25     CPC_‰‘
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * 
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function userEventBeforeLoadLC(type, form, request){
	
}

function userEventBeforeSubmitLC(type){		
	  if (type == 'create') {		
		nlapiSetFieldValue('landedcostperline','T');
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
function userEventAfterSubmitLC(type){
	try{
	if(type=='create'){
	var notsingleflag=true;
	var itemreceiptRecord=nlapiLoadRecord('itemreceipt', nlapiGetRecordId());
	var counts=itemreceiptRecord.getLineItemCount('item');
	var itArray=new Array();
	var itQuantity=0;
	var itAmount=0;
	var itWeight=0;
	var createdfrom=itemreceiptRecord.getFieldValue('createdfrom');	
	var inboundshipmentId=itemreceiptRecord.getFieldValue('inboundshipment');  //“’…‰×•¨ID 
	if(!isEmpty(inboundshipmentId)){
		var alrecord=nlapiLoadRecord('inboundShipment', inboundshipmentId);
		var inboundShipmentid=alrecord.getFieldValue('custrecord_djkk_landed_cost');//“’…‰×•¨-DJ_—A“ü”Š|ID
		if(!isEmpty(inboundShipmentid)){
		itemreceiptRecord.setFieldValue('custbody_djkk_landed_cost',inboundShipmentid);
		//changed by song add start U378
		var landedRecord=nlapiLoadRecord('customrecord_djkk_landed_cost', inboundShipmentid);//DJ_—A“ü”Š|
		var landedStatus = landedRecord.getFieldValue('custrecord_djkk_landedcost_status')//DJ_—A“ü”Š|ƒXƒe[ƒ^ƒX
		if(landedStatus == '2'){
		//changed by song add end U378	
			//var landedCost=nlapiLoadRecord('customrecord_djkk_landed_cost',inboundShipmentid);
			var alrecordCount=alrecord.getLineItemCount('items');
			for(var i=1;i<counts+1;i++){
				 itemreceiptRecord.selectLineItem('item', i);
				 var orderline=itemreceiptRecord.getLineItemValue('item', 'orderline', i);
				for(var j=1;j<alrecordCount+1;j++){
					var purchaseorder=alrecord.getLineItemValue('items','purchaseorder',j);
					var lineid=alrecord.getLineItemValue('items','custrecord_djkk_po_line_number',j);
					if(purchaseorder==createdfrom&&lineid==orderline){
						var landedcost = itemreceiptRecord.createCurrentLineItemSubrecord('item', 'landedcost');
						var poRateValue = alrecord.getLineItemValue('items','shipmentitemexchangerate',j);
						var landedcostamount5=alrecord.getLineItemValue('items','custrecord_djkk_landedcostamount5_cha_m',j);
						landedcostamount5 = (Number(landedcostamount5/poRateValue)).toFixed(2);
						if (!isEmpty(landedcostamount5)) {
						landedcost.selectNewLineItem('landedcostdata');
						landedcost.setCurrentLineItemValue('landedcostdata','costcategory', '5');
						landedcost.setCurrentLineItemValue('landedcostdata', 'amount',landedcostamount5);
						landedcost.commitLineItem('landedcostdata');
						}
						
						var landedcostamount7=alrecord.getLineItemValue('items','custrecord_djkk_landedcostamount7_cha_m',j);
						landedcostamount7 = (Number(landedcostamount7/poRateValue)).toFixed(2);
						if (!isEmpty(landedcostamount7)) {
						landedcost.selectNewLineItem('landedcostdata');
						landedcost.setCurrentLineItemValue('landedcostdata','costcategory', '7');
						landedcost.setCurrentLineItemValue('landedcostdata', 'amount',landedcostamount7);
						landedcost.commitLineItem('landedcostdata');
					    }	
						
						var landedcostamount13=alrecord.getLineItemValue('items','custrecord_djkk_landedcostamount13_cha_m',j);
						landedcostamount13 = (Number(landedcostamount13/poRateValue)).toFixed(2);
						if (!isEmpty(landedcostamount13)) {
						landedcost.selectNewLineItem('landedcostdata');
						landedcost.setCurrentLineItemValue('landedcostdata','costcategory', '13');
						landedcost.setCurrentLineItemValue('landedcostdata', 'amount',landedcostamount13);
						landedcost.commitLineItem('landedcostdata');
						}
						
						var landedcostamount14=alrecord.getLineItemValue('items','custrecord_djkk_landedcostamount14_cha_m',j);
						landedcostamount14 = (Number(landedcostamount14/poRateValue)).toFixed(2);
						if (!isEmpty(landedcostamount14)) {
						landedcost.selectNewLineItem('landedcostdata');
						landedcost.setCurrentLineItemValue('landedcostdata','costcategory', '14');
						landedcost.setCurrentLineItemValue('landedcostdata', 'amount',landedcostamount14);
						landedcost.commitLineItem('landedcostdata');
					    }
						
						var landedcostamount6=alrecord.getLineItemValue('items','custrecord_djkk_landedcostamount6_cha_m',j);
						landedcostamount6 = (Number(landedcostamount6/poRateValue)).toFixed(2);
						if (!isEmpty(landedcostamount6)) {
						landedcost.selectNewLineItem('landedcostdata');
						landedcost.setCurrentLineItemValue('landedcostdata','costcategory', '6');
						landedcost.setCurrentLineItemValue('landedcostdata', 'amount',landedcostamount6);
						landedcost.commitLineItem('landedcostdata');
					    }
						
						var landedcostamount8=alrecord.getLineItemValue('items','custrecord_djkk_customs_duty_act',j);
						landedcostamount8 = (Number(landedcostamount8/poRateValue)).toFixed(2);
						if (!isEmpty(landedcostamount8)) {
						landedcost.selectNewLineItem('landedcostdata');
						landedcost.setCurrentLineItemValue('landedcostdata','costcategory', '8');
						landedcost.setCurrentLineItemValue('landedcostdata', 'amount',landedcostamount8);
						landedcost.commitLineItem('landedcostdata');
					    }
						
						var landedcostamount15=alrecord.getLineItemValue('items','custrecord_djkk_other_taxes_act',j);
						landedcostamount15 = (Number(landedcostamount15/poRateValue)).toFixed(2);
						if (!isEmpty(landedcostamount15)) {
						landedcost.selectNewLineItem('landedcostdata');
						landedcost.setCurrentLineItemValue('landedcostdata','costcategory', '15');
						landedcost.setCurrentLineItemValue('landedcostdata', 'amount',landedcostamount15);
						landedcost.commitLineItem('landedcostdata');
					    }
						
						var landedcostamount16=alrecord.getLineItemValue('items','custrecord_djkk_work_cost_act',j);
						landedcostamount16 = (Number(landedcostamount16/poRateValue)).toFixed(2);
						if (!isEmpty(landedcostamount16)) {
						landedcost.selectNewLineItem('landedcostdata');
						landedcost.setCurrentLineItemValue('landedcostdata','costcategory', '16');
						landedcost.setCurrentLineItemValue('landedcostdata', 'amount',landedcostamount16);
						landedcost.commitLineItem('landedcostdata');
					    }
						
						//changed by geng add start U583
						var landedcostamount18=alrecord.getLineItemValue('items','custrecord_djkk_baling_generation_price',j);
						landedcostamount18 = (Number(landedcostamount18/poRateValue)).toFixed(2);
						if (!isEmpty(landedcostamount18)) {
						landedcost.selectNewLineItem('landedcostdata');
						landedcost.setCurrentLineItemValue('landedcostdata','costcategory', '18');
						landedcost.setCurrentLineItemValue('landedcostdata', 'amount',landedcostamount18);
						landedcost.commitLineItem('landedcostdata');
					    }
						//
						landedcost.commit();					
					}
				}
				itemreceiptRecord.commitLineItem('item');		
			}
			nlapiSubmitRecord(itemreceiptRecord, false, true);
		}
		}
		//changed by song add start U378
		nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(),'custbody_djkk_inboundshipment_intid', inboundshipmentId); //DJ_ƒNƒŒƒWƒbƒgƒƒ‚
		//changed by song add end U378
	  }
   }
   }catch(error){
	   nlapiLogExecution('debug','error',e);
	}
}