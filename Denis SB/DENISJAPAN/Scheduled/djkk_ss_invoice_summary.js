/**
 * 合計請求書SS
 *
 * Version    Date            Author           Remarks
 * 1.00       17 Aug 2021
 *
 */

var LOGO_DJKK = SECURE_URL_HEAD+'/core/media/media.nl?id=8964&amp;'+URL_PARAMETERS_C+'&amp;h=iZGylgnfvSp4TB_TJwZ77OSQg4P2z4L8Da64VmTDBop13ssU';
var LOGO_DPKK = SECURE_URL_HEAD+'/core/media/media.nl?id=8965&amp;'+URL_PARAMETERS_C+'&amp;h=i25CMfzWHBy82Kdeb9ZUOAPDY_ClryAAWqdkgq2Fjw-3WVtU';
var LOGO_SCETI = SECURE_URL_HEAD+'/core/media/media.nl?id=8967&amp;'+URL_PARAMETERS_C+'&amp;h=0QJLdTP0yRNYGh7fhtf4HNZYRAuoHGbb-Ev99yJi9VF7rMLa';
var LOGO_NBKK = SECURE_URL_HEAD+'/core/media/media.nl?id=8966&amp;'+URL_PARAMETERS_C+'&amp;h=WgUn4Hd9vsKzRY4yyM0VIqPHukYO39nB5lYXdIjDCi3-ms0e';
var LOGO_ULKK = SECURE_URL_HEAD+'/core/media/media.nl?id=8968&amp;'+URL_PARAMETERS_C+'&amp;h=3FMsESFK45rSWy-y7iU3-pPDoeUL25qnudjMizIaQk8erqXv';

	
	
/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
 function scheduled(type) {

	nlapiLogExecution('debug', '合計請求書', '開始');

	var strId = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_ss_inv_summary_id');
	var key = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_key');//ランダム文字列
	var sub = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_subsidiary');//子会社
	//CH755 20230726 add by zdj start
	var sendMailFlag = nlapiGetContext().getSetting('SCRIPT','custscript_djkk_send_mail');
	//CH755 20230726 add by zdj start
	nlapiLogExecution('DEBUG', 'sendMailFlag', sendMailFlag);
	sub = JSON.parse(sub);
	nlapiLogExecution('DEBUG', 'パラメータ', strId);
//	nlapiLogExecution('DEBUG', 'customerId', customerId);
	var _strArr = strId.split(',');

	//請求書のID
	var entityArrValue = new Array();
	//クレジットメモのID
	var entityArrValue2 = new Array();
	var entityArrPostion = new Array();

	//顧客と請求書分け
	for(var i = 0 ; i < _strArr.length ; i++){
		governanceYield();
		if(isEmpty(_strArr[i])){
			continue;
		}

		var __strArr = _strArr[i].split('_');


		if(__strArr[1] == 'INV'){
			var entity = nlapiLookupField('invoice', __strArr[0], 'entity');
			if(entityArrPostion.indexOf(entity) == -1){
				entityArrPostion.push(entity);
				entityArrValue[entityArrPostion.indexOf(entity)]=__strArr[0]+'_';

			}else{
				if(isEmpty(entityArrValue[entityArrPostion.indexOf(entity)])){
					entityArrValue.push(__strArr[0]+'_');
				}else{
					entityArrValue[entityArrPostion.indexOf(entity)]+=__strArr[0]+'_';
				}
			}
		}else{
			var entity = nlapiLookupField('creditmemo', __strArr[0], 'entity');
			if(entityArrPostion.indexOf(entity) == -1){
				entityArrPostion.push(entity);
				entityArrValue2[entityArrPostion.indexOf(entity)]=__strArr[0]+'_';

			}else{
				if(isEmpty(entityArrValue2[entityArrPostion.indexOf(entity)])){
					entityArrValue2.push(__strArr[0]+'_');
				}else{
					entityArrValue2[entityArrPostion.indexOf(entity)]+=__strArr[0]+'_';
				}

			}
		}



	}

	governanceYield();

	//前月の入金額を取得
	var customerpaymentSearch = nlapiSearchRecord("customerpayment",null,
		[
			["type","anyof","CustPymt"],
			"AND",
			["trandate","within","lastmonth"]
		],
		[
			new nlobjSearchColumn("amountpaid",null,"SUM"),
			new nlobjSearchColumn("internalid","customer","GROUP")
		]
	);
	var custlastMonthPaymentArr = new Array();
	if(!isEmpty(customerpaymentSearch)){
		for(var i = 0 ; i < customerpaymentSearch.length ; i ++){
		//add zhou CH580 20230522 start
			custlastMonthPaymentArr[customerpaymentSearch[i].getValue("internalid","customer","GROUP")] = customerpaymentSearch[i].getValue("internalid","customer","GROUP");
//			custlastMonthPaymentArr[customerpaymentSearch[i].getValue("internalid","customer","GROUP")] = customerpaymentSearch[i].getValue("amountpaid",null,"SUM");
		//add zhou CH580 20230522 end
		}
	}


	//当月の入金額を取得
	var customerpaymentSearch = nlapiSearchRecord("customerpayment",null,
		[
			["type","anyof","CustPymt"],
			"AND",
			["trandate","within","lastmonth"]
		],
		[
			new nlobjSearchColumn("amountpaid",null,"SUM"),
			new nlobjSearchColumn("internalid","customer","GROUP")
		]
	);
	var custNowMonthPaymentArr = new Array();
	if(!isEmpty(customerpaymentSearch)){
		for(var i = 0 ; i < customerpaymentSearch.length ; i ++){
			// add zhou CH580 20230522 start
			custNowMonthPaymentArr[customerpaymentSearch[i].getValue("internalid","customer","GROUP")] = customerpaymentSearch[i].getValue("internalid","customer","GROUP");
//			custNowMonthPaymentArr[customerpaymentSearch[i].getValue("internalid","customer","GROUP")] = customerpaymentSearch[i].getValue("amountpaid",null,"SUM");
			// add zhou CH580 20230522 end
		}
	}


	var mailSendIdFilter = new Array();
	mailSendIdFilter.push("internalid");
	mailSendIdFilter.push("anyof");

	//採番ルール
	var nowYear =new Date().getYear()+1900;
	var invNoRst = nlapiSearchRecord("customrecord_djkk_invoice_summary",null,
		[
			["custrecord_djkk_totalinv_no","contains",parseInt(nowYear).toString()]
		],
		[
			new nlobjSearchColumn("custrecord_djkk_totalinv_no",null,"MAX").setSort(false)
		]
	);
	var invNo = 0;
	if(!isEmpty(invNoRst)){
		//例：YYYY-SJ-00000001
		if(isEmpty(invNoRst[0].getValue("custrecord_djkk_totalinv_no",null,"MAX"))){
			invNo = 0;
		}else{
			invNo = Number(invNoRst[0].getValue("custrecord_djkk_totalinv_no",null,"MAX").split('-')[2]);
		}

	}else{
		invNo = 0;
	}
	if(invNo < 0 || isEmpty(invNo)){
		invNo = 0;
	}
	//20230112 add by zhou CH203 start
	
	//新規フォルダの作成
	//add by zzq CH675 20230818 start
//	var folderName = '合計請求書'+getFormatYmdHms()+'_'+RondomPass(10);
	var folderName = '合計請求書'+ '_' +getDateYymmddFileName();
	//add by zzq CH675 20230818 end
    //20230901 add by CH762 zzq start 
    var SAVE_FOLDER = FILE_CABINET_ID_TOTAL_INV;
    if(sub == SUB_NBKK){
        SAVE_FOLDER = FILE_CABINET_ID_TOTAL_INV_NBKK;
    }else if(sub == SUB_ULKK){
        SAVE_FOLDER = FILE_CABINET_ID_TOTAL_INV_ULKK;
    }
   //20230901 add by CH762 zzq end 
	var parentFolder = SAVE_FOLDER;
	var foldertype = 'DEFAULT';
	var folderCreate = nlapiCreateRecord('folder');
	folderCreate.setFieldValue('name', folderName);//フォルダー名
	folderCreate.setFieldValue('parent', parentFolder);//親フォルダー  - 合計請求書出力ファイル
	folderCreate.setFieldValue('foldertype', foldertype);//種類
	var folderId = nlapiSubmitRecord(folderCreate);//フォルダ作成ID
	
	//合計請求書実行記録は、一括実行毎の集計要求書合成時のタスク情報を記録する
	//DJ_合計請求書実行記録管理テーブル作成
	var executionRecord = nlapiCreateRecord('customrecord_djkk_inv_summary_execution')
	
	executionRecord.setFieldValue('custrecord_djkk_totalinv_folder_name', folderName);//DJ_フォルダID
	executionRecord.setFieldValue('custrecord_djkk_totalinv_folder_id', folderId);//DJ_フォルダ名
	var folderLink = URL_HEAD +"/core/media/downloadfolder.nl?id=" + folderId +""; 
	executionRecord.setFieldValue('custrecord_djkk_totalinv_downloadlink', folderLink);//DJ_フォルダlink
	executionRecord.setFieldValue('custrecord_djkk_totalinv_date', nlapiDateToString(new Date()));//DJ_日付
	executionRecord.setFieldValue('custrecord_djkk_totalinv_customer', entityArrPostion);//DJ_顧客
	executionRecord.setFieldValue('custrecord_djkk_totalinv_subsidiary', sub);//DJ_連結

	var totalinvNumList = [];//DJ_合計請求書番号リスト
	var totalinvIdList= [];//DJ_合計請求書IDリスト
	var invIdList= '';//DJ_請求書IDリスト
	var creditmemoIdList= '';//DJ_クレジットメモIDリスト
	//end
	
	//顧客別で出力する
	for(var k = 0 ; k < entityArrPostion.length ; k++){

		var pdfStr = "";
		var strArr = new Array();
		if(!isEmpty(entityArrValue[k])){
			strArr = entityArrValue[k].split('_');
		}

		var strArr2 = new Array();
		if(!isEmpty(entityArrValue2[k])){
			strArr2 = entityArrValue2[k].split('_');
		}

		var custom = {
				totalSum: 0,
				totalTax: 0,
				totalPay: 0,
				wholeTaxType: {},
				subsidiary: '',
				shimeDate: '',
				paymentDate: '',
				strCreditmemoList: '',
				strInvList: '',
				nowMonthIncome:0,
				nowMonthIncomeTax:0
		};
		var inv = new Array();
		var customRec = nlapiLoadRecord('customer', entityArrPostion[k]);
		//20230104 add by zhou  start
		//合計請求書送信
		var subsidiary = defaultEmpty(customRec.getFieldValue('subsidiary'));
		var invoiceSumPeriodtype = '25';//合計請求書送信方法不要の場合
		var invoiceSumSite = '';//DJ_合計請求書送信先区分
		var invoiceSumPerson = '';//DJ_合計請求書送信先担当者
		var invoiceSumSubName = '';//DJ_合計請求書送信先会社名(3RDパーティー)
		var invoiceSumPersont = '';//DJ_合計請求書送信先担当者(3RDパーティー)
		var invoiceSumEmail = '';//DJ_合計請求書送信先メール(3RDパーティー)
		var invoiceSumFax = '';//DJ_合計請求書送信先FAX(3RDパーティー)
		var invoiceSumMemo = '';//DJ_合計請求書送信先登録メモ
		
		var salesman =defaultEmpty(customRec.getFieldValue('salesrep'));
		var templeteObj;//MALLとFAXテンプレートObj
		nlapiLogExecution('debug','subsidiary',subsidiary)
		if(subsidiary == SUB_SCETI || subsidiary == SUB_DPKK){
			invoiceSumPeriodtype = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_period'));//DJ_合計請求書送信区分
			invoiceSumSite = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_site'));//DJ_合計請求書送信先区分
			invoiceSumPerson = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_person'));//DJ_合計請求書送信先担当者
			invoiceSumSubName = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_subname'));//DJ_合計請求書送信先会社名(3RDパーティー)
			invoiceSumPersont = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_person_t'));//DJ_合計請求書送信先担当者(3RDパーティー)
			invoiceSumEmail = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_email'));//DJ_合計請求書送信先メール(3RDパーティー)
			invoiceSumFax = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_fax'));//DJ_合計請求書送信先FAX(3RDパーティー)
			invoiceSumMemo = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_memo'));//DJ_合計請求書送信先登録メモ
		}else if(subsidiary == SUB_NBKK || subsidiary == SUB_ULKK){
			var invoiceSumFlg = defaultEmpty(customRec.getFieldValue('custentity_djkk_totalinv_pdfsend_flg'));
			  nlapiLogExecution('debug','invoiceSumFlg',invoiceSumFlg)
			  if(invoiceSumFlg == "T"){
				  invoiceSumPeriodtype = '27';//DJ_合計請求書送信方法  (両方)
				  nlapiLogExecution('debug','invoiceSumFlg3',invoiceSumPeriodtype)
			  }else{
				  invoiceSumPeriodtype = '25';//DJ_合計請求書送信方法  (不要)
			  }
			invoiceSumSite = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_site'));//DJ_合計請求書送信先区分
			invoiceSumPerson = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_person'));//DJ_合計請求書送信先担当者
			invoiceSumSubName = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_subname'));//DJ_合計請求書送信先会社名(3RDパーティー)
			invoiceSumPersont = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_person_t'));//DJ_合計請求書送信先担当者(3RDパーティー)
			invoiceSumEmail = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_email'));//DJ_合計請求書送信先メール(3RDパーティー)
//			var invoiceSumFax = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_fax'));//DJ_合計請求書送信先FAX(3RDパーティー)
			invoiceSumMemo = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_memo'));//DJ_合計請求書送信先登録メモ
		}
		nlapiLogExecution('debug','invoiceSumPeriodtype',invoiceSumPeriodtype)
		if(invoiceSumPeriodtype != '25' && !isEmpty(invoiceSumPeriodtype)){
		//合計請求書送信
			nlapiLogExecution('debug','invoiceSum on','invoiceSum on')
			var customer = entityArrPostion[k]//顧客
//			var customform = data.customform;
			var mailType;
			nlapiLogExecution('debug','invoiceSum sendmail start')
			mailType = '合計請求書';
			var mailTempleteObj = {};
			var faxTempleteObj = {};
			//DJ_合計請求書送信
			if(invoiceSumPeriodtype != '25' &&(subsidiary == SUB_NBKK || subsidiary == SUB_ULKK)){
				nlapiLogExecution('debug','invoiceSumSite',invoiceSumSite)
				var mail = defaultEmpty(customRec.getFieldValue('email')); //email
				nlapiLogExecution('debug','mail2',mail)
				nlapiLogExecution('debug','invoiceSumSite',invoiceSumSite)
				if(invoiceSumSite == '29'){
					//送信顧客先の場合
					
//					var custRecord = nlapiLoadRecord('customer',customer);
					var fax = ''; //fax
					var mail = defaultEmpty(customRec.getFieldValue('email')); //email
					nlapiLogExecution('debug','mail',mail)
					templeteObj = invoiceSumSendmail(fax,mail,invoiceSumPeriodtype,subsidiary,mailType,salesman)
				}else{
					//3rd
					var fax = '';
					var mail = defaultEmpty(invoiceSumEmail);
					templeteObj = invoiceSumSendmail(fax,mail,invoiceSumPeriodtype,subsidiary,mailType,salesman)
				}
			}else if (invoiceSumPeriodtype != '25' &&(subsidiary == SUB_SCETI || subsidiary == SUB_DPKK)){
				if(invoiceSumSite == '29'){
					//送信顧客先の場合
					nlapiLogExecution('debug','invoiceSum','invoiceSum')
//					var custRecord = nlapiLoadRecord('customer',customer);
					var fax = defaultEmpty(customRec.getFieldValue('fax')); //fax
					var mail = defaultEmpty(customRec.getFieldValue('email')); //email
					nlapiLogExecution('debug','mail',mail)
					templeteObj = invoiceSumSendmail(fax,mail,invoiceSumPeriodtype,subsidiary,mailType,salesman)
				}else{
					//3rd
					var fax = defaultEmpty(invoiceSumFax);
					var mail = defaultEmpty(invoiceSumEmail);
					templeteObj = invoiceSumSendmail(fax,mail,invoiceSumPeriodtype,subsidiary,mailType,salesman)
				}
			}
			
		}
		if(!isEmpty(templeteObj)){
			mailTempleteObj = templeteObj.mailTempleteObj;
			faxTempleteObj = templeteObj.faxTempleteObj;
		}
		nlapiLogExecution('DEBUG', 'templeteObj',JSON.stringify(templeteObj))
		nlapiLogExecution('DEBUG', 'mailTempleteObj',JSON.stringify(mailTempleteObj))
		
		
		
		//end
		var strInvList = "";

		//請求書作成
		nlapiLogExecution('debug', '請求書', strArr);
		processTarget('invoice', '請求書', strArr, custom, inv);
		
		//クレジットメモ作成
		nlapiLogExecution('debug', 'クレジットメモ', strArr2);
		nlapiLogExecution('debug','inv0',JSON.stringify(inv));
		processTarget('creditmemo', 'クレジットメモ', strArr2, custom, inv);
		nlapiLogExecution('debug','inv1',JSON.stringify(inv));
		nlapiLogExecution('debug','custom.subsidiary',custom.subsidiary);
		var subsidiaryAddress= nlapiSearchRecord("subsidiary",null,
				[
				   ["internalid","anyof",custom.subsidiary]
				], 
				[
				   new nlobjSearchColumn("custrecord_djkk_address_state","address",null),
				   new nlobjSearchColumn("custrecord_djkk_address_fax","address",null), 
				   new nlobjSearchColumn("zip","address",null), 
				   new nlobjSearchColumn("city","address",null), 
				   new nlobjSearchColumn("address1","address",null), 
				   new nlobjSearchColumn("address2","address",null), 
				   new nlobjSearchColumn("address3","address",null), 
				   new nlobjSearchColumn("custrecord_djkk_address_fax","address",null), 
				   new nlobjSearchColumn("phone","address",null), 
				   new nlobjSearchColumn("addressee","address",null), 
				   new nlobjSearchColumn("legalname"),
				   new nlobjSearchColumn("custrecord_djkk_bank_1"),
				   new nlobjSearchColumn("custrecord_djkk_bank_2"),
				   new nlobjSearchColumn("custrecord_djkk_subsidiary_url"),
				   new nlobjSearchColumn("custrecord_djkk_mainaddress_en","address"),
				   //20230510 add by zhou DENISJAPAN-759 start
				   new nlobjSearchColumn("custrecord_djkk_invoice_issuer_number"),
				   //20230510 add by zhou DENISJAPAN-759 end
				   //20230731 CH756&CH757 by zdj start
				   new nlobjSearchColumn("custrecord_djkk_subsidiary_en")
				   //20230731 CH756&CH757 by zdj end

				]
		);
		
		//20230731 CH756&CH757 by zdj start
		custom.invoiceNameEng= isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("custrecord_djkk_subsidiary_en");//名前英語
		//20230731 CH756&CH757 by zdj end
		var _logo = isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("custrecord_djkk_subsidiary_url");
		custom.com_logo = SECURE_URL_HEAD+'/core/media/media.nl?id=8386&amp;'+URL_PARAMETERS_C+'&amp;h=DZtE1f2JHVzDYzOgXZNHKeYaTvtUcIYWTCka_0uLMSVpRxJs';

		if(custom.subsidiary == SUB_DJKK){
			custom.com_logo = LOGO_DJKK
		}
		if(custom.subsidiary == SUB_NBKK){
			custom.com_logo = LOGO_NBKK
		}
		if(custom.subsidiary == SUB_ULKK){
			custom.com_logo = LOGO_ULKK
		}
		if(custom.subsidiary == SUB_SCETI){
			custom.com_logo = LOGO_SCETI
		}
		if(custom.subsidiary == SUB_DPKK){
			custom.com_logo = LOGO_DPKK
		}

		
		nlapiLogExecution('DEBUG', 'LOGO', _logo);
		nlapiLogExecution('DEBUG', 'LOGO2', '&amp;');
		custom.com_address_en = isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("custrecord_djkk_mainaddress_en","address");
		custom.com_legalname = isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("legalname");
		custom.com_zip = isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("zip","address",null);
		//20230510 add by zhou DENISJAPAN-759 start
		custom.issuer_number= isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("custrecord_djkk_invoice_issuer_number");
		//20230510 add by zhou DENISJAPAN-759 end
		if(custom.com_zip){
			custom.com_zip = '〒' + custom.com_zip;
		}else{
			custom.com_zip = '';
		}
		custom.com_state = (isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("custrecord_djkk_address_state","address",null)) || '';
		custom.com_city = (isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("city","address",null)) || '';
		custom.com_addr1 = (isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("address1","address",null)) || '';
		custom.com_addr2 = (isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("address2","address",null)) || '';
		custom.com_addr3 = (isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("address3","address",null)) || '';
		custom.com_addressee= (isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("addressee","address",null)) || '';
		custom.com_fax = (isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("custrecord_djkk_address_fax","address",null)) || '';
		if(custom.com_fax){
			custom.com_fax = 'FAX: ' + custom.com_fax;
		}
		custom.com_phone = (isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("phone","address",null)) || '';
		if(custom.com_phone){
			custom.com_phone = 'TEL: ' + custom.com_phone;
		}
		var customObj = nlapiLoadRecord('customer', entityArrPostion[k]);
		custom.bankname = customObj.getFieldValue('custentity_dj_custpayment_bankname');//銀行名
		custom.thenameofthestore= customObj.getFieldValue('custentity_dj_custpayment_branchname');//支店名
		custom.accountnumber= customObj.getFieldValue('custentity_dj_custpayment_accountnumber');//振込元口座番号
		var bankInfo = [];
		custom.bankInfo = bankInfo; 
		var bank1 = isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("custrecord_djkk_bank_1");
		var bank2 = isEmpty(subsidiaryAddress) ? '' :  subsidiaryAddress[0].getValue("custrecord_djkk_bank_2");
		if(bank1){
			bank1 = nlapiLoadRecord('customrecord_djkk_bank', bank1);
			bankInfo.push({
				bankName: defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_name')),
				branchName: defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_branch_name')),
				bankType: defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_type')),
				bankNo: defaultEmpty(bank1.getFieldValue('custrecord_djkk_bank_no'))
			})			
		}
		if(bank2){
			bank2 = nlapiLoadRecord('customrecord_djkk_bank', bank2);
			bankInfo.push({
				bankName: defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_name')),
				branchName: defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_branch_name')),
				bankType: defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_type')),
				bankNo: defaultEmpty(bank2.getFieldValue('custrecord_djkk_bank_no'))
			})			
		}

		//請求締日
		custom.shimeDate = custom.shimeDate ? formatDate(nlapiStringToDate(custom.shimeDate)) : '';
		//繰越残高
		custom.balance = parseInt(customRec.getFieldValue('balance'));
		nlapiLogExecution('debug', 'custom.balance', typeof(custom.balance));
		nlapiLogExecution('debug', 'custom.balancetype', custom.balance);
		//前月入金・訂正
		custom.lastMonthPayment = isEmpty(custlastMonthPaymentArr) ? '0' : isEmpty( custlastMonthPaymentArr[entityArrPostion[k]] ) ? '0' : custlastMonthPaymentArr[entityArrPostion[k]];
		//前月残高
		custom.lastMonthMoney = Number(custom.balance) - Number(custom.lastMonthPayment);
		//当月売上高
		custom.nowMonthIncome;
		//消費税額
		custom.nowMonthIncomeTax;
		//当月入金・訂正
		custom.nowMonthPayment =isEmpty(custNowMonthPaymentArr) ? '0' :  isEmpty( custNowMonthPaymentArr[entityArrPostion[k]] ) ? '0' : custNowMonthPaymentArr[entityArrPostion[k]];
		//翌月繰越額
		custom.nextMonthBalance = Number(custom.lastMonthMoney) + Number(custom.nowMonthIncome) + Number(custom.nowMonthIncomeTax) - Number(custom.nowMonthPayment);
		//支払日付
		custom.paymentDate = custom.paymentDate ? formatDate(nlapiStringToDate(custom.paymentDate)) : '';
		//支払方法
		//add by 20230706 zhou CH485 start 
		//add by 20230509 zhou CH485 start
		custom.payMentWay = customRec.getFieldText('custentity_djkk_customer_payment');
//		custom.payMentWay = customRec.getFieldText('custentity_djkk_payment_conditions');
		//add by 20230509 zhou CH485 end
		//add by 20230706 zhou CH485 end 
		//顧客名
		custom.name = customRec.getFieldValue('companyname');
		//顧客名
		custom.entityid = customRec.getFieldValue('entityid');
		
		var customAddress = nlapiSearchRecord("customer",null,
			[
				["internalid","anyof",entityArrPostion[k]]
			],
			[
				new nlobjSearchColumn("zipcode","Address",null),
				new nlobjSearchColumn("custrecord_djkk_address_state","Address",null),
				new nlobjSearchColumn("address1","Address",null),
				new nlobjSearchColumn("address2","Address",null),
				new nlobjSearchColumn("addressee","Address",null),
				//add start geng U786
				new nlobjSearchColumn("state","Address",null),//都道府県
				new nlobjSearchColumn("city","Address",null),//市区町村	
				new nlobjSearchColumn("address3","Address",null),
				new nlobjSearchColumn("phone"), 
				new nlobjSearchColumn("fax")
				//add end geng U786
			]
		);
		//顧客郵便
		custom.zip = isEmpty(customAddress) ? '' :  customAddress[0].getValue("zipcode","Address",null);
		if(custom.zip){
			custom.zip = '〒' + custom.zip;
		}else{
			custom.zip = '';
		}
		//顧客住所１
		custom.state = isEmpty(customAddress) ? '' :  customAddress[0].getValue("custrecord_djkk_address_state","Address",null);
		//顧客住所１
		custom.add1 = isEmpty(customAddress) ? '' :  customAddress[0].getValue("address1","Address",null);
		//顧客住所２
		custom.add2 = isEmpty(customAddress) ? '' :  customAddress[0].getValue("address2","Address",null);
		//顧客宛先
		custom.addressee = isEmpty(customAddress) ? '' :  customAddress[0].getValue("addressee","Address",null);
		//changed by geng add start U786
		custom.dropstatus = isEmpty(customAddress) ? '' :  customAddress[0].getValue("state","Address",null);
		custom.city = isEmpty(customAddress) ? '' :  customAddress[0].getValue("city","Address",null);
		var codeCustom = '';
		if(!isEmpty(custom.name)&&!isEmpty(custom.entityid)){
			codeCustom = String(custom.entityid).split(String(custom.name));
			custom.code = codeCustom[0];
		}
		custom.addr3 = isEmpty(customAddress) ? '' :  customAddress[0].getValue("address3","Address",null);
		custom.phone = isEmpty(customAddress) ? '' :  customAddress[0].getValue("phone");
		custom.fax = isEmpty(customAddress) ? '' :  customAddress[0].getValue("fax");
		//changed by geng add end U786


		//20230112 add by zhou start
		//add by 20230515 zhou CH418 start
		var invNoNum = nowYear+'-SJ-'+PrefixZero(++invNo,8);
		if(!isEmpty(strArr)){
			for(var i = 0 ; i < strArr.length ; i++){
				if(isEmpty(strArr[i])){
					continue;
				}
				nlapiLogExecution('DEBUG', 'strArr', strArr[i]);
				nlapiSubmitField('invoice', strArr[i], 'custbody_djkk_totalinv_no', invNoNum);
			}
		}
		
		
		if(!isEmpty(strArr2)){
			for(var o = 0 ; o < strArr2.length ; o++){
				if(isEmpty(strArr2[o])){
					continue;
				}
				nlapiLogExecution('DEBUG', 'strArr2', strArr2[o]);
				nlapiSubmitField('creditmemo', strArr2[o], 'custbody_djkk_totalinv_no', invNoNum);
			}
		}
//		totalinvNumList.push(nowYear+'-SJ-'+PrefixZero(++invNo,8)); //DJ_合計請求書番号リスト
		//add by 20230515 zhou CH418 end
			totalinvNumList.push(invNoNum); //DJ_合計請求書番号リスト
		invIdList += custom.strInvList;//DJ_請求書IDリスト
		creditmemoIdList += custom.strCreditmemoList;//DJ_クレジットメモIDリスト
		if(k+1 < entityArrPostion.length){
			invIdList += ',';
			creditmemoIdList += ',';
		}
		//end
		
		//採番先、請求書番号取得するため
		var rec2 = nlapiCreateRecord('customrecord_djkk_invoice_summary')
		//add by 20230515 zhou CH418 start
//		rec2.setFieldValue('custrecord_djkk_totalinv_no', nowYear+'-SJ-'+PrefixZero(++invNo,8))
		rec2.setFieldValue('custrecord_djkk_totalinv_no', invNoNum);
		//add by 20230515 zhou CH418 end
		rec2.setFieldValue('custrecord_djkk_inv_customer', entityArrPostion[k]);
		rec2.setFieldValue('custrecord_djkk_inv_data', nlapiDateToString(new Date()));
		rec2.setFieldValue('custrecord_djkk_creditmemo_list', custom.strCreditmemoList);
		rec2.setFieldValue('custrecord_djkk_inv_list', custom.strInvList);
		rec2.setFieldValue('custrecord_djkk_totalinv_sub', custom.subsidiary);

		var id = nlapiSubmitRecord(rec2)

		var renderer = nlapiCreateTemplateRenderer();
		renderer.setTemplate(stringXml(null,custom,inv,rec2.getFieldValue('custrecord_djkk_totalinv_no')));
		var xml = renderer.renderToString();
		
		// test
//		var xlsFile = nlapiCreateFile('テスト用' + '_' + getFormatYmdHms() + '.xml', 'XMLDOC', xml);
//		
//		xlsFile.setFolder(109338);
//		nlapiSubmitFile(xlsFile);
		// test end
		//20230104 add by zhou start
		//CH207 
		var fileName;
		var fileID;
		var xlsFile = nlapiXMLToPDF(xml);
		if(invoiceSumPeriodtype != '25' &&!isEmpty(mailTempleteObj)){
			fileName = mailTempleteObj.fileName + '_' + invNoNum;
			xlsFile.setName(fileName+ '.pdf');
		    //20230901 add by CH762 zzq start 
		    var SAVE_FOLDER = FILE_CABINET_ID_TOTAL_INV;
		    if(subsidiary == SUB_NBKK){
		        SAVE_FOLDER = FILE_CABINET_ID_TOTAL_INV_NBKK;
		    }else if(subsidiary == SUB_ULKK){
		        SAVE_FOLDER = FILE_CABINET_ID_TOTAL_INV_ULKK;
		    }
		   //20230901 add by CH762 zzq end 
			xlsFile.setFolder(SAVE_FOLDER);
			xlsFile.setIsOnline(true);

			fileID = nlapiSubmitFile(xlsFile);
			nlapiSubmitField('customrecord_djkk_invoice_summary', id, 'custrecord_djkk_inv_mail_pdf', fileID);
			
			var mailFile = fileID;
			var mailFileArr = [];
			mailFileArr.push(mailFile);
			mailFile = mailFileArr;
			//add by zhou 20230516_CH418 start
//			var mailover =automaticSendmail(mailTempleteObj,mailFile);
			//add by zhou 20230516_CH418 end
//			nlapiLogExecution('debug','mailover',mailover)
		}
		if(invoiceSumPeriodtype != '25' &&!isEmpty(faxTempleteObj)){
			nlapiLogExecution('debug','in fax send','in')
			fileName = faxTempleteObj.fileName;
			xlsFile.setName(fileName+ '.pdf');
	         //20230901 add by CH762 zzq start 
            var SAVE_FOLDER = FILE_CABINET_ID_TOTAL_INV;
            if(subsidiary == SUB_NBKK){
                SAVE_FOLDER = FILE_CABINET_ID_TOTAL_INV_NBKK;
            }else if(subsidiary == SUB_ULKK){
                SAVE_FOLDER = FILE_CABINET_ID_TOTAL_INV_ULKK;
            }
           //20230901 add by CH762 zzq end 
			xlsFile.setFolder(SAVE_FOLDER);
			xlsFile.setIsOnline(true);

			//fileID = nlapiSubmitFile(xlsFile);
			
			var faxfile = fileID;
			var faxfileArr = [];
			faxfileArr.push(faxfile);
			faxfile = faxfileArr;
			//add by zhou 20230516_CH418 start
//			var faxover =automaticSendFax(faxTempleteObj,faxfile);
			//add by zhou 20230516_CH418 end
//			nlapiLogExecution('debug','send',faxover)
		}
		//end
		/*******old******/
//		xlsFile.setName(custom.name+'_合計請求書' + '_' + getFormatYmdHms() + '.pdf');
//		xlsFile.setFolder(FILE_CABINET_ID_TOTAL_INV_OUTPUT_FILE);
//		xlsFile.setIsOnline(true);
//		fileID = nlapiSubmitFile(xlsFile);
		/*******old******/
		/*******new******/
		
		//add by zzq CH675 20230629 start
//		xlsFile.setName(custom.name+'_合計請求書' + '_' + getFormatYmdHms() + '.pdf');
		//xlsFile.setName(custom.name+'_合計請求書' + '_' + invNoNum + '.pdf');
		//add by zzq CH675 20230818 start
		xlsFile.setName(custom.name+'_合計請求書' + '_' + invNoNum + '_' + getDateYymmddFileName() +'.pdf');
		//add by zzq CH675 20230818 end
		//add by zzq CH675 20230629 end
		xlsFile.setFolder(folderId);
		xlsFile.setIsOnline(true);
		fileID = nlapiSubmitFile(xlsFile);
		/*******new******/
		
		nlapiLogExecution('debug','PDF fileID',fileID)

		//ファイル作成後　履歴へ更新
		nlapiSubmitField('customrecord_djkk_invoice_summary', id, 'custrecord_djkk_inv_pdf', fileID)
		//DJ_合計請求書実行記録管理テーブル ファイル作成後　履歴へ更新  20230112 add by zhou
		nlapiLogExecution('debug','test','test')
		
		mailSendIdFilter.push(id);

	}
	executionRecord.setFieldValue('custrecord_djkk_totalinv_num', totalinvNumList);//DJ_合計請求書番号リスト
	nlapiLogExecution('debug','totalinvNumList',totalinvNumList)
	
//	executionRecord.setFieldValue('custrecord_djkk_totalinv_id', custom.subsidiary);//DJ_合計請求書IDリスト
	
	executionRecord.setFieldValue('custrecord_djkk_totalinv_inv_list','123');//DJ_請求書IDリスト
	nlapiLogExecution('debug','invIdList',invIdList)
	executionRecord.setFieldValue('custrecord_djkk_totalinv_creditmemo_list', creditmemoIdList);//DJ_クレジットメモIDリスト
	
//	executionRecord.setFieldValue('custrecord_djkk_totalinv_reset_flg', custom.subsidiary);//DJ_合計請求書リセットフラグ
	
	executionRecord.setFieldValue('custrecord_djkk_totalinv_key', key);//DJ_key

	var executionRecordId = nlapiSubmitRecord(executionRecord);//DJ_合計請求書実行記録管理テーブルID
	nlapiLogExecution('debug','key',key)
	nlapiLogExecution('debug','executionRecordId',executionRecordId)
	//PDF送信 custentity_djkk_invoice_automatic_mail

//	var customrecord_djkk_invoice_summarySearch = nlapiSearchRecord("customrecord_djkk_invoice_summary",null,
//		[
//			["custrecord_djkk_inv_customer.custentity_djkk_totalinv_pdfsend_flg","is","T"],
//			"AND",
//			["custrecord_djkk_inv_customer.custentity_djkk_invoice_automatic_mail","isnotempty",""],
//			"AND",
//			mailSendIdFilter
//		],
//		[
//			new nlobjSearchColumn("custrecord_djkk_inv_mail_pdf"),
//			new nlobjSearchColumn("custentity_djkk_totalinv_pdfsend_flg","CUSTRECORD_DJKK_INV_CUSTOMER",null),
//			new nlobjSearchColumn("custentity_djkk_invoice_automatic_mail","CUSTRECORD_DJKK_INV_CUSTOMER",null)
//		]
//	);

//	if(!isEmpty(customrecord_djkk_invoice_summarySearch)){nlapiLogExecution('debug','test2','test2')
//		for(var i = 0 ; i < customrecord_djkk_invoice_summarySearch.length ; i++){
//			var file = null;
//			if(customrecord_djkk_invoice_summarySearch[i].getValue("custentity_djkk_totalinv_pdfsend_flg","CUSTRECORD_DJKK_INV_CUSTOMER",null) == 'T'){
//				file = nlapiLoadFile(customrecord_djkk_invoice_summarySearch[i].getValue("custrecord_djkk_inv_mail_pdf"));
//			}
//			nlapiLogExecution('debug', 'file', file);
//			nlapiSendEmail(-5, customrecord_djkk_invoice_summarySearch[i].getValue("custentity_djkk_invoice_automatic_mail","CUSTRECORD_DJKK_INV_CUSTOMER",null), '合計請求書送信', '合計請求書作成のお知らせ', null, null, null, file);
//		}
//	nlapiLogExecution('debug','test3','test3')
//	}

	//CH755 20230726 add by zdj start
	if(sendMailFlag == 'T'){
	    sendEmail(executionRecordId); 
	}
	//CH755 20230726 add by zdj end
	
	nlapiLogExecution('debug', '合計請求書', '終了');
}
 
function processTarget(type, title, strArr2, custom, inv){
	nlapiLogExecution('debug','custom0',JSON.stringify(custom));
	nlapiLogExecution('debug','inv2',JSON.stringify(inv));
	for(var i = 0 ; i < strArr2.length ; i++){
		if(isEmpty(strArr2[i])){
			continue;
		}
		
		governanceYield();
		nlapiLogExecution('debug', 'loading ' + type, strArr2[i]);
		var recCre = nlapiLoadRecord(type, strArr2[i]);
		if(!custom.shimeDate){
			custom.shimeDate = recCre.getFieldValue('custbody_suitel10n_inv_closing_date');
		}
		if(!custom.paymentDate){
			custom.paymentDate = recCre.getFieldValue('duedate')
		}
		custom.subsidiary = recCre.getFieldValue('subsidiary');
		var invDetial = {};
		if (type == 'invoice') {
		    invDetial.rtype = '1';
		} else {
		    invDetial.rtype = '2';
		}
		invDetial.createfromSeparate = recCre.getFieldText('createdfrom');
		invDetial.createfromSplit = invDetial.createfromSeparate.split("注文書");
		//add by zhou 20230506_CH479 start
//		invDetial.createfrom = invDetial.createfromSplit.slice(-1);
		var createdfromId = recCre.getFieldValue('createdfrom');
		nlapiLogExecution('debug', 'createdfromId', createdfromId);
		var createfrom = '';
		if(!isEmpty(createdfromId)){
			var createfromObj = nlapiLookupField('salesorder', createdfromId, 'transactionnumber');
			nlapiLogExecution('debug', 'createfromObj', createfromObj);
			createfrom = defaultEmpty(createfromObj);
		}
		invDetial.createfrom = createfrom;
		//add by zhou 20230506_CH479 end
		nlapiLogExecution('debug', 'invDetial.createfrom', invDetial.createfrom);
		//add by zhou 20230509_CH477 start
		// セクション
		var sectionName = recCre.getFieldText('department');
		if(sectionName){
			var sectionNameArr= sectionName.split(" ");
			if(sectionNameArr.length<=0){
				invDetial.section = sectionNameArr[0]
			}else{
				invDetial.section= defaultEmpty(sectionNameArr.slice(0,1));
			}
		}else{
			invDetial.section= '';
		}
		// 営業担当者
		var salesrepId = recCre.getFieldValue('salesrep');
		nlapiLogExecution('debug', 'salesrepId', salesrepId);
		invDetial.salesrepName = '';
		if(salesrepId){
			var employeeObj = nlapiLookupField('employee', salesrepId, ['lastname','firstname']);
			nlapiLogExecution('debug', 'employeeObj', employeeObj);
			if(employeeObj){
				if(employeeObj.lastname && employeeObj.firstname){
					invDetial.salesrepName = ''+employeeObj.lastname + employeeObj.firstname;
				}else if(employeeObj.lastname && !employeeObj.firstname){
					invDetial.salesrepName = ''+employeeObj.lastname;
				}else if(!employeeObj.lastname && employeeObj.firstname){
					invDetial.salesrepName = ''+employeeObj.firstname;
				}
			}
		}
		//add by zhou 20230509_CH477 end
		//不明ため外す
//		var createdfrom = recCre.getFieldValue('createdfrom');//作成元
//		if(createdfrom){
//			if('creditmemo' == type){ // クレジットメモ 作成元,請求書
//				nlapiLogExecution('debug', 'loading invoice', createdfrom);
//				var rec = nlapiLoadRecord('invoice', createdfrom);
//				createdfrom = rec.getFieldValue('createdfrom');
//				if(!custom.shimeDate){
//					custom.shimeDate = rec.getFieldValue('custbody_suitel10n_inv_closing_date')
//				}
//			}
//			nlapiLogExecution('debug', 'loading salesorder', createdfrom);
//			if(createdfrom){
//				var salesorder = nlapiLoadRecord('salesorder', createdfrom);				
//				invDetial.createdfrom = '注文書 #' + salesorder.getFieldValue('tranid');
//			}
//		}
		
		invDetial.date = formatDate(nlapiStringToDate(recCre.getFieldValue('trandate')));
		//add by zhou 20230506_CH479 start
//		invDetial.name = title + '　＃'+recCre.getFieldValue('tranid');
		
		//add by zhou 20230524 CH581 start
//		invDetial.name = title +'　' + recCre.getFieldValue('transactionnumber');
		invDetial.name = recCre.getFieldValue('transactionnumber');
		//add by zhou 20230524 CH581 end
		
		//add by zhou 20230506_CH479 end
//add by zhou 20220707 start
		invDetial.type = title;
//end
		invDetial.inComeTaxEx =   recCre.getFieldValue('subtotal');
		invDetial.inComeTax =   recCre.getFieldValue('taxtotal');
		invDetial.inComeTaxIn =   recCre.getFieldValue('total');
		//クレジットメモ場合負数表示する。
		if(type == 'creditmemo'){
			invDetial.inComeTaxEx = Number(invDetial.inComeTaxEx) * -1;
			invDetial.inComeTax = Number(invDetial.inComeTax) * -1 ;
			invDetial.inComeTaxIn = Number(invDetial.inComeTaxIn) * -1 ;			
		}

		var subsidiaryValue = recCre.getFieldValue('subsidiary');
//		if(subsidiaryValue == SUB_SCETI || subsidiaryValue == SUB_DPKK){
//			invDetial.code = recCre.getFieldValue('tranid');//請求書番号 
//		}else{
//			invDetial.code = recCre.getFieldValue('transactionnumber');//トランザクション番号  CH128 add 2022/12/08 by song
//		}
		invDetial.code = recCre.getFieldValue('transactionnumber');//トランザクション番号  CH128 add 2022/12/08 by song
		
		nlapiLogExecution('debug', title, invDetial.code);
		invDetial.issuedate = recCre.getFieldValue('trandate');//発行日
		// add CF408 20230520 start
//		invDetial.memo = defaultEmpty(recCre.getFieldValue('memo'));	//備考
		invDetial.memo = defaultEmpty(recCre.getFieldValue('custbody_djkk_deliverynotememo'));	//備考
		// add CF408 20230520 end
//		invDetial.byserber = recCre.getFieldValue('bytheserialnumber');//受住番号
		invDetial.deliverydate= recCre.getFieldValue('custbody_djkk_delivery_date') || '';//納品日
		if(invDetial.deliverydate){
			invDetial.deliverydate = formatDate(nlapiStringToDate(invDetial.deliverydate));
		}
		invDetial.otherrefnum= defaultEmpty(recCre.getFieldValue('otherrefnum'));//御社発住番号
		invDetial.termsofpayment= defaultEmpty(recCre.getFieldValue('custbody_djkk_payment_conditions'));//支払条件
		if(invDetial.termsofpayment) {
			nlapiLogExecution('debug', 'loading payment', invDetial.termsofpayment);
			var payCond = nlapiLoadRecord('customlist_djkk_payment_conditions', invDetial.termsofpayment);//支払条件
			invDetial.termsofpayment = payCond.getFieldValue('name');
		}	

		var deliveryDest= recCre.getFieldValue('custbody_djkk_delivery_destination');//納品先id
		nlapiLogExecution('debug', 'loading delivery dest', deliveryDest);
		var deliveryDestObj = !isEmpty(deliveryDest) ? nlapiLoadRecord('customrecord_djkk_delivery_destination', deliveryDest) : '';
		invDetial.deliveryDestCode = !deliveryDestObj ? '' : deliveryDestObj.getFieldValue('custrecord_djkk_delivery_code');//納品先??
		invDetial.deliveryDest = !deliveryDestObj ? '' : deliveryDestObj.getFieldValue('custrecorddjkk_name');//納品先名称
		invDetial.postalcode = !deliveryDestObj ? '' : deliveryDestObj.getFieldValue('custrecord_djkk_zip');//郵便番号
		invDetial.prefectures = !deliveryDestObj ? '' : deliveryDestObj.getFieldValue('custrecord_djkk_prefectures');//都道府県
		invDetial.thecitydoesnot = !deliveryDestObj ? '' : deliveryDestObj.getFieldValue('custrecord_djkk_municipalities');//市区町村
		invDetial.addressone = !deliveryDestObj ? '' : deliveryDestObj.getFieldValue('custrecord_djkk_delivery_residence');//納品先住所1
		//add by zhou 20230509_CH480 start
//		var tmpAddressTwo = !deliveryDestObj ? '' : deliveryDestObj.getFieldValue('custrecord_djkk_delivery_residence2');
		var tmpAddressTwo = !deliveryDestObj ? '' : deliveryDestObj.getFieldValue('custrecord_djkk_delivery_lable');//納品先住所2
		var tmpAddressThree = !deliveryDestObj ? '' : deliveryDestObj.getFieldValue('custrecord_djkk_delivery_residence2');//納品先住所3
		if (!tmpAddressThree) {
			tmpAddressThree = '';
		}
		if (!tmpAddressTwo) {
			tmpAddressTwo = '';
		}
		invDetial.addresstwo = tmpAddressTwo;//納品先住所2
		invDetial.addressthree = tmpAddressThree;//納品先住所2
		//add by zhou 20230509_CH480 end
		inv.push(invDetial);
		inv.sort(function(a, b) {
		    var rt1 = a.rtype;
		    var rt2 = b.rtype;
		    if (rt1 == rt2) {
	            var o1 = a.date;
	            var o2 = b.date;
	            if (o1 == o2) {
	                var o3 = a.name;
	                var o4 = b.name;
	                if (o3 < o4) {
	                    return -1;
	                } else if (o3 > o4) {
	                    return 1;
	                } else {
	                    return 0;
	                }
	            } else {
	                if (o1 < o2) {
	                    return -1;
	                } else if (o1 > o2) {
	                    return 1;
	                } else {
	                    return 0;
	                }
	            }
		    } else {
                if (rt1 < rt2) {
                    return -1;
                } else if (rt1 > rt2) {
                    return 1;
                } else {
                    return 0;
                }
		    }
        });
        
		var invSublist = [];
		invDetial.sublist = invSublist;
		var taxType = {};
		invDetial.taxSubList = taxType;
		invDetial.totalSum = 0;
		invDetial.taxSum= 0;
		invDetial.paySum= 0;
		var sublistCount = recCre.getLineItemCount('item');
		
		var itemIdArr = [];
		var itemLocationArr = [];
		
		for(var s = 1; s <= sublistCount; s ++){
		    governanceYield();
			var itemId =recCre.getLineItemValue('item', 'item', s);//アイテム
			var itemLocation =recCre.getLineItemValue('item', 'location', s);//アイテム場所
			//add by zzq ch631 20230607 start
//			var itemName =recCre.getLineItemValue('item', 'item_display', s);//名称
			//add by zzq ch631 20230607 end
			var itemCountStr = recCre.getLineItemValue('item', 'quantity', s);
			var itemCount = itemCountStr ? parseFloat(itemCountStr) : 0;//数量
			var itemUnit=recCre.getLineItemValue('item', 'units_display', s);//単位
			
			if(!isEmpty(itemUnit)){
                var unitsArray = itemUnit.split("/");
                if(!isEmpty(unitsArray)){
                    itemUnit = unitsArray[0];
                }
            }
			
			var itemPrice=parseFloat(recCre.getLineItemValue('item', 'rate', s));//単価
			var itemObj = nlapiLookupField('item', itemId, ['custitem_djkk_deliverycharge_flg', 'type']);
			if (itemObj.type == 'OthCharge') {
			    var deliverychargeFlg = itemObj.custitem_djkk_deliverycharge_flg;
			    if (deliverychargeFlg == true || deliverychargeFlg == 'T') {
			        if (!Number(itemPrice) > 0) {
			            continue;
			        }
			    }
			}
			var itemTaxType=recCre.getLineItemValue('item', 'taxrate1', s);//税金種類
			var itemTax=parseFloat(recCre.getLineItemValue('item', 'tax1amt', s));//税金
			var itemAmount=parseFloat(recCre.getLineItemValue('item', 'amount', s));//金額
			//add by zhou 20230508_CH481 start
			var taxCode=parseFloat(recCre.getLineItemValue('item', 'taxcode', s));//税金コードId
			//add by zhou 20230508_CH481 end
			// add by zdj 20230802 start
			var itemNouhinBikou=recCre.getLineItemValue('item', 'custcol_djkk_deliverynotememo', s);//DJ_納品書備考
			nlapiLogExecution('DEBUG', 'itemNouhinBikou', itemNouhinBikou);
			// add by zdj 20230802 end
			//クレジットメモ場合負数表示する。
			if(type == 'creditmemo'){
				itemTax = Number(itemTax) * -1;
				itemAmount = Number(itemAmount) * -1;
				itemCount = Number(itemCount) * -1;
			}

			itemIdArr.push(itemId);
			if(itemLocation){
				itemLocationArr.push(itemLocation);
			}
			
			invSublist.push({
				itemProductCode: '',//DJ_カタログ製品コード
				itemLocationBarcode: '',//DJ_場所バーコード
				itemId: itemId,//アイテム
				itemLocation: itemLocation,//アイテム場所
				//add by zzq ch631 20230607 start
//				itemName: itemName,//名称
				itemName: '',//名称
				//add by zzq ch631 20230607 end
				itemCount: itemCount,//数量
				itemUnit: itemUnit ? itemUnit : '',//単位
				itemPrice: itemPrice ? itemPrice : 0,//単价
				itemTax: itemTax ? itemTax : 0,//税金
				itemAmount: itemAmount ? itemAmount : 0,//金額
				//add by zhou 20230508_CH481 start
				taxCode: taxCode,//税金コードId
				//add by zhou 20230508_CH481 end
				// add by zdj 20230802 start
				itemNouhinBikou: itemNouhinBikou,
				// add by zdj 20230802 end
			});

			//add by zhou 20230508_CH478 start
//			if(itemTaxType && itemTax > 0){
			if(itemTaxType && itemTax){
				//add by zhou 20230508_CH478 end
				var taxStat = taxType[itemTaxType];
				if(!taxStat){
					taxStat = {total: 0, tax: 0, pay: 0};
					taxType[itemTaxType] = taxStat;
				}
				taxStat['total'] = taxStat['total'] + defaultFloat(itemAmount);//合?
				taxStat['tax'] = taxStat['tax'] + defaultFloat(itemTax);//消?税
				taxStat['pay'] = taxStat['pay'] + defaultFloat(itemTax + itemAmount);//?求?					
			}
			
			invDetial.totalSum = invDetial.totalSum + defaultFloat(itemAmount);//合?
			invDetial.taxSum = invDetial.taxSum + defaultFloat(itemTax);//合?消?税
			invDetial.paySum = invDetial.paySum + defaultFloat(itemTax + itemAmount);//合??求?
//            if(type == 'creditmemo'){
//                invDetial.totalSum = Number(invDetial.totalSum) * -1;
//                invDetial.taxSum = Number(invDetial.taxSum) * -1;
//                invDetial.paySum = Number(invDetial.paySum) * -1;
//            }
			if(itemTaxType && itemTax){
				var wholeTaxStat = custom.wholeTaxType[itemTaxType]
				if(!wholeTaxStat){
					wholeTaxStat = {total: 0, tax: 0, pay: 0};
					custom.wholeTaxType[itemTaxType] = wholeTaxStat;
				}
				wholeTaxStat['total'] = wholeTaxStat['total'] + defaultFloat(itemAmount);//合?
				wholeTaxStat['tax'] = wholeTaxStat['tax'] + defaultFloat(itemTax);//消?税
				wholeTaxStat['pay'] = wholeTaxStat['pay'] + defaultFloat(itemTax + itemAmount);//?求?	
//				nlapiLogExecution('DEBUG', 'show me the information for  defaultFloat(itemTax + itemAmount)', defaultFloat(itemTax + itemAmount))
			}

			custom.totalSum += defaultFloat(itemAmount);
			custom.totalTax += defaultFloat(itemTax);
			custom.totalPay += defaultFloat(itemTax + itemAmount);
//			nlapiLogExecution('DEBUG', 'show me the information for defaultFloat(itemTax + itemAmount', defaultFloat(itemTax + itemAmount));
		}
		governanceYield();
		if(sublistCount>0){
			var itemSearch = nlapiSearchRecord("item",null,
					[
					   ["internalid","anyof",itemIdArr]
					], 
					[
					   new nlobjSearchColumn("internalid"), 
					   new nlobjSearchColumn("custitem_djkk_product_code"),
					   //add by zzq ch631 20230607 start
					   new nlobjSearchColumn("displayname"),
					   //add by zzq ch631 20230607 end
					   new nlobjSearchColumn("type"),
					   //add by zzq CH631 20230706 start
					   new nlobjSearchColumn("custitem_djkk_product_name_jpline1"), //DJ_品名（日本語）LINE1
	                   new nlobjSearchColumn("custitem_djkk_product_name_jpline2")  //DJ_品名（日本語）LINE2
					   //add by zzq CH631 20230706 end
					]
					);
				


			if (!isEmpty(itemSearch)) {
                for ( var m = 0; m < itemSearch.length; m++) {
                    var itemSearchId = itemSearch[m].getValue('internalid');
                    var itemSearchproduct = defaultEmpty(itemSearch[m].getValue('custitem_djkk_product_code'));
                    var itemType = defaultEmpty(itemSearch[m].getValue('type'));
                    var itemSearchName = defaultEmpty(itemSearch[m].getValue('displayname'));
                    //add bu zzq CH631 20230706 start
                    var itemName1;
                    var itemName2;
                    // add by zzq ch631 20230607 start
                    nlapiLogExecution('DEBUG', 'itemType', itemType);
                    for ( var o = 0; o < invSublist.length; o++) {
                        if (itemSearchId == invSublist[o].itemId) {
                            invSublist[o].itemProductCode = itemSearchproduct;
                            // add by zzq ch631 20230607 start
                            if (itemType == 'OthCharge') {
                                invSublist[o].itemName = othChargeDisplayname(itemSearchName); // 手数料
                                nlapiLogExecution('debug', 'itemSearchName', itemSearchName);
                            } else {
                                itemName1 = defaultEmpty(itemSearch[m].getValue('custitem_djkk_product_name_jpline1'));
                                itemName2 = defaultEmpty(itemSearch[m].getValue('custitem_djkk_product_name_jpline2'));
                                //add by zzq start
                                if(!isEmpty(itemName1) && !isEmpty(itemName2)){
                                    invSublist[o].itemName = itemName1 + '\xa0\xa0' + itemName2;
                                }else if(!isEmpty(itemName1) && isEmpty(itemName2)){
                                    invSublist[o].itemName = itemName1;
                                }else if(isEmpty(itemName1) && !isEmpty(itemName2)){
                                    invSublist[o].itemName = itemName2;
                                }else{
                                    invSublist[o].itemName = '';
                                }
                                //add by zzq end
                                //invSublist[o].itemName = itemSearchName;
                                // add by zzq ch631 20230607 end
                            }
                            //add by zdj 20230802 start
                            if(invSublist[o].itemName){
                            	if(invSublist[o].itemNouhinBikou){
                            		invSublist[o].itemName = invSublist[o].itemName + '<br/>' + invSublist[o].itemNouhinBikou;
                            	}
                            }else {
                            	if(invSublist[o].itemNouhinBikou){
                            		invSublist[o].itemName = invSublist[o].itemNouhinBikou;
                            	}
                            }
                            //add by zdj 20230802 end
                        }
                        // add by zzq ch631 20230607 end
                        //add bu zzq CH631 20230706 end
                    }
                }
            }
			nlapiLogExecution('DEBUG', 'itemLocationArr', itemLocationArr.length);
			if (itemLocationArr.length>0){
				nlapiLogExecution('DEBUG', 'itemLocationArr0', itemLocationArr);
				var locationSearch = nlapiSearchRecord("location",null,
						[
						   ["internalid","anyof",itemLocationArr]
						], 
						[
						   new nlobjSearchColumn("internalid"), 
						   new nlobjSearchColumn("custrecord_djkk_location_barcode")
						]
						);
				if (!isEmpty(locationSearch)) {
					for (var p = 0; p < locationSearch.length; p++) {
							var itemLocationSearchId = locationSearch[p].getValue('internalid');
							var itemLocationBarcodeSearch = defaultEmpty(locationSearch[p].getValue('custrecord_djkk_location_barcode'));
							for (var q = 0; q < invSublist.length; q++) {
								if(itemLocationSearchId == invSublist[q].itemLocation){
									invSublist[q].itemLocationBarcode = itemLocationBarcodeSearch;
								}
							}
					}
				}
			}
		}
		
		nlapiLogExecution('DEBUG', 'custom');
		
		custom.nowMonthIncome+=Number(invDetial.inComeTaxEx);
		custom.nowMonthIncomeTax+=Number(invDetial.inComeTax);

		//請求書フラグ更新
		recCre.setFieldValue('custbody_djkk_invoicetotal_flag', 'T');
		//保留フラグがFへ更新
		recCre.setFieldValue('custbody_djkk_hold_flg', 'F');
		nlapiSubmitRecord(recCre);
		if(type == 'invoice'){
			custom.strInvList+= strArr2[i]+",";
		}else if (type == 'creditmemo'){
			custom.strCreditmemoList+= strArr2[i]+",";
		}
		
	}
}

function PrefixZero(num, size) {
	var s = "00000000" + num;
	return s.substr(s.length-size);
}

function formatDate(dt){
	return dt.getFullYear() + "/" + PrefixZero((dt.getMonth() + 1), 2) + "/" + PrefixZero(dt.getDate(), 2);
}

function defaultEmpty(src){
	return src || '';
}

function defaultFloat(src){
	return isNaN(src) ? 0 : src;
}

function stringXml(sub,custom,inv,id){
	nlapiLogExecution('debug', 'custom', JSON.stringify(custom.wholeTaxType));
	nlapiLogExecution('debug', 'inv', JSON.stringify(inv));
	var shimeDate = custom.shimeDate;
	var dts = shimeDate.split('/');
	var shimeStartDate = dts[0] + '/' + dts[1] +'/' + '01';
	var str = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'+
	    '<pdfset>' +
		'<pdf>'+
		'<head>'+
		'<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />'+
		'<#if .locale == "zh_CN">'+
		'<link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />'+
		'<#elseif .locale == "zh_TW">'+
		'<link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />'+
		'<#elseif .locale == "ja_JP">'+
		'<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />'+
		'<#elseif .locale == "ko_KR">'+
		'<link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />'+
		'<#elseif .locale == "th_TH">'+
		'<link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />'+
		'</#if>'+
		'<macrolist>'+
		'<macro id="nlheader">'+
        '<table style="width: 660px;" cellpadding="1" cellspacing="1"><tr><td style="width: 330px; border: 1px dotted black; border-radius: 20px;">' + 
        '<table class="custom-info" cellpadding="1" cellspacing="1"><tr>'+
        '<td style="width: 20px">&nbsp;</td>'+
        '<td style="height: 35px">'+custom.zip+'</td>'+
        '<td style="width: 40px">&nbsp;</td>'+
        '<td style="width: 6px">&nbsp;</td>'+
        '</tr>'+
        '<tr padding-top="-10px">'+
        '<td>&nbsp;</td>'+
        '<td style="height: 20px">&emsp;'+custom.state+'</td>'+// custom. dropstatus
        '<td>&nbsp;</td>'+
        '<td>&nbsp;</td>'+
        '</tr>'+
        '<tr>'+
        '<td>&nbsp;</td>'+
        '<td style="height: 20px">&emsp;'+custom.city+'</td>'+
        '<td>&nbsp;</td>'+
        '<td>&nbsp;</td>'+
        '</tr>'+
        '<tr>'+
        '<td>&nbsp;</td>'+
        '<td style="height: 20px">&emsp;'+custom.add1+ '&nbsp;'+custom.add2+'&nbsp;'+custom.addr3+'</td>'+
        '<td>&nbsp;</td>'+
        '<td>&nbsp;</td>'+
        '</tr>'+
        '<tr>'+
        '<td>&nbsp;</td>'+
        '<td style="height: 20px">&emsp;'+custom.addressee+'</td>'+
        '<td>御中</td>'+
        '<td>&nbsp;</td>'+
        '</tr>'+
//      '<tr>'+
//      '<td style="height: 20px">'+custom.code+'</td>'+
//      '</tr>'+
//      '<tr>'+
////        '<td style="height: 20px">電話:'+custom.phone+'</td>'+//changed by zhou 20230224
//      '<td style="height: 15px"></td>'+//add by zhou 20230224
//      '</tr>'+
        '<tr>'+
//      '<td style="height: 20px">FAX:'+custom.fax+'</td>'+//changed by zhou 20230224
        '<td style="height: 10px"></td>'+//add by zhou 20230224
        '</tr>'+
        '<tr>'+
        '<td>&nbsp;</td>'+
//      '<td style="width: 50px;height:20px;" align="right" >御中</td>'+
        '<td>&nbsp;</td>'+
        '<td>&nbsp;</td>'+
        '<td>&nbsp;</td>'+
        '</tr>'+
        //changed by geng add start U786
//      '<tr margin-top = "4px">'+
//      '<td>&nbsp;</td>'+
////        '<td style="height:20px;" align="right">得意先コード&nbsp;'+custom.code+'</td>'+
//      '<td style="height:20px;" align="right">&nbsp;</td>'+
//      '<td>&nbsp;</td>'+
//        '<td>&nbsp;</td>'+
//      '</tr>'+
        //changed by geng add end U786
        //20230731 CH756&CH757 by zdj start
        //'<tr>'+
        //'<td style="height: 20px;" align="right"></td>'+
        //'<td style="height: 20px;" align="right">'+custom.name+'</td>'+
        //'</tr>'+
        //20230731 CH756&CH757 by zdj end
        '</table>'+
        '</td>' + 
        '<td><table cellpadding="1" cellspacing="1">' +
        //20230731 CH756&CH757 by zdj start
//      '<tr><td style="height: 60px;"><img style="margin-left: 30px; height: 60px;" src="'+custom.com_logo+'" />' + 
        '<tr style="height: 2px;">'
        if(custom.subsidiary == SUB_NBKK){
            str += '<td style=";margin-right:30px;"><img src="'+SECURE_URL_HEAD+'/core/media/media.nl?id='+NBKK_INSYOU_ID+'&amp;'+URL_PARAMETERS_C+'&amp;'+NBKK_INSYOU_URL+'" style="width:100px;height: 100px; position:absolute;top:-8px;left:184px;" /></td>'
        }else if(custom.subsidiary == SUB_ULKK){
            str += '<td style=";margin-right:30px;"><img src="'+SECURE_URL_HEAD+'/core/media/media.nl?id='+ULKK_INSYOU_ID+'&amp;'+URL_PARAMETERS_C+'&amp;'+ULKK_INSYOU_URL+'" style="width:100px;height: 100px; position:absolute;top:-2px;left:210px;" /></td>'
        }else{
            str += '<td style=";margin-right:30px;">&nbsp;</td>';
        }
        str+='</tr>'+
        '<tr>'+
//      '<td style="font-size:17px;margin-left: 30px;">'+ custom.invoiceNameEng +'</td>'+
        '<td style="font-size:17px;margin-left: 30px;">'+ custom.invoiceNameEng +'</td>'+
//      '</td></tr><tr><td style="height: 60px;vertical-align: bottom;">' + 
        '</tr>'+
        '<tr><td style="vertical-align: bottom;">'+ 
        //20230731 CH756&CH757 by zdj end
        //20230731 CH756&CH757 by zdj start
//      '<span style="margin-left: 30px; margin-bottom: 10px;font-size: 20px;"><strong><span style="color:#3498db;"></span></strong></span><br/><span style="font-size:24px; margin-left: 30px; margin-top: 20px;"><strong><span style="color:#3498db;">' + custom.com_legalname + '</span></strong></span></td>'+
        '<span style="margin-left: 30px; margin-bottom: 10px;font-size: 19px;"><span style="color:black;"></span></span><br/><span style="font-size:19px; margin-left: 30px;"><span style="color:black;font-family: heiseimin;">' + custom.com_legalname + '</span></span></td>'+
        //20230731 CH756&CH757 by zdj end
        '</tr><tr><td style="vertical-align: bottom;"><table style="margin-left: 30px;" cellpadding="1" cellspacing="1">' +
        //add by zhou 20230510 DENISJAPAN-759 start
        //20230731 CH756&CH757 by zdj start
//      '<tr><td style="height: 20px">適格請求書発行事業者番号 ：' + custom.issuer_number + '</td></tr>' +
        '<tr><td style="height: 20px">登録番号 ：' + custom.issuer_number + '</td></tr>' +
        //20230731 CH756&CH757 by zdj end
        //add by zhou 20230510 DENISJAPAN-759 end
        '<tr><td style="height: 20px">' + custom.com_zip + '</td></tr>' +
        //20230731 CH756&CH757 by zdj start
//      '<tr><td style="height: 20px">' + custom.com_state + '</td></tr>' +
        '<tr><td style="height: 20px">' + custom.com_state + custom.com_city + custom.com_addr1 + custom.com_addr2 + custom.com_addr3 + '</td></tr>' +
        //20230731 CH756&CH757 by zdj end
        '<tr><td style="height: 20px">' + custom.com_phone + '&nbsp;' + custom.com_fax + '</td></tr>' +
        '<tr><td style="height: 20px">' + custom.com_address_en+ '</td></tr>' +
        
        '</table></td></tr></table></td></tr></table>' + 
        //20230731 CH756&CH757 by zdj start
        //'&nbsp;'+
        '<table>'+
        '<tr height="10xp"><td>&nbsp;</td></tr>'+
        '</table>'+
//      '<table cellpadding="1" cellspacing="1" style="width:660px;border: 1px dotted black;"><tr><td colspan="5" style="height: 20px">&nbsp;</td></tr><tr>'+
        '<table cellpadding="1" cellspacing="1" style="width:660px;border: 1px dotted black;">'+
        '<tr padding-top="4px">'+
//      '<tr>'+
        //20230731 CH756&CH757 by zdj end
        '<td>&nbsp;</td>'+
        '<td>&nbsp;</td>'+
        '<td><span style="font-size:22px;">請&nbsp;&nbsp;求&nbsp;&nbsp;書</span></td>'+
        '<td>&nbsp;</td>'+
        '<td>&nbsp;</td>'+
        '</tr>'+
        '<tr>'+
        '<td colspan="5" rowspan="1" align="center">請求締日：'+custom.shimeDate + '&nbsp;&nbsp;&nbsp;&nbsp;(' + shimeStartDate + '~' + shimeDate +')</td>'+
        //20230731 CH756&CH757 by zdj start
//      '</tr><tr><td colspan="5" style="height: 20px">&nbsp;</td></tr></table>'+
        '</tr>'+
        '</table>'+
        //20230731 CH756&CH757 by zdj end
        ''+
        '<table border="0" cellpadding="1" cellspacing="1" style="height:60px;width:660px;"><tr>'+
        '<td style="height:60px;width:480px;">&nbsp;</td>'+
        '<td>'+
        '<table cellpadding="1" cellspacing="1" style="height:60px;width:60px;border: 1px dotted black;"><tr>'+
        '<td>&nbsp;</td>'+
        '</tr></table>'+
        '</td>'+
        '<td>'+
        '<table cellpadding="1" cellspacing="1" style="height:60px;width:60px;border: 1px dotted black;"><tr>'+
        '<td>&nbsp;</td>'+
        '</tr></table>'+
        '</td>'+
        '<td>'+
        '<table cellpadding="1" cellspacing="1" style="height:60px;width:60px;border: 1px dotted black;"><tr>'+
        '<td>&nbsp;</td>'+
        '</tr></table>'+
        '</td>'+
        '</tr></table>'+
        ''+
        '<table class="stat-line" cellpadding="1" cellspacing="1" style="width:660px; border-top: 3px solid; border-bottom: 3px solid;"><tr>'+
        '<td align="right">繰越残高</td>'+
        '<td align="right">前月入金・訂正</td>'+
        '<td align="right">前月残高</td>'+
        '<td align="right">当月売上高</td>'+
        '<td align="right">消費税額</td>'+
        '<td align="right">当月入金・訂正</td>'+
        '<td align="right">翌月繰越額</td>'+
        '</tr>'+
        '<tr>';
        // add zhou CH580 20230522 start
        str += '<td align="right">${'+custom.balance+'?string[",##0;; roundingMode=halfUp"]}</td>';
//        if(custom.balance>=0){
//          str += '<td align="right">${'+custom.balance+'?string[",##0;; roundingMode=halfUp"]}</td>';
//        }else{
//          str += '<td align="right">-${'+Math.abs(custom.balance)+'?string[",##0;; roundingMode=halfUp"]}</td>';
//        }
        if(custom.lastMonthPayment>=0){
            str += '<td align="right">${'+custom.lastMonthPayment+'?string[",##0;; roundingMode=halfUp"]}</td>';
        }else{
            str += '<td align="right">-${'+Math.abs(custom.lastMonthPayment)+'?string[",##0;; roundingMode=halfUp"]}</td>';
        }
        if(custom.lastMonthMoney>=0){
            str += '<td align="right">${'+custom.lastMonthMoney+'?string[",##0;; roundingMode=halfUp"]}</td>';
        }else{
            str += '<td align="right">-${'+Math.abs(custom.lastMonthMoney)+'?string[",##0;; roundingMode=halfUp"]}</td>';
        }
        if(custom.nowMonthIncome < 0){
            str += '<td align="right">-${'+Math.abs(custom.nowMonthIncome)+'?string[",##0;; roundingMode=halfUp"]}</td>';
        }else{
            str += '<td align="right">${'+Math.abs(custom.nowMonthIncome)+'?string[",##0;; roundingMode=halfUp"]}</td>';
        }
        if(custom.nowMonthIncomeTax < 0){
            str += '<td align="right">-${'+Math.abs(custom.nowMonthIncomeTax)+'?string[",##0;; roundingMode=halfUp"]}</td>';
        }else{
            str += '<td align="right">${'+Math.abs(custom.nowMonthIncomeTax)+'?string[",##0;; roundingMode=halfUp"]}</td>';
        }
        if(custom.nowMonthPayment < 0){
            str += '<td align="right">-${'+Math.abs(custom.nowMonthPayment)+'?string[",##0;; roundingMode=halfUp"]}</td>';
        }else{
            str += '<td align="right">${'+Math.abs(custom.nowMonthPayment)+'?string[",##0;; roundingMode=halfUp"]}</td>';
        }
//        if(custom.nextMonthBalance < 0){
//          str += '<td align="right">-${'+Math.abs(custom.nextMonthBalance)+'?string[",##0;; roundingMode=halfUp"]}</td>';
//        }else{
//          str += '<td align="right">${'+Math.abs(custom.nextMonthBalance)+'?string[",##0;; roundingMode=halfUp"]}</td>';
//        }
        str += '<td align="right">${'+custom.nextMonthBalance +'?string[",##0;; roundingMode=halfUp"]}</td>';
//      '<td align="right">${'+custom.lastMonthPayment+'?string[",##0;; roundingMode=halfUp"]}</td>'+
//      '<td align="right">${'+custom.lastMonthMoney +'?string[",##0;; roundingMode=halfUp"]}</td>';
//        str += '<td align="right">${'+custom.nowMonthIncomeTax+'?string[",##0;; roundingMode=halfUp"]}</td>'+
//      '<td align="right">${'+custom.nowMonthPayment+'?string[",##0;; roundingMode=halfUp"]}</td>'+
//        
     // add zhou CH580 20230522 end
        str += '</tr></table>'+
        //20230731 CH756&CH757 by zdj start
        //'&nbsp;'+
        //20230731 CH756&CH757 by zdj end
        ''+
        '<table padding-top="8px" border="0" cellpadding="1" cellspacing="1" style="width:660px;"><tr>'+
//      '<table border="0" cellpadding="1" cellspacing="1" style="width:660px;"><tr>'+
        '<td colspan="2">請求番号：'+id+'</td>'+
        '</tr>'+
        '<tr>'+
        '<td colspan="2">支払日付：'+custom.paymentDate+'</td>'+
        '</tr>'+
        '<tr>'+
        //add by zhou 20230509_CH485 start
//      '<td>支払方法：'+custom.payMentWay+'</td><td align="right"><totalpages/>頁</td>'+
        '<td>支払条件：'+custom.payMentWay+'</td><td align="right">合計#<pagenumber/></td>'+
        //add by zhou 20230509_CH485 end
        '</tr>'+
        '</table>'+
        '<table padding-top="6px" cellpadding="1" cellspacing="1" style="width:660px;">'+
        '<tr>'+
        //'<table border="0" cellpadding="1" cellspacing="1" style="width:660px;"><tr>'+
        //add by zhou 20230511_CH485 start
        '<td style="width: 25%">発行日</td>'+
        '<td style="width: 25%">請求書番号</td>'+
        '<td style="width: 25%" align="right">売上額</td>'+
        '<td style="width: 25%" align="right">消費税</td>'+
        '<td style="width: 25%" align="right">売上合計</td>'+
        //add by zhou 20230511_CH485 end
        '</tr>'+
        '</table>'+
        //20230731 CH756&CH757 by zdj start
        //'&nbsp;'+
        //20230731 CH756&CH757 by zdj end
        ''+
		'</macro>' +
        '<macro id="nlfooter">';
        str+='<table style="width: 660px; border-top: 3px solid  #000000;"><tr>'+
    	'<td style="width: 320px"><table align="left" ><tr>'+
    	'<td>振込口座</td>'+
    	'<td>&nbsp;</td></tr>';
        for(var k = 0; k < custom.bankInfo.length; k++){
        	var bankItem = custom.bankInfo[k];
            str +=
        	'<tr>'+
        	'<td>'+bankItem.bankName+'</td>'+
        	'<td>'+bankItem.branchName+'</td>'+ 
        	'</tr>'+
        	'<tr><td>&nbsp;</td>'+
        	   '<td>'+ bankItem.bankType + '&nbsp;&nbsp;' + 'No.' + bankItem.bankNo +'</td>'+	   
        	'</tr>'; 
        }
    	
        str += '</table></td>'+		
    		'<td><table>'+
    		' <tr>'+
    		 '<td></td>'+
    		 '<td align="right">売上額</td>'+
    		 '<td align="right">消費税</td>'+
    		 '<td align="right">売上合計</td>'+
    		 '</tr>'+
    		 '<tr>'+
    		 '<td></td>'+
    		 '<td></td>'+
    		 '<td></td>'+
    		 '<td></td>'+
    		 '</tr>';
    		for(var taxData in custom.wholeTaxType){
    			var taxDataValue = custom.wholeTaxType[taxData];
//20220707 changed by zhou strat   			
    			var totalInTaxData = Number(taxDataValue['total']);
    			var taxInTaxData = Number(taxDataValue['tax']);
    			var payInTaxData =  Number(taxDataValue['pay']);
    			if(totalInTaxData < 0){
	    			str += '<tr>'+
	    			// add zhou CH580 20230522 start
					'<td>' + taxData + ':</td>';
					if(Math.abs(totalInTaxData)>0){
						str += '<td align="right">-${'+Math.abs(totalInTaxData)+'?string[",##0;; roundingMode=halfUp"]}</td>';
					}else{
						str += '<td align="right">${'+Math.abs(totalInTaxData)+'?string[",##0;; roundingMode=halfUp"]}</td>';
					}
					if(Math.abs(taxInTaxData)>0){
						str += '<td align="right">-${'+Math.abs(taxInTaxData)+'?string[",##0;; roundingMode=halfUp"]}</td>';
					}else{
						str += '<td align="right">${'+Math.abs(taxInTaxData)+'?string[",##0;; roundingMode=halfUp"]}</td>';
					}
					if(Math.abs(payInTaxData)>0){
						str += '<td align="right">-${'+Math.abs(payInTaxData)+'?string[",##0;; roundingMode=halfUp"]}</td>';
					}else{
						str += '<td align="right">${'+Math.abs(payInTaxData)+'?string[",##0;; roundingMode=halfUp"]}</td>';
					}
//					'<td align="right">-${'+Math.abs(totalInTaxData)+'?string[",##0;; roundingMode=halfUp"]}</td>'+
//					'<td align="right">-${'+Math.abs(taxInTaxData)+'?string[",##0;; roundingMode=halfUp"]}</td>'+
//					'<td align="right">-${'+Math.abs(payInTaxData)+'?string[",##0;; roundingMode=halfUp"]}</td>'+
					str += '</tr>';
					// add zhou CH580 20230522 end
    			}else{
        			str += '<tr>'+
    				'<td>' + taxData + ':</td>'+
    				'<td align="right">${'+Math.abs(totalInTaxData)+'?string[",##0;; roundingMode=halfUp"]}</td>'+
    				'<td align="right">${'+Math.abs(taxInTaxData)+'?string[",##0;; roundingMode=halfUp"]}</td>'+
    				'<td align="right">${'+Math.abs(payInTaxData)+'?string[",##0;; roundingMode=halfUp"]}</td>'+
    				'</tr>';	
    			}
    		}
    		var totalSumData = Number(custom.totalSum);
			var totalTaxData = Number(custom.totalTax);
			var totalPayData = Number(custom.totalPay);
    		if(totalSumData < 0){
	    		str +=
	    			'<tr>'+
	    			// add zhou CH580 20230522 start
	    			'<td class="border-top-dot"> 合計: </td>';
	    		if(Math.abs(totalSumData)>0){
					str += '<td class="border-top-dot" align="right">-${'+Math.abs(totalSumData)+'?string[",##0;; roundingMode=halfUp"]}</td>';
				}else{
					str += '<td class="border-top-dot" align="right">${'+Math.abs(totalSumData)+'?string[",##0;; roundingMode=halfUp"]}</td>';
				}
	    		if(Math.abs(totalTaxData)>0){
					str += '<td class="border-top-dot" align="right">-${'+Math.abs(totalTaxData)+'?string[",##0;; roundingMode=halfUp"]}</td>';
				}else{
					str += '<td class="border-top-dot" align="right">${'+Math.abs(totalTaxData)+'?string[",##0;; roundingMode=halfUp"]}</td>';
				}
	    		if(Math.abs(totalPayData)>0){
					str += '<td class="border-top-dot" align="right">-${'+Math.abs(totalPayData)+'?string[",##0;; roundingMode=halfUp"]}</td>';
				}else{
					str += '<td class="border-top-dot" align="right">${'+Math.abs(totalPayData)+'?string[",##0;; roundingMode=halfUp"]}</td>';
				}
//	    			'<td class="border-top-dot" align="right">-${'+Math.abs(totalSumData)+'?string[",##0;; roundingMode=halfUp"]}</td>'+
//	    			'<td class="border-top-dot" align="right">-${'+Math.abs(totalTaxData)+'?string[",##0;; roundingMode=halfUp"]}</td>'+
//	    			'<td class="border-top-dot" align="right">-${'+Math.abs(totalPayData)+'?string[",##0;; roundingMode=halfUp"]}</td>'+
	    		str += '</tr></table></td>'+
	    			'</tr>';
	    		// add zhou CH580 20230522 end
    		}else{
    			str +=
	    			'<tr>'+
	    			'<td class="border-top-dot"> 合計: </td>'+
	    			'<td class="border-top-dot" align="right">${'+Math.abs(totalSumData)+'?string[",##0;; roundingMode=halfUp"]}</td>'+
	    			'<td class="border-top-dot" align="right">${'+Math.abs(totalTaxData)+'?string[",##0;; roundingMode=halfUp"]}</td>'+
	    			'<td class="border-top-dot" align="right">${'+Math.abs(totalPayData)+'?string[",##0;; roundingMode=halfUp"]}</td>'+
	    			'</tr></table></td>'+
	    			'</tr>';
    		}
//20220707 changed by zhou end
        str +='</table>';
        str += '</macro>'+
        '</macrolist>' +
		'    <style type="text/css">* {'+
		'<#if .locale == "zh_CN">'+
		'font-family: NotoSans, NotoSansCJKsc, sans-serif;'+
		'<#elseif .locale == "zh_TW">'+
		'font-family: NotoSans, NotoSansCJKtc, sans-serif;'+
		'<#elseif .locale == "ja_JP">'+
		'font-family: NotoSans, NotoSansCJKjp, sans-serif;'+
		'<#elseif .locale == "ko_KR">'+
		'font-family: NotoSans, NotoSansCJKkr, sans-serif;'+
		'<#elseif .locale == "th_TH">'+
		'font-family: NotoSans, NotoSansThai, sans-serif;'+
		'<#else>'+
		'font-family: NotoSans, sans-serif;'+
		'</#if>'+
		'}'+
		'      table { font-size: 9pt; table-layout: fixed; width: 100%; }'+
		'th { font-weight: bold; font-size: 8pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #333333; padding-bottom: 10px; padding-top: 10px; }'+
		'td { padding: 4px 6px; }'+
		'b { font-weight: bold; color: #333333; }'+
		'.bottom-line-2px {border-bottom: 3px solid black; vertical-align: middle;}' +
		'.border-tb-dash {border-top: 1px dashed black; border-bottom: 1px dashed black;}' +
		'.border-top-dot {border-top: 1px dotted black;}' +
		'.custom-info td{ height: 20px; vertical-align: middle;}' +
		'.stat-line td{ height: 30px; vertical-align: middle;}';
		//20220801  changed by zdj end
        str += '</style>'+
		'</head>'+
		'<body header="nlheader" header-height="24%" footer="nlfooter" footer-height="9%" padding="0.5in 0.55in 0.5in 0.45in" size="A4">'+
//		'<table><tr><td></td></tr></table>'
		'<table padding-top="165px" border="0" cellpadding="1" cellspacing="1" style="width:660px;">'
//		'<tr>'+
//		//'<table border="0" cellpadding="1" cellspacing="1" style="width:660px;"><tr>'+
//		//add by zhou 20230511_CH485 start
//		'<td style="width: 20%">発行日</td>'+
//		'<td style="width: 32%">請求書番号</td>'+
//		'<td style="width: 16%" align="right">売上額</td>'+
//		'<td style="width: 16%" align="right">消費税</td>'+
//		'<td style="width: 16%" align="right">売上合計</td>'+
//		//add by zhou 20230511_CH485 end
//		'</tr>'
		//'<tr><td colspan="5">&nbsp;</td></tr>';
	for(var i = 0 ; i < inv.length;i++){
		str +='<tr padding-top="2px">'
			nlapiLogExecution('debug', 'inv[i].name', inv[i].name);
		str +='<td style="width: 25%">'+inv[i].date+'</td>';
		str +='<td style="width: 25%">'+inv[i].name+'</td>';
		//add by zhou 20220415
		if(inv[i].inComeTaxEx < 0){
			//add by zhou 20230522_CH580 start
			if(Math.abs(inv[i].inComeTaxEx)>0){
				str +='<td style="width: 25%" align="right" >-${'+Math.abs(inv[i].inComeTaxEx)+'?string[",##0;; roundingMode=halfUp"]}</td>';
			}else{
				str +='<td style="width: 25%" align="right" >${'+Math.abs(inv[i].inComeTaxEx)+'?string[",##0;; roundingMode=halfUp"]}</td>';
			}
			if(Math.abs(inv[i].inComeTax)>0){
				str +='<td style="width: 25%" align="right" >-${'+Math.abs(inv[i].inComeTax)+'?string[",##0;; roundingMode=halfUp"]}</td>';
			}else{
				str +='<td style="width: 25%" align="right" >${'+Math.abs(inv[i].inComeTax)+'?string[",##0;; roundingMode=halfUp"]}</td>';
			}
			if(Math.abs(inv[i].inComeTaxIn)>0){
				str +='<td style="width: 25%" align="right" >-${'+Math.abs(inv[i].inComeTaxIn)+'?string[",##0;; roundingMode=halfUp"]}</td>';
			}else{
				str +='<td style="width: 25%" align="right" >${'+Math.abs(inv[i].inComeTaxIn)+'?string[",##0;; roundingMode=halfUp"]}</td>';
			}
//			str +='<td align="right" >-${'+Math.abs(inv[i].inComeTax)+'?string[",##0;; roundingMode=halfUp"]}</td>';
//			str +='<td align="right" >-${'+Math.abs(inv[i].inComeTaxIn)+'?string[",##0;; roundingMode=halfUp"]}</td>';
			//add by zhou 20230522_CH580 end
		}else{
			str +='<td style="width: 25%" align="right" >${'+inv[i].inComeTaxEx+'?string[",##0;; roundingMode=halfUp"]}</td>';
			str +='<td style="width: 25%" align="right" >${'+inv[i].inComeTax+'?string[",##0;; roundingMode=halfUp"]}</td>';
			str +='<td style="width: 25%" align="right" >${'+inv[i].inComeTaxIn+'?string[",##0;; roundingMode=halfUp"]}</td>';
		}
		
		str +='</tr>';
	}
	str+='</table>';
    str += '</body>'+
    '</pdf>'+
    '<pdf>'+
    '<head>'+
    '<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />'+
    '<#if .locale == "zh_CN">'+
    '<link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />'+
    '<#elseif .locale == "zh_TW">'+
    '<link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />'+
    '<#elseif .locale == "ja_JP">'+
    '<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />'+
    '<#elseif .locale == "ko_KR">'+
    '<link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />'+
    '<#elseif .locale == "th_TH">'+
    '<link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />'+
    '</#if>'+
    '<macrolist>'+
    '<macro id="emptyFooter"><table border="0"><tr><td></td></tr></table></macro>' +
    '<macro id="nlheader">' +
    '<table  padding-top="-40px" cellspacing="0" cellpadding="5" style="width: 660px;">'+
    '<tr padding-top="10px"><td colspan="4" class="bottom-line-2px" align="center"><span style="margin-left: 120px; font-size: 18px">' + custom.com_legalname + ' 請求明細書</span></td><td class="bottom-line-2px" style="width: 160px" align="right">' + formatDate(new Date()) + '&nbsp;明細#<pagenumber/></td></tr>'+
    
//    '<tr padding-top="17px">'+
    '<tr padding-top="4px">'+
    '<td>月次請求書番号:</td>'+
    '<td colspan="2">'+id+'</td>'+
    '<td>&nbsp;</td><td>&nbsp;</td>'+
    '</tr>' +
    '<tr padding-top="-2px">'+
    '<td>請求先:</td>'+
    '<td colspan="2">'+custom.entityid+'</td>'+
    '<td>&nbsp;</td><td>&nbsp;</td></tr>'+
    '</table>' +
    '</macro>' +
    '</macrolist>' +
    '    <style type="text/css">* {'+
    '<#if .locale == "zh_CN">'+
    'font-family: NotoSans, NotoSansCJKsc, sans-serif;'+
    '<#elseif .locale == "zh_TW">'+
    'font-family: NotoSans, NotoSansCJKtc, sans-serif;'+
    '<#elseif .locale == "ja_JP">'+
    'font-family: NotoSans, NotoSansCJKjp, sans-serif;'+
    '<#elseif .locale == "ko_KR">'+
    'font-family: NotoSans, NotoSansCJKkr, sans-serif;'+
    '<#elseif .locale == "th_TH">'+
    'font-family: NotoSans, NotoSansThai, sans-serif;'+
    '<#else>'+
    'font-family: NotoSans, sans-serif;'+
    '</#if>'+
    '}'+
    '      table { font-size: 9pt; table-layout: fixed; width: 100%; }'+
    'th { font-weight: bold; font-size: 8pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #333333; padding-bottom: 10px; padding-top: 10px; }'+
    'td { padding: 4px 6px; }'+
    'b { font-weight: bold; color: #333333; }'+
    '.bottom-line-2px {border-bottom: 3px solid black; vertical-align: middle;}' +
    '.border-tb-dash {border-top: 1px dashed black; border-bottom: 1px dashed black;}' +
    '.border-top-dot {border-top: 1px dotted black;}' +
    '.custom-info td{ height: 20px; vertical-align: middle;}' +
    '.stat-line td{ height: 30px; vertical-align: middle;}';
    str += '</style>'+
    '</head>'+
    '<body header="nlheader" header-height="6%" footer="emptyFooter" footer-height="0.8%" padding="0.5in 0.55in 0.25in 0.45in" size="A4">'+
    '<table style=" width: 660px;" cellspacing="0" cellpadding="2">';

    for(var x = 0; x <inv.length; x++){
        var invDetial = inv[x];
        var type = inv[x].type;
        
        str += '<tr style="border-top: 3px solid #000000;">'+
        '<td style="width: 20px;">' + (x + 1) + '</td>'+
        '<td style="width: 100px;"></td>'+
        '<td style="width: 135px;"></td>'+
        '<td style="width: 135px;"></td>'+
        '<td style="width: 90px;"></td>'+
        '<td style="width: 90px;"></td>'+
        '<td style="width: 90px;"></td>'+
        '</tr>'+
        
        '<tr>'+
        '<td></td>'+
        '<td>請求書番号: </td>'+
        '<td>'+invDetial.code+'</td>'+
        '<td>営業担当者:</td>'+
        '<td colspan="3" align="left">'+invDetial.salesrepName+' '+invDetial.section+'</td>'+
        '</tr>'+
        
        '<tr>'+
        '<td></td>'+
        '<td>受注番号: </td>'+
        '<td>'+invDetial.createfrom+'</td>'+
        '<td>発行日:</td>'+
        '<td>'+invDetial.issuedate+'</td>'+
        '<td align="right">備考：</td>'+
        '<td align="left">'+invDetial.memo+'</td>'+
        '</tr>'+
        
        '<tr>'+
        '<td></td>'+
        '<td>御社発注番号: </td>'+
        '<td>' + invDetial.otherrefnum + '</td>'+
        '<td>納品日: </td>'+
        '<td colspan="3">'+invDetial.deliverydate+'</td>'+
        '</tr>' +
        
        '<tr>'+
        '<td></td>'+
        '<td>納品先:</td>'+
        '<td colspan="5">'+invDetial.deliveryDestCode+ '&nbsp;' + invDetial.deliveryDest + '&nbsp;' + (invDetial.postalcode ? '〒' + invDetial.postalcode : '')+ '&nbsp;'+invDetial.prefectures+ '&nbsp;'+ invDetial.thecitydoesnot+ '&nbsp;'+ invDetial.addressone+ '&nbsp;'+ invDetial.addresstwo+ '&nbsp;'+ invDetial.addressthree+'</td>'+
        '</tr>' +
        
        '<tr><td colspan="7"></td></tr>' + 

        '<tr>'+
        '<td></td>'+
        '<td class="border-tb-dash">明&nbsp;&nbsp;細</td>'+
        '<td colspan="2" align="right" class="border-tb-dash"></td>'+
        '<td align="right" class="border-tb-dash">数量</td>'+
        '<td align="right" class="border-tb-dash">単価</td>'+
        '<td align="right" class="border-tb-dash">金額</td>'+
        '</tr>';
        
        var detailList = invDetial.sublist;
        for(var k=0; k<detailList.length; k++){
            var detail = detailList[k];
            var itemplcode = '';
            if(detail.itemProductCode && !detail.itemLocationBarcode){
                itemplcode = detail.itemProductCode;
            }else if(!detail.itemProductCode && detail.itemLocationBarcode){
                itemplcode = detail.itemLocationBarcode;
            }else if(detail.itemProductCode && detail.itemProductCode){
                itemplcode = detail.itemProductCode+ '　'+detail.itemLocationBarcode;
            }
            str +='<tr>' +
            '<td></td>';
            str +='<td>'+itemplcode+'</td>'+
            '<td colspan="2">'+dealFugou(detail.itemName)+'</td>';
            var taxCodeText = detail.taxCode == 11 ? '※' : '';
            var itemCount = detail.itemCount;
            if(itemCount){
                itemCount = formatAmount1(detail.itemCount);
            }
            str +='<td align="right">'+taxCodeText+' ' +itemCount + '&nbsp;' + detail.itemUnit + '</td>';
            if(detail.itemAmount<=0){
                str +='<td align="right">${'+Math.abs(detail.itemPrice)+'?string[",##0;; roundingMode=halfUp"]}</td>';
                if(Math.abs(detail.itemAmount)==0){
                    str +='<td align="right">${'+Math.abs(detail.itemAmount)+'?string[",##0;; roundingMode=halfUp"]}</td>';
                }else{
                    str +='<td align="right">-${'+Math.abs(detail.itemAmount)+'?string[",##0;; roundingMode=halfUp"]}</td>';
                }
                //add by zhou 20230522_CH580 end 
            }else{
                str +='<td align="right">${'+Math.abs(detail.itemPrice)+'?string[",##0;; roundingMode=halfUp"]}</td>';
                str +='<td align="right">${'+Math.abs(detail.itemAmount)+'?string[",##0;; roundingMode=halfUp"]}</td>';
            }
            str +='</tr>';
        }
        
        str +='<tr>'+
        '<td></td>'+
        '<td colspan="6">'+
        '<table style=" width: 640px; border-top: 3px solid  #000000; " cellspacing="0" cellpadding="5">' +
        '<tr>'+
        '<td></td>'+
        '<td></td>'+
        '<td align="right">合計</td>'+
        '<td align="right">消費税</td>'+
        '<td align="right">御請求額</td>'+
        '</tr>';
        if(type != 'クレジットメモ'){
            for(var taxType in invDetial.taxSubList){
                var taxTypeValue = invDetial.taxSubList[taxType];
                str += '<tr>'+
                    '<td></td>';
                    str +='<td>' + taxType + '</td>';
                    str += '<td align="right">${'+Math.abs(taxTypeValue['total'])+'?string[",##0;; roundingMode=halfUp"]}</td>'+
                    '<td align="right">${'+Math.abs(taxTypeValue['tax'])+'?string[",##0;; roundingMode=halfUp"]}</td>'+
                    '<td align="right">${'+Math.abs(taxTypeValue['pay'])+'?string[",##0;; roundingMode=halfUp"]}</td>'+
                    '</tr>';
            }
        } else{
            for(var taxType in invDetial.taxSubList){
                var taxTypeValue = invDetial.taxSubList[taxType];
                str += '<tr>'+
                    '<td></td>';
                    str +='<td>' +taxType+ '</td>';
                    if(taxTypeValue['total']>=0){
                        str += '<td align="right">${'+Math.abs(taxTypeValue['total'])+'?string[",##0;; roundingMode=halfUp"]}</td>';
                    }else{
                        str += '<td align="right">-${'+Math.abs(taxTypeValue['total'])+'?string[",##0;; roundingMode=halfUp"]}</td>';
                    }
                    
                    if(taxTypeValue['tax']>=0){
                        str += '<td align="right">${'+Math.abs(taxTypeValue['tax'])+'?string[",##0;; roundingMode=halfUp"]}</td>';
                    }else{
                        str += '<td align="right">-${'+Math.abs(taxTypeValue['tax'])+'?string[",##0;; roundingMode=halfUp"]}</td>';
                    }
                    
                    if(taxTypeValue['pay']>=0){
                        str += '<td align="right">${'+Math.abs(taxTypeValue['pay'])+'?string[",##0;; roundingMode=halfUp"]}</td>';
                    }else{
                        str += '<td align="right">-${'+Math.abs(taxTypeValue['pay'])+'?string[",##0;; roundingMode=halfUp"]}</td>';
                    }
                    str += '</tr>';
            }
        }
        if(type != 'クレジットメモ'){
            str +=
                '<tr>'+
                '<td>※軽減税率対象</td>'+
                '<td class="border-top-dot"> 合計 </td>'+
                '<td class="border-top-dot" align="right">${'+Math.abs(invDetial.totalSum)+'?string[",##0;; roundingMode=halfUp"]}</td>'+ // ?string[",##0;; roundingMode=halfUp"] 四捨五入 小数を2桁残
                '<td class="border-top-dot" align="right">${'+Math.abs(invDetial.taxSum)+'?string[",##0;; roundingMode=halfUp"]}</td>'+
                '<td class="border-top-dot" align="right">${'+Math.abs(invDetial.paySum)+'?string[",##0;; roundingMode=halfUp"]}</td>'+
                '</tr>';
        } else{
            str +=
                '<tr>'+
                '<td>※軽減税率対象</td>'+
                '<td class="border-top-dot"> 合計 </td>';
                if(Math.abs(invDetial.totalSum) == 0){
                    str += '<td class="border-top-dot" align="right">${'+Math.abs(invDetial.totalSum)+'?string[",##0;; roundingMode=halfUp"]}</td>';
                }else{
                    str += '<td class="border-top-dot" align="right">-${'+Math.abs(invDetial.totalSum)+'?string[",##0;; roundingMode=halfUp"]}</td>';
                }
                if(Math.abs(invDetial.taxSum) == 0){
                    str += '<td class="border-top-dot" align="right">${'+Math.abs(invDetial.taxSum)+'?string[",##0;; roundingMode=halfUp"]}</td>';
                }else{
                    str += '<td class="border-top-dot" align="right">-${'+Math.abs(invDetial.taxSum)+'?string[",##0;; roundingMode=halfUp"]}</td>';
                }
                if(Math.abs(invDetial.paySum) == 0){
                    str += '<td class="border-top-dot" align="right">${'+Math.abs(invDetial.paySum)+'?string[",##0;; roundingMode=halfUp"]}</td>';
                }else{
                    str += '<td class="border-top-dot" align="right">-${'+Math.abs(invDetial.paySum)+'?string[",##0;; roundingMode=halfUp"]}</td>';
                }
                str += ' </tr>';
        }
        str += '</table>'+
        '</td>'+
        '</tr>';
        str += '<tr><td colspan="7"></td></tr>';
    }
    
    str += '</table>'+
    '</body>'+
    '</pdf>'+
    '</pdfset>';
	// nlapiLogExecution('debug', 'html str', str);
	return str;

}

//合計請求書送信
function invoiceSumSendmail(fax,mail,sendtype,subsidiary,mailType,salesman){
	var title;
	var body;
	var sendMailFlag = 'F';
	var sendFaxFlag = 'F';
	if(sendtype == '26' && !isEmpty(fax)){
		//faxの場合
//		sendFaxFlag = 'T';
//		var templeteObj =  getMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman)
//		return templeteObj;
	}else if(sendtype == '27' && !isEmpty(mail)){
		//emailの場合
		sendMailFlag = 'T';
		var templeteObj =  getMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman)
		return templeteObj;
	}else if(sendtype == '28' && !isEmpty(fax) && !isEmpty(mail)){
		//fax&emailの場合
		sendMailFlag = 'T';
//		sendFaxFlag = 'T';
		var templeteObj =  getMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman)
		return templeteObj;

	}
}

	//add by zzq CH671 20230704 start
function othChargeDisplayname(dpn) {
    var itemName = '';
    if(dpn) {
        itemSearchName = dpn.split("/");
        itemName = itemSearchName[0];
    }
        return itemName;
}
    	
	/**
     * 符号処理
     * 
     * @param val
     * @returns {String}
     */
function dealFugou(value) {
    var reValue = '';
        reValue = value.replace(new RegExp('&', 'g'), '&amp;')
                       .replace(new RegExp('&amp;lt;', 'g'), '&lt;') // [&]を置き換えると、元々エスケープ処理されている[<]が変化するため、戻す
                       .replace(new RegExp('&amp;gt;', 'g'), '&gt;');
    return reValue;
}
	// add by zzq CH671 20230704 end

function formatAmount1(number) {
    var parts = number.toString().split(".");
    var integerPart = parts[0];
    var decimalPart = parts.length > 1 ? "." + parts[1] : "";
    
    var pattern = /(\d)(?=(\d{3})+$)/g;
    integerPart = integerPart.replace(pattern, "$1,");
    
    return integerPart + decimalPart;
}
//CH755 20230726 add by zdj start
/*
*送信
*/
function sendEmail(keyId){

    var jobSearch = nlapiSearchRecord("customrecord_djkk_inv_summary_execution",null,
            [
               ["internalid","anyof",keyId]
            ], 
            [ 
               new nlobjSearchColumn("custrecord_djkk_totalinv_num"), 
            ]
            );
    

    var totalinvNum = jobSearch[0].getValue("custrecord_djkk_totalinv_num");
    var totalinvNumArr = totalinvNum.split(/[(\r\n)\r\n]+/);
    for(var k=0;k<totalinvNumArr.length;k++){
        if(!totalinvNumArr[k]){
            totalinvNumArr.splice(k,1);
        };
    }
    nlapiLogExecution('debug','totalinvNumArr',totalinvNumArr);
//  totalinvNumArr.forEach((item,index))=>{
//      
//  };
    for(var i =0;i<totalinvNumArr.length;i++){
        var summarySearch = nlapiSearchRecord("customrecord_djkk_invoice_summary",null,
                [
                   ["custrecord_djkk_totalinv_no","is",totalinvNumArr[i]]
                ], 
                [
                   new nlobjSearchColumn("custrecord_djkk_inv_pdf"), 
                   new nlobjSearchColumn("custrecord_djkk_inv_mail_pdf"),
                   new nlobjSearchColumn("custrecord_djkk_inv_customer"),
                   new nlobjSearchColumn("custrecord_djkk_totalinv_no")
                ]
                );
    
        if(!isEmpty(summarySearch)){
            nlapiLogExecution('debug','summarySearch.length ',summarySearch.length);
            for(var cd = 0 ; cd < summarySearch.length ; cd++){
                //DJ_pdf表示
                var pdfFileId = summarySearch[cd].getValue("custrecord_djkk_inv_mail_pdf");
                if (!pdfFileId) {
                    pdfFileId = summarySearch[cd].getValue("custrecord_djkk_inv_pdf");
                }
                var customerId = summarySearch[cd].getValue("custrecord_djkk_inv_customer");
                var totalinvNo = summarySearch[cd].getValue("custrecord_djkk_totalinv_no");
                //DJ_顧客
                var customRec = nlapiLoadRecord('customer', customerId);
                //合計請求書送信
                var subsidiary = defaultEmpty(customRec.getFieldValue('subsidiary'));
                var invoiceSumPeriodtype = '25';//合計請求書送信方法不要の場合
                var invoiceSumSite = '';//DJ_合計請求書送信先区分
                var invoiceSumPerson = '';//DJ_合計請求書送信先担当者
                var invoiceSumSubName = '';//DJ_合計請求書送信先会社名(3RDパーティー)
                var invoiceSumPersont = '';//DJ_合計請求書送信先担当者(3RDパーティー)
                var invoiceSumEmail = '';//DJ_合計請求書送信先メール(3RDパーティー)
                var invoiceSumFax = '';//DJ_合計請求書送信先FAX(3RDパーティー)
                var invoiceSumMemo = '';//DJ_合計請求書送信先登録メモ
                
                var salesman =defaultEmpty(customRec.getFieldValue('salesrep'));
                var templeteObj;//MALLとFAXテンプレートObj
                nlapiLogExecution('debug','subsidiary',subsidiary)
                if(subsidiary == SUB_SCETI || subsidiary == SUB_DPKK){
                    invoiceSumPeriodtype = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_period'));//DJ_合計請求書送信区分
                    invoiceSumSite = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_site'));//DJ_合計請求書送信先区分
                    invoiceSumPerson = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_person'));//DJ_合計請求書送信先担当者
                    invoiceSumSubName = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_subname'));//DJ_合計請求書送信先会社名(3RDパーティー)
                    invoiceSumPersont = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_person_t'));//DJ_合計請求書送信先担当者(3RDパーティー)
                    invoiceSumEmail = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_email'));//DJ_合計請求書送信先メール(3RDパーティー)
                    invoiceSumFax = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_fax'));//DJ_合計請求書送信先FAX(3RDパーティー)
                    invoiceSumMemo = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_memo'));//DJ_合計請求書送信先登録メモ
                }else if(subsidiary == SUB_NBKK || subsidiary == SUB_ULKK){
                    var invoiceSumFlg = defaultEmpty(customRec.getFieldValue('custentity_djkk_totalinv_pdfsend_flg'));
                    nlapiLogExecution('debug','invoiceSumFlg',invoiceSumFlg)
                    if(invoiceSumFlg == "T"){
                        invoiceSumPeriodtype = '27';//DJ_合計請求書送信方法  (両方)
                        nlapiLogExecution('debug','invoiceSumFlg3',invoiceSumPeriodtype)
                    }else{
                        invoiceSumPeriodtype = '25';//DJ_合計請求書送信方法  (不要)
                    }
                    invoiceSumSite = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_site'));//DJ_合計請求書送信先区分
                    invoiceSumPerson = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_person'));//DJ_合計請求書送信先担当者
                    invoiceSumSubName = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_subname'));//DJ_合計請求書送信先会社名(3RDパーティー)
                    invoiceSumPersont = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_person_t'));//DJ_合計請求書送信先担当者(3RDパーティー)
                    invoiceSumEmail = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_email'));//DJ_合計請求書送信先メール(3RDパーティー)
//                  var invoiceSumFax = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_fax'));//DJ_合計請求書送信先FAX(3RDパーティー)
                    invoiceSumMemo = defaultEmpty(customRec.getFieldValue('custentity_djkk_invoice_sum_memo'));//DJ_合計請求書送信先登録メモ
                }
                
                if(invoiceSumPeriodtype != '25' && !isEmpty(invoiceSumPeriodtype)){
                    //合計請求書送信
                    nlapiLogExecution('debug','invoiceSum on','invoiceSum on')
                    var customer = customerId;//顧客
//                  var customform = data.customform;
                    var mailType;
                    nlapiLogExecution('debug','invoiceSum sendmail start')
                    mailType = '合計請求書';
                    var mailTempleteObj = {};
                    var faxTempleteObj = {};
                    //DJ_合計請求書送信
                    if(invoiceSumPeriodtype != '25' &&(subsidiary == SUB_NBKK || subsidiary == SUB_ULKK)){
                        nlapiLogExecution('debug','invoiceSumSite',invoiceSumSite)
                        var mail = defaultEmpty(customRec.getFieldValue('email')); //email
                        if(invoiceSumSite == '29'){
                            //送信顧客先の場合
//                              var custRecord = nlapiLoadRecord('customer',customer);
                            var fax = ''; //fax
                            var mail = defaultEmpty(customRec.getFieldValue('email')); //email
                            templeteObj = invoiceSumSendmail1(fax,mail,invoiceSumPeriodtype,subsidiary,mailType,salesman,totalinvNo);
                        }else{
                            //3rd
                            var fax = '';
                            var mail = defaultEmpty(invoiceSumEmail);
                            templeteObj = invoiceSumSendmail1(fax,mail,invoiceSumPeriodtype,subsidiary,mailType,salesman,totalinvNo);
                        };
                    }else if (invoiceSumPeriodtype != '25' &&(subsidiary == SUB_SCETI || subsidiary == SUB_DPKK)){
                        if(invoiceSumSite == '29'){
                            //送信顧客先の場合
//                          var custRecord = nlapiLoadRecord('customer',customer);
                            var fax = defaultEmpty(customRec.getFieldValue('fax')); //fax
                            var mail = defaultEmpty(customRec.getFieldValue('email')); //email
                            templeteObj = invoiceSumSendmail1(fax,mail,invoiceSumPeriodtype,subsidiary,mailType,salesman,totalinvNo);
                        }else{
                            //3rd
                            var fax = defaultEmpty(invoiceSumFax);
                            var mail = defaultEmpty(invoiceSumEmail);
                            templeteObj = invoiceSumSendmail1(fax,mail,invoiceSumPeriodtype,subsidiary,mailType,salesman,totalinvNo)
                        };
                    };
                }
                if(!isEmpty(templeteObj)){
                    mailTempleteObj = templeteObj.mailTempleteObj;
                    faxTempleteObj = templeteObj.faxTempleteObj;
                };
                nlapiLogExecution('debug','invoiceSumPeriodtype',invoiceSumPeriodtype)
                
                if(invoiceSumPeriodtype != '25' &&!isEmpty(mailTempleteObj)){
                    
                    var pdfFileIdArr = [];
                    pdfFileIdArr.push(pdfFileId);
                    if(mailTempleteObj){
                        var mailover =automaticSendmail(mailTempleteObj,pdfFileIdArr);
                        nlapiLogExecution('debug','mailover',mailover);
                    }
//                    if(faxTempleteObj){
//                        var faxover =automaticSendFax(faxTempleteObj,pdfFileIdArr);
//                        nlapiLogExecution('debug','send',faxover);
//                    }
//                  // 画面条件変更場合、メッセージ出てこないのため
//                  window.ischanged = false;
//                  // 画面をリフレッシュする
//                  window.location.href = https;
                }
                if(invoiceSumPeriodtype != '25' &&!isEmpty(faxTempleteObj)){

                    var pdfFileIdArr = [];
                    pdfFileIdArr.push(pdfFileId);
//                    if(mailTempleteObj){
//                        var mailover =automaticSendmail(mailTempleteObj,pdfFileIdArr);
//                        nlapiLogExecution('debug','mailover',mailover);
//                    }
                    if(faxTempleteObj){
                        var faxover =automaticSendFax(faxTempleteObj,pdfFileIdArr);
                        nlapiLogExecution('debug','send',faxover);
                    }
                           
//                  // 画面条件変更場合、メッセージ出てこないのため
//                  window.ischanged = false;
//                  // 画面をリフレッシュする
//                  window.location.href = https;
                };
            };
        };
    };
}

function getInvoiceSummaryMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman,totalinvNo){
//  search
    try{
    var mailTempleteObj = {};
    var faxTempleteObj = {};
    var custEmployeeId = nlapiLookupField('employee',salesman,'custentity_djkk_employee_id');
    var mailTypeSearch = nlapiSearchRecord("customlist_djkk_mail_temple_type",null,
            [
               ["name","is",mailType]
            ], 
            [
               new nlobjSearchColumn("internalid")
            ]
            );
    if(!isEmpty(mailTypeSearch)){
        var mailTypeId = mailTypeSearch[0].getValue("internalid"); //DJ_送信種類ID
    }
    if(sendMailFlag == 'T' && !isEmpty(mailTypeId) && !isEmpty(mail)){
        var mailtemplateSearch = nlapiSearchRecord("customrecord_djkk_template",null,
                [
                   ["custrecord_djkk_tmp_sub","anyof",subsidiary], //DJ_子会社
                   "AND", 
                   ["custrecord_djkk_tmp_faxuse","is","F"], //FAXテンプレートフィールド
                   "AND", 
                   ["custrecord_djkk_tmp_mailuse","is","T"], //MALLテンプレートフィールド
                   "AND", 
                   ["custrecord_djkk_tmp_type","anyof",mailTypeId]//DJ_送信種類
                ], 
                [
                   new nlobjSearchColumn("custrecord_djkk_tmp_sub"), //DJ_子会社
                   new nlobjSearchColumn("custrecord_djkk_tmp_type"), //DJ_送信種類
                   new nlobjSearchColumn("custrecord_djkk_tmp_faxuse"), //FAXテンプレートフィールド
                   new nlobjSearchColumn("custrecord_djkk_tmp_mailuse"), //MALLテンプレートフィールド
                   new nlobjSearchColumn("custrecord_djkk_tmp_from"), //From address
                   new nlobjSearchColumn("custrecord_djkk_tmp_to"), //TO address
                   new nlobjSearchColumn("custrecord_djkk_tmp_to_muster"), //Email address from the client master
                   new nlobjSearchColumn("custrecord_djkk_tmp_bcc"), //BCC
                   new nlobjSearchColumn("custrecord_djkk_tmp_subject"), //Subject
                   new nlobjSearchColumn("custrecord_djkk_tmp_body"), //Body
                   new nlobjSearchColumn("custrecord_djkk_tmp_filetype"), //Attachment file name
                   new nlobjSearchColumn("custrecord_djkk_tmp_flnameissub")//Same contents as subject
                ]
                );
        var formAddress = mailtemplateSearch[0].getValue("custrecord_djkk_tmp_from"); //From address
        var toAddress = mailtemplateSearch[0].getValue("custrecord_djkk_tmp_to");//TO address
        var bcc = mailtemplateSearch[0].getValue("custrecord_djkk_tmp_bcc");//BCC
        var addressFormMuster = mailtemplateSearch[0].getValue("custrecord_djkk_tmp_to_muster");////Email address from the client master
        if(addressFormMuster == 'T'){
            toAddress = mail;
        }
        var subject = mailtemplateSearch[0].getValue("custrecord_djkk_tmp_subject");//subject
      //add by zzq CH675 20230818 start
//        subject += getdateYYMMDD()+'_'+totalinvNo;
        subject = subject + '_' + getDateYymmddFileName02()+'_'+totalinvNo;
      //add by zzq CH675 20230818 end
        var body = mailtemplateSearch[0].getValue("custrecord_djkk_tmp_body");//body
        var fileName = mailtemplateSearch[0].getValue("custrecord_djkk_tmp_filetype");//Attachment file name
        var fileNameFormSubject = mailtemplateSearch[0].getValue("custrecord_djkk_tmp_flnameissub");// SAME CONTENTS AS SUBJECT
        if(fileNameFormSubject == 'T'){
            fileName = subject;
        }else{
          //add by zzq CH675 20230818 start
//            fileName = fileName + getdateYYMMDD()+'_'+totalinvNo;
            fileName = fileName + '_' + getDateYymmddFileName02()+'_'+totalinvNo;
          //add by zzq CH675 20230818 end
        }
        mailTempleteObj ={
                formAddress:formAddress,
                toAddress:toAddress,
                bcc:bcc,
                addressFormMuster:addressFormMuster,
                subject:subject,
                body:body,
                fileName:fileName,
                fileNameFormSubject:fileNameFormSubject
        }
    }
    if(sendFaxFlag == 'T' && !isEmpty(mailTypeId) && !isEmpty(fax)){
        var faxtemplateSearch = nlapiSearchRecord("customrecord_djkk_template",null,
                [
                   ["custrecord_djkk_tmp_sub","anyof",subsidiary], //DJ_子会社
                   "AND", 
                   ["custrecord_djkk_tmp_faxuse","is","T"], //FAXテンプレートフィールド
                   "AND", 
                   ["custrecord_djkk_tmp_mailuse","is","F"], //MALLテンプレートフィールド
                   "AND", 
                   ["custrecord_djkk_tmp_type","anyof",mailTypeId]//DJ_送信種類
                ], 
                [
                   new nlobjSearchColumn("custrecord_djkk_tmp_sub"), //DJ_子会社
                   new nlobjSearchColumn("custrecord_djkk_tmp_type"), //DJ_送信種類
                   new nlobjSearchColumn("custrecord_djkk_tmp_faxuse"), //FAXテンプレートフィールド
                   new nlobjSearchColumn("custrecord_djkk_tmp_mailuse"), //MALLテンプレートフィールド
                   new nlobjSearchColumn("custrecord_djkk_tmp_from"), //From address
                   new nlobjSearchColumn("custrecord_djkk_tmp_to"), //TO address
                   new nlobjSearchColumn("custrecord_djkk_tmp_to_muster"), //Email address from the client master
                   new nlobjSearchColumn("custrecord_djkk_tmp_bcc"), //BCC
                   new nlobjSearchColumn("custrecord_djkk_tmp_subject"), //Subject
                   new nlobjSearchColumn("custrecord_djkk_tmp_body"), //Body
                   new nlobjSearchColumn("custrecord_djkk_tmp_filetype"), //Attachment file name
                   new nlobjSearchColumn("custrecord_djkk_tmp_flnameissub")//Same contents as subject
                ]
                );
        var formAddress = faxtemplateSearch[0].getValue("custrecord_djkk_tmp_from"); //From address
        var toAddress = faxtemplateSearch[0].getValue("custrecord_djkk_tmp_to");//TO address
        var bcc = faxtemplateSearch[0].getValue("custrecord_djkk_tmp_bcc");//BCC
        var addressFormMuster = faxtemplateSearch[0].getValue("custrecord_djkk_tmp_to_muster");////Email address from the client master
        if(addressFormMuster == 'T'){
            toAddress = fax;
        }
        var subject = faxtemplateSearch[0].getValue("custrecord_djkk_tmp_subject");//subject
        subject += custEmployeeId+ '-' + totalinvNo;
        
        var body = faxtemplateSearch[0].getValue("custrecord_djkk_tmp_body");//body
        var fileName = faxtemplateSearch[0].getValue("custrecord_djkk_tmp_filetype");//Attachment file name
        var fileNameFormSubject = faxtemplateSearch[0].getValue("custrecord_djkk_tmp_flnameissub");// SAME CONTENTS AS SUBJECT
        if(fileNameFormSubject == 'T'){
            fileName = subject;
        }else{
            fileName = fileName+custEmployeeId+ '-' +totalinvNo;
        }
        
        faxTempleteObj ={
                formAddress:formAddress,
                toAddress:toAddress,
                bcc:bcc,
                addressFormMuster:addressFormMuster,
                subject:subject,
                body:body,
                fileName:fileName,
                fileNameFormSubject:fileNameFormSubject
        }
    }
    var recultObj = {
            mailTempleteObj:mailTempleteObj,
            faxTempleteObj:faxTempleteObj
            }
    return recultObj
    }catch(e){
        nlapiLogExecution('debug','message',e)
    }
    
}

//合計請求書送信
function invoiceSumSendmail1(fax,mail,sendtype,subsidiary,mailType,salesman,totalinvNo){
    var title;
    var body;
    var sendMailFlag = 'F';
    var sendFaxFlag = 'F';
    if(sendtype == '26' && !isEmpty(fax)){
        //faxの場合
//      sendFaxFlag = 'T';
//      var templeteObj =  getMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman)
//      return templeteObj;
    }else if(sendtype == '27' && !isEmpty(mail)){
        //emailの場合
        sendMailFlag = 'T';
//      var templeteObj =  getMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman,totalinvNo)
        var templeteObj =  getInvoiceSummaryMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman,totalinvNo)
        return templeteObj;
    }else if(sendtype == '28' && !isEmpty(fax) && !isEmpty(mail)){
        //fax&emailの場合
        sendMailFlag = 'T';
//      sendFaxFlag = 'T';
//      var templeteObj =  getMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman,totalinvNo)
        var templeteObj =  getInvoiceSummaryMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman,totalinvNo)
        return templeteObj;

    }
}
//CH755 20230726 add by zdj end