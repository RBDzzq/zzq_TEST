/**
 * ZŠ‚ÌClient
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/04/28     CPC_‰‘
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @param {String}
 *            name Field internal id
 * @param {Number}
 *            linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum) {
	if (name == 'zip') {
		var zipcode = replaceExceptNumber(nlapiGetFieldValue('zip'));
		var codeSearch = nlapiSearchRecord("customrecord_djkk_postal_code",
				null, [ [ "custrecord_djkk_postal_code", "is", zipcode ] ], [
						new nlobjSearchColumn("custrecord_djkk_state"),
						new nlobjSearchColumn("custrecord_djkk_city"),
						new nlobjSearchColumn("custrecord_djkk_address") ]);
		if (!isEmpty(codeSearch)) {
			nlapiSetFieldValue('custrecord_djkk_address_state', codeSearch[0]
					.getText('custrecord_djkk_state'));
			nlapiSetFieldValue('city', codeSearch[0]
					.getValue('custrecord_djkk_city'));
			nlapiSetFieldValue('addr1', codeSearch[0]
					.getValue('custrecord_djkk_address'),false,true);
		} else {
			nlapiSetFieldValue('custrecord_djkk_address_state', '');
			nlapiSetFieldValue('city', '');
			nlapiSetFieldValue('addr1', '',false,true);
		}
	}
	if (name == 'addr1') {
		var addr1 = nlapiGetFieldValue('addr1');
		var zip=nlapiGetFieldValue('zip');
      if(!isEmpty(addr1)&&isEmpty(zip)){
		var addSearch = nlapiSearchRecord("customrecord_djkk_postal_code",
				null, [ [ "custrecord_djkk_address", "contains", addr1 ] ], [
						new nlobjSearchColumn("custrecord_djkk_postal_code"),
						new nlobjSearchColumn("custrecord_djkk_state"),
						new nlobjSearchColumn("custrecord_djkk_city") ]);
		if (!isEmpty(addSearch)) {
			nlapiSetFieldValue('custrecord_djkk_address_state', addSearch[0]
					.getText('custrecord_djkk_state'));
			nlapiSetFieldValue('city', addSearch[0]
					.getValue('custrecord_djkk_city'));
			nlapiSetFieldValue('zip', addSearch[0]
					.getValue('custrecord_djkk_postal_code'),false,true);
		} else {
//			nlapiSetFieldValue('custrecord_djkk_address_state', '');
//			nlapiSetFieldValue('city', '');
//			nlapiSetFieldValue('zip', '',false,true);
		}
	  }
	}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){

	//20220708 add by zhou
	//U280
		var roleSubsidiary = getRoleSubsidiary();
		// H•i
		if(roleSubsidiary==SUB_NBKK||roleSubsidiary==SUB_ULKK){
				var zip = nlapiGetFieldValue('zip');
				var addr2 = nlapiGetFieldValue('addr2');
				var addrphone  = nlapiGetFieldValue('addrphone');
				if(isEmpty(zip)){
					if(isEmpty(addrphone)){
						if(isEmpty(addr2)){
							alert('ZŠ–¾×: ZŠ‚É—X•Ö”Ô†,“d˜b”Ô†,ZŠ‚ğ“ü—Í‚µ‚È‚¢‚Å‚·B');
						}else{
							alert('ZŠ–¾×: ZŠ‚É—X•Ö”Ô†,“d˜b”Ô†‚ğ“ü—Í‚µ‚È‚¢‚Å‚·B');
						}
						
					}else if(!isEmpty(addrphone)){
						if(isEmpty(addr2)){
							alert('ZŠ–¾×: ZŠ‚É—X•Ö”Ô†,ZŠ‚ğ“ü—Í‚µ‚È‚¢‚Å‚·B');
						}else{
							alert('ZŠ–¾×: ZŠ‚É—X•Ö”Ô†‚ğ“ü—Í‚µ‚È‚¢‚Å‚·B');
						}
					}	
				}else if(!isEmpty(zip)){
					if(isEmpty(addrphone)){
						if(isEmpty(addr2)){
							alert('ZŠ–¾×: ZŠ‚É“d˜b”Ô†,ZŠ‚ğ“ü—Í‚µ‚È‚¢‚Å‚·B');
						}else{
							alert('ZŠ–¾×: ZŠ‚É“d˜b”Ô†‚ğ“ü—Í‚µ‚È‚¢‚Å‚·B');	
						}
					}else if(!isEmpty(addrphone)){
						if(isEmpty(addr2)){
							alert('ZŠ–¾×: ZŠ‚ÉZŠ‚ğ“ü—Í‚µ‚È‚¢‚Å‚·B');
						}
					}
				}
			}
		
	//20220708 add by zhou end
		return true;
	}
