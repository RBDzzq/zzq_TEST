/**
 * 共通ライブラリ
 * 
 * Version    Date            Author           Remarks
 * 1.00       2021/03/08     CPC_苑
 *
 */

/**
 *SutApp use 内部ID
 */

// DJ_NO_BBD recordType
var DJ_NO_BBD_RECORDTYPE_ARY = ['assemblyitem','lotnumberedassemblyitem','serializedassemblyitem','inventoryitem','lotnumberedinventoryitem','serializedinventoryitem'];

// 月 to 日数
var DAYS_FROM_MONTH_TO_DAY = 30;

var CUSTOMER_CUSTOMFORM_DISABLED_LS_ID = '137';
var CUSTOMER_CUSTOMFORM_DISABLED_LS_FOOD = '143';

var VENDOR_CUSTOMFORM_DISABLED_LS_ID = '106';
var VENDOR_CUSTOMFORM_DISABLED_LS_FOOD = '120';

// DJ_納品書自動送信ファイルキャビネット内部ID
var DELIVERYNOTE_FILE_CABINET_ID = '785';

// カスタムフォーム :DJ_発注書_食品
var cusform_id_po_food='110';
//カスタムフォーム :DJ_発注書_LS
var cusform_id_po_ls='169';

/**
 * 印章
 */
var NBKK_INSYOU_ID = 480236;
var NBKK_INSYOU_URL = 'h=I4MoOlKGNT5wClfzyGHDmnp273JBVQ9BPk9YazigRcR_dkkh';
var ULKK_INSYOU_ID = 480237;
var ULKK_INSYOU_URL = 'h=fr6dWpla-OixbfSgxwZye-1GZrZbgtlIsaTCz9wIGzkSuBIO';

/**
 * ファイルキャビネット内部ID
 */
//20230901 add by CH762 start

//発注書
var PURCHASEORDER_PDF_DJ_PURCHASEORDERPDF_NBKK = '300931';
var PURCHASEORDER_PDF_DJ_PURCHASEORDERPDF_ULKK = '301046';
//前受金請求書
var SALESORDER_PDF_DJ_SALESORDERPDF_NBKK = '300929';
var SALESORDER_PDF_DJ_SALESORDERPDF_ULKK = '301044';
//食品個別請求書
var CREDITMEMO_PDF_IN_MAIL_DJ_CREDITMEMOPDF_NBKK = '300926';
var CREDITMEMO_PDF_IN_MAIL_DJ_CREDITMEMOPDF_ULKK = '301041';
//食品価格入り納品書
var DELIVERY_PDF_IN_CM_MAIL_DJ_DELIVERYPDF_NBKK = '300925';
var DELIVERY_PDF_IN_CM_MAIL_DJ_DELIVERYPDF_ULKK = '301040';
//セールスレポート
var FILE_CABINET_ID_SALES_REPORT_NBKK = '300927';
var FILE_CABINET_ID_SALES_REPORT_ULKK = '301042';
//請求書
var INVOICE_PDF_MAIL_DJ_INVOICEPDF_NBKK = '300920';
var INVOICE_PDF_MAIL_DJ_INVOICEPDF_ULKK = '300935';
//DJ_納品書PDF
var DELIVERY_PDF_IN_CM_DJ_DELIVERYPDF_NBKK = '300924';
var DELIVERY_PDF_IN_CM_DJ_DELIVERYPDF_ULKK = '301039';
//DJ_個別請求書PDF
var INVOICE_REQUESE_PDF_DJ_INVOICEREQUESTPDF_NBKK = '300923';
var INVOICE_REQUESE_PDF_DJ_INVOICEREQUESTPDF_ULKK = '301038';
//仕入先返品(輸入)PDF
var FILE_CABINET_ID_IMPORT_PDF_NBKK = '300917';
var FILE_CABINET_ID_IMPORT_PDF_ULKK = '300932';
//合計請求書
var FILE_CABINET_ID_TOTAL_INV_NBKK = '300928';
var FILE_CABINET_ID_TOTAL_INV_ULKK = '301043';
//DJ_実地棚卸
var FILE_CABINET_ID_DJ_ACTUAL_INVENTORY_NBKK = '300918';
var FILE_CABINET_ID_DJ_ACTUAL_INVENTORY_ULKK = '300933';
//在庫レポート
var FILE_CABINET_ID_INVENTORY_REPORT_NBKK = '300919';
var FILE_CABINET_ID_INVENTORY_REPORT_ULKK = '300934';
//SC課FCレポート_食品
var FILE_CABINET_ID_FC_REPORT_NBKK = '300921';
var FILE_CABINET_ID_FC_REPORT_ULKK = '300936';
//営業計画情報レポート_食品
var FILE_CABINET_ID_BP_REPORT_NBKK = '300922';
var FILE_CABINET_ID_BP_REPORT_ULKK = '300937';
//20230901 add by CH762 end

//個別請求書PDF
var INVOICE_REQUESE_PDF_DJ_INVOICEREQUESTPDF = 45870;
//納品書PDF
var DELIVERY_FILE_PDF_IN_DJ_DELIVERYPDF = 37968;
//DJ_出荷案内書
var DELIVERY_PDF_IN_DJ_DELIVERYPDF = 34867;
// 五聯単PDF
var FIVE_PDF_IN_DJ_FIVEPDF = 34564;
//請求書PDF
var INVOICE_PDF_ID_DJ_INVOICEPDF = 34566;
//CH762 20230811 add by zdj start
//発注書PDF
var PURCHASEORDER_PDF_DJ_PURCHASEORDERPDF = 281490;
//前受金請求書PDF
var SALESORDER_PDF_DJ_SALESORDERPDF = 281491;
//合計請求書PDF
var CABINET_PDF_DJ_CABINETPDF = 373;
//CH762 20230811 add by zdj end
//請求書PDF送信
//CH762 20230814 add by zdj start
var INVOICE_PDF_MAIL_DJ_INVOICEPDF = 282093;
//CH762 20230814 add by zdj end
//クレジットメモ-個別請求書PDF送信
//CH762 20230815 add by zdj start
var CREDITMEMO_PDF_IN_MAIL_DJ_CREDITMEMOPDF = 284495;
//CH762 20230815 add by zdj end
//価格入り納品書PDF 自動送信
//CH762 20230815 add by zdj start
var DELIVERY_PDF_IN_CM_MAIL_DJ_DELIVERYPDF = 285897;
//DJ_納品書PDF
var DELIVERY_PDF_IN_CM_DJ_DELIVERYPDF = 287698;
//見積
var ESTIMATE_PDF_DJ_ESTIMATEPDF = 290801;
//CH762 20230815 add by zdj end
// DJ_EDI
var FILE_CABINET_ID_DJ_DEI = 336;
// DJ_EDI JRAM
var FILE_CABINET_ID_DJ_EDI_JRAM = 337;
// DJ_EDI JRAM BK
var FILE_CABINET_ID_DJ_EDI_JRAM_BK = 338;
// DJ_EDI JRAM ERROR
var FILE_CABINET_ID_DJ_EDI_JRAM_ERROR = 339;
// DJ_EDI RIOS
var FILE_CABINET_ID_DJ_EDI_RIOS	= 340;
// DJ_EDI RIOS 納入済データ送信
var FILE_CABINET_ID_DJ_EDI_RIOS_DELIVERY_DATA_SND = 341;
// DJ_EDI RIOS 納入予定データ送信
var FILE_CABINET_ID_DJ_EDI_RIOS_DELIVERY_SCHEDULE_DATA_SND = 342;
// DJ_EDI RIOS 注文受信
var FILE_CABINET_ID_DJ_EDI_RIOS_SO_INV = 343;
// DJ_EDI RIOS 注文受信 BK
var FILE_CABINET_ID_DJ_EDI_RIOS_BK = 344;
// DJ_EDI RIOS 注文受信 ERROR
var FILE_CABINET_ID_DJ_EDI_RIOS_ERROR = 345;
// DJ_エクセル
var FILE_CABINET_ID_DJ_EXCEL = 346;
// DJ_エクセル 基本パターン(NBKK)　FS　RE
var FILE_CABINET_ID_DJ_EXCEL_NBKK_FS_RE = 347;
// DJ_エクセル 基本＋価格提案記入追加＋追加希望項目(NBKK) RE	
var FILE_CABINET_ID_DJ_EXCEL_NBKK_RE_APS_AHI = 348;
// DJ_エクセル 即引き用(NBKK) RE
var FILE_CABINET_ID_DJ_EXCEL_NBKK_RE_IMMEDIATE = 349;
// DJ_エクセル 基本＋追加希望項目 + 価格提案記入追加(UL)
var FILE_CABINET_ID_DJ_EXCEL_UL_APS_AHI = 350;
// DJ_エクセル 基本パターン(UL)
var FILE_CABINET_ID_DJ_EXCEL_UL_FS_RE = 351;
// DJ_修理品PDF出力
var FILE_CABINET_ID_DJ_REPAIR_GOODS_PDF = 352;
// DJ_修理品納品書＆請求書PDF出力
var FILE_CABINET_ID_DJ_DELIVERY_INV_PDF = 353;
// DJ_到着荷物更新（受領）出力
var FILE_CABINET_ID_DJ_RECEIPT_UPDATE = 354;
// DJ_実地棚卸
var FILE_CABINET_ID_DJ_ACTUAL_INVENTORY = 355;
// DJ_配送伝票発行
var FILE_CABINET_ID_DJ_DELIVERY_SLIP_ISSUE = 356;
// DJ_預かり在庫配送伝票
var FILE_CABINET_ID_DJ_DEPOSIT_STOCK_DELIVERY_SLIP = 357;
// EDIデータ_ケイヒン
var FILE_CABINET_ID_EDI_DATA_KEIHIN = 358;
// EDIデータ_ケイヒン	DONE
var FILE_CABINET_ID_EDI_DATA_KEIHIN_DONE = 359;
// EDIデータ_ケイヒン	PROCESSING
var FILE_CABINET_ID_EDI_DATA_KEIHIN_PROCESSING = 360;
// EDIデータ_ケイヒン	BAK
var FILE_CABINET_ID_EDI_DATA_KEIHIN_BAK = 361;
// EDIデータ_ケイヒン	RAW
var FILE_CABINET_ID_EDI_DATA_KEIHIN_RAW = 362;
// EDIデータ_ケイヒン	ERROR
var FILE_CABINET_ID_EDI_DATA_KEIHIN_ERROR = 363;
// FBデータ
var FILE_CABINET_ID_FB_DATA = 364;
// INVOICE SUMMARIES
var FILE_CABINET_ID_INVOICE_SUMMARIES = 209;
// INVOICE SUMMARIES DENISファーマ株式会社
var FILE_CABINET_ID_INVOICE_SUMMARIES_DENIS_COMPANY = 379;
// INVOICE SUMMARIES 関連会社２
var FILE_CABINET_ID_INVOICE_SUMMARIES_COMPANY2 = 380;
// INVOICE SUMMARIES 関連会社１
var FILE_CABINET_ID_INVOICE_SUMMARIES_COMPANY1 = 381;
// PRINTED PURCHASE ORDERS
var FILE_CABINET_ID_PRINTED_PURCHASE_ORDERS = 208;
// PRINTED PURCHASE ORDERS 	DENISファーマ株式会社
var FILE_CABINET_ID_PRINTED_PURCHASE_ORDERS_DENIS_COMPANY = 382;
// PRINTED PURCHASE ORDERS	関連会社２
var FILE_CABINET_ID_PRINTED_PURCHASE_ORDERS_COMPANY2 = 383;
// PRINTED PURCHASE ORDERS	関連会社１
var FILE_CABINET_ID_PRINTED_PURCHASE_ORDERS_COMPANY1 = 384;
// SC課FCレポート
var FILE_CABINET_ID_FC_REPORT = 790;
// カスタム入金データ
var FILE_CABINET_ID_CUSTOM_DEPOSIT_DATA = 366;
// ケイヒン倉庫出荷指示
var FILE_CABINET_ID_KEIHIN_SHIPPING = 367;
// セールスレポート
var FILE_CABINET_ID_SALES_REPORT = 368;
// 仕入先返品(輸入)PDF
var FILE_CABINET_ID_IMPORT_PDF = 369;
// 倉庫移動指示リスト
var FILE_CABINET_ID_WAREHOUSE_LIST = 370;
// 倉庫移動指示
var FILE_CABINET_ID_WAREHOUSE_MOVE = 371;
// 入荷送信PDF
var FILE_CABINET_ID_INCOMING_PDF = 372;
// 合計請求書
var FILE_CABINET_ID_TOTAL_INV = 373;
// 合計請求書出力ファイル
var FILE_CABINET_ID_TOTAL_INV_OUTPUT_FILE = 374;
// 営業計画情報レポート
var FILE_CABINET_ID_PLAN_REPORT = 375;
// 在庫レポート
var FILE_CABINET_ID_INVENTORY_REPORT = 376;
// 場所/保管棚バーコード
var FILE_CABINET_ID_LOCATION_STORAGE_BARCODE = 377;
// 送信
var FILE_CABINET_ID_SND_MAIL = 378;
// URL
var URL_HEADER = 5722722;
// 営業計画情報レポートCSV
var FILE_CABINET_ID_FC_CSV_BP = 31130;
//営業計画情報レポートCSV_upload
var FILE_CABINET_ID_FC_CSV_UPLOAD_BP = 31131;
//営業計画情報レポートCSV_download
var FILE_CABINET_ID_FC_CSV_DOWNLOAD_BP = 31132;
//DJ_預かり在庫検索CSV出力
var FILE_CABINET_ID_DJ_INVENTORY_CUSTODY = 898;
//DJ_送り状作成機能csvデータ
var FILE_CABINET_ID_DJ_INVOICE_CREATE_MAIN = 86930;
//配送用CSV出力
var FILE_CABINET_ID_DJ_OUTOUT_DELIVERY_CSV = 87031;
//連結子会社内部ID
var SUB_DJKK = 1;
var SUB_NBKK = 2;
var SUB_ULKK = 4;
var SUB_SCETI = 6;
var SUB_DPKK = 7;

/**
 * 定数
 */
var itemreceipt_ls_form_id=148;
var itemreceipt_food_form_id=182;
var developers_employee_id=114;
/**
 * メールテンプレートパラメータ
 */
//通知メールテンプレート注文書
var custemailtmpl_notice_mailtemp_salesorder = 6;
//通知メールテンプレート納品書
var custemailtmpl_notice_mailtemp_salesorder_delivery = 5;
//通知メールテンプレート請求書
var custemailtmpl_notice_mailtemp_invoice = 7;
//通知メールテンプレート前受金
var custemailtmpl_notice_mailtemp_customerdeposit = 8;
//通知メールテンプレート受注納期自動送信
var custemailtmpl_notice_mailtemp_order_delivery_date = 9;
//通知メールテンプレート配送自動送信
var custemailtmpl_notice_mailtemp_delivery_send = 10;
//通知メールテンプレート請求書自動送信
var custemailtmpl_notice_mailtemp_invoice_send = 11;
//通知faxテンプレート配送自動送信
var custemailtmpl_notice_faxtemp_delivery_send = 2;//
//固定メール送信する先
var mail_address_temp = 'zhao.zhi@car24.co.jp';
//出荷回復指定の承認者にメール
var mail_address_shipmentback = 'zhao.zhi@car24.co.jp';
//固定メール送信:経理担当者メール
var mail_address_manager = 'sun@car24.co.jp';

//20230417 add by zhou start
//example:  https://5722722-sb1.app.netsuite.com/core/media/media.nl?id=3266&c=5722722_SB1&whence=

//固定URLタイトル
var URL_HEAD = 'https://5722722-sb1.app.netsuite.com';
//本番固定URLタイトル  : 'https://5722722.app.netsuite.com';

//SECURE固定URLタイトル
var SECURE_URL_HEAD = 'https://5722722-sb1.secure.netsuite.com';
//本番 SECURE固定URLタイトル :'https://5722722.secure.netsuite.com';

//リンクパラメータ 固定URLタイトル:C
var URL_PARAMETERS_C = 'c=5722722_SB1';
//本番 SECURE固定URLタイトル:C :'c=5722722';
//20230417 add by zhou end

//DJ_言語:「日本語」
var LANGUAGE_JP = '26';
//DJ_言語:「英語」
var LANGUAGE_EN = '13';
//言語:「日本語」
var SYS_LANGUAGE_JP = 'ja_JP';
//言語:「英語」
var SYS_LANGUAGE_EN = 'en';
/**
 * 空値を判断
 * 
 * @param str
 *            対象
 * @returns 判断結果
 */
function isEmpty(obj) {
	if (obj === undefined || obj == null || obj === '') {
		return true;
	}
	if (obj.length && obj.length > 0) {
		return false;
	}
	if (obj.length === 0) {
		return true;
	}
	for ( var key in obj) {
		if (hasOwnProperty.call(obj, key)) {
			return false;
		}
	}
	if (typeof (obj) == 'boolean') {
		return false;
	}
	if (typeof (obj) == 'number') {
		return false;
	}
	return true;
}

/**
 * 
 * 
 * @param 割合
 *            
 * @returns 対象
 */
function toPoint(percent){
    var str=percent.replace("%","");
    str= str/100;
    return str;
}

/**
 * デジタル変換の割合
 * 
 * @param point
 *            対象
 * @returns 割合
 */
function toPercent(point) {
	var str = Number(point * 100).toFixed(2);
	str += "%";
	return str;
}

/**
 * 入力ルールのカナチェック
 * 
 * @param str 対象
 * @returns チェック結果
 */
function inputCheckKana(str) {
    var checkFlg = false;
    var reg = /^[a-zA-Z0-9\uff66-\uff9fｦ-ﾟ]*$/;
    if (str == null || str.length == 0 || reg.test(str.toString())) {
        checkFlg = true;
    }
//    if (str == null || str.length == 0 || !!str.match(/^a-zA-Z0-9[ｦ-ﾟ ]*$/)) {
//        checkFlg = true;
//    }
    return checkFlg;
}

/**
 * 数字以外の文字を除外する
 * 
 * @param str
 * @returns {Array}
 */
function replaceExceptNumber(str){
	  return str.replace(/[^0-9]/ig,"");
	}

/**
 * 数字アルファベット以外の文字を除外する
 * 
 * @param str
 * @returns {Array}
 */
function replaceExceptNumberAndLetter(str){
	  return str.replace(/[^a-zA-Z0-9]/g,"")
	}

/**
 * 検索からデータを取得する
 * 
 * @param strSearchType
 * @param filters
 * @param columns
 * @returns {Array}
 */
function getSearchResults(type, id, filters, columns) {
    var search = nlapiCreateSearch(type, filters, columns);

    // 検索し、結果を渡す
    var searchResult = search.runSearch();
    var maxCount = 0;
    var results = [];
  if(!isEmpty(searchResult)){
    var resultInfo;
    try{
    do {
        resultInfo = searchResult.getResults(maxCount, maxCount + 1000);
        if (!isEmpty(resultInfo)) {
            resultInfo.forEach(function(row) {
                results.push(row);
            });
        }
        maxCount += 1000;
    } while (resultInfo.length == 1000);
    }catch(e){}
   }
    return results;
}

/**
 * システム時間の取得メソッド
 */
function getSystemTime() {

	// システム時間
	var now = new Date();
	var offSet = now.getTimezoneOffset();
	var offsetHours = 9 + (offSet / 60);
	now.setHours(now.getHours() + offsetHours);

	return now;
}

/**
 * 先週の土曜日の日付を取得します
 */
function getLastWeekSaturday(date) {
	var nowdate = nlapiStringToDate(date);
	var returndate = '';
	var flag = true;
	while (flag) {
		var day = nowdate.getDay();
		if (day == '6') {
			returndate = nowdate;
			flag = false;
		} else {
			nowdate.setDate(nowdate.getDate() - 1);
		}
	}
	returndate = nlapiDateToString(returndate);
	return returndate;
}

/**
 * 日付の比較
 * 
 * @param strDate
 *            日付１
 * @param strDate
 *            日付２
 * @param dateFormat
 *            format
 * @returns 比較結果
 */
function compareStrDate(strDate1, strDate2) {
	var date1 = nlapiStringToDate(strDate1);
	var date2 = nlapiStringToDate(strDate2);
	if (date1 <= date2) {
		return true;
	}
	return false;
}

/**
 * 次日の取得メソッド
 */
function getTheNextDay() {

	// システム時間
	var now = new Date();
	var offSet = now.getTimezoneOffset();
	var offsetHours = 9 + (offSet / 60);
	now.setHours(now.getHours() + offsetHours);
	now.setDate(now.getDate() + 1);
	return now;
}

/**
 * 日付と週の番号を取得します
 * 
 * @param date
 * @returns
 */
function getYearWeek(date) {
	
	
	
	var date1 = nlapiStringToDate(date);
	var date2 = new Date(date1.getFullYear(), 0, 1);

	var dateWeekNum = date2.getDay() - 1;
	if (dateWeekNum < 0) {
		dateWeekNum = 6;
	}

	// ISO 8601:dateWeekNum<4
	if (dateWeekNum < 7) {
		date2.setDate(date2.getDate() - dateWeekNum);
	} else {
		date2.setDate(date2.getDate() + 7 - dateWeekNum);
	}
	var d = Math.round((date1.valueOf() - date2.valueOf()) / 86400000);
	if (d < 0) {
		var date3 = new Date(date1.getFullYear(), 0, 0);
		return getYearWeek(date3);
	} else {
		var year = date1.getFullYear();
		var week = Math.ceil((d + 1) / 7);
		return week;
	}
	
	
	

}
/**
* NEW - 日付と週の番号を取得します 
* 月曜日から日曜日
* 
* @param date
* @returns
*/
function newGetYearWeekMonToSun(date) {
//	20230421 changed by zhou start
	var date1 = nlapiStringToDate(date);
	var date2 = new Date(date1.getFullYear(), 0, 1);
    var d = Math.round((date1.valueOf() - date2.valueOf()) / 86400000);
    return Math.ceil((d + ((date2.getDay() + 1) - 1)) / 7);
//    end
}
//20230327 add by zhou start
/**
* NEW - 日付と週の番号を取得します 
* 日曜日から土曜日
* @param date
* @returns
*/
function newGetYearWeek(date) {
	var date1 = new Date(date);
	var thisyear = date1.getFullYear();
	
	var firstDay = thisyear +'/01/01';
	var firstDayObj = new Date(firstDay);
	var dayOfWeek = firstDayObj.getDay(); 
	var diffTime = date1.getTime() - firstDayObj.getTime();
	var diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
	var weekNum = Math.ceil((diffDays + 1) / 7);
	return weekNum;
}
//20230327 add by zhou end
/**
 * 週の日曜日を取得します
 * 
 * @param date
 * @param flag
 * @returns
 */
function getSunday(date, flag) {
	var dd = nlapiStringToDate(date);
	var week = dd.getDay();
	var minus = week ? week - 1 : 6;
	dd.setDate(dd.getDate() - minus);
	dd.setDate(dd.getDate() + 6);
	var y = dd.getFullYear();
	var m = dd.getMonth() + 1;
	var d = dd.getDate();
	if (flag) {
		return m + "/" + d;
	} else {
		var returnDate = nlapiDateToString(dd);
		return returnDate;
	}
}
//20230327 add by zhou end
/**
 * 前の週の日曜日を取得します
 * 
 * @param date
 * @param flag
 * @returns
 */
/***TODO***/
function getLastSunday(date, flag) {
	var dd = nlapiStringToDate(date);
	var newtime =dd.getTime();
	var day =dd.getDay();
	var oneDayTime =86400*1000;
	var lastSundayTime = newtime +(0-day)*oneDayTime;//上周的周日
	var lastSunday = new Date(lastSundayTime);
	var y = lastSunday.getFullYear();
	var m = lastSunday.getMonth() + 1;
	var d = lastSunday.getDate();
	if (flag) {
		return m + "/" + d;
	} else {
		var returnDate = nlapiDateToString(dd);
		return returnDate;
	}
}
//20230327 add by zhou end
/**
 * 前の週の日曜日を取得します
 * 
 * @param date
 * @param flag
 * @returns
 */
/***TODO***/
function getLastSundayYYYYMMDD(date) {
	var dd = nlapiStringToDate(date);
	var newtime =dd.getTime();
	var day =dd.getDay();
	var oneDayTime =86400*1000;
	var lastSundayTime = newtime +(0-day)*oneDayTime;//上周的周日
	var lastSunday = new Date(lastSundayTime);
	var y = lastSunday.getFullYear();
	var m = lastSunday.getMonth() + 1;
	var d = lastSunday.getDate();
	return y + "/" + m + "/" + d;
}
/**
 * 年を取得します
 * 
 * @param date
 * @returns
 */
function getYear(date) {
	var date = nlapiStringToDate(date);
	var year = date.getFullYear();
	return year;
}

/**
 * 日付増加
 */
function dateAddDays(date, addDays) {

	// システム時間
	var Date = nlapiStringToDate(date);
	var offSet = Date.getTimezoneOffset();
	var offsetHours = 9 + (offSet / 60);
	Date.setHours(Date.getHours() + offsetHours);
	Date.setDate(Date.getDate() + addDays);
	var changeDate = nlapiDateToString(Date);
	return changeDate;
}

/**
 * 日曜日付取得
 */
function getSundayOfWeek(date) {
	var dateObj = nlapiStringToDate(date);;
	var dayOfWeek = dateObj.getDay();
	var diffDays = dayOfWeek - 0;
	var sundayObj = new Date(dateObj);
	sundayObj.setDate(sundayObj.getDate() - diffDays);
	var sundayObj = nlapiDateToString(sundayObj)
	return sundayObj;
	}


/**
 *  day -7
 */
function dateSubtractionDays(date,days) {

	// システム時間
	var Date = nlapiStringToDate(date);
	var offSet = Date.getTimezoneOffset();
	var offsetHours = 9 + (offSet / 60);
	Date.setHours(Date.getHours() + offsetHours);
	Date.setDate(Date.getDate() - days);
	var changeDate = nlapiDateToString(Date);
	return changeDate;
}
/**
 * ガバナンスのチェック
 */
function governanceYield() {
	if (parseInt(nlapiGetContext().getRemainingUsage()) <= 300) {
		var state = nlapiYieldScript();
		if (state.status == 'FAILURE') {
			nlapiLogExecution('DEBUG', 'Failed to yield script.');
		} else if (state.status == 'RESUME') {
			nlapiLogExecution('DEBUG', 'Resuming script');
		}
	}
}

/**
 * 数字の前に0を追加する
 * 
 * @param num
 *            数字
 * @param n
 *            行数
 * @returns 結果
 */
function prefixInteger(num, n) {
	return (Array(n).join(0) + num).slice(-n);
}

/**
 * 重複データを削除する
 * 
 * @param array
 *            リスト
 * @returns リスト
 */
function unique(array) {
	var resultArr = new Array();
	var numberOBJ = {};
	for (var i = 0; i < array.length; i++) {
		if (!numberOBJ[array[i]]) {
			resultArr.push(array[i]);
			numberOBJ[array[i]] = 1;
		}
	}
	return resultArr;
}

/**
 * 制御の無効化
 * 
 * @param fileNmae
 *            コントロール
 */
function setFieldDisableType(fileName, type) {
	try {
		var field = nlapiGetField(fileName);
		if (!isEmpty(field)) {
			field.setDisplayType(type);
		}
	} catch (e) {
		nlapiLogExecution('debug', fileName + '無効化の異常', e);
	}
}

/**
 * LineItem制御の無効化
 * 
 * @param fileName
 *            コントロール
 */
function setLineItemDisableType(type, fileName, disableType) {
	try {
		var field = nlapiGetLineItemField(type, fileName);
		if (!isEmpty(field)) {
			field.setDisplayType(disableType);
		}
	} catch (e) {
		nlapiLogExecution('debug', fileName + '無効化の異常', e);
	}
}

/**
 * Button制御の無効化
 * 
 * @param fileName
 *            コントロール
 */
function setButtunButtonDisable(btnName) {
	try {
		document.getElementById(btnName).style.display = 'none';
	} catch (e) {
		nlapiLogExecution('debug', btnName + '無効化の異常', e);
	}
}

/**
 * Table制御の無効化
 * 
 * @param fileName
 *            コントロール
 */
function setTableDisable(btnName,type) {
	try {
		document.getElementById(btnName).style.display = type;
	} catch (e) {
		nlapiLogExecution('debug', btnName + '無効化の異常', e);
	}
}

/**
 * Table制御の無効化
 * 
 * @param fileName
 *            コントロール
 */
function setTableHidden(table) {
	try {
		document.getElementById(table).style.visibility = "hidden";
	} catch (e) {
		nlapiLogExecution('debug', table + '無効化の異常', e);
	}
}

/**
 * Table制御の無効化
 * 
 * @param fileName
 *            コントロール
 */
function setTableNone(table) {
	try {
		document.getElementById(table).style.display = 'none';
		//document.getElementById(table).style.visibility = "hidden";
	} catch (e) {
		nlapiLogExecution('debug', table + '無効化の異常', e);
	}
}

/**
 * Table制御の有効化
 * 
 * @param fileName
 *            コントロール
 */
function setTableInline(table) {
	try {
		document.getElementById(table).style.display = 'inline';
		//document.getElementById(table).style.visibility = "hidden";
	} catch (e) {
		nlapiLogExecution('debug', table + '有効化の異常', e);
	}
}
/**
 * tab制御の無効化
 * 
 * @param fileName
 *            コントロール
 */
function formHiddenTab(form,tab) {
	try {
		//create an inline html field
		var hideFld = form.addField('custpage_hide_buttons', 'inlinehtml', 'not shown - hidden'); 
		//for every button you want to hide, modify the scr += line
		var scr = "";
		scr += 'jQuery("#'+tab+'").hide();';
		//push the script into the field so that it fires and does its handy work
		hideFld.defaultValue = "<script>jQuery(function($){require([], function(){" + scr + ";})})</script>"
	} catch (e) {
		nlapiLogExecution('debug', tab + '無効化の異常', e);
	}
}
//20221214 add by zhou start
/**
 * .class制御
 * 
 * @param fileName
 *            コントロール
 */
function formHiddenDiv(form,div) {
	try {
		var hideFld = form.addField('custpage_hide_buttons', 'inlinehtml', 'not shown - hidden'); 
		var scr = "";
		scr += '$(".'+div+'").hide();';
		hideFld.defaultValue = "<script>jQuery(function($){require([], function(){" + scr + ";})})</script>"
	} catch (e) {
		nlapiLogExecution('debug', div + '無効化の異常', e);
	}
}
//end
/*
 * 入り目の取得
 */
function getConversionrate(unitname) {
	var conversionrate = '';
	try {
		var unitstypeSearch = nlapiSearchRecord("unitstype", null, [ [
				"unitname", "is", unitname ] ], [ new nlobjSearchColumn(
				"conversionrate", null, "GROUP") ]);
		var columns = unitstypeSearch[0].getAllColumns();
		conversionrate = unitstypeSearch[0].getValue(columns[0]);
	} catch (e) {

	}
	return conversionrate;
}

/*
 * 入り目略称の取得
 */
function getConversionrateAbbreviation(unitname) {
	var conversionrate = '';
	try {
		var unitstypeSearch = nlapiSearchRecord("unitstype", null, [ [
				"abbreviation", "is", unitname ] ], [ new nlobjSearchColumn(
				"conversionrate", null, "GROUP") ]);
		var columns = unitstypeSearch[0].getAllColumns();
		conversionrate = unitstypeSearch[0].getValue(columns[0]);
	} catch (e) {

	}
	return conversionrate;
}


/*
 * アイテム種類の取得
 */
function getItemRecordType(itemID) {
	var itemRecordType = nlapiLookupField('item', itemID, 'recordType');
	return itemRecordType;
}

/*
 * ロールの会社取得
 */
function getRoleSubsidiary() {
	var subsidiary = '';
	try {
		var id = nlapiGetRole();
		//clientDevelopmentTesting('id:'+id);
		var roleSubsidiarySearch = nlapiSearchRecord("customrecord_djkk_role_subsidiary",null,
				[
				   ["custrecord_djkk_role_id","is",id]
				], 
				[
				   new nlobjSearchColumn("custrecord_djkk_role_syokuseki")
				]
				);
		if(!isEmpty(roleSubsidiarySearch)){
			var subid=roleSubsidiarySearch[0].getValue('custrecord_djkk_role_syokuseki');
			if(!isEmpty(subid)){
				subsidiary = subid;
			}else{
				subsidiary = nlapiGetSubsidiary();
			}
			
		}else{
			subsidiary = nlapiGetSubsidiary();
		}
	} catch (e) {
		subsidiary = nlapiGetSubsidiary();
		//clientDevelopmentTesting('e:'+e.message);
	}
	return subsidiary;
}

/**/
function getRoleSubsidiariesAndAddSelectOption(subField) {
	subField.addSelectOption('','');
	var syokuseki='';
	try{
	var roleid=nlapiGetRole();
    // 保存検索の呼び出し
    var filters = new Array();
    filters.push(new nlobjSearchFilter('internalId', null, 'anyof', roleid));
    var savedSearch = nlapiLoadSearch('role','customsearch_djkk_role_subsearch');

    if (!isEmpty(filters)) {
        var oldFilters = savedSearch.getFilters();
        oldFilters.forEach(function(c) {
            filters.push(c);
        });
        savedSearch.addFilters(filters);
    }

       // 保存検索の実行
    var resultset = savedSearch.runSearch();       
    if (!isEmpty(resultset)) {
        var searchCount = 0;
        var searchlinesResults;
        if(!isEmpty(resultset.getResults(0,1))){
        do {
            searchlinesResults = resultset.getResults(searchCount, searchCount + 1000);
            if (!isEmpty(searchlinesResults)) {
             syokuseki= searchlinesResults[0].getValue('custrecord_syokuseki')
                for (var i = 0; i < searchlinesResults.length; i++) {
                var columnID=	searchlinesResults[i].getAllColumns();
                	searchlinesResults[i].getValue(columnID[0]);

                	subField.addSelectOption(searchlinesResults[i].getValue('subsidiaries'), searchlinesResults[i].getText('subsidiaries'));

                    }
                }         
            searchCount += 1000;
        } while (searchlinesResults.length == 1000);
        }else{
        	syokuseki=nlapiGetSubsidiary();
			var subsidiarySearch = nlapiSearchRecord("subsidiary", null, [], [
					new nlobjSearchColumn("internalid").setSort(false),
					new nlobjSearchColumn("name") ]);
			if (!isEmpty(subsidiarySearch)) {				
				for (var j = 0; j < subsidiarySearch.length; j++) {
					subField.addSelectOption(subsidiarySearch[j].getValue('internalid'),subsidiarySearch[j].getValue('name'));
				}
			}
        }
    }
    }catch(e){
    	syokuseki=nlapiGetSubsidiary();
		var subsidiarySearch = nlapiSearchRecord("subsidiary", null, [], [
				new nlobjSearchColumn("internalid").setSort(false),
				new nlobjSearchColumn("name") ]);
		if (!isEmpty(subsidiarySearch)) {				
			for (var j = 0; j < subsidiarySearch.length; j++) {
				subField.addSelectOption(subsidiarySearch[j].getValue('internalid'),subsidiarySearch[j].getValue('name'));
			}
		}
    
    }
    subField.setDefaultValue(syokuseki.toString());
    return syokuseki.toString();
}
/**/

/**
 * Client開発テスト
 * 
 * @param fileName
 *            コントロール
 */
function clientDevelopmentTesting(fileName,userid) {
	var user = nlapiGetUser();
	if(isEmpty(userid)){
		userid=developers_employee_id;
	}
	if (user == userid) {
		if (!isEmpty(fileName)) {
			alert(fileName);
		} else {
			alert('Testing');
		}
	}
}

/**
 * バッチ処理
 */
function runBatch(customscript, customdeploy, scheduleparams) {	
	try {
		var sleeptime = 10000;
		var status_jo;
		do {
			var status_jo = nlapiScheduleScript(customscript, customdeploy,
					scheduleparams);
			// バッチを呼び出し
			if (status_jo != 'QUEUED') {
				sleep(10000);
				sleeptime += 10000;
			}
			if (sleeptime >= 250000) {
				nlapiLogExecution('debug', '実行時間が超過しました');
				return;
			}
		} while (status_jo != 'QUEUED');		
	} catch (e) {
		nlapiLogExecution('debug', 'プロジェクト同期処理異常:', e);
	}
}

/**
 * 定期バッチの実行ステータスを取得する
 * 
 * @param deploymentId
 * @returns {String}
 */
function getScheduledScriptRunStatus(deploymentId) {

	var filters = new Array();
	filters.push(new nlobjSearchFilter('datecreated', null, 'onOrAfter',
			getScheduledScriptDate()));
	filters.push(new nlobjSearchFilter('scriptid', 'scriptdeployment', 'is',
			deploymentId));

	var columns = new Array();
	columns.push(new nlobjSearchColumn('datecreated', null, 'max')
			.setWhenOrderedBy('datecreated', null).setSort(true));
	columns.push(new nlobjSearchColumn('status', null, 'group'));

	var scheduledStatusList = nlapiSearchRecord('scheduledscriptinstance',
			null, filters, columns);
	var status = '';
	if (scheduledStatusList != null && scheduledStatusList.length > 0) {
		status = scheduledStatusList[0].getValue('status', null, 'group')
				.toUpperCase();
	}

	return status;
}

/**
 * バッチ実行日付を取得する
 * 
 * @returns
 */
function getScheduledScriptDate() {
	var now = getSystemTime();
	now.setHours(0, 0, 0, 0);
	return now;
}

/**
 * DJ枝番採番用
 * 
 * @param soOrpo
 *            1:PO 2:SO
 */
function getDjkkNowNumber(name) {

	var numberingSearch = nlapiSearchRecord("customrecord_djkk_trs_bra_num_numbering",null,
			[
			   ["name","is",name]
			], 
			[
			   new nlobjSearchColumn("internalid")
			]
			);
	if(!isEmpty(numberingSearch)){
	var numberId=numberingSearch[0].getValue('internalid');
	
	// 枝番情報を取得する
	var customrecord_djkk_trs_bra_num_numbering = nlapiLoadRecord(
			"customrecord_djkk_trs_bra_num_numbering", numberId);

	var custrecord_djkk_now_number = customrecord_djkk_trs_bra_num_numbering
			.getFieldValue("custrecord_djkk_now_number");
	var custrecord_djkk_prefix = customrecord_djkk_trs_bra_num_numbering
			.getFieldValue("custrecord_djkk_prefix");
	var custrecord_djkk_minimum_number_of_digits = customrecord_djkk_trs_bra_num_numbering
			.getFieldValue("custrecord_djkk_minimum_number_of_digits");

	// 枝番を組合
	var dj_no = "";
	for (var i = 0; i < custrecord_djkk_minimum_number_of_digits; i++) {
		dj_no += "0";
	}
	dj_no += custrecord_djkk_now_number.toString();

	// 現在No更新する
	custrecord_djkk_now_number++;
	nlapiSubmitField("customrecord_djkk_trs_bra_num_numbering", numberId,
			"custrecord_djkk_now_number", custrecord_djkk_now_number);

	return custrecord_djkk_prefix
			+ dj_no.slice(-custrecord_djkk_minimum_number_of_digits);
	}else{
	return '';
	}
}

function changeFcWeekOfYear(weekOfYear){
	var year=weekOfYear.split('-')[0];
	var week=Number(weekOfYear.split('-')[1]);
	if(week<10){
		week='0'+(Number(week)+1);
	}else if(week=='52'){
	year=Number(year)+1;
	week='01';
	} else{
	week=week+1;
	}
	var returnWeekOfYear=year+'-'+week;
	return returnWeekOfYear;
	}
//20230330 add by zhou start
/**
 * 
 * 
 */
function newChangeFcWeekOfYear(weekOfYear){
	var year=weekOfYear.split('-')[0];
	var week=Number(weekOfYear.split('-')[1]);
	if(week<10){
		week='0'+(Number(week)+1);
	}else if(week=='52'){
	year=Number(year)+1;
	week='01';
	} else{
	week=week;
	}
	var returnWeekOfYear=year+'-'+week;
	return returnWeekOfYear;
	}
//end
function getFcNextMonth(YearMonth){
	var year=YearMonth.split('-')[0];
	var Month=Number(YearMonth.split('-')[1]);
	if(Month<10){
		Month='0'+(Number(Month)+1);
	}else if(Month=='12'){
	year=Number(year)+1;
	Month='01';
	} else{
	Month=Month+1;
	}
	var newYearMonth=year+'-'+Month;
	return newYearMonth;
	}
function getFcBeforeMonth(weekOfYear){
	var year=weekOfYear.split('-')[0];
	var Month=Number(weekOfYear.split('-')[1]);
	if(Month>1&&Month<10){
		Month='0'+(Number(Month)-1);
	}else if(Month=='1'){
	year=Number(year)-1;
	Month='12';
	} else{
		Month=Month-1;
	}
	var newYearMonth=year+'-'+Month;
	return newYearMonth;
	}
/**
 * メール送信(トランザクション)
 * 
 * @param from
 * @param to
 * @param title
 * @param body
 * @param id
 *            トランザクションID
 * @param div
 *            -1場合 テンプレート使用しません。 1 注文書 ２請求書 ３前受金
 */
function sendEmail(from, to, title, body, id, div,file) {

	var records = new Object();
	   
	if (div == -1) {
		records = null;
	} else if (div == 1) {

		// 注文書メールテンプレート
		var templete = nlapiLoadRecord('emailtemplate', custemailtmpl_notice_mailtemp_salesorder);
		var mailRenderer = nlapiCreateTemplateRenderer();
		var mailTemplate = templete.getFieldValue('content');
		title = templete.getFieldValue('subject');
		mailRenderer.setTemplate(mailTemplate);
		var poRecord = nlapiLoadRecord('salesorder', id);
		mailRenderer.addRecord('transaction', poRecord);
		body = mailRenderer.renderToString();
		records['transaction'] = id;
//	} else if (div == 2) {
//		// 請求書メールテンプレート
//		var templete = nlapiLoadRecord('emailtemplate', custemailtmpl_notice_mailtemp_invoice);
//		var mailRenderer = nlapiCreateTemplateRenderer();
//		var mailTemplate = templete.getFieldValue('content');
//		title = templete.getFieldValue('subject');
//		mailRenderer.setTemplate(mailTemplate);
//		var poRecord = nlapiLoadRecord('invoice', id);
//		mailRenderer.addRecord('transaction', poRecord);
//		var _text = nlapiLookupField('invoice', id, 'tranid') 
//		body = "<a href = "+URL_HEAD+" +'secure.netsuite.com/app/accounting/transactions/custinvc.nl?whence=&id="+id+"'>請求書#"+_text +" を確認する</a><br />"
//		body += mailRenderer.renderToString();
//		records['transaction'] = id;
	} else if (div == 3) {
		// 前受金メールテンプレート
		var templete = nlapiLoadRecord('emailtemplate', custemailtmpl_notice_mailtemp_customerdeposit);
		var mailRenderer = nlapiCreateTemplateRenderer();
		var mailTemplate = templete.getFieldValue('content');
		title = templete.getFieldValue('subject');
		mailRenderer.setTemplate(mailTemplate);
		var poRecord = nlapiLoadRecord('customerdeposit', id);
		mailRenderer.addRecord('transaction', poRecord);
		body = mailRenderer.renderToString();
		records['transaction'] = id;
	}
	else if (div == 4) {
		// 通知メールテンプレート受注納期自動送信
		var templete = nlapiLoadRecord('emailtemplate', custemailtmpl_notice_mailtemp_order_delivery_date);
		var mailRenderer = nlapiCreateTemplateRenderer();
		var mailTemplate = templete.getFieldValue('content');
		title = templete.getFieldValue('subject');
		mailRenderer.setTemplate(mailTemplate);
		var poRecord = nlapiLoadRecord('salesorder', id);
		mailRenderer.addRecord('transaction', poRecord);
		body = mailRenderer.renderToString();
		records['transaction'] = id;
	}
	else if (div == 5) {
		// 通知メールテンプレート配送自動送信
		var templete = nlapiLoadRecord('emailtemplate', custemailtmpl_notice_mailtemp_delivery_send);
		var mailRenderer = nlapiCreateTemplateRenderer();
		var mailTemplate = templete.getFieldValue('content');
		title = templete.getFieldValue('subject');
		mailRenderer.setTemplate(mailTemplate);
		var poRecord = nlapiLoadRecord('salesorder', id);
		mailRenderer.addRecord('transaction', poRecord);
		body = mailRenderer.renderToString();
		records['transaction'] = id;
	}
	else if (div == 6) {
		// 通知メールテンプレート請求書自動送信
		var templete = nlapiLoadRecord('emailtemplate', custemailtmpl_notice_mailtemp_invoice_send);
		var mailRenderer = nlapiCreateTemplateRenderer();
		var mailTemplate = templete.getFieldValue('content');
		title = templete.getFieldValue('subject');
		mailRenderer.setTemplate(mailTemplate);
		var poRecord = nlapiLoadRecord('invoice', id);
		mailRenderer.addRecord('transaction', poRecord);
		body = mailRenderer.renderToString();
		records['transaction'] = id;
	}else if (div == 7) {

		//DJ_納期回答送信|DJ_出荷案内送信
		var templete = nlapiLoadRecord('emailtemplate', custemailtmpl_notice_mailtemp_salesorder);
		var mailRenderer = nlapiCreateTemplateRenderer();
		var mailTemplate = templete.getFieldValue('content');
		title = '納期回答自動送信';
		mailRenderer.setTemplate(mailTemplate);
		var poRecord = nlapiLoadRecord('salesorder', id);
		mailRenderer.addRecord('transaction', poRecord);
		var _text = nlapiLookupField('salesorder', id, 'custbody_djkk_reference_delive') 
		body = '<div>'+_text+'</div>'
		records['transaction'] = id;
	} else if (div == 8) {
		// 請求書自動送信
		var templete = nlapiLoadRecord('emailtemplate', custemailtmpl_notice_mailtemp_invoice);
		var mailRenderer = nlapiCreateTemplateRenderer();
		var mailTemplate = templete.getFieldValue('content');
		title = '請求書自動送信'
		mailRenderer.setTemplate(mailTemplate);
		var poRecord = nlapiLoadRecord('invoice', id);
		mailRenderer.addRecord('transaction', poRecord);
		var _text = nlapiLookupField('invoice', id, 'custbody_djkk_invoice_destination_regi') 
		body = '<div>'+_text+'</div>'
		records['transaction'] = id;
	}else if(div == 9){
		// 納品書自動送信
		var templete = nlapiLoadRecord('emailtemplate', custemailtmpl_notice_mailtemp_salesorder_delivery);
		var mailRenderer = nlapiCreateTemplateRenderer();
		var mailTemplate = templete.getFieldValue('content');
		title = '納品書自動送信'
		mailRenderer.setTemplate(mailTemplate);
		var poRecord = nlapiLoadRecord('salesorder', id);
		mailRenderer.addRecord('transaction', poRecord);
		var _text = nlapiLookupField('salesorder', id, 'custbody_djkk_reference_column') 
		body = '<div>'+_text+'</div>'
		records['transaction'] = id;
	}


	// 送信する
	nlapiLogExecution('DEBUG', 'FROM', from)
	nlapiLogExecution('DEBUG', 'TO', to)
	nlapiLogExecution('DEBUG', 'タイトル', title)
	nlapiLogExecution('DEBUG', 'ボディ', body)
	nlapiLogExecution('DEBUG', 'トランザクションID', id)
	nlapiLogExecution('DEBUG', 'メール区分', div)
	nlapiLogExecution('DEBUG', 'ファイルbefore', file)
	var fileArr = null;
	if(!isEmpty(file)){
		fileArr = new Array();
		for(var i = 0;i < file.length;i++){
			fileArr.push(nlapiLoadFile(file[i]));
			nlapiLogExecution('DEBUG', 'ファイル', file[i])
		}
	}


	nlapiSendEmail(from, to, title, body,null,null,records,fileArr);

}

/**
 * Fax送信(トランザクション)
 * 
 * @param from
 * @param to
 * @param title
 * @param body
 * @param id
 *            トランザクションID
 * @param div
 *            -1場合 テンプレート使用しません。 1 注文書 ２請求書 ３前受金
 */
function sendFax(from, to, title, body, id, div,file) {

	var records = new Object();
	   
	if (div == -1) {
		records = null;
	} else if (div == 1) {

		// 注文書メールテンプレート
		var templete = nlapiLoadRecord('emailtemplate', custemailtmpl_notice_mailtemp_salesorder);
		var mailRenderer = nlapiCreateTemplateRenderer();
		var mailTemplate = templete.getFieldValue('content');
		title = templete.getFieldValue('subject');
		mailRenderer.setTemplate(mailTemplate);
		var poRecord = nlapiLoadRecord('salesorder', id);
		mailRenderer.addRecord('transaction', poRecord);
		body = mailRenderer.renderToString();
		records['transaction'] = id;
	} else if (div == 2) {
		// 請求書メールテンプレート
		var templete = nlapiLoadRecord('emailtemplate', custemailtmpl_notice_mailtemp_invoice);
		var mailRenderer = nlapiCreateTemplateRenderer();
		var mailTemplate = templete.getFieldValue('content');
		title = templete.getFieldValue('subject');
		mailRenderer.setTemplate(mailTemplate);
		var poRecord = nlapiLoadRecord('invoice', id);
		mailRenderer.addRecord('transaction', poRecord);
		var _text = nlapiLookupField('invoice', id, 'tranid') 
		body = "<a href = "+URL_HEAD+" +'secure.netsuite.com/app/accounting/transactions/custinvc.nl?whence=&id="+id+"'>請求書#"+_text +" を確認する</a><br />"
		body += mailRenderer.renderToString();
		records['transaction'] = id;
	} else if (div == 3) {
		// 前受金メールテンプレート
		var templete = nlapiLoadRecord('emailtemplate', custemailtmpl_notice_mailtemp_customerdeposit);
		var mailRenderer = nlapiCreateTemplateRenderer();
		var mailTemplate = templete.getFieldValue('content');
		title = templete.getFieldValue('subject');
		mailRenderer.setTemplate(mailTemplate);
		var poRecord = nlapiLoadRecord('customerdeposit', id);
		mailRenderer.addRecord('transaction', poRecord);
		body = mailRenderer.renderToString();
		records['transaction'] = id;
	}
	else if (div == 4) {
		// 通知メールテンプレート受注納期自動送信
		var templete = nlapiLoadRecord('emailtemplate', custemailtmpl_notice_mailtemp_order_delivery_date);
		var mailRenderer = nlapiCreateTemplateRenderer();
		var mailTemplate = templete.getFieldValue('content');
		title = templete.getFieldValue('subject');
		mailRenderer.setTemplate(mailTemplate);
		var poRecord = nlapiLoadRecord('salesorder', id);
		mailRenderer.addRecord('transaction', poRecord);
		body = mailRenderer.renderToString();
		records['transaction'] = id;
	}
	else if (div == 5) {
		// 通知メールテンプレート配送自動送信
		var templete = nlapiLoadRecord('emailtemplate', custemailtmpl_notice_mailtemp_delivery_send);
		var mailRenderer = nlapiCreateTemplateRenderer();
		var mailTemplate = templete.getFieldValue('content');
		title = templete.getFieldValue('subject');
		mailRenderer.setTemplate(mailTemplate);
		var poRecord = nlapiLoadRecord('salesorder', id);
		mailRenderer.addRecord('transaction', poRecord);
		body = mailRenderer.renderToString();
		records['transaction'] = id;
	}
	else if (div == 6) {
		// 通知メールテンプレート請求書自動送信
		var templete = nlapiLoadRecord('emailtemplate', custemailtmpl_notice_mailtemp_invoice_send);
		var mailRenderer = nlapiCreateTemplateRenderer();
		var mailTemplate = templete.getFieldValue('content');
		title = templete.getFieldValue('subject');
		mailRenderer.setTemplate(mailTemplate);
		var poRecord = nlapiLoadRecord('invoice', id);
		mailRenderer.addRecord('transaction', poRecord);
		body = mailRenderer.renderToString();
		records['transaction'] = id;
	}else if (div == 7) {

		//DJ_納期回答送信|DJ_出荷案内送信
		var templete = nlapiLoadRecord('emailtemplate', custemailtmpl_notice_mailtemp_salesorder);
		var mailRenderer = nlapiCreateTemplateRenderer();
		var mailTemplate = templete.getFieldValue('content');
		title = 'DJ_納期回答送信|DJ_出荷案内送信';
		mailRenderer.setTemplate(mailTemplate);
		var poRecord = nlapiLoadRecord('salesorder', id);
		mailRenderer.addRecord('transaction', poRecord);
		body = mailRenderer.renderToString();
		records['transaction'] = id;
	} else if (div == 8) {
		//請求書自動送信
		var templete = nlapiLoadRecord('emailtemplate', custemailtmpl_notice_mailtemp_invoice);
		var mailRenderer = nlapiCreateTemplateRenderer();
		var mailTemplate = templete.getFieldValue('content');
		title = '請求書自動送信';
		mailRenderer.setTemplate(mailTemplate);
		var poRecord = nlapiLoadRecord('invoice', id);
		mailRenderer.addRecord('transaction', poRecord);
		var _text = nlapiLookupField('invoice', id, 'tranid') 
		body = "<a href = "+URL_HEAD+" +'secure.netsuite.com/app/accounting/transactions/custinvc.nl?whence=&id="+id+"'>請求書#"+_text +" を確認する</a><br />"
		body += mailRenderer.renderToString();
		records['transaction'] = id;
	}
//	else if (div == 9) {
//		//請求書自動送信
//		var templete = nlapiLoadRecord('emailtemplate', custemailtmpl_notice_mailtemp_invoice);
//		var mailRenderer = nlapiCreateTemplateRenderer();
//		var mailTemplate = templete.getFieldValue('content');
//		title = '請求書自動送信';
//		mailRenderer.setTemplate(mailTemplate);
//		var poRecord = nlapiLoadRecord('invoice', id);
//		mailRenderer.addRecord('transaction', poRecord);
//		var _text = nlapiLookupField('invoice', id, 'tranid') 
//		body = "<a href = "+URL_HEAD+" +'secure.netsuite.com/app/accounting/transactions/custinvc.nl?whence=&id="+id+"'>請求書#"+_text +" を確認する</a><br />"
//		body += mailRenderer.renderToString();
//		records['transaction'] = id;
//	}

	// 送信する
	nlapiLogExecution('DEBUG', 'FROM', from)
	nlapiLogExecution('DEBUG', 'TO', to)
	nlapiLogExecution('DEBUG', 'タイトル', title)
	nlapiLogExecution('DEBUG', 'ボディ', body)
	nlapiLogExecution('DEBUG', 'トランザクションID', id)
	nlapiLogExecution('DEBUG', 'メール区分', div)

	var fileArr = null;
	if(!isEmpty(file)){
		fileArr = new Array();
		for(var i = 0;i < file.length;i++){
			fileArr.push(nlapiLoadFile(file[i]));
			nlapiLogExecution('DEBUG', 'ファイル', file[i])
		}
	}

    nlapiSendFax(from, to, title, body,records,fileArr);

}
//20221229 add by zhou start
/**
 *	U085 get mail&fax templete
 */
//CH762 20230814 add by zdj start
//function getMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman){
function getMailTemplete(fax,mail,sendMailFlag,sendFaxFlag,mailType,subsidiary,salesman,transactionnumber,recordType){
//CH762 20230814 add by zdj end
//	search
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
		//CH762 20230814 add by zdj start
//		subject += getdateYYMMDD()+'_'+RondomPass(10);
		if(recordType){
		if(recordType == 'invoice' || recordType == 'creditmemo'){
            if(transactionnumber){
               subject = subject  + '_' + getDateYymmddFileName02() + '_' + transactionnumber;
            }else{
               subject = subject + '_' + getDateYymmddFileName02();
            }
            }else{
               subject += getDateYymmddFileName02();
            }
		    }else{
		        subject = subject + '_' + getDateYymmddFileName02();
		}
		//CH762 20230814 add by zdj end
		var body = mailtemplateSearch[0].getValue("custrecord_djkk_tmp_body");//body
		var fileName = mailtemplateSearch[0].getValue("custrecord_djkk_tmp_filetype");//Attachment file name
		var fileNameFormSubject = mailtemplateSearch[0].getValue("custrecord_djkk_tmp_flnameissub");// SAME CONTENTS AS SUBJECT
		if(fileNameFormSubject == 'T'){
			fileName = subject;
		}else{
		    //CH762 20230814 add by zdj start
//			fileName = fileName+ getdateYYMMDD()+ '_'+RondomPass(10);
		    if(recordType){
		    if(recordType == 'invoice' || recordType == 'creditmemo'){
                fileName = fileName + '_' + getDateYymmddFileName02() + '_' +transactionnumber;
            }else{
                fileName = fileName + '_' + getDateYymmddFileName02();
            }
		    }else{
		        fileName = fileName + '_' + getDateYymmddFileName02();
		    }
            }
		    //CH762 20230814 add by zdj end
		
		nlapiLogExecution('debug','fileName',fileName)
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
		nlapiLogExecution('debug','mailTypeId',mailTypeId)
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
		subject += custEmployeeId+ '-' + RondomPass(10);
		nlapiLogExecution('debug','subject',subject)
		var body = faxtemplateSearch[0].getValue("custrecord_djkk_tmp_body");//body
		var fileName = faxtemplateSearch[0].getValue("custrecord_djkk_tmp_filetype");//Attachment file name
		var fileNameFormSubject = faxtemplateSearch[0].getValue("custrecord_djkk_tmp_flnameissub");// SAME CONTENTS AS SUBJECT
		if(fileNameFormSubject == 'T'){
			fileName = subject;
		}else{
			fileName = fileName+custEmployeeId+ '-' +RondomPass(10);
		}
		nlapiLogExecution('debug','fileName',fileName)
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
/**
 *	U085 auto send mail 
 */
function automaticSendmail(obj,file){
//	search
//	var newObj = JSON.parse(obj);
	var newObj = obj;
	var flag = 'Sending failed';
	var formAddress = newObj.formAddress;
	formAddress = 'wy@cloverplus.net';
	nlapiLogExecution('DEBUG', 'formAddress',formAddress)
	var employeeSearch = nlapiSearchRecord("employee",null,
			[
			   ["email","is",formAddress]
			], 
			[
			   new nlobjSearchColumn("internalid")
			]
			);
	if(!isEmpty(employeeSearch)){
		var entityid = employeeSearch[0].getValue("internalid");//従業員ID`
		entityid = nlapiGetUser();//20230210 changed by zhou :テストのための一時的な変換    現在のオペレータ
		nlapiLogExecution('DEBUG', 'entityid', entityid)
		formAddress = entityid;
		var toAddress = newObj.toAddress;
		nlapiLogExecution('DEBUG', 'toAddress', toAddress)
//		toAddress = 'kozaki@nbkk.co.jp';
//		toAddress = 'wy@cloverplus.net';
		var bcc = newObj.bcc;
		var subject = newObj.subject;
//		var body = '<div>'+newObj.body;+'</div>';
		var body = newObj.body;	
		nlapiLogExecution('DEBUG', 'body', body);
		var fileArr = null;
		if(!isEmpty(file)){
			fileArr = new Array();
			nlapiLogExecution('DEBUG', 'file', file);
			for(var i = 0;i < file.length;i++){
				nlapiLogExecution('DEBUG', 'filei', file[i]);
				fileArr.push(nlapiLoadFile(file[i]));
				nlapiLogExecution('DEBUG', 'ファイル', file[i])
			}
		}
		//
//		toAddress = ['zheng@cloverplus.net','wang.ww@cloverplus.net'];
		// add by zzq CH750 20230713 start
		var toAddressArr = [];
		var customrecord_djkk_auto_send_email_testSearch = nlapiSearchRecord("customrecord_djkk_auto_send_email_test",null,
		        [["isinactive","is","F"]], 
		        [
		           new nlobjSearchColumn("custrecord_djkk_mail_name")
		        ]
		        );
		if(!isEmpty(customrecord_djkk_auto_send_email_testSearch)){
		    for(var k=0; k<customrecord_djkk_auto_send_email_testSearch.length; k++){
		        var mailName = customrecord_djkk_auto_send_email_testSearch[k].getValue("custrecord_djkk_mail_name");//従業員ID`
		        if(!isEmpty(mailName)){
		            toAddressArr.push(mailName);
		        }
		    }
		}
		nlapiLogExecution('DEBUG', 'toAddressArr', toAddressArr);
		if(!isEmpty(toAddressArr)){
		    toAddress = toAddressArr;
		}
		// add by zzq CH750 20230713 end
		nlapiSendEmail(formAddress, toAddress , subject, body,null,bcc,null,fileArr);
		flag = 'Sending succeeded';
	}
	return flag;
}
/**
 *	U085 auto send fax 
 */
function automaticSendFax(obj,file){
//	search
//	var newObj = JSON.parse(obj);
	var newObj = obj;
	var flag = 'Sending failed';
	var formAddress = newObj.formAddress;
	formAddress = 'zht@cloverplus.net';
	var employeeSearch = nlapiSearchRecord("employee",null,
			[
			   ["email","is",formAddress]
			], 
			[
			   new nlobjSearchColumn("entityid").setSort(false), 
			   new nlobjSearchColumn("internalid")
			]
			);
	if(!isEmpty(employeeSearch)){
		var entityid = employeeSearch[0].getValue("internalid");//従業員ID
		formAddress = entityid;
		var toAddress = newObj.toAddress;
//		toAddress = 'zht@cloverplus.net';
		var bcc = newObj.bcc;
		var subject = newObj.subject;
//		var body = '<div>'+newObj.body;+'</div>';
		var body = newObj.body;	
			
		var fileArr = null;
		if(!isEmpty(file)){
			fileArr = new Array();
			for(var i = 0;i < file.length;i++){
				fileArr.push(nlapiLoadFile(file[i]));
				nlapiLogExecution('DEBUG', 'ファイル', file[i])
			}
		}
		var toAddressArr = [];
        var customrecord_djkk_auto_send_email_testSearch = nlapiSearchRecord("customrecord_djkk_auto_send_email_test",null,
                [["isinactive","is","F"]], 
                [
//                   new nlobjSearchColumn("custrecord_djkk_fax_name")
                   new nlobjSearchColumn("custrecord_djkk_mail_name")
                ]
                );
        if(!isEmpty(customrecord_djkk_auto_send_email_testSearch)){
            for(var k=0; k<customrecord_djkk_auto_send_email_testSearch.length; k++){
//                var faxName = customrecord_djkk_auto_send_email_testSearch[k].getValue("custrecord_djkk_fax_name");//従業員ID`
                var faxName = customrecord_djkk_auto_send_email_testSearch[k].getValue("custrecord_djkk_mail_name");//従業員ID`
                if(!isEmpty(faxName)){
//                    faxName = faxName + '@fax2mail.com';
                    toAddressArr.push(faxName);
                }
            }
        }
        nlapiLogExecution('DEBUG', 'toAddressArr', toAddressArr);
        if(!isEmpty(toAddressArr)){
            toAddress = toAddressArr;
        }else{
            toAddress = toAddress + '@fax2mail.com';
        }
        nlapiSendEmail(formAddress, toAddress , subject, body,null,null,null,fileArr);
//		nlapiSendFax(formAddress, toAddress, subject, body,fileArr);
//		flag = 'Sending succeeded';
		flag = 'FAX送信一時停止';
	}
	return flag;
}
//end
/**
 *	n桁ランダム読み取り
 */
function RondomPass(number){
//    var arr1 = new Array("0","1","2","3","4","5","6","7","8","9");
//    var nonceStr=''
//    for(var i=0;i<number;i++){
//        var n = parseInt(Math.floor(Math.random()*number));
//        nonceStr+=arr1[n];
//    }
//    nlapiLogExecution('DEBUG', 'RondomPass', parseInt(nonceStr))
	var nonceStr = Math.floor((Math.random()+Math.floor(Math.random()*9+1))*Math.pow(10,9));
    return parseInt(nonceStr)
}

/**
 * sleep
 */
function sleep(waitMsec) {
    var startMsec = new Date();

    while (new Date() - startMsec < waitMsec);
}

/**
 * URLパラメータを取得する
 */
function getQueryVariable(variable){
	try{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
	}catch(e){}
       return null;
}
//20230413 add by zhou start
/**
 * request URL取得する
 */
function serverScriptGetUrlHead(request){
//	SL/UE
	try{
       var url = JSON.stringify(request.getURL());
       var urlToArr = url.split("/app");
       var urlHead = urlToArr[0].replace(new RegExp('"',"g"),"");
       //It looks like :  https://5722722.app.netsuite.com
       if(urlHead){
    	   return urlHead;
       }
	}catch(e){}
       return null;
}
function clientScriptGetUrlHead(){
	try{
		 var url = JSON.stringify(window.location.href);
	     var urlToArr = url.split("/app");
	     var urlHead = urlToArr[0].replace(new RegExp('"',"g"),"");
       //It looks like :  https://5722722.app.netsuite.com
       if(urlHead){
    	   return urlHead;
       }
	}catch(e){}
       return null;
}
//20230413 add by zhou end

//20230614 add by zhou start
/**
 * request 1.0 Client get Batchstatus
 * request 1.0クライアントスクリプトがssスクリプト運転状態を取得する
 */
function clientScriptGetBatchStatus(customscriptId,customdeployId){
	//customscriptId: SS customscriptID
	//customdeployId: SS customdeployId
	try{
    	var batchStatusLink = nlapiResolveURL('SUITELET','customscript_djkk_sl_scheduled_getstatus','customdeploy_djkk_sl_scheduled_getstatus');
    	batchStatusLink +='&customscriptId=' +customscriptId;
		batchStatusLink +='&customdeployId=' +customdeployId;
    	var rse = nlapiRequestURL(batchStatusLink);
    	var flag = rse.getBody();
    	return flag;
    	//flag : 
	}catch(e){}
       return null;
}
//20230614 add by zhou end
/**
 * システム日付と時間をフォーマットで取得
 */
 function getFormatYmdHms() {

    // システム時間
    var now = getSystemTime();

    var str = now.getFullYear().toString();
    str += (now.getMonth() + 1).toString();
    str += now.getDate() + "_";
    str += now.getHours();
    str += now.getMinutes();
    str += now.getMilliseconds();

    return str;
}
 /**
  * システム日付と時間をフォーマットで取得 - YYMMDD
  */
 function getdateYYMMDD(){
	var now = getSystemTime();
	 nlapiLogExecution('DEBUG', 'now.getDate()', now.getDate())
	var month = now.getMonth() + 1;
	var Day = now.getDate();
	 nlapiLogExecution('DEBUG', 'Day',Day)
	var today = "";
	if(month<10){
	if(Day<10){
	today = now.getFullYear().toString().substr(-2) + "0" + month + "0" + Day;
	}else{
	today = now.getFullYear().toString().substr(-2) + "0" + month + Day;
	}
	}
	else{
	if(Day<10){
	today = now.getFullYear().toString().substr(-2) + month + "0" + Day;
	}else{
	today = now.getFullYear().toString().substr(-2) + month +  Day;
	}
	}
	return today
}
 //三位,追加
 function thousandsWithComa(num){
	    var str = num.toString();
	    var reg = str.indexOf(".") > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
	    return str.replace(reg,"$1,");
	}
 
//０埋める
 function PrefixZero(num, n) {
     return (Array(n).join(0) + num).slice(-n);
 }
 

 function getRoleSub(roleId) {
	var filters = new Array();
	filters.push(new nlobjSearchFilter('internalId', null, 'anyof', roleId));
	var savedSearch = nlapiLoadSearch('role','customsearch_djkk_role_subsearch');
	savedSearch.addFilters(filters);

	// 保存検索の実行
	var resultset = savedSearch.runSearch();

	if(!isEmpty(resultset)){
		var searchlinesResults = resultset.getResults(0, 1000);
		if(!isEmpty(searchlinesResults)){
			return searchlinesResults[0].getValue('subsidiaries');
		}
	}
	return '';
}
 
//change 'null' to ''
 function checkStringNull(String) {
	 if(!isEmpty(String)){
		 if(String=='null'||String=='NULL'){
			 return ''; 
		 }else{
			 return String;
		 }	 
	 }
     return '';
 }
 //add by zhou オブジェクト配列は要素順に増加します
 function compare(property,desc) {
	    return function (a, b) {
	        var value1 = a[property];
	        var value2 = b[property];
	        if(desc==true){
	        	return value2 - value1;
	        }else{
	            
	            return value1 - value2;
	        }
	    }
}

// CH677 zheng 20230629 start
 /*
  * 入り目略称の取得
  */
 function getConversionrateAbbreviationNew(itemUnitsTypeId, unitId) {

     var conversionrate = '';

     var unitsTypeRec = nlapiLoadRecord('unitstype', itemUnitsTypeId);
     var count = unitsTypeRec.getLineItemCount('uom');
     for (var i = 1; i <= count; i++) {
         var tmpSubId = unitsTypeRec.getLineItemValue("uom", "internalid", i);
         if (tmpSubId == unitId) {
             conversionrate = unitsTypeRec.getLineItemValue("uom", "conversionrate", i);
             break;
         }
     }

     return conversionrate;
 }
//CH677 zheng 20230629 end

 /**
  * システム日付と時間をフォーマットで取得 - YYMMDD/hhmmss
  */
//CH762 20230811 add by zdj start
 function getDateYymmddFileName(){
     var now = getSystemTime();
     nlapiLogExecution('DEBUG', 'now.getDate()', now.getDate())
     var month = now.getMonth() + 1;
     var Day = now.getDate();
     nlapiLogExecution('DEBUG', 'Day',Day)
     var hours = now.getHours();
     var minutes = now.getMinutes();
     var seconds = now.getSeconds();
     if(month<10){
         month = "0" + month;
     }; 
     if(Day<10){
         Day = "0" + Day;
     };
     if(hours<10){
         hours = "0" + hours;
     };
     if(minutes<10){
         minutes = "0" + minutes;
     };
     if(seconds<10){
         seconds = "0" + seconds;
     };
     var today = "";
     today = now.getFullYear().toString() + month  + Day  + hours + minutes + seconds;
     return today
 }
 //CH762 20230811 add by zdj end 
 /**
  * システム日付をフォーマットで取得 - YYMMDD
  */
//CH762 20230817 add by zdj start
 function getDateYymmddFileName02(){
     var now = getSystemTime();
     nlapiLogExecution('DEBUG', 'now.getDate()', now.getDate())
     var month = now.getMonth() + 1;
     var Day = now.getDate();
     nlapiLogExecution('DEBUG', 'Day',Day)
     if(month<10){
         month = "0" + month;
     }; 
     if(Day<10){
         Day = "0" + Day;
     };
     var today = "";
     today = now.getFullYear().toString() + month  + Day ;
     return today
 }
 //CH762 20230817 add by zdj end 