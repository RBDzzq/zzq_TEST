/**
 * DJ_�\��בփ��[�g��Client
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/05/16     CPC_��
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
		nlapiSetFieldValue('name', '�����̔�');
	}
	setFieldDisableType('name', 'disabled');

	var categ = nlapiGetFieldValue('custrecord_djkk_reservation_rate_categ');
	// �A��
	if (categ == '1') {

		// DJ_�\�񃌁[�g�w����
		setFieldDisableType('custrecord_djkk_rer_vendor', 'normal');
		setFieldDisableType('custrecord_djkk_rer_customer', 'disabled');

		// �A�o
	} else if (categ == '2') {

		// DJ_�\�񃌁[�g�ڋq
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
  alert('��{�ʉ�JPY��I���ł��܂���');
return false;
    }
var type=nlapiGetFieldValue('custrecord_djkk_reservation_rate_type');
var typetxt='';
if(type=='1'){
	typetxt='�Г�';
}else if(type=='2'){
	typetxt='�\��';
	}
	// �uDJ_���t�v+��+�uDJ_���[�g��ށv+��+�uDJ_�\��בփ��[�g�v
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

	// DJ_�J�e�S��
	if (name == 'custrecord_djkk_reservation_rate_categ') {
		var categ = nlapiGetFieldValue('custrecord_djkk_reservation_rate_categ');
		nlapiSetFieldValue('custrecord_djkk_rer_vendor', '');
		nlapiSetFieldValue('custrecord_djkk_rer_customer', '');
		nlapiSetFieldValue('custrecord_djkk_entity', '');
		// �A��
		if (categ == '1') {

			// DJ_�\�񃌁[�g�w����
			setFieldDisableType('custrecord_djkk_rer_vendor', 'normal');
			setFieldDisableType('custrecord_djkk_rer_customer', 'disabled');

			// �A�o
		} else if (categ == '2') {

			// DJ_�\�񃌁[�g�ڋq
			setFieldDisableType('custrecord_djkk_rer_customer', 'normal');
			setFieldDisableType('custrecord_djkk_rer_vendor', 'disabled');

		} else {

			setFieldDisableType('custrecord_djkk_rer_vendor', 'disabled');
			setFieldDisableType('custrecord_djkk_rer_customer', 'disabled');
		}
	}
	// DJ_�\�񃌁[�g�w����||DJ_�\�񃌁[�g�ڋq
	if (name == 'custrecord_djkk_rer_vendor'
			|| name == 'custrecord_djkk_rer_customer') {

		// DJ_�����
		nlapiSetFieldValue('custrecord_djkk_entity', nlapiGetFieldValue(name));
	}
}
