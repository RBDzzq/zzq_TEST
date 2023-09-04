/**
 *DJ_έΙΪΧClient
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/10/25     CPC_
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){
    var count=nlapiGetLineItemCount('inventory_details');
    var quantity=0;
    for(var i=1;i<count+1;i++){
    	if(nlapiGetLineItemValue('inventory_details', 'custpage_checkbox', i)=='T'){
    		quantity+=Number(nlapiGetLineItemValue('inventory_details', 'custpage_djkk_ditl_quantity', i));
    	}	
    }
   var headerQuantity=Math.abs(Number(nlapiGetFieldValue('custpage_djkk_ind_quantity')));
   if(quantity!=headerQuantity){
    alert('έΙΪΧΜvΚΝΤα’B');
    return false;
   }
    return true;
}

function clientFieldChanged(type, name, linenum){
	if(name==='custpage_djkk_ditl_quantity'){
		var quantity=Number(nlapiGetLineItemValue('inventory_details', 'custpage_djkk_ditl_quantity', linenum));
		var possible =Number(nlapiGetLineItemValue('inventory_details', 'custpage_djkk_ditl_quantity_possible', linenum));
		if(quantity>possible){
			alert('έΙΒ\Κͺ'+quantity+'’Ε·');
			nlapiSetLineItemValue('inventory_details', 'custpage_djkk_ditl_quantity',linenum, possible);
		}
	}
}