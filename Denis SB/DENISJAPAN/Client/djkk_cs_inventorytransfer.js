/**
 * �݌Ɉړ�Client
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/08/16     CPC_��
 *
 */
function popuplmi(){
	var theLink = nlapiResolveURL('SUITELET', 'customscript_djkk_sl_location_move_ins','customdeploy_djkk_sl_location_move_ins');
	theLink+='&inventorytransferid='+nlapiGetRecordId();
	nlExtOpenWindow(theLink, 'newwindow',750, 750, this, false, '�q�Ɉړ��w�����X�g');
	//open(theLink,'_lanedcost','top=150,left=250,width=750,height=750,menubar=no,toolbar=no,location=no,directories=no,status=no,scrollbars=no,resizable=no')
}


