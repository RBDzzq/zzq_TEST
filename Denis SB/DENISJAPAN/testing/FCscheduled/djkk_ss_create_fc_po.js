/**
 * DJ_����������
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/07/06     CPC_��
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {
	nlapiLogExecution('debug', 'DJ_���������� Start');
	nlapiLogExecution('debug', 'DJ_����������');
	var dataarray = nlapiGetContext().getSetting('SCRIPT', 'custscript_djkk_cfp_dataarray');
	
	// �A��
	var subsidiary = nlapiGetContext().getSetting('SCRIPT', 'custscript_djkk_cfp_subsidiary');
	nlapiLogExecution('debug', 'dataarray:', dataarray);
	nlapiLogExecution('debug', 'subsidiary:', subsidiary);
	dataarray = eval("(" + dataarray + ")");
	var vendor = dataarray['vendor'];
	var incotermsLocation = nlapiLookupField('vendor', vendor,'custentity_djkk_incoterms_location');//20230301 add by zhou DJ_�C���R�^�[���ꏊ
	var currency = dataarray['currency'];
	var memo = dataarray['memo'];
	//20230629 add by zhou start CH678
	//zhou memo :FC���甭�������쐬����ꍇ�A���F�v���Z�X�ɓ���A���\����ԁB
	var roleValue = dataarray['userRole'];
	var userValue = nlapiGetUser();
	nlapiLogExecution('debug', 'userValue:', userValue);
	nlapiLogExecution('debug', 'roleValue:', roleValue);
	var approvalSearch = nlapiSearchRecord("customrecord_djkk_trans_approval_manage",null,//�g�����U�N�V�������F�Ǘ��\
			[
			   ["isinactive","is","F"], 
			   "AND", 
			   ["custrecord_djkk_trans_appr_obj","anyof",6],
			   "AND",
			   ["custrecord_djkk_trans_appr_subsidiary","anyof",subsidiary],
			   "AND",
			   ["custrecord_djkk_trans_appr_create_role","anyof",roleValue]
			], 
			[
			   new nlobjSearchColumn("custrecord_djkk_trans_appr_create_role"), //�쐬���[��
			   new nlobjSearchColumn("custrecord_djkk_trans_appr1_role"), //��ꏳ�F���[��
			]
			);
	if(!isEmpty(approvalSearch)){
		var createRole = approvalSearch[0].getValue("custrecord_djkk_trans_appr_create_role");//�쐬���[��
		var nextApprRole = approvalSearch[0].getValue("custrecord_djkk_trans_appr1_role");//��ꏳ�F���[��/DJ_���̏��F���[��
	}else {
		throw nlapiCreateError('�V�X�e���G���[','WF�̏d�v�ȏ�񂪎����A���������쐬����Ȃ������B�J���҂ɘA�����āuDJ_�g�����U�N�V�������F�Ǘ��\�v���m�F���Ă�������',true);
	}
	//20230629 add by zhou end
//	if(!isEmpty(memo)&&memo!='undefined'){
//		memo = String(memo);
//		memo = memo.replace(/_+/g,'\n');//(new RegExp(" ","g"),"\n");(/,/g, "_")
//	}
	nlapiLogExecution('debug', 'memo', memo);
	var location = dataarray['location'];
	var creatpoDate = dataarray['creatpoDate'];
	var jsonDate = dataarray['itemList'];
	
	nlapiLogExecution('debug', 'itemList:', jsonDate);
	
	try{
		var poRecord=nlapiCreateRecord('purchaseorder');
		
		// �J�X�^���t�H�[�� :DJ_������_�H�i
		poRecord.setFieldValue('customform', cusform_id_po_food);			
		poRecord.setFieldValue('trandate', creatpoDate);			
		poRecord.setFieldValue('entity', vendor);
		poRecord.setFieldValue('subsidiary', subsidiary);
		poRecord.setFieldValue('currency', currency);
		poRecord.setFieldValue('memo', memo);
		poRecord.setFieldValue('location', location);
		
		poRecord.setFieldValue('custbody_djkk_po_fc_created', 'T');
		/********old*********/
		//20230301 changed by zhou DJ_�C���R�^�[���ꏊ
//		if(isEmpty(poRecord.getFieldValue('custbody_djkk_po_incoterms_location'))){     
//		poRecord.setFieldValue('custbody_djkk_po_incoterms_location', '�C���R�^�[���ꏊ��');	
//	    }
		/********old*********/
		/********new*********/
		if(!isEmpty(incotermsLocation)){	
			poRecord.setFieldValue('custbody_djkk_po_incoterms_location', incotermsLocation);
		}else{
			poRecord.setFieldValue('custbody_djkk_po_incoterms_location', '�C���R�^�[���ꏊ��');	
		}
		/********new*********/
		//end
		var updateArray=new Array();
		//20230629 add by zhou start CH678
		//zhou memo :FC���甭�������쐬����ꍇ�A���F�v���Z�X�ɓ���A���\����ԁB
		if(!isEmpty(approvalSearch)){
			nlapiLogExecution('debug', 'createUser', userValue);
			poRecord.setFieldValue('custbody_djkk_trans_appr_deal_flg','T'); //DJ_���F�����t���O
			poRecord.setFieldValue('custbody_djkk_trans_appr_create_role',createRole);//DJ_�쐬���[��
			poRecord.setFieldValue('custbody_djkk_trans_appr_create_user',userValue); //DJ_�쐬��
			poRecord.setFieldValue('custbody_djkk_trans_appr_next_role',nextApprRole); //DJ_���̏��F���[��
			poRecord.setFieldValue('employee',userValue); //�]�ƈ�
		}
		//20230629 add by zhou end CH678
//		var jsonDate = eval("(" + itemList + ")");
		for (var i = 0; i < jsonDate.length; i++) {
			governanceYield();
		
			// fcid
			var fcid = jsonDate[i]['fcid'];
		
			// �A�C�e��
			var item = jsonDate[i]['item'];
		
			// ����
			var description = jsonDate[i]['description'];

//			// �ꏊ
//			var linelocation = jsonDate[i]['linelocation'];

//			// �d����
//			var linevendor= jsonDate[i]['linevendor'];

			// ������
			var quantity= jsonDate[i]['quantity'];//����̍w������

			// �P��
			var units= jsonDate[i]['units'];

			// �����
			var conversionrate= jsonDate[i]['conversionrate'];//�����
			// conversion
			var conversion= jsonDate[i]['conversion'];//���Z��
			nlapiLogExecution('debug', 'conversion',conversion);
//			// �P�[�X��
//			var cases= jsonDate[i]['cases'];

			// �P��
			var rate= jsonDate[i]['rate'];

			// ���z
			var amount= jsonDate[i]['amount'];

			// �ŋ��R�[�h
			var taxcode= jsonDate[i]['taxcode'];

			// ���z
			var grossamt= jsonDate[i]['grossamt'];

//			// �ʉ�
//			var currency= jsonDate[i]['currency'];

			// ��̗\���
			var expectedreceiptdate= jsonDate[i]['expectedreceiptdate'];

			// ���l
			var memo= jsonDate[i]['memo'];
			if(!isEmpty(memo)&&memo!='undefined'){
				memo = memo.replace(new RegExp("","g"),"\n");
			}
			
			// ��{�P�ʐ���ch549
			var itemunitconversion= jsonDate[i]['itemunitconversion'];
			
			poRecord.selectNewLineItem('item');
			poRecord.setCurrentLineItemValue('item', 'item', item);
			//poRecord.setCurrentLineItemValue('item', 'custcol_djkk_item', item);
			poRecord.setCurrentLineItemValue('item', 'quantity', quantity);//����̍w������
			var nowSoQuantity  = Number(quantity)*Number(conversion)//����̎��ѓ��ɐ�
			nlapiLogExecution('debug', 'nowSoQuantity',nowSoQuantity);
			nlapiLogExecution('debug', 'quantity',quantity);
			nlapiLogExecution('debug', 'conversion',conversion);
			poRecord.setCurrentLineItemValue('item', 'rate',rate);
			poRecord.setCurrentLineItemValue('item', 'taxcode',taxcode);
			poRecord.setCurrentLineItemValue('item', 'location',location);
			poRecord.setCurrentLineItemValue('item', 'description',memo);
			
			poRecord.setCurrentLineItemValue('item', 'targetsubsidiary',subsidiary);
			poRecord.setCurrentLineItemValue('item', 'targetlocation',location);						
			if(!isEmpty(units)&&units!='0'){			
			poRecord.setCurrentLineItemValue('item', 'units',units.split('|')[1]);
			}
//			poRecord.setCurrentLineItemValue('item', 'custcol_djkk_conversionrate',conversionrate);
			poRecord.setCurrentLineItemValue('item', 'expectedreceiptdate',expectedreceiptdate);
			poRecord.setCurrentLineItemValue('item', 'custcol_djkk_conversionrate', itemunitconversion);
			poRecord.commitLineItem('item');
			var fcInQuantity=nlapiLookupField('customrecord_djkk_sc_forecast', fcid, 'custrecord_djkk_sc_fc_add');//���𑍍w������(DJ_IN+))
			if(nowSoQuantity>=fcInQuantity){
				//����̍w������  ��   ���𑍍w������(DJ_IN+)) ���傫���ꍇ
				updateArray.push([fcid,'T']); 
				//nlapiSubmitField('customrecord_djkk_sc_forecast', fcid, 'custrecord_djkk_po_created', 'T');
			}else{
				updateArray.push([fcid,Number(fcInQuantity-nowSoQuantity)]);//�]��̍w������
				//nlapiSubmitField('customrecord_djkk_sc_forecast', fcid, 'custrecord_djkk_sc_fc_add', fcInQuantity-quantity);
			}
		}
		var poid=nlapiSubmitRecord(poRecord,false,true);
		nlapiLogExecution('debug', 'poid:',poid);
		for(var s=0;s<updateArray.length;s++){
			governanceYield();
			var apA=updateArray[s];
			var upId=updateArray[s][0];	
			if(updateArray[s][1]=='T'){
				//nlapiSubmitField('customrecord_djkk_sc_forecast', upId,  ['custrecord_djkk_po_created','custrecord_djkk_sc_fc_add'], ['T','']);
				nlapiSubmitField('customrecord_djkk_sc_forecast', upId, 'custrecord_djkk_sc_fc_add','');
			}else{
				nlapiSubmitField('customrecord_djkk_sc_forecast', upId, 'custrecord_djkk_sc_fc_add', updateArray[s][1]);//���ʍX�V
			}
		}
	}catch(e){
		nlapiLogExecution('debug', 'error:',e);
	}
}
function replace(text)
{
if ( typeof(text)!= "string" )
   text = text.toString() ;

text = text.replace(/,/g, "_") ;

return text ;
}
