/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/09/02     CPC_��
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {
	var dataarray = nlapiGetContext().getSetting('SCRIPT', 'custscript_djkk_wo_shipping_json');
	var locationSearch = nlapiSearchRecord("location",null,
			[
			], 
			[
			   new nlobjSearchColumn("custrecord_djkk_mail","address",null),
			   new nlobjSearchColumn("internalid")
			]
			);
	var mailArr = new Array();
	for(var i = 0 ; i < locationSearch.length ; i++){
		mailArr[locationSearch[i].getValue('internalid')] = locationSearch[i].getValue("custrecord_djkk_mail","address",null);
	}
	var jsonDate = eval("(" + dataarray + ")");
	var locationArray= new Array();
	for (var j = 0; j < jsonDate.length; j++) {
		var locationid = jsonDate[j]['locationid'];
		locationArray.push(locationid);
	}
	locationArray=unique(locationArray);
		
	for(var s=0;s<locationArray.length;s++){
		try{
			governanceYield();
			var locationId=locationArray[s];
			var txt='��ЁA�A�C�e���A�Ǘ��ԍ��i�V���A��/���b�g�ԍ��j�A�ꏊ�A���ʁA�P��\r\n';	
			var woidList=new Array();
		for (var i = 0; i < jsonDate.length; i++) {
			if(jsonDate[i]['locationid']==locationId){						
			var subsidiary = jsonDate[i]['subsidiary'];
			var item = jsonDate[i]['item'];
			var inventorynumber = jsonDate[i]['inventorynumber'];
			var location = jsonDate[i]['location'];
			var quantity = jsonDate[i]['quantity'];
			var unit = jsonDate[i]['unit'];
			woidList.push(jsonDate[i]['woid']);
			txt+=subsidiary+'�A'+item+'�A'+inventorynumber+'�A'+location+'�A'+quantity+'�A'+unit+'\r\n';
			}
		}
		nlapiSendEmail(589, mailArr[locationId], 'DJ_���[�N�I�[�_�[�߯�ݸ�ؽ�', txt, null, null, null, null);
//		for(var wo=0;wo<woidList.length;wo++){
//		nlapiSubmitField('workorder', woidList[wo], 'custbody_djkk_shippinglist_sended', 'T', false);
//		}
		}catch(e){}
	}
}
