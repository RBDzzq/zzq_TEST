/**
 * DJ_発注書入力
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/07/06     CPC_苑
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {
	nlapiLogExecution('debug', 'DJ_発注書入力 Start');
	nlapiLogExecution('debug', 'DJ_発注書入力');
	var dataarray = nlapiGetContext().getSetting('SCRIPT', 'custscript_djkk_cfp_dataarray');
	
	// 連結
	var subsidiary = nlapiGetContext().getSetting('SCRIPT', 'custscript_djkk_cfp_subsidiary');
	nlapiLogExecution('debug', 'dataarray:', dataarray);
	nlapiLogExecution('debug', 'subsidiary:', subsidiary);
	dataarray = eval("(" + dataarray + ")");
	var vendor = dataarray['vendor'];
	var incotermsLocation = nlapiLookupField('vendor', vendor,'custentity_djkk_incoterms_location');//20230301 add by zhou DJ_インコターム場所
	var currency = dataarray['currency'];
	var memo = dataarray['memo'];
	//20230629 add by zhou start CH678
	//zhou memo :FCから発注書を作成する場合、承認プロセスに入り、未申請状態。
	var roleValue = dataarray['userRole'];
	var userValue = nlapiGetUser();
	nlapiLogExecution('debug', 'userValue:', userValue);
	nlapiLogExecution('debug', 'roleValue:', roleValue);
	var approvalSearch = nlapiSearchRecord("customrecord_djkk_trans_approval_manage",null,//トランザクション承認管理表
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
			   new nlobjSearchColumn("custrecord_djkk_trans_appr_create_role"), //作成ロール
			   new nlobjSearchColumn("custrecord_djkk_trans_appr1_role"), //第一承認ロール
			]
			);
	if(!isEmpty(approvalSearch)){
		var createRole = approvalSearch[0].getValue("custrecord_djkk_trans_appr_create_role");//作成ロール
		var nextApprRole = approvalSearch[0].getValue("custrecord_djkk_trans_appr1_role");//第一承認ロール/DJ_次の承認ロール
	}else {
		throw nlapiCreateError('システムエラー','WFの重要な情報が失われ、発注書が作成されなかった。開発者に連絡して「DJ_トランザクション承認管理表」を確認してください',true);
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
		
		// カスタムフォーム :DJ_発注書_食品
		poRecord.setFieldValue('customform', cusform_id_po_food);			
		poRecord.setFieldValue('trandate', creatpoDate);			
		poRecord.setFieldValue('entity', vendor);
		poRecord.setFieldValue('subsidiary', subsidiary);
		poRecord.setFieldValue('currency', currency);
		poRecord.setFieldValue('memo', memo);
		poRecord.setFieldValue('location', location);
		
		poRecord.setFieldValue('custbody_djkk_po_fc_created', 'T');
		/********old*********/
		//20230301 changed by zhou DJ_インコターム場所
//		if(isEmpty(poRecord.getFieldValue('custbody_djkk_po_incoterms_location'))){     
//		poRecord.setFieldValue('custbody_djkk_po_incoterms_location', 'インコターム場所無');	
//	    }
		/********old*********/
		/********new*********/
		if(!isEmpty(incotermsLocation)){	
			poRecord.setFieldValue('custbody_djkk_po_incoterms_location', incotermsLocation);
		}else{
			poRecord.setFieldValue('custbody_djkk_po_incoterms_location', 'インコターム場所無');	
		}
		/********new*********/
		//end
		var updateArray=new Array();
		//20230629 add by zhou start CH678
		//zhou memo :FCから発注書を作成する場合、承認プロセスに入り、未申請状態。
		if(!isEmpty(approvalSearch)){
			nlapiLogExecution('debug', 'createUser', userValue);
			poRecord.setFieldValue('custbody_djkk_trans_appr_deal_flg','T'); //DJ_承認処理フラグ
			poRecord.setFieldValue('custbody_djkk_trans_appr_create_role',createRole);//DJ_作成ロール
			poRecord.setFieldValue('custbody_djkk_trans_appr_create_user',userValue); //DJ_作成者
			poRecord.setFieldValue('custbody_djkk_trans_appr_next_role',nextApprRole); //DJ_次の承認ロール
			poRecord.setFieldValue('employee',userValue); //従業員
		}
		//20230629 add by zhou end CH678
//		var jsonDate = eval("(" + itemList + ")");
		for (var i = 0; i < jsonDate.length; i++) {
			governanceYield();
		
			// fcid
			var fcid = jsonDate[i]['fcid'];
		
			// アイテム
			var item = jsonDate[i]['item'];
		
			// 説明
			var description = jsonDate[i]['description'];

//			// 場所
//			var linelocation = jsonDate[i]['linelocation'];

//			// 仕入先
//			var linevendor= jsonDate[i]['linevendor'];

			// 注文数
			var quantity= jsonDate[i]['quantity'];//今回の購入数量

			// 単位
			var units= jsonDate[i]['units'];

			// 入り目
			var conversionrate= jsonDate[i]['conversionrate'];//入り目
			// conversion
			var conversion= jsonDate[i]['conversion'];//換算率
			nlapiLogExecution('debug', 'conversion',conversion);
//			// ケース数
//			var cases= jsonDate[i]['cases'];

			// 単価
			var rate= jsonDate[i]['rate'];

			// 金額
			var amount= jsonDate[i]['amount'];

			// 税金コード
			var taxcode= jsonDate[i]['taxcode'];

			// 総額
			var grossamt= jsonDate[i]['grossamt'];

//			// 通貨
//			var currency= jsonDate[i]['currency'];

			// 受領予定日
			var expectedreceiptdate= jsonDate[i]['expectedreceiptdate'];

			// 備考
			var memo= jsonDate[i]['memo'];
			if(!isEmpty(memo)&&memo!='undefined'){
				memo = memo.replace(new RegExp("","g"),"\n");
			}
			
			// 基本単位数量ch549
			var itemunitconversion= jsonDate[i]['itemunitconversion'];
			
			poRecord.selectNewLineItem('item');
			poRecord.setCurrentLineItemValue('item', 'item', item);
			//poRecord.setCurrentLineItemValue('item', 'custcol_djkk_item', item);
			poRecord.setCurrentLineItemValue('item', 'quantity', quantity);//今回の購入数量
			var nowSoQuantity  = Number(quantity)*Number(conversion)//今回の実績入庫数
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
			var fcInQuantity=nlapiLookupField('customrecord_djkk_sc_forecast', fcid, 'custrecord_djkk_sc_fc_add');//履歴総購入数量(DJ_IN+))
			if(nowSoQuantity>=fcInQuantity){
				//今回の購入数量  が   履歴総購入数量(DJ_IN+)) より大きい場合
				updateArray.push([fcid,'T']); 
				//nlapiSubmitField('customrecord_djkk_sc_forecast', fcid, 'custrecord_djkk_po_created', 'T');
			}else{
				updateArray.push([fcid,Number(fcInQuantity-nowSoQuantity)]);//余剰の購入数量
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
				nlapiSubmitField('customrecord_djkk_sc_forecast', upId, 'custrecord_djkk_sc_fc_add', updateArray[s][1]);//数量更新
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
