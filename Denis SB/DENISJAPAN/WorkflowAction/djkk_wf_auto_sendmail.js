/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 May 2023     10046
 *
 */

/**
 * @returns {Void} Any or no return value
 */
function workflowAction() {
	var wftype=nlapiGetContext().getSetting('SCRIPT','custscript_djkk_asm_type');
	var recordTypeText=nlapiGetContext().getSetting('SCRIPT','custscript_djkk_asm_recordtypetext');
	var recordType=nlapiGetContext().getSetting('SCRIPT','custscript_djkk_asm_recordtype');
	var recordNumber=nlapiGetContext().getSetting('SCRIPT','custscript_djkk_asm_recordnumber');
	var recordId=nlapiGetContext().getSetting('SCRIPT','custscript_djkk_asm_recordid');
	var body=nlapiGetContext().getSetting('SCRIPT','custscript_djkk_asm_body');
	var to=nlapiGetContext().getSetting('SCRIPT','custscript_djkk_asm_to');
	var loginUser=nlapiGetContext().getSetting('SCRIPT','custscript_djkk_asm_loginuser');
	var loginUserRole = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_asm_role');
	var createUser = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_asm_create_user');
	
	var cc=new Array();
	if(recordType=='item'){
		recordType=nlapiLookupField('item', recordId, 'recordtype');
	}
	if (isEmpty(to)&&!isEmpty(createUser)&&!isEmpty(loginUserRole)) {
		to = [];
		var employeeSearch = nlapiSearchRecord("employee", null, 
				[ 
                  ["internalid","noneof",createUser], 
                  "AND", 
				  [ "role","anyof", loginUserRole ] 
				  ],[ 
				  new nlobjSearchColumn("internalid", null, "GROUP").setSort(false) 
				  ]);
		if (!isEmpty(employeeSearch)) {
			for (var i = 0; i < employeeSearch.length; i++) {
//				if (i == 0) {
//					to = employeeSearch[i].getValue("internalid", null, "GROUP");
//				} else {
//					cc.push(employeeSearch[i].getValue("internalid", null, "GROUP"));
//				}
				to.push(employeeSearch[i].getValue("internalid", null, "GROUP"));
			}
		}
	}
	

	nlapiLogExecution('debug', 'wftype', wftype);
	nlapiLogExecution('debug', 'recordTypeText', recordTypeText);
	nlapiLogExecution('debug', 'recordType', recordType);
	nlapiLogExecution('debug', 'recordNumber', recordNumber);
	nlapiLogExecution('debug', 'recordId', recordId);
	nlapiLogExecution('debug', 'body', body);
	nlapiLogExecution('debug', 'to', to);
	nlapiLogExecution('debug', 'loginUser', loginUser);
	nlapiLogExecution('debug', 'loginUserRole', loginUserRole);
	nlapiLogExecution('debug', 'createUser', createUser);
	nlapiLogExecution('debug', 'cc', cc);
	if(isEmpty(recordNumber)||recordNumber=='null'||recordNumber=='undefined'){
		recordNumber='';
	}
	approvalAutoSendMail(wftype,recordTypeText,recordType,recordNumber,recordId,body,loginUser,to,cc)
}


/**���[�N�t���[���[�����M
 * 
 * @param {String} wftype :1,2,3,4
 * @param {String} recordTypeText �g�����U�N�V������ނ̃e�L�X�g
 * @param {String} recordType �g�����U�N�V������� �}�X�^�����ł� 
 * @param {String} recordNumber �h�L�������g�ԍ�
 * @param {String} recordId �g�����U�N�V��������ID
 * @param {String} body ���e
 * @param {String} loginUser user
 * @param {String} to ��M��
 * @param {String} cc CC
 * @returns {Void}
 */
function approvalAutoSendMail(wftype,recordTypeText,recordType,recordNumber,recordId,body,loginUser,to,cc){
	
	var title='';
	var bodyText='';
	var theLink ='';
	var records = new Object();
	/*  
	 * 1/���߂��̏ꍇ
	 * 
	 *�����F��NetSuite�y�i�g�����U�N�V������� �}�X�^�����ł��j�h�L�������g�ԍ��z �o�^���߂�
	 *���e�F���L�̏C�����K�v�ł��B�y�C���˗��̃R�����g�z�\��
	 *�C����ɍđ��M���������B
	 *�����N�FNetSuite���ł̂��̋L�^�ւ̃A�N�Z�X
	 */
	if(wftype=='1'){
		title+='��NetSuite ���߂� : �y�i';
		title+=''+recordTypeText+'�j';
		title+=''+recordNumber;
		title+='�z';
		
		bodyText+='���L�̏C�����K�v�ł��B<br />';
		if(!isEmpty(body)){	
			bodyText+='�y'+body+'�z<br />';
	        }
		
		bodyText+='�C����ɍđ��M���������B<br />';
	}
	
	/*
	 * 2/�p���̏ꍇ
	 * 
	 * �����F�INetSuite�o�^�p���y�i�g�����U�N�V������� �}�X�^�����ł��j�h�L�������g�ԍ��z
	 * ���e�F�y�p�����R�̃R�����g�z�\��
	 * �����N�FNetSuite���ł̂��̋L�^�ւ̃A�N�Z�X
	 */
	
	if (wftype == '2') {

		title+='�INetSuite�p�� : �y�i';
		title+=''+recordTypeText+'�j';
		title+=''+recordNumber;
		title+='�z';
        if(!isEmpty(body)){	
		bodyText+='�y'+body+'�z<br />';
        }
	}
	
	/*
	 * 3/�A�N�e�B�x�[�V������̏ꍇ 
	 * 
	 * �����F��NetSuite�o�^�����ς݁y�i�g�����U�N�V������� �}�X�^�����ł��j�h�L�������g�ԍ��z 
	 * ���e�F-
	 * �����N�FNetSuite���ł̂��̋L�^�ւ̃A�N�Z�X
	 */
	if (wftype == '3') {

		title+='��NetSuite�ŏI���F�� : �y�i';
		title+=''+recordTypeText+'�j';
		title+=''+recordNumber;
		title+='�z';
	}
	
	/*
	 * 4/���F���肢�̏ꍇ
	 * 
	 * �����F��NetSuite���F���肢�y�i�g�����U�N�V������� �}�X�^�����ł��j�h�L�������g�ԍ��z 
	 * ���e�F���L�̏��F���K�v�ł��B
	 * �����N�FNetSuite���ł̂��̋L�^�ւ̃A�N�Z�X
	 */
	if (wftype == '4') {

		title+='��NetSuite���F���肢 : �y�i';
		title+=''+recordTypeText+'�j';
		title+=''+recordNumber;
		title+='�z';
		bodyText+='���L�̏��F���K�v�ł��B<br />';
		
	}
	nlapiLogExecution('debug', 'recordType='+recordType,'recordId='+recordId);
	
	//���|��p�i�����ו���ʂփ����N�j
	if(recordType == 'customrecord_djkk_landed_cost'){
		var inboundshipmentSearch = nlapiSearchRecord("inboundshipment", null, 
				[ 
				  [ "shipmentnumber","anyof", recordNumber ] 
				  ],[ 
				  new nlobjSearchColumn("internalid", null, "GROUP").setSort(false) 
				  ]);
		if(!isEmpty(inboundshipmentSearch)){//changed by song add 0531
			inboundshipmentId = inboundshipmentSearch[0].getValue("internalid", null, "GROUP");
			theLink = nlapiResolveURL('RECORD','inboundshipment',inboundshipmentId, 'VIEW');
		}
	}else{
		theLink = nlapiResolveURL('RECORD',recordType,recordId, 'VIEW');
	}
	nlapiLogExecution('debug', 'theLink',theLink);
	bodyText+='<a href="'+URL_HEAD+theLink+'">�����N�FNetSuite���ł̂��̋L�^�ւ̃A�N�Z�X</a>';
	
	if(recordType.indexOf('customrecord')>-1){
		records['recordtype'] = recordType;
		records['record'] = recordId;
	}else if(recordType.indexOf('item')>-1){
		
	}else if(recordType=='customer'||recordType=='vendor'){
		records['entity'] = recordId;
	}
	else{
		records['transaction'] = recordId;
		
	}
	nlapiLogExecution('debug', 'loginUser',loginUser);
	nlapiLogExecution('debug', 'to',to);
	nlapiLogExecution('debug', 'title',title);
	nlapiLogExecution('debug', 'bodyText',bodyText);
	nlapiLogExecution('debug', 'cc',cc);
	nlapiLogExecution('debug', 'records[recordtype]',records['recordtype']);
	nlapiLogExecution('debug', 'records[record]',records['record']);
	nlapiLogExecution('debug', 'records[entity]',records['entity']);
	nlapiLogExecution('debug', 'records[transaction]',records['transaction']);
	nlapiSendEmail(loginUser, to, title, bodyText,null,null,records);
	nlapiLogExecution('debug', 'afterSendMali');
}
