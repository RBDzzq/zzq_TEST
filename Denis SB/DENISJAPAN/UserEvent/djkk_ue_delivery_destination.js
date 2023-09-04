/**
 * DJ_�[�i��UE
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Feb 2022     sys
 *
 */

/**
 * �ŏ�����
 */
var TheMinimumdigits = 4;

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm}
 *            form Current form
 * @param {nlobjRequest}
 *            request Request object
 * @returns {Void}
 */
function userEventBeforeLoad(type, form, request) {
	form.setScript('customscript_djkk_cs_delivery_d');

}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Operation types: create, edit, delete, xedit approve, reject,
 *            cancel (SO, ER, Time Bill, PO & RMA only) pack, ship (IF)
 *            markcomplete (Call, Task) reassign (Case) editforecast (Opp,
 *            Estimate)
 * @returns {Void}
 */
function userEventBeforeSubmit(type) {
	if (type == 'create' || type == 'copy') {
		var customerID = nlapiGetFieldValue('custrecord_djkk_customer');
		if (!isEmpty(customerID)) {

			var customerRecord = nlapiLookupField('customer', customerID, [
					'entityid', 'custentity_djkk_delivery_destination_num' ]);
			var numberIng = customerRecord.custentity_djkk_delivery_destination_num;
			var entityid = customerRecord.entityid;
			if (isEmpty(numberIng)) {
				numberIng = 0;
			}
			numberIng++;
			var numberd = entityid
					+ '-'
					+ prefixInteger(parseInt(numberIng),
							parseInt(TheMinimumdigits));
			;
			nlapiSetFieldValue('custrecord_djkk_delivery_code', numberd, false,
					true);
			// 20221226�����start CH236 �����̔Ԃ�ǉ�
			// DJ_�[�i�於�O
			var custrecordname = nlapiGetFieldValue('custrecorddjkk_name');
			nlapiSetFieldValue('name', numberd + ' ' + custrecordname, false,
					true);
			// end
			nlapiSubmitField('customer', customerID,
					'custentity_djkk_delivery_destination_num', numberIng);

		}
	}
	// �o�O�Ή�
	if (type != 'delete') {
		// DJ_�[�i��d�b�ԍ�
		var phoneNumber = nlapiGetFieldValue('custrecord_djkk_delivery_phone_number');
		nlapiLogExecution('debug','phoneNumber',phoneNumber);
		if(phoneNumber){
			// DJ_�[�i��d�b�ԍ�TEXT
			var phoneText = nlapiGetFieldValue('custrecord_djkk_delivery_phone_text');
			nlapiLogExecution('debug','phoneText',phoneText);
			phoneNumber = stripPhoneCode(phoneNumber.toString());
			nlapiLogExecution('debug','phoneNumber1',phoneNumber);
			if(phoneText != phoneNumber || !phoneText){
				nlapiSetFieldValue('custrecord_djkk_delivery_phone_text', phoneNumber, false,true);
			}
		}else{
			nlapiSetFieldValue('custrecord_djkk_delivery_phone_text', '', false,true);
		}
	}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Operation types: create, edit, delete, xedit, approve,
 *            cancel, reject (SO, ER, Time Bill, PO & RMA only) pack, ship (IF
 *            only) dropship, specialorder, orderitems (PO only) paybills
 *            (vendor payments)
 * @returns {Void}
 */
function userEventAfterSubmit(type) {
	if (type != 'delete') {//20230412 add by zhou 
		var record = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
		var code = record.getFieldValue("custrecord_djkk_delivery_code");
		if (type == 'create') {
			var customerID = record.getFieldValue('custrecord_djkk_customer');
			if (!isEmpty(customerID) && isEmpty(code)) {

				var customerRecord = nlapiLookupField('customer', customerID,
						[ 'entityid',
								'custentity_djkk_delivery_destination_num' ]);
				var numberIng = customerRecord.custentity_djkk_delivery_destination_num;
				var entityid = customerRecord.entityid;
				if (isEmpty(numberIng)) {
					numberIng = 0;
				}
				numberIng++;
				var numberd = entityid
						+ '-'
						+ prefixInteger(parseInt(numberIng),
								parseInt(TheMinimumdigits));
				;
				record.setFieldValue('custrecord_djkk_delivery_code', numberd);
				code = numberd;
				// 20221226�����start CH236 �����̔Ԃ�ǉ�
				// end
				nlapiSubmitField('customer', customerID,
						'custentity_djkk_delivery_destination_num', numberIng);
			}
		}

		var newname = record.getFieldValue("custrecorddjkk_name");// name
		var code_name = code + " " + newname;
		if (code_name != record.getFieldValue("name")) {
			record.setFieldValue('name', code_name);
			nlapiSubmitRecord(record, false, true);
		}
		// �o�O�Ή�
		var record2 = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
		// DJ_�[�i��d�b�ԍ�
		var phoneNumber = record2.getFieldValue('custrecord_djkk_delivery_phone_number');
//		if(phoneNumber){
//			nlapiLogExecution('debug','phoneNumber3',phoneNumber);
//			// DJ_�[�i��d�b�ԍ�TEXT
//			var phoneText = record2.getFieldValue('custrecord_djkk_delivery_phone_text');
//			nlapiLogExecution('debug','phoneText3',phoneText);
//			phoneNumber = stripPhoneCode(phoneNumber.toString());
//			nlapiLogExecution('debug','phoneNumber4',phoneNumber);
//			if(phoneText != phoneNumber || !phoneText){
//				record2.setFieldValue('custrecord_djkk_delivery_phone_text', phoneNumber);
//				nlapiSubmitRecord(record2, false, true);
//			}
//		}
	}
}
// �o�O�Ή�
function stripPhoneCode(phoneNumber) {
	var strippedNumber = phoneNumber;
//	//���ׂĂ̔񐔎��������폜
//	var strippedNumber = phoneNumber.replace(/\D+/g, '');
//		
//	//�d�b�ԍ����u+�v�Ŏn�܂�ꍇ�́A���3�����폜
//	if (phoneNumber.startsWith('+')) {
//		strippedNumber = strippedNumber.slice(2);
//	}
		
	var fdStart = phoneNumber.indexOf("+");
	nlapiLogExecution('debug','fdStart',fdStart);
	if(fdStart == 0){
		strippedNumber = phoneNumber.substring(3).toString();
	}
	return strippedNumber;
}