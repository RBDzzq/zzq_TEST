/**
 * ��������UserEvent
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/03/09     CPC_��             �V�K�쐬
 *
 */

//�u�O�����v2
var PAYMENT_CONDIRIONA_MAIBARAI = '2';
//�u������v1
var PAYMENT_CONDIRIONA_DAIHIKI = '1';

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
	
	// ���[���̉�Ў擾
	var roleSubsidiary = getRoleSubsidiary();

	try {
		
		var projectid = request.getParameter('projectid');
		if (!isEmpty(projectid)) {
			// DJ_�v���W�F�N�g
			nlapiSetFieldValue('custbody_djkk_project', projectid);
		}
		
		var requestdayType = nlapiGetFieldValue('subsidiary');
		if(!isEmpty(requestdayType)){
			if(roleSubsidiary == requestdayType && roleSubsidiary == 6){
				//SCETI
				formHiddenTab(form,'custom43txt');
	    	}else if(roleSubsidiary == requestdayType && roleSubsidiary == 7){
	    		//DPKK
	    		formHiddenTab(form,'custom41txt');
	    	}
		}
	} catch (e) {
		nlapiLogExecution('debug', 'USEREVENTBEFORELOAD_ERROR_LINE(54) : ', e);
	}
	
	form.setScript('customscript_jdkk_cs_salesorder');
	if (type == 'view') {
//		if(roleSubsidiary != SUB_NBKK && roleSubsidiary != SUB_ULKK){
//			form.addButton('custpage_receiptmaker', '��̏����','receiptPDF()');
//		}	
		
		//�x������
		var custbody_djkk_payment_conditions = nlapiGetFieldValue('custbody_djkk_payment_conditions');
		//�o�׎w���ς�
		var custbody_djkk_shipping_instructions = nlapiGetFieldValue('custbody_djkk_shipping_instructions')
		var haisouBtnShowFlg = 'T';
		var record = nlapiLoadRecord('salesorder', nlapiGetRecordId());
		
		// �u �O�����ꍇ���L�����s���܂�
		if (custbody_djkk_payment_conditions == PAYMENT_CONDIRIONA_MAIBARAI) {
			// ���������v���z�擾
			var soTotal = nlapiGetFieldValue('total');

			// �O���������v���z�擾
			var customerdepositTotal = 0;
			
			var count = record.getLineItemCount('links')

			for (var i = 0; i < count; i++) {
				record.selectLineItem('links',  i + 1);
				
				// DJ_�a����A�C�e��
				var cusitem = record.getCurrentLineItemValue('item', 'custcol_djkk_custody_item');
				if(cusitem=='T'){
					haisouBtnShowFlg='F';
				}
				if (record.getCurrentLineItemValue('links', 'type') == '�O���'){
					customerdepositTotal += Number(record.getCurrentLineItemValue('links', 'total'));
				}	
			}

			// �O���������v���z�� ���������v���z�ꍇ �z���w���{�^���\��
			if (Number(soTotal) == Number(customerdepositTotal)) {
				haisouBtnShowFlg = 'T';
			}else{
				haisouBtnShowFlg = 'F';
			}
		} 
		
		//�o�׎w���ς݁@���`�F�b�N�ꍇ
		if(custbody_djkk_shipping_instructions == 'T'){
			haisouBtnShowFlg = 'F'
		}

		if(record.getFieldValue('subsidiary')==SUB_NBKK||record.getFieldValue('subsidiary')==SUB_ULKK){
			haisouBtnShowFlg = 'F'
		}
		
		//���׍s�ŁA�݌ɃA�C�e�����݂Ȃ��ꍇ�z���w�����Ȃ�
		var searchInvRst = nlapiSearchRecord("transaction",null,[["internalid","anyof",nlapiGetRecordId()],"AND",["mainline","is","F"],"AND",["item.type","anyof","InvtPart"]],[]);
		
		if(isEmpty(searchInvRst)){
			haisouBtnShowFlg = 'F';
			nlapiSetFieldValue('custbody_djkk_shipping_instructions', 'T')
		}
		
		//add start�^�M���x�z���f    todolistU014 by geng
		var total = nlapiGetFieldValue('total');
		var exchangerate = nlapiGetFieldValue('exchangerate')
		total = Number(total) * Number(exchangerate);
		var custId = nlapiGetFieldValue('entity');
		if(isEmpty(custId)){
			return false;
		}
		
		var custRec = nlapiLoadRecord('customer', custId);
		var custName = custRec.getFieldValue('entityid');
		var custCreateLimit = custRec.getFieldValue('custentity_djkk_credit_limit');
		var custBalance = custRec.getFieldValue('balance');
		var unbilledorders = custRec.getFieldValue('unbilledorders');
		
		if(Number(custCreateLimit) - Number(custBalance) -Number(total) -Number(unbilledorders)  >= 0){
			//�z���w���{�^����\������
			if(haisouBtnShowFlg == 'T'){
			    var soApprStatus = custRec.getFieldValue('custbody_djkk_trans_appr_status');
			    if (soApprStatus && soApprStatus == '2') {
	                form.addButton('custpage_deliveryinstructions', '�z���w��','deliveryinstructionst()');   
			    }
			}
		}
		
		var itemcount = record.getLineItemCount('item')
		var recordStatus=record.getFieldValue('status');
		var payment = nlapiGetFieldValue('custbody_djkk_payment_conditions');//pay 
        var custodyItemFlag=false;
        var itemArray=new Array();
		for (var j = 1; j < itemcount+1; j++) {
			record.selectLineItem('item',  j);
			itemArray.push(record.getCurrentLineItemValue('item', 'item'));
			// DJ_�a����A�C�e��
			if (record.getCurrentLineItemValue('item', 'custcol_djkk_custody_item') == 'T'){
				custodyItemFlag=true;
			}	
		}
		if(custodyItemFlag&&recordStatus!='���F�ۗ�'&&recordStatus!='�z���ۗ�'){
			form.addButton('custpage_custodyitem', 'DJ_�a����݌ɔz��','creatIca();');
		}
		if(recordStatus=='�����ς�'||recordStatus=='�����ۗ�'){
			var itemSearch = nlapiSearchRecord("item",null,
					[
					   ["custitem_djkk_re_object","is","T"], 
					   "AND", 
					   ["internalid","anyof",itemArray]
					], 
					[
					   new nlobjSearchColumn("internalid",null,"GROUP")
					]
					);
		}
		var isRepair=nlapiGetFieldValue('custbody_djkk_estimate_re');
		if(!isEmpty(isRepair)){
			form.addButton('custpage_invoicepdf', '������PDF�o��',"repairPDF('invoice');");
			form.addButton('custpage_deliverypdf', '�[�i��PDF�o��',"repairPDF('delivery');");
			form.addButton('custpage_receiptpdf', '��̏�PDF�o��',"repairPDF('receipt');");
		}		
		// add U415 by sys start
		var status = nlapiGetFieldValue('orderstatus');
		if(status != 'A'){
		    // zheng 20230423 start
	        if(record.getFieldValue('subsidiary') == SUB_SCETI || record.getFieldValue('subsidiary') == SUB_DPKK){
	            form.addButton('custpage_pdfTwo', '�[�i���A���i��̏��A�������o��','pdfSum();');   
	        }
	     // zheng 20230423 end
		}
		
		// add U415 by sys end	
		if(status != 'A' && payment=='2'){
	        form.addButton('custpage_invoiceTranPdf', '�O��������PDF','invoiceTranPdf();');
	    }
	}else{
		form.addButton('custpage_commission', '�萔���v�Z', 'commission();');
		form.addButton('custpage_commission2', '�z�����v�Z', 'commission2();');
		form.addButton('custpage_commissiondelect', '�萔���폜','commissionDelect();');
		form.addButton('custpage_commissiondelect2', '�z�����폜','commissionDelect2();');
	}
	

	//�v���W�F�N�g��\��
	setFieldDisableType('job','hidden')
		
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
	//20220809 add by zhou U732
	if (type == 'create'||type == 'edit'){
		var subsidiary = getRoleSubsidiary();
		var customerLocation  = nlapiGetFieldValue('custbody_djkk_customer_address');
		var destinationLocation  = nlapiGetFieldValue('custbody_djkk_delivery_address');
		if(isEmpty(destinationLocation)&& isEmpty(customerLocation)){
			if(subsidiary == SUB_SCETI||subsidiary == SUB_DPKK){
				var entityId = nlapiGetFieldValue('entity');
				if (!isEmpty(entityId)) {
					var customerSearch = nlapiSearchRecord("customer",null,
							[
							   ["isdefaultbilling","is","T"], 
							   "AND", 
							   ["internalid","anyof",entityId]
							], 
							[
							   new nlobjSearchColumn("custrecord_djkk_address_state","Address",null), 
							   new nlobjSearchColumn("city","Address",null), 
							   new nlobjSearchColumn("address1","Address",null), 
							   new nlobjSearchColumn("address2","Address",null), 
							   new nlobjSearchColumn("address3","Address",null), 
							   new nlobjSearchColumn("addressee","Address",null)
							]
							);
					if(customerSearch != null){
						var addressState = customerSearch[0].getValue("custrecord_djkk_address_state","Address",null);
						var city = customerSearch[0].getValue("city","Address",null);
						var address1 = customerSearch[0].getValue("address1","Address",null);
						var address2 = customerSearch[0].getValue("address2","Address",null);
						var address3 = customerSearch[0].getValue("address3","Address",null);
						var addressee = customerSearch[0].getValue("addressee","Address",null);
						var str = ''
						str += ''+addressState+' '+city+' '+address1+' '+address2+' '+address3+' '+addressee+'';
						nlapiSetFieldValue('custbody_djkk_customer_address', str);
					}
				}
				
				var destinationID = nlapiGetFieldValue('custbody_djkk_delivery_destination');
				if (!isEmpty(destinationID)) {
					var destinationSearch = nlapiSearchRecord("customrecord_djkk_delivery_destination",null,
							[
							   ["internalid","anyof",destinationID]
							], 
							[
							   new nlobjSearchColumn("custrecord_djkk_prefectures"), 
							   new nlobjSearchColumn("custrecord_djkk_municipalities"), 
							   new nlobjSearchColumn("custrecord_djkk_delivery_residence"), 
							   new nlobjSearchColumn("custrecord_djkk_delivery_residence2"),
							]
							);
					if(destinationSearch != null){
						var prefectures = destinationSearch[0].getValue("custrecord_djkk_prefectures");
						var municipalities = destinationSearch[0].getValue("custrecord_djkk_municipalities");
						var deliveryResidence = destinationSearch[0].getValue("custrecord_djkk_delivery_residence");
						var deliveryResidence2 = destinationSearch[0].getValue("custrecord_djkk_delivery_residence2");
						var str2 = ''
						str2 += ''+prefectures+municipalities+deliveryResidence+deliveryResidence2+'';
						nlapiSetFieldValue('custbody_djkk_delivery_address', str2);
					}
				}
			}
		}
	}
	//end
	var count = nlapiGetLineItemCount('item');
	for (var i = 1; i < count + 1; i++) {
		nlapiSelectLineItem('item', i);
		 if (nlapiGetCurrentLineItemValue('item', 'itemtype') != 'EndGroup') {
		var locationId = nlapiGetFieldValue('location');
		var location = nlapiGetCurrentLineItemValue('item', 'location');
		
		// DJ_�a����A�C�e��
		var cusitem = nlapiGetCurrentLineItemValue('item', 'custcol_djkk_custody_item');
		if(cusitem=='T'){
			// DJ_�o�׎w���ς�(�EU003:�a����݌ɃA�C�e�����`�F�b�N����ꍇ�A�z���w���{�^���͗v��Ȃ��F�������M�͗v��Ȃ��ł��B)
			nlapiSetFieldValue('custbody_djkk_shipping_instructions', 'T');
		}
		if (!isEmpty(locationId) && isEmpty(location)) {
			nlapiSetCurrentLineItemValue('item', 'location', locationId);
			nlapiCommitLineItem('item');
		}
		 }
	}

	// DJ�}�Ԏ����̔�
	var custrecord_djkk_now_number = nlapiGetFieldValue("custbody_djkk_branch_number");
	if (isEmpty(custrecord_djkk_now_number)) {
		nlapiSetFieldValue("custbody_djkk_branch_number", getDjkkNowNumber('�̔��}��'));
	}

	if (type == 'create') {
		try{
			var userid=nlapiGetUser();
			if(!isEmpty(userid)&&userid!='-4'&&userid!=-4){
				// DJ_�쐬�� �������̂ݐݒ肵�Ă��� ��������ʂɎ����A�g���܂�
				nlapiSetFieldValue('custbody_djkk_input_person', userid);
			}
		}catch(e){
			nlapiLogExecution('debug', 'USEREVENTBEFORESUBMIT_ERROR_LINE(295):',e);
		}
	}
	
	//10 19�@�P�������z�̕ύX�����钍������ΏۂɁA�u�O���V�X�e���t�B�[�h�o�b�N�Ώۃt���O�O�v��T�ɍX�V�B
	//�H�i�̂݁@3�@NBKK�@�@4�@ULKK
	var sub = nlapiGetFieldValue('subsidiary')
	if(type == 'edit'){
		if(sub == SUB_NBKK || sub == SUB_ULKK){
			var preTotal = nlapiLookupField('salesorder', nlapiGetRecordId(), 'total');
			var nowTotal = nlapiGetFieldValue('total')
			if(Number(preTotal) != Number(nowTotal)){
				nlapiSetFieldValue('custbody_djkk_exsystem_feedback_flg', 'T');
			}
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
	
	if(type=='delete'){
		return null;
	}else{
		// DJ_�x������
		var custbody_djkk_payment_conditions = nlapiGetFieldValue('custbody_djkk_payment_conditions');
		// DJ_�[���񓚎������M
		var custbody_djkk_delivery_replyauto = nlapiGetFieldValue('custbody_djkk_delivery_replyauto');
		// DJ_�[���񓚎������M
		var custbody_djkk_delivery_replyauto_flg = nlapiGetFieldValue('custbody_djkk_delivery_replyauto_flg');
		//�[�i��
		var custbody_djkk_delivery_destination =  nlapiGetFieldValue('custbody_djkk_delivery_destination');
		
		var count = nlapiGetLineItemCount('item');
		for (var i = 1; i < count + 1; i++) {
			nlapiSelectLineItem('item', i);
			 if (nlapiGetCurrentLineItemValue('item', 'itemtype') != 'EndGroup') {
			var location = nlapiGetCurrentLineItemValue('item', 'location');
			// DJ_�a����A�C�e��
			var cusitem = nlapiGetCurrentLineItemValue('item', 'custcol_djkk_custody_item');
			if(cusitem=='T'){
				// DJ_�o�׎w���ς�(�EU003:�a����݌ɃA�C�e�����`�F�b�N����ꍇ�A�󒍔[���񓚎������M���v��Ȃ��B�B)
				custbody_djkk_delivery_replyauto='F';
			}
			 }
		}
		
		//U214
		// ���[�����M�@�\ �O���������҂����[�� 
		//�H�i����ύX���ALS�͐V�K�쐬���@���M����
	    var id=nlapiGetRecordId();
	    var sub = nlapiGetFieldValue('subsidiary');
	    var totalAmt = nlapiGetFieldValue('total');
	    
		if ( (sub == SUB_NBKK ||sub == SUB_ULKK ) || (type =='create' && sub == SUB_SCETI ||sub == SUB_DPKK  )) {
			// �x�������́u�O�����v2�ꍇ
			if (custbody_djkk_payment_conditions == PAYMENT_CONDIRIONA_MAIBARAI) {
				var title = '';
				var body = '';
				var mail = mail_address_temp;
				// ���[�����M����
				// ���M�� �A�^�C�g���A�{�f�B�s���̂��� �e�X�g���e��ݒ肵�܂��B
				//���M�����Ȃ��ꍇ���M���܂���
				var from = nlapiGetUser();
				if(isEmpty(from)){
					from = nlapiGetFieldValue('salesrep');
				}
				var maeuketsukeAMT = 0;
				var customerdepositSearch = nlapiSearchRecord("customerdeposit",null,
						[
						   ["voided","is","F"], 
						   "AND", 
						   ["type","anyof","CustDep"], 
						   "AND", 
						   ["createdfrom","anyof",id]
						], 
						[
						   new nlobjSearchColumn("amount",null,"SUM")
						]
						);
				if(!isEmpty(customerdepositSearch)){
					maeuketsukeAMT = customerdepositSearch[0].getValue("amount",null,"SUM");
				}
				//�O����̍��v���z�@���@�󒍂̋��z��@�o������֓����҂��̃��[�����o���܂��B
				if(maeuketsukeAMT < totalAmt){
					if(!isEmpty(from) && from > 0 ){
						sendEmail(from, mail, title, body,id, 1,null);
					}
					nlapiSubmitField('salesorder', id, 'custbody_djkk_customerdeposit_sendmail', 'T', false);
				}
			}
		}

		var custId = nlapiGetFieldValue('entity');
		if(isEmpty(custId)){
			return false;
		}
		
		var custRec = nlapiLoadRecord('customer', custId);	
		var subsidiary = custRec.getFieldValue('subsidiary');
		
		// DJ_�[���񓚎������M �`�F�b�N��������ꍇ���M���܂��B
		if(subsidiary == '6' || subsidiary == '7'){
			if (custbody_djkk_delivery_replyauto == 'T' && custbody_djkk_delivery_replyauto_flg != 'T') {
		
				// ���[�����M����
				var title = '';
				var body = nlapiGetFieldValue('custbody_djkk_delivery_replyauto_memo');
				var mail = nlapiGetFieldValue('custbody_djkk_delivery_replyauto_mail');
				var fax = nlapiGetFieldValue('custbody_djkk_delivery_replyauto_fax');
		
				// �t�@�C���擾
				var transactionSearch = getSearchResults("transaction", null, [ [
						"internalid", "anyof", id ] ],
						[ new nlobjSearchColumn("internalid", "file", null) ]);
		
				var arrFile = null;
				if (!isEmpty(transactionSearch)) {
					arrFile = new Array();
					for (var i = 0; i < transactionSearch.length; i++) {
						var fileid = transactionSearch[i].getValue("internalid","file")
						if (arrFile.indexOf(fileid) == -1 && !isEmpty(fileid) && fileid != -1) {
							arrFile.push(fileid);
						}
					}
				}
						
				// ���M�� �A�^�C�g���A�{�f�B�s���̂��� �e�X�g���e��ݒ肵�܂��B
				var from = nlapiGetUser();
				if(!isEmpty(mail) && !isEmpty(from) && from > 0){
					sendEmail(from, mail, title, body, id,4,arrFile);
				}
				if(!isEmpty(fax)  && !isEmpty(from) && from > 0){
					sendFax(from, fax, title, body, id,4,arrFile);
				}
				nlapiSubmitField('salesorder', id, 'custbody_djkk_delivery_replyauto_flg', 'T', false);
			}
		}
	}
		
	var salesorderRecord = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
    var headerLocation=salesorderRecord.getFieldValue('location');
	var count = salesorderRecord.getLineItemCount('item');
	
	var itemIdAry = [];
	var perunitquantityObj = {};
	for(var x = 1; x < count+1; x++){
		 if (salesorderRecord.getLineItemValue('item', 'itemtype', x) != 'EndGroup') {
		itemIdAry.push(salesorderRecord.getLineItemValue('item', 'item', x));
		 }
	}
	
	if(itemIdAry.length > 0){
		var itemPerunitquantitySearch = nlapiSearchRecord("item",null,
				[
				   ["internalid","anyof",itemIdAry]
				], 
				[
				   new nlobjSearchColumn("internalid"), 
				   new nlobjSearchColumn("custitem_djkk_perunitquantity")
				]
		);
		
		if(itemPerunitquantitySearch != null){
		    // CH798 add by zzq 20230815 start
		    for(var p = 0;p<itemPerunitquantitySearch.length;p++){
		        var internalidValue = itemPerunitquantitySearch[p].getValue("internalid");
	            var perunitquantityValue = itemPerunitquantitySearch[p].getValue("custitem_djkk_perunitquantity");
	            perunitquantityObj[internalidValue] = perunitquantityValue;
		    }
//			var internalidValue = itemPerunitquantitySearch[0].getValue("internalid");
//			var perunitquantityValue = itemPerunitquantitySearch[0].getValue("custitem_djkk_perunitquantity");
//			
//			perunitquantityObj[internalidValue] = perunitquantityValue;
		 // CH798 add by zzq 20230815 end
		}
	}
	//add by zzq ch677 20230703 start 
	var itemArr=[];
	for(var k = 1; k < count+1; k++){
	    var itemId = salesorderRecord.getLineItemValue('item', 'item', k);
	    if(itemArr.indexOf(itemId)<0){
	        itemArr.push(itemId);
	    }
	}
	nlapiLogExecution('debug', 'itemArr', JSON.stringify(itemArr));
	var itemSearch = nlapiSearchRecord("item",null,
	        [
	           ["internalid","anyof",itemArr], 
	           "AND", 
	           ["isinactive","is","F"]
	        ], 
	        [
	           new nlobjSearchColumn("internalid"), 
	           new nlobjSearchColumn("unitstype")
	        ]
	        );
	var unitstypeObj = {};
    if(!isEmpty(itemSearch)){
        for(var j=0;j<itemSearch.length;j++){
            var itemId = itemSearch[j].getValue("internalid");
            var unitstype = itemSearch[j].getValue("unitstype");
            unitstypeObj[itemId] = unitstype;
        }
    }
    nlapiLogExecution('debug', 'unitstypeObj', JSON.stringify(unitstypeObj));
  //add by zzq ch677 20230703 end
	for(var i = 1; i < count+1; i++){
		if (salesorderRecord.getLineItemValue('item', 'itemtype', i) != 'EndGroup') {
		var lineLocation = salesorderRecord.getLineItemValue('item', 'location', i);
		if(isEmpty(lineLocation)){
			salesorderRecord.setLineItemValue('item', 'location', i, headerLocation);
		}
		//add by zzq ch677 20230703 start
		var itemId = salesorderRecord.getLineItemValue('item', 'item', i);
//		var unitname = salesorderRecord.getLineItemText('item', 'units', i);
		var unitId = salesorderRecord.getLineItemValue('item', 'units', i);
		var crVal = '';
		if (!isEmpty(unitId)) {
		    if (unitstypeObj[itemId]) {
		        crVal = getConversionrateAbbreviationNew(unitstypeObj[itemId], unitId);
		    }
		}
		// DJ_����
//		var perunitQuantity = !isEmpty(unitname) ? getConversionrateAbbreviation(unitname) : '';
		var perunitQuantity = !isEmpty(crVal) ? crVal : '';
		
//		var itemId = salesorderRecord.getLineItemValue('item', 'item', i);
		//add by zzq ch677 20230703 end
		var quantity = salesorderRecord.getLineItemValue('item', 'quantity', i);
		
		if(!isEmpty(quantity) && !isEmpty(perunitQuantity) && !isEmpty(itemId)){
			var itemPerunitQuantity = perunitquantityObj[itemId];
			if(!isEmpty(itemPerunitQuantity)){
				// DJ_��{����
				var conversionRate = quantity * perunitQuantity;
				
				// DJ_�P�[�X��
				var floor = Math.floor(conversionRate / itemPerunitQuantity);
				var caseQuantity = floor > 0 ? floor : (conversionRate / itemPerunitQuantity).toFixed(2);
				
				// DJ_�o����
				var djQuantity = (conversionRate - caseQuantity * itemPerunitQuantity).toFixed(2);
				
				salesorderRecord.setLineItemValue('item', 'custcol_djkk_conversionrate', i, conversionRate);
				salesorderRecord.setLineItemValue('item', 'custcol_djkk_casequantity', i, caseQuantity);
				salesorderRecord.setLineItemValue('item', 'custcol_djkk_quantity', i, djQuantity);
				salesorderRecord.setLineItemValue('item', 'custcol_djkk_perunitquantity', i, itemPerunitQuantity);
				salesorderRecord.commitLineItem('item');
			}
		}
	}
	}
	nlapiSubmitRecord(salesorderRecord, false, true);
}