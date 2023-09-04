/**
 * 仕入先返品Client
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/08/24     CPC_苑
 *
 */

var foodVendorbill = '109';


function popuppdf(){
	var theLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_supplier_returns_pd','customdeploy_djkk_sl_supplier_returns_pd');
	theLink+='&vendorreturnauthorizationId='+nlapiGetRecordId();
	window.open(theLink);
}

//  changed by song add CH625 start
function clientPageInit(type, name, linenum) {
	var customform = nlapiGetFieldValue('customform');//カスタムフォーム
	if(customform == foodVendorbill){
		var createdfrom = nlapiGetFieldValue('createdfrom');//作成元
		if(!isEmpty(createdfrom)){
			var subsidiary = nlapiGetFieldValue('subsidiary');
			var counts=nlapiGetLineItemCount('item');
			if(!isEmpty(subsidiary)){
				for(var i=1;i<counts+1;i++){
					nlapiSelectLineItem('item', i);
					if(isEmpty(nlapiGetCurrentLineItemValue('item', 'targetsubsidiary'))){
						nlapiSetCurrentLineItemValue('item', 'targetsubsidiary', subsidiary,false,true);
					}
					if(!isEmpty(nlapiGetCurrentLineItemValue('item', 'location'))&&isEmpty(nlapiGetCurrentLineItemValue('item', 'targetlocation'))){
						nlapiSetCurrentLineItemValue('item', 'targetlocation', nlapiGetCurrentLineItemValue('item', 'location'),false,true);
					}
					nlapiCommitLineItem('item');
				}
			}
		}	
	}
}
//changed by song add CH625 start

function clientFieldChanged(type, name, linenum) {
	
	if(type == 'item' &&name=='location'){
		if(nlapiGetCurrentLineItemValue('item', 'custcol_djkk_po_inspection_required') == 'T'){
		if(!isEmpty(nlapiGetCurrentLineItemValue('item','location'))&&!isEmpty(nlapiGetFieldValue('subsidiary'))){
			try{
		var locationSearch = nlapiSearchRecord("location",null,
				[
				   ["name","contains","検品中"], 
				   "AND", 
				   ["subsidiary","anyof",nlapiGetFieldValue('subsidiary')], 
				   "AND", 
				   ["custrecord_djkk_exsystem_parent_location","anyof",nlapiGetCurrentLineItemValue('item','location')]
				], 
				[
				   new nlobjSearchColumn("internalid")
				]
				);
		
		var inspectionLocationid = '';
		if(!isEmpty(locationSearch)){
			inspectionLocationid = locationSearch[0].getValue("internalid");
			nlapiSetCurrentLineItemValue('item', 'targetlocation',inspectionLocationid,false,true);
		}else{
			nlapiSetCurrentLineItemValue('item', 'targetlocation',nlapiGetCurrentLineItemValue('item','location'),false,true);
		}
		}catch(e2){nlapiSetCurrentLineItemValue('item', 'targetlocation',nlapiGetCurrentLineItemValue('item','location'),false,true);}
		}else{
			nlapiSetCurrentLineItemValue('item', 'targetlocation',nlapiGetCurrentLineItemValue('item','location'),false,true);
		}
	}else{
		nlapiSetCurrentLineItemValue('item', 'targetlocation',nlapiGetCurrentLineItemValue('item','location'),false,true);
	}		
	}
}

function clientPostSourcing(type, name) {
	var customform = nlapiGetFieldValue("customform"); 
	nlapiLogExecution('error','customform',customform);
	if(customform =='124'){
		if (type == 'item'&&name == 'item'&& !isEmpty(nlapiGetCurrentLineItemValue('item', 'item'))) {
		       if(isEmpty(nlapiGetCurrentLineItemValue('item', 'targetsubsidiary'))){
		   			nlapiSetCurrentLineItemValue('item', 'targetsubsidiary',nlapiGetFieldValue('subsidiary'),false,true);
		       }
		       if(isEmpty(nlapiGetCurrentLineItemValue('item', 'location'))){
		    	   nlapiSetCurrentLineItemValue('item', 'location',nlapiGetFieldValue('location'),false,true);   
		       }
		       if(isEmpty(nlapiGetCurrentLineItemValue('item', 'targetlocation'))){		    	 		    	   		    	   
		    	   if(nlapiGetCurrentLineItemValue('item', 'custcol_djkk_po_inspection_required') == 'T'){
		    		   if(!isEmpty(nlapiGetFieldValue('location'))&&!isEmpty(nlapiGetFieldValue('subsidiary'))){
		    			   try{
							var locationSearch = nlapiSearchRecord("location",null,
									[
									   ["name","contains","検品中"], 
									   "AND", 
									   ["subsidiary","anyof",nlapiGetFieldValue('subsidiary')], 
									   "AND", 
									   ["custrecord_djkk_exsystem_parent_location","anyof",nlapiGetFieldValue('location')]
									], 
									[
									   new nlobjSearchColumn("internalid")
									]
									);
							
					var inspectionLocationid = '';
					if(!isEmpty(locationSearch)){
						inspectionLocationid = locationSearch[0].getValue("internalid");
						nlapiSetCurrentLineItemValue('item', 'targetlocation',inspectionLocationid,false,true);
					}else{
						nlapiSetCurrentLineItemValue('item', 'targetlocation',nlapiGetFieldValue('location'),false,true);
					}
					}catch(e2){nlapiSetCurrentLineItemValue('item', 'targetlocation',nlapiGetFieldValue('location'),false,true);}
					}
				   }
          }
      }
   }
}