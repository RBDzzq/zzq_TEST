/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       16 May 2023     zhou
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {
	var columns = new Array();
	columns.push(new nlobjSearchColumn("itemid"));
	columns.push(new nlobjSearchColumn("vendorname"));
	columns.push(new nlobjSearchColumn("custitem_djkk_product_code"));
	columns.push(new nlobjSearchColumn("displayname"));
	columns.push(new nlobjSearchColumn("custitem_djkk_item_abbreviation_name"));
	columns.push(new nlobjSearchColumn("custitem_dkjj_item_pdf_show"));
	columns.push(new nlobjSearchColumn("internalid"));
	var search = nlapiSearchRecord("item",null
			[
			 ["baserecordtype","anyof","serializedinventoryitem"]
			 ],
			columns);
	
	for(var i = 0; i<search.length;i++){
		
	var itemRecord = nlapiLoadRecord(search[i].getValue(columns[6]))
	var itemid = search[i].getValue(columns[0]);
	var vendorname = search[i].getValue(columns[1]);
	var productCode = search[i].getValue(columns[2]);
	var enname = search[i].getValue(columns[3]);
	var abbreviationname = search[i].getValue(columns[4]);//‹KŠi
	var pdf = search[i].getValue(columns[5]);//‹KŠi
	var itemPdf = itemid;
	nlapiLogExecution('debug','id',enname)
	if(pdf.indexOf("Ž©“®Ì”Ô") != -1 ){
		
	 // true indexOf() )
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
	nlapiLogExecution('debug', 'itemPdf',itemPdf);
	//end
	itemRecord.setFieldValue('custitem_dkjj_item_pdf_show', itemPdf);
	try{
		 nlapiSubmitRecord(itemRecord);
	 }catch(e){
		 nlapiLogExecution('error', e.message);
	 }	 }	
}}
