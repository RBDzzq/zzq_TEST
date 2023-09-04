/**
 * DJ_—\–ñˆ×‘ÖƒŒ[ƒg‚ÌClient
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/05/16     CPC_‰‘
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type) {
	if (type == 'create' || type == 'copy') {
		nlapiSetFieldValue('name', '©“®Ì”Ô');
	}
	setFieldDisableType('name', 'disabled');

	var categ = nlapiGetFieldValue('custrecord_djkk_reservation_rate_categ');
	// —A“ü
	if (categ == '1') {

		// DJ_—\–ñƒŒ[ƒgw“üæ
		setFieldDisableType('custrecord_djkk_rer_vendor', 'normal');
		setFieldDisableType('custrecord_djkk_rer_customer', 'disabled');

		// —Ao
	} else if (categ == '2') {

		// DJ_—\–ñƒŒ[ƒgŒÚ‹q
		setFieldDisableType('custrecord_djkk_rer_customer', 'normal');
		setFieldDisableType('custrecord_djkk_rer_vendor', 'disabled');

	} else {

		setFieldDisableType('custrecord_djkk_rer_vendor', 'disabled');
		setFieldDisableType('custrecord_djkk_rer_customer', 'disabled');
	}

	setFieldDisableType('custrecord_djkk_entity', 'disabled');
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord() {
 var curry=nlapiGetFieldValue('custrecord_djkk_currency');
 if(curry=='1'){
  alert('Šî–{’Ê‰İJPY‚ğ‘I‘ğ‚Å‚«‚Ü‚¹‚ñ');
return false;
    }
var type=nlapiGetFieldValue('custrecord_djkk_reservation_rate_type');
var typetxt='';
if(type=='1'){
	typetxt='Ğ“à';
}else if(type=='2'){
	typetxt='—\–ñ';
	}
	// uDJ_“ú•tv+‹ó+uDJ_ƒŒ[ƒgí—Şv+‹ó+uDJ_—\–ñˆ×‘ÖƒŒ[ƒgv
	var name = nlapiGetFieldValue('custrecord_djkk_date') + ' '
			+ typetxt + ' '
			+ nlapiGetFieldValue('custrecord_djkk_reserved_exchange_rate');
	nlapiSetFieldValue('name', name);
	return true;
}

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

	// DJ_ƒJƒeƒSƒŠ
	if (name == 'custrecord_djkk_reservation_rate_categ') {
		var categ = nlapiGetFieldValue('custrecord_djkk_reservation_rate_categ');
		nlapiSetFieldValue('custrecord_djkk_rer_vendor', '');
		nlapiSetFieldValue('custrecord_djkk_rer_customer', '');
		nlapiSetFieldValue('custrecord_djkk_entity', '');
		// —A“ü
		if (categ == '1') {

			// DJ_—\–ñƒŒ[ƒgw“üæ
			setFieldDisableType('custrecord_djkk_rer_vendor', 'normal');
			setFieldDisableType('custrecord_djkk_rer_customer', 'disabled');

			// —Ao
		} else if (categ == '2') {

			// DJ_—\–ñƒŒ[ƒgŒÚ‹q
			setFieldDisableType('custrecord_djkk_rer_customer', 'normal');
			setFieldDisableType('custrecord_djkk_rer_vendor', 'disabled');

		} else {

			setFieldDisableType('custrecord_djkk_rer_vendor', 'disabled');
			setFieldDisableType('custrecord_djkk_rer_customer', 'disabled');
		}
	}
	// DJ_—\–ñƒŒ[ƒgw“üæ||DJ_—\–ñƒŒ[ƒgŒÚ‹q
	if (name == 'custrecord_djkk_rer_vendor'
			|| name == 'custrecord_djkk_rer_customer') {

		// DJ_æˆøæ
		nlapiSetFieldValue('custrecord_djkk_entity', nlapiGetFieldValue(name));
	}
}
