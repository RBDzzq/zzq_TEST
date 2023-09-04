/**
 *前受金のUserEvent
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/05/26     CPC_苑
 *
 */

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
           try{
        	   var soid=nlapiGetFieldValue('salesorder');
        	   if(!isEmpty(soid)){
        	   var pjid=nlapiLookupField('salesorder', soid, 'custbody_djkk_project');
        	   nlapiSetFieldValue('custbody_djkk_project', pjid, false, true);
        	   }
           }catch(e){
        	   nlapiLogExecution('debug', e);
           }
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
	// メール送信機能

		var title = '';
		var body = '';
		
		//注文書取得
		var so = nlapiGetFieldValue('salesorder');
		if (!isEmpty(so)){
		if(nlapiGetFieldValue('payment')>0 && nlapiLookupField('salesorder', so, 'custbody_djkk_exsystem_opc_flg')!='T'){
			
			//DJ_前払金受領済フラグ更新
			nlapiSubmitField('salesorder', so, 'custbody_djkk_exsystem_opc_flg', 'T');
		}
		}	
		var sendFlg = nlapiGetFieldValue('custbody_djkk_customs_manager');

		var sub = nlapiGetFieldValue('subsidiary');
		// LS場合のみ対応　連結内部ID固定値2 5
		nlapiLogExecution('DEBUG', '連結', sub);
		nlapiLogExecution('DEBUG', '送信フラグ', sendFlg);
		nlapiLogExecution('DEBUG', 'SO', so);
		if (!isEmpty(so)&& !isEmpty(sendFlg) && (sub ==  SUB_SCETI|| sub == SUB_DPKK)) {
			if(sendFlg !='T'){
				var soUser=nlapiLookupField('salesorder', so, ['salesrep','custbody_djkk_customs_manager']);
				nlapiLogExecution('DEBUG', '送信先', soUser);
				//従業員取得
				var employee = soUser.salesrep;
				if (!isEmpty(employee)) {
					//メール取得
					var eamil = nlapiLookupField('employee', employee, 'email');
					if (!isEmpty(eamil)) {
					
						nlapiLogExecution('DEBUG', '送信先メール', eamil);
						// メール送信する
						sendEmail(nlapiGetUser(), eamil, title, body,nlapiGetFieldValue('id'),3,null);
						nlapiSubmitField('customerdeposit', nlapiGetRecordId(), 'custbody_djkk_customs_manager', 'T');
					}
				}
			}
		}
}
