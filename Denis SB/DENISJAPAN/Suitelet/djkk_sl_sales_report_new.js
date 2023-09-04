/**
 * 
 * セールスレポート
 * Version    Date            Author           Remarks
 * 1.00       2021/04/27     CPC_
 *
 */
//去年含むフラグ
var CONST_LAST_YEAR = "F";
var CONST_LINE = "0";
var CONST_GROUP1 = "0";
var CONST_GROUP2 = "0";
//表示内容が数量/金額　1:金額　2:数量
var CONST_AMT_OR_COUNT = "1"
//会社
var CONST_SUB = "";
var CONST_SUB_TEXT = "";

//社外秘
var CONST_SHAGAIHI = "";

var CSV_STR = '';
var CSV_STRNew = ''

var DATE_TEXT = '';

var CONST_AREA = "";//エリア
var areaArray;

//PDFとHTML表示を分ける CH193
var CONST_HTML_FLG = 1;
var CONST_PDF_FLG = 2;

//20230901 add by CH762 start 
var REPORT_ADDRESS = '';
//20230901 add by CH762 end 

function suitelet(request, response) {
	var form = nlapiCreateForm('DJ_セールスレポート', false);
	form.setScript('customscript_djkk_cs_sales_report_new');

	// パラメータ取得
	var selectFlg = request.getParameter('selectFlg');
	var group1Value = request.getParameter('group1');
	var group2Value = request.getParameter('group2');
	var lineValue = request.getParameter('line');
	var subsidiaryValue = request.getParameter('subsidiary');
	var lastYearValue = request.getParameter('lastyear');
	var amtOrCountValue = request.getParameter('amtOrCount');
	var shagaihiValue  =request.getParameter('shagaihi');
	var sessionValue = request.getParameter('session');
	var brandValue = request.getParameter('brand');
	var employeeValue = request.getParameter('employee');
	var itemValue = request.getParameter('item');
	var itemgroupValue = request.getParameter('itemgroup');
	var customerValue = request.getParameter('customer');
	var customergroupValue = request.getParameter('customergroup');
	var locationValue = request.getParameter('location');
	var deliveryValue = request.getParameter('delivery');
	var dateFromValue = request.getParameter('datefrom');
	var dateToValue = request.getParameter('dateto');
	var areaValue = request.getParameter('area');
	var areaSubValue = request.getParameter('areasub');
	var deliverygroupValue = request.getParameter('deliverygroup');
	var tantoValue = request.getParameter('tanto');

	// 画面ボタン追加
	if (selectFlg == 'T') {
		form.addButton('btn_return', '検索戻す', 'searchReturn()')
	} else {
		form.addButton('btn_search', '検索', 'search()')
		form.addButton('btn_clear', 'クリア', 'clearf()')

	}
	
	//20230901 add by CH762 start 
    if(subsidiaryValue == SUB_NBKK){
        REPORT_ADDRESS = FILE_CABINET_ID_SALES_REPORT_NBKK;
    }else if(subsidiaryValue == SUB_ULKK){
        REPORT_ADDRESS = FILE_CABINET_ID_SALES_REPORT_ULKK;
    }else{
        REPORT_ADDRESS = FILE_CABINET_ID_SALES_REPORT;
    }
   //20230901 add by CH762 end 
	
	//特殊処理グループ２選択し、グループ１が選択されていない場合
//	if(group1Value =='0' && group2Value != '0'){
//		group1Value = group2Value;
//		group2Value = '0';
//	}
	//CH618 group1 group2 抽出専用
	if(group1Value =='0' && group2Value != '0'){
		group1Value = group2Value;
		group2Value = '0';
	}
	if(group1Value !='0' && group2Value != '0'){
		var tempValue = group2Value 
		group2Value = group1Value;
		group1Value = tempValue;
	}
	var group1FieldValue = group2Value; 
	var group2FieldValue = group1Value;
	
	
	//画面項目追加
	form.addFieldGroup('show_group', '表示内容');
	form.addFieldGroup('select_group', '検索項目');

	
	//グループ２
	var group2Field = form.addField('custpage_group2', 'select', 'Group1',null,'show_group');
	addOpption(group2Field);
	group2Field.setDefaultValue(group2FieldValue);
	
	
	//グループ１
	var group1Field = form.addField('custpage_group1', 'select', 'Group2',null,'show_group');
	addOpption(group1Field);
	group1Field.setDefaultValue(group1FieldValue);
	
	CONST_GROUP2 = group2Value;
	CONST_GROUP1 = group1Value;
	if(group1Value !='0' && group2Value != '0'){
		CONST_GROUP2 = group1Value;
		CONST_GROUP1 = group2Value;
	}
	

	
	//ライン
	var lineField = form.addField('custpage_line', 'select', 'Line',null,'show_group');
	lineField.setMandatory(true);
	addOpption(lineField);
	lineField.setDefaultValue(lineValue);
	CONST_LINE = lineValue;
	
	//金額/数量表示
	var amtOrCountField = form.addField('custpage_amtorcount', 'select', 'Data',null, 'show_group');
	amtOrCountField.addSelectOption('1', 'Sales');
	amtOrCountField.addSelectOption('2', 'QTY');
	amtOrCountField.setDefaultValue(amtOrCountValue);
	CONST_AMT_OR_COUNT = amtOrCountValue;
	
	//担当CH199
	
//	var salesRepField = form.addField('custpage_salesrep', 'select', 'salesRep',null, 'show_group');
//	  var salesRepSearch  = getSearchResults("employee",null,
//	      [
//	       ["access","is","T"], 
//	       "AND", 
//	       ["role","noneof","@NONE@"]
//	      ], 
//	      [
//	         new nlobjSearchColumn("internalid")
//	      ]
//	      );
//	    
//	  salesRepField.addSelectOption('','');
//	  for(var i = 0; i<salesRepSearch.length;i++){
//		  salesRepField.addSelectOption(salesRepSearch[i].getValue("internalid"),salesRepSearch[i].getValue('internalid'));
//	  }
	
	
	
	//前年度も含む
	var lastYearField = form.addField('custpage_lastyear', 'checkbox', 'LastYear',null, 'show_group');
	lastYearField.setDefaultValue(lastYearValue);
	CONST_LAST_YEAR = lastYearValue;
	
	//社外秘
	var shagaihiField = form.addField('custpage_shagaihi', 'checkbox', '社外秘',null, 'show_group');
	shagaihiField.setDefaultValue(shagaihiValue);
	CONST_SHAGAIHI = shagaihiValue;
	

	
	//連結
	var subsidiaryField = form.addField('custpage_subsidiary', 'select', 'Subsidiary',null, 'select_group');
	subsidiaryField.setMandatory(true);
	var selectSub=getRoleSubsidiariesAndAddSelectOption(subsidiaryField);
	if(isEmpty(subsidiaryValue)){
		subsidiaryValue = selectSub;
	}
	subsidiaryField.setDefaultValue(subsidiaryValue);
	CONST_SUB =subsidiaryValue;
	CONST_SUB_TEXT=nlapiLookupField('subsidiary', subsidiaryValue, 'custrecord_djkk_subsidiary_en');
	
	//期間
	var dateFromField = form.addField('custpage_datefrom', 'date', 'Date(From)',null, 'select_group');
	dateFromField.setDefaultValue(dateFromValue);
	var dateToField = form.addField('custpage_dateto', 'date', 'Date(To)',null, 'select_group');
	dateToField.setDefaultValue(dateToValue);
	
	if(!isEmpty(dateFromValue) || !isEmpty(dateToValue)){
		DATE_TEXT = '期間：'+(dateFromValue) + '～'+ dateToValue;
	}
	

	//セクション
	var sessionField = form.addField('custpage_session', 'multiselect', 'Section',null, 'select_group');
	setSelectOpption("department",sessionField,'subsidiary',"name");
	sessionField.setDefaultValue(sessionValue);
	
	//ブランド
	var brandField = form.addField('custpage_brand', 'multiselect', 'Brand',null, 'select_group');
	setSelectOpption("classification",brandField,'subsidiary',"name");
	brandField.setDefaultValue(brandValue);
	
	//担当者
	var employeeField = form.addField('custpage_employee', 'multiselect', 'Salesman',null, 'select_group');
	setSelectOpption("employee",employeeField,'subsidiary',"entityid");
	employeeField.setDefaultValue(employeeValue);

	var tantoField = form.addField('custpage_tanto', 'multiselect', 'Tanto',null, 'select_group');
	setSelectOpption("employee",tantoField,'subsidiary',"entityid");
	tantoField.setDefaultValue(tantoValue);
	
	//アイテム
	var itemField = form.addField('custpage_item', 'multiselect', 'Item',null, 'select_group');
	//20230516 changed by zhou start
	setSelectOpption("item",itemField,'subsidiary',"custitem_dkjj_item_pdf_show");//before
//	setSelectOpption("item",itemField,'subsidiary',"custitem_djkk_product_code");//DJ_カタログ製品コード
	//20230516 changed by zhou end
	itemField.setDefaultValue(itemValue);
	
	//アイテムグループ
	var itemgroupField = form.addField('custpage_itemgroup', 'multiselect', 'Prod.Group',null, 'select_group');
	setSelectOpption("customrecord_djkk_product_group",itemgroupField,'custrecord_djkk_pg_subsidiary',"name");
	itemgroupField.setDefaultValue(itemgroupValue);
	
	//顧客
	var customerField = form.addField('custpage_customer', 'multiselect', 'Customer',null, 'select_group');
	setSelectOpption("customer",customerField,'subsidiary',"companyname");
	customerField.setDefaultValue(customerValue);
	
	//顧客グループ
	var customergroupField = form.addField('custpage_customergroup', 'multiselect', 'Cust.Category',null, 'select_group');
	setSelectOpption("customrecord_djkk_customer_group",customergroupField,'custrecord_djkk_cg_subsidiary',"name");
	customergroupField.setDefaultValue(customergroupValue);
	
	//場所
	var locationField = form.addField('custpage_location', 'multiselect', 'Warehouse',null, 'select_group');
	setSelectOpption("location",locationField,'subsidiary',"name");
	locationField.setDefaultValue(locationValue);
	
	//納品先
	var deliveryField = form.addField('custpage_delivery', 'multiselect', 'DelvCustomer',null, 'select_group');
	setSelectOpption("customrecord_djkk_delivery_destination",deliveryField,'custrecord_djkk_delivery_subsidiary',"name");
	deliveryField.setDefaultValue(deliveryValue);

	//テリトリー
	var areaField = form.addField('custpage_area', 'multiselect', 'Delv.Area',null, 'select_group');
//	setSelectOpption("customrecord_djkk_location_area",areaField,'custrecord_djkk_location_subsidiary',"name");
	setSelectOpption("customlist_djkk_area",areaField,null,"name");
	areaField.setDefaultValue(areaValue);
	CONST_AREA = areaValue;
	if(!isEmpty(CONST_AREA)){
	       areaArray = CONST_AREA.split('');//itemを分割する
	}
//	nlapiLogExecution('DEBUG', 'CONST_AREA', CONST_AREA);
//	if(CONST_SUB == SUB_NBKK || CONST_SUB == SUB_ULKK ){
	var areaSubField = form.addField('custpage_area_sub', 'multiselect', 'Delv.AreaSub',null, 'select_group');
	setSelectedAreaOpption("customrecord_djkk_area_subdivision",areaSubField,'custrecord_djkk_area_record',"name");
	areaSubField.setDefaultValue(areaSubValue);
//	}
	
	
	//納品先グループ
	var deliveryGroupField = form.addField('custpage_deliverygroup', 'multiselect', 'DelvCustomerGroup',null, 'select_group');
	setSelectOpption("customrecord_djkk_delivery_group",deliveryGroupField,'custrecord_djkk_delivery_group_sub',"name");
	deliveryGroupField.setDefaultValue(deliverygroupValue);
	
	
	if(selectFlg == 'T'){
		//項目非編集状態へ
		group1Field.setDisplayType('inline');
		group2Field.setDisplayType('inline');
		lineField.setDisplayType('inline');
		subsidiaryField.setDisplayType('inline');
		lastYearField.setDisplayType('inline');
		shagaihiField.setDisplayType('inline');
		amtOrCountField.setDisplayType('inline');
		sessionField.setDisplayType('inline');
		employeeField.setDisplayType('inline');
		tantoField.setDisplayType('inline');
		brandField.setDisplayType('inline');
		itemField.setDisplayType('inline');
		itemgroupField.setDisplayType('inline');
		customerField.setDisplayType('inline');
		customergroupField.setDisplayType('inline');
		locationField.setDisplayType('inline');
		deliveryField.setDisplayType('inline');
		dateFromField.setDisplayType('inline');
		dateToField.setDisplayType('inline');
		areaField.setDisplayType('inline');
//		if(CONST_SUB == SUB_NBKK || CONST_SUB == SUB_ULKK ){
		areaSubField.setDisplayType('inline');
//		}
		deliveryGroupField.setDisplayType('inline');

		var lastYear = getLastYear(dateFromValue,dateToValue);
		
		
		//対象データ取得する。今年
		var rstData = getData('F',subsidiaryValue,sessionValue,brandValue,employeeValue,itemValue,itemgroupValue,customerValue,customergroupValue,locationValue,deliveryValue,dateFromValue,dateToValue,areaValue,areaSubValue,deliverygroupValue,tantoValue);
		var lastYearRstData = null;
		if(lastYearValue == 'T'){
			//対象データ取得する。去年
			lastYearRstData = getData('T',subsidiaryValue,sessionValue,brandValue,employeeValue,itemValue,itemgroupValue,customerValue,customergroupValue,locationValue,deliveryValue,dateFromValue,dateToValue,areaValue,areaSubValue,deliverygroupValue,tantoValue);
		}

		//画面を書く
		var htmlNote = '';
		var pdfNote = '';
		//CH193でページブレイクを追加
		var pdfHeadNote = '';
		//changed by geng add start U080 20221124
		var htmlNoteNew = '';
//		var pdfNoteNew = '';
		//changed by geng add end U080 20221124
		if (group1Value != '0' && group2Value != '0') {
			//グループ１とグループ２場合

				htmlNote = setPageGroup2(rstData, lastYearRstData, CONST_HTML_FLG);
			//対象データ取得する。今年
			var rstData = getData('F',subsidiaryValue,sessionValue,brandValue,employeeValue,itemValue,itemgroupValue,customerValue,customergroupValue,locationValue,deliveryValue,dateFromValue,dateToValue,areaValue,areaSubValue,deliverygroupValue,tantoValue);
			var lastYearRstData = null;
			if(lastYearValue == 'T'){
				//対象データ取得する。去年
				lastYearRstData = getData('T',subsidiaryValue,sessionValue,brandValue,employeeValue,itemValue,itemgroupValue,customerValue,customergroupValue,locationValue,deliveryValue,dateFromValue,dateToValue,areaValue,areaSubValue,deliverygroupValue,tantoValue);
			}
			pdfNote = setPageGroup2(rstData, lastYearRstData, CONST_PDF_FLG);
			if(getOpption(CONST_LINE)=="Item"){			
				var rstData = getData('F',subsidiaryValue,sessionValue,brandValue,employeeValue,itemValue,itemgroupValue,customerValue,customergroupValue,locationValue,deliveryValue,dateFromValue,dateToValue,areaValue,areaSubValue,deliverygroupValue,tantoValue);
				var lastYearRstData = null;
				if(lastYearValue == 'T'){
					//対象データ取得する。去年
					lastYearRstData = getData('T',subsidiaryValue,sessionValue,brandValue,employeeValue,itemValue,itemgroupValue,customerValue,customergroupValue,locationValue,deliveryValue,dateFromValue,dateToValue,areaValue,areaSubValue,deliverygroupValue,tantoValue);
				}
				htmlNoteNew = setPageGroup2New(rstData, lastYearRstData, CONST_HTML_FLG);
			}
			
			pdfHeadNote +='<tr>';
			pdfHeadNote +='<td colspan = "4" align="left" class="font_color" style="color:#00255C;font-size:17px;"><u><strong>'+CONST_SUB_TEXT+'</strong></u></td>';
			pdfHeadNote +='<td colspan = "11" align="center" class="font_color" style="color:#00255C;font-size:18px;vertical-align:top;"><strong>＜＜'+getSalesOrQty()+' Per   '+getOpption(CONST_LINE)+'  Group1:'+getOpption(CONST_GROUP2)+'  Group2:'+getOpption(CONST_GROUP1)+'＞＞</strong></td>';
			pdfHeadNote +='<td colspan = "3" align="right" style="font-size:13px;color:#00255C;vertical-align:top;">'+nlapiDateToString(getSystemTime())+'</td>';
			pdfHeadNote +='</tr>';
		} else if (group1Value != '0' || group2Value != '0') {
			//グループ１場合

			htmlNote = setPageGroup1(rstData, lastYearRstData, CONST_HTML_FLG);
			var rstData = getData('F',subsidiaryValue,sessionValue,brandValue,employeeValue,itemValue,itemgroupValue,customerValue,customergroupValue,locationValue,deliveryValue,dateFromValue,dateToValue,areaValue,areaSubValue,deliverygroupValue,tantoValue);
			var lastYearRstData = null;
			if(lastYearValue == 'T'){
				//対象データ取得する。去年
				lastYearRstData = getData('T',subsidiaryValue,sessionValue,brandValue,employeeValue,itemValue,itemgroupValue,customerValue,customergroupValue,locationValue,deliveryValue,dateFromValue,dateToValue,areaValue,areaSubValue,deliverygroupValue,tantoValue);
			}
			pdfNote = setPageGroup1(rstData, lastYearRstData, CONST_PDF_FLG);
			if(getOpption(CONST_LINE)=="Item"){
				var rstData = getData('F',subsidiaryValue,sessionValue,brandValue,employeeValue,itemValue,itemgroupValue,customerValue,customergroupValue,locationValue,deliveryValue,dateFromValue,dateToValue,areaValue,areaSubValue,deliverygroupValue,tantoValue);
				var lastYearRstData = null;
				if(lastYearValue == 'T'){
					//対象データ取得する。去年
					lastYearRstData = getData('T',subsidiaryValue,sessionValue,brandValue,employeeValue,itemValue,itemgroupValue,customerValue,customergroupValue,locationValue,deliveryValue,dateFromValue,dateToValue,areaValue,areaSubValue,deliverygroupValue,tantoValue);
				}
				htmlNoteNew = setPageGroup1New(rstData, lastYearRstData, CONST_HTML_FLG);
			}			

			pdfHeadNote +='<tr>';
			pdfHeadNote +='<td colspan = "4" align="left" class="font_color" style="color:#00255C;font-size:17px;"><u><strong>'+CONST_SUB_TEXT+'</strong></u></td>';
			pdfHeadNote +='<td colspan = "11" align="center" class="font_color" style="color:#00255C;font-size:18px;vertical-align:top;"><strong>＜＜'+getSalesOrQty()+' Per   '+getOpption(CONST_LINE)+'  Group1:'+getOpption(CONST_GROUP1)+'＞＞</strong></td>';
			pdfHeadNote +='<td colspan = "3" align="right" style="font-size:13px;color:#00255C;vertical-align:top;">'+nlapiDateToString(getSystemTime())+'</td>';
			pdfHeadNote +='</tr>';
		} else {
			//ラインのみ場合
			htmlNote = setPageLine(rstData, lastYearRstData, CONST_HTML_FLG);
			pdfNote = setPageLine(rstData, lastYearRstData, CONST_PDF_FLG);
			//changed by geng add start U080 20221124
			if(getOpption(CONST_LINE)=="Item"){
				htmlNoteNew = setPageLineNew(rstData, lastYearRstData, CONST_HTML_FLG);
			}
			//changed by geng add end U080 20221124
			pdfHeadNote +='<tr>';
			pdfHeadNote +='<td colspan = "4" align="left" class="font_color" style="color:#00255C;font-size:17px;"><u><strong>'+CONST_SUB_TEXT+'</strong></u></td>';
			pdfHeadNote +='<td colspan = "11" align="center" class="font_color" style="color:#00255C;font-size:18px;vertical-align:top;"><strong>＜＜'+getSalesOrQty()+' Per   '+getOpption(CONST_LINE)+'＞＞</strong></td>';
			pdfHeadNote +='<td colspan = "3" align="right" style="font-size:13px;color:#00255C;vertical-align:top;">'+nlapiDateToString(getSystemTime())+'</td>';
			pdfHeadNote +='</tr>';
			
		}
		
		//社外秘表示
		if(CONST_SHAGAIHI == 'T'){
			pdfHeadNote +='<tr>';
			pdfHeadNote +='<td colspan = "18" align="center" style="font-weight: bold;color:#696969;font-size:50px;"><b>社外秘</b></td>';
			pdfHeadNote +='</tr>';
		}

		pdfHeadNote += '</table>';
		pdfHeadNote += '<table border="0" cellpadding="0" cellspacing="0" class= "table_main" style="overflow:scroll;margin-left:15px;margin-bottom:15px;width:1020px;border-collapse:collapse;">';//table b
		pdfHeadNote +='<tr >';
		pdfHeadNote +='<td colspan = "16">'+DATE_TEXT+'</td>';
		pdfHeadNote +='<td colspan = "2" align="right" style="font-size:11px;color:#00255C;min-width:39px">上段 本年</td>';
		pdfHeadNote +='</tr>';
		pdfHeadNote +='<tr >';
		pdfHeadNote +='<td colspan = "16">&nbsp;</td>';
		pdfHeadNote +='<td colspan = "2" align="right" style="font-size:11px;color:#00255C;min-width:39px">下段 前年</td>';
		pdfHeadNote +='</tr>';
		
		pdfHeadNote +='<tr>';
		pdfHeadNote +='<td colspan = "15" style="height:30px">&nbsp;</td>';
		if(CONST_AMT_OR_COUNT == '2'){
			pdfHeadNote +='<td align="right" style="font-size:11px;color:#00255C;">(単位 個)</td>';
			pdfHeadNote +='<td align="right" style="font-size:11px;color:#00255C;">(千円)</td>';
			pdfHeadNote +='<td align="right" style="font-size:11px;color:#00255C;">(円)</td>';
		}else if(CONST_AMT_OR_COUNT == '1'){
			pdfHeadNote +='<td align="right" style="font-size:11px;color:#00255C;">(千円)</td>';
			pdfHeadNote +='<td align="right" style="font-size:11px;color:#00255C;"></td>';
			pdfHeadNote +='<td align="right" style="font-size:11px;color:#00255C;"></td>';
			
		}
		pdfHeadNote +='</tr>';
		
		pdfHeadNote +='<tr>';
		pdfHeadNote +='<td style="width:39px"></td>';
		pdfHeadNote +='<td style="width:39px"></td>';
		pdfHeadNote +='<td style="width:39px"></td>';
		pdfHeadNote +='<td style="width:39px"></td>';
		pdfHeadNote +='<td style="width:39px"></td>';
		pdfHeadNote +='<td style="width:39px"></td>';
		pdfHeadNote +='<td style="width:39px"></td>';
		pdfHeadNote +='<td style="width:39px"></td>';
		pdfHeadNote +='<td style="width:39px"></td>';
		pdfHeadNote +='<td style="width:39px"></td>';
		pdfHeadNote +='<td style="width:39px"></td>';
		pdfHeadNote +='<td style="width:39px"></td>';
		pdfHeadNote +='<td style="width:39px"></td>';
		pdfHeadNote +='<td style="width:39px"></td>';
		pdfHeadNote +='<td style="width:39px"></td>';
		pdfHeadNote +='<td style="width:39px"></td>';
		pdfHeadNote +='<td style="width:39px"></td>';
		pdfHeadNote +='<td style="width:39px"></td>';
		pdfHeadNote +='</tr>';
		
		
		pdfHeadNote +='<tr>';
		pdfHeadNote +='<td colspan = "3" style="  line-height:93%;font-size:13px;color:#00255C;border-left:none;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto">'+getOpption(CONST_LINE)+'</td>';
		pdfHeadNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">1月</td>';
		pdfHeadNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">2月</td>';
		pdfHeadNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">3月</td>';
		pdfHeadNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">4月</td>';
		pdfHeadNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">5月</td>';
		pdfHeadNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">6月</td>';
		pdfHeadNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">7月</td>';
		pdfHeadNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">8月</td>';
		pdfHeadNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">9月</td>';
		pdfHeadNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">10月</td>';
		pdfHeadNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">11月</td>';
		pdfHeadNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;border-right:2px solid #1456A2;width:39px">12月</td>';
		
		if(CONST_AMT_OR_COUNT == '2'){
			pdfHeadNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-top:1px solid #00255C;border-bottom:2px solid #00255C;border-left:2px solid #1456A2;width:39px">Total</td>'
				pdfHeadNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">Total</td>';
				pdfHeadNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">AvgPrice</td>';
		}else if(CONST_AMT_OR_COUNT == '1'){
			pdfHeadNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">Yearly</td>';
			pdfHeadNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto;min-width:39px">G.P</td>';
			pdfHeadNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-right:none; border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto">％</td>';
		}
		
		pdfHeadNote +='</tr>';
		
		var feieldNote = form.addField('custpage_note', 'inlinehtml', '', '','');
		feieldNote.setDefaultValue(htmlNote);
		
		//changed by geng add start U080 
		var resultUrl = '';
		if(getOpption(CONST_LINE)=="Item"){
			resultUrl = htmlNoteNew;
		}else{
			resultUrl = htmlNote;
		}
		//changed by geng add end U080 
		if(!isEmpty(rstData)){
			form.addButton('btn_csv', 'CSV出力', "window.open('" + getCsv(rstData,lastYearRstData,lastYear) + "', '_blank');")
			form.addButton('btn_excel', 'Excel出力', "window.open('" + getExcel(resultUrl) + "', '_blank');")
			form.addButton('btn_pdf', 'PDF出力', "window.open('" + getPdf(pdfNote,pdfHeadNote) + "', '_blank');")
//			form.addButton('btn_html', 'PDF出力html', "window.open('" + getPdf(htmlNote,pdfHeadNote) + "', '_blank');")
		}
		


		
	}
	
	
	
	

	response.writePage(form);
}




//画面を書く ラインとグループ１とグループ２
function setPageGroup2(rstGroup2,lastYearRstGroup2, htmlOrPdfCheckFlog){
	if(isEmpty(rstGroup2)){
		return "データがありませんでした。";
	}
	var htmlNote='';
	CSV_STR = '';
//	htmlNote +='<table><tr><td align="center">';	
//	htmlNote +='<div id="tablediv" style="overflow:scroll;height:400px;width:1040px;border:1px solid;">';
	htmlNote += '<table border="0"  cellpadding="0" cellspacing="0" style="margin-left:15px;width:1020px;border-collapse:collapse;">';//table a
	htmlNote +='<tr>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='</tr>';
	//CH193で外す
	if(htmlOrPdfCheckFlog == 1){
	htmlNote +='<tr>';
	htmlNote +='<td colspan = "4" align="left" class="font_color" style="color:#00255C;font-size:17px;"><u><strong>'+CONST_SUB_TEXT+'</strong></u></td>';
	htmlNote +='<td colspan = "11" align="center" class="font_color" style="color:#00255C;font-size:18px;vertical-align:top;"><strong>＜＜'+getSalesOrQty()+' Per   '+getOpption(CONST_LINE)+'  Group1:'+getOpption(CONST_GROUP2)+'  Group2:'+getOpption(CONST_GROUP1)+'＞＞</strong></td>';
	htmlNote +='<td colspan = "3" align="right" style="font-size:13px;color:#00255C;vertical-align:top;">'+nlapiDateToString(getSystemTime())+'</td>';
	htmlNote +='</tr>';
	
	//社外秘表示
	if(CONST_SHAGAIHI == 'T'){
		htmlNote +='<tr>';
		htmlNote +='<td colspan = "18" align="center" style="font-weight: bold;color:#696969;font-size:50px;"><b>社外秘</b></td>';
		htmlNote +='</tr>';
	}
	}

	htmlNote += '</table>';
	htmlNote += '<table border="0" cellpadding="0" cellspacing="0" class= "table_main" style="overflow:scroll;margin-left:15px;margin-bottom:15px;width:1020px;border-collapse:collapse;">';//table b
	if(htmlOrPdfCheckFlog == 1){
	htmlNote +='<tr >';
	htmlNote +='<td colspan = "16">'+DATE_TEXT+'</td>';
	htmlNote +='<td colspan = "2" align="right" style="font-size:11px;color:#00255C;min-width:39px">上段 本年</td>';
	htmlNote +='</tr>';
	htmlNote +='<tr >';
	htmlNote +='<td colspan = "16">&nbsp;</td>';
	htmlNote +='<td colspan = "2" align="right" style="font-size:11px;color:#00255C;min-width:39px">下段 前年</td>';
	htmlNote +='</tr>';
	
	htmlNote +='<tr>';
	htmlNote +='<td colspan = "15" style="height:30px">&nbsp;</td>';
	if(CONST_AMT_OR_COUNT == '2'){
		htmlNote +='<td align="right" style="font-size:11px;color:#00255C;">(単位 個)</td>';
		htmlNote +='<td align="right" style="font-size:11px;color:#00255C;">(千円)</td>';
		htmlNote +='<td align="right" style="font-size:11px;color:#00255C;">(円)</td>';
	}else if(CONST_AMT_OR_COUNT == '1'){
		htmlNote +='<td align="right" style="font-size:11px;color:#00255C;">(千円)</td>';
		htmlNote +='<td align="right" style="font-size:11px;color:#00255C;"></td>';
		htmlNote +='<td align="right" style="font-size:11px;color:#00255C;"></td>';
		
	}
	htmlNote +='</tr>';
	htmlNote +='<tr>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='</tr>';
	
	htmlNote +='<tr>';
	htmlNote +='<td colspan = "3" style="  line-height:93%;font-size:13px;color:#00255C;border-left:none;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto">'+getOpption(CONST_LINE)+'</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">1月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">2月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">3月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">4月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">5月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">6月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">7月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">8月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">9月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">10月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">11月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;border-right:2px solid #1456A2;width:39px">12月</td>';

	if(CONST_AMT_OR_COUNT == '2'){
		htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-top:1px solid #00255C;border-bottom:2px solid #00255C;border-left:2px solid #1456A2;width:39px">Total</td>'
			htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">Total</td>';
			htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">AvgPrice</td>';
	}else if(CONST_AMT_OR_COUNT == '1'){
		htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">Yearly</td>';
		htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto;min-width:39px">G.P</td>';
		htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-right:none; border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto">％</td>';
	}
	
	htmlNote +='</tr>';
	}
	var colGroup2TotalMonth1 = 0;
	var colGroup2TotalMonth2 = 0;
	var colGroup2TotalMonth3 = 0;
	var colGroup2TotalMonth4 = 0;
	var colGroup2TotalMonth5 = 0;
	var colGroup2TotalMonth6 = 0;
	var colGroup2TotalMonth7 = 0;
	var colGroup2TotalMonth8 = 0;
	var colGroup2TotalMonth9 = 0;
	var colGroup2TotalMonth10 = 0;
	var colGroup2TotalMonth11 = 0;
	var colGroup2TotalMonth12 = 0;
	var colGroup2TotalCount = 0;
	var colGroup2TotalAmt = 0;
	var colGroup2TotalCost = 0;
	var colGroup2TotalSorieki = 0;
	var colGroup2TotallineSoriekiPer = 0;
	
	var colGroup2TotalMonth1LastYear = 0;
	var colGroup2TotalMonth2LastYear = 0;
	var colGroup2TotalMonth3LastYear = 0;
	var colGroup2TotalMonth4LastYear = 0;
	var colGroup2TotalMonth5LastYear = 0;
	var colGroup2TotalMonth6LastYear = 0;
	var colGroup2TotalMonth7LastYear = 0;
	var colGroup2TotalMonth8LastYear = 0;
	var colGroup2TotalMonth9LastYear = 0;
	var colGroup2TotalMonth10LastYear = 0;
	var colGroup2TotalMonth11LastYear = 0;
	var colGroup2TotalMonth12LastYear = 0;
	var colGroup2TotalCountLastYear = 0;
	var colGroup2TotalAmtLastYear = 0;
	var colGroup2TotalCostLastYear = 0;
	var colGroup2TotalSoriekiLastYear = 0;
	var colGroup2TotallineSoriekiPerLastYear = 0;
	var csvGroup2Text = '';
	
	for(var k = 0 ; k < rstGroup2.length ; k++){
		
		
		var rstGroup1 = rstGroup2[k];	
		var lastYearRstGroup1 = getOldYearDataGroup2(lastYearRstGroup2,rstGroup2[k][0]);
		
		csvGroup2Text = rstGroup2[k][0];
		if(CONST_GROUP2 == '4'){
			var csvGroup2Arr = csvGroup2Text.split('||');
			csvGroup2Text = csvGroup2Arr[0];
		}
		if(!isEmpty(csvGroup2Text)){
			csvGroup2Text = csvGroup2Text.replace(new RegExp("&","g"),"&amp;");
		}
		
		htmlNote +='<tr>';
		htmlNote +='<td colspan="18" style="font-size:13px;color:#00255C;height:25px;width:351px;border-left:none;border-right:none;border-top:1px solid #00255C;border-bottom-width:none;"><strong>'+getOpption(CONST_GROUP2)+' '+csvGroup2Text+'</strong></td>';
		htmlNote +='</tr>';
		
		//第一目を削除する。
		rstGroup1.shift();
		lastYearRstGroup1.shift();
		
		var colGroup1TotalMonth1 = 0;
		var colGroup1TotalMonth2 = 0;
		var colGroup1TotalMonth3 = 0;
		var colGroup1TotalMonth4 = 0;
		var colGroup1TotalMonth5 = 0;
		var colGroup1TotalMonth6 = 0;
		var colGroup1TotalMonth7 = 0;
		var colGroup1TotalMonth8 = 0;
		var colGroup1TotalMonth9 = 0;
		var colGroup1TotalMonth10 = 0;
		var colGroup1TotalMonth11 = 0;
		var colGroup1TotalMonth12 = 0;
		var colGroup1TotalCount = 0;
		var colGroup1TotalAmt = 0;
		var colGroup1TotalCost = 0;
		var colGroup1TotalSorieki = 0;
		var colGroup1TotallineSoriekiPer = 0;
		
		var colGroup1TotalMonth1LastYear = 0;
		var colGroup1TotalMonth2LastYear = 0;
		var colGroup1TotalMonth3LastYear = 0;
		var colGroup1TotalMonth4LastYear = 0;
		var colGroup1TotalMonth5LastYear = 0;
		var colGroup1TotalMonth6LastYear = 0;
		var colGroup1TotalMonth7LastYear = 0;
		var colGroup1TotalMonth8LastYear = 0;
		var colGroup1TotalMonth9LastYear = 0;
		var colGroup1TotalMonth10LastYear = 0;
		var colGroup1TotalMonth11LastYear = 0;
		var colGroup1TotalMonth12LastYear = 0;
		var colGroup1TotalCountLastYear = 0;
		var colGroup1TotalAmtLastYear = 0;
		var colGroup1TotalCostLastYear = 0;
		var colGroup1TotalSoriekiLastYear = 0;
		var colGroup1TotallineSoriekiPerLastYear = 0;
		var csvGroup1Text = '';
		
		for(var j = 0 ; j < rstGroup1.length ; j++){
			
			var rst = rstGroup1[j];		
			var lastYearRst = getOldYearDataGroup1(lastYearRstGroup1,rstGroup1[j][0]);
			
			csvGroup1Text = rstGroup1[j][0];
			if(CONST_GROUP1 == '4'){
				var csvGroup1Arr = csvGroup1Text.split('||');
				csvGroup1Text = csvGroup1Arr[0];
			}
			if(!isEmpty(csvGroup1Text)){
				csvGroup1Text = csvGroup1Text.replace(new RegExp("&","g"),"&amp;");
			}
			
			htmlNote +='<tr>';
			htmlNote +='<td colspan="18" style="font-size:13px;color:#00255C;height:25px;width:351px;border-left:none;border-right:none;border-top:1px solid #00255C;border-bottom-width:none;"><strong>'+getOpption(CONST_GROUP1)+' '+csvGroup1Text+'</strong></td>';
			htmlNote +='</tr>';
			
			//第一目を削除する。
			rst.shift();
			lastYearRst.shift();
			
			
			var colTotalMonth1 = 0;
			var colTotalMonth2 = 0;
			var colTotalMonth3 = 0;
			var colTotalMonth4 = 0;
			var colTotalMonth5 = 0;
			var colTotalMonth6 = 0;
			var colTotalMonth7 = 0;
			var colTotalMonth8 = 0;
			var colTotalMonth9 = 0;
			var colTotalMonth10 = 0;
			var colTotalMonth11 = 0;
			var colTotalMonth12 = 0;
			var colTotalCount = 0;
			var colTotalAmt = 0;
			var colTotalCost = 0;
			var colTotalSorieki = 0;
			var colTotallineSoriekiPer = 0;
			
			var colTotalMonth1LastYear = 0;
			var colTotalMonth2LastYear = 0;
			var colTotalMonth3LastYear = 0;
			var colTotalMonth4LastYear = 0;
			var colTotalMonth5LastYear = 0;
			var colTotalMonth6LastYear = 0;
			var colTotalMonth7LastYear = 0;
			var colTotalMonth8LastYear = 0;
			var colTotalMonth9LastYear = 0;
			var colTotalMonth10LastYear = 0;
			var colTotalMonth11LastYear = 0;
			var colTotalMonth12LastYear = 0;
			var colTotalCountLastYear = 0;
			var colTotalAmtLastYear = 0;
			var colTotalCostLastYear = 0;
			var colTotalSoriekiLastYear = 0;
			var colTotallineSoriekiPerLastYear = 0;
			for(var i = 0 ; i <rst.length ; i++ ){
				
				var lastYearRstLine = getOldYearDataLine(lastYearRst,rst[i][0]);
				if(rst[i][0] != lastYearRstLine[0]){
					lastYearRstLine = ["",{"count":"","amt":"","line":"","month":"01"},{"count":"","amt":"","line":"","month":"02"},{"count":"","amt":"","line":"","month":"03"},{"count":"","amt":"","line":"","month":"04"},{"count":"","amt":"","line":"","month":"05"},{"count":"","amt":"","line":"","month":"06"},{"count":"","amt":"","line":"","month":"07"},{"count":"","amt":"","line":"","month":"08"},{"count":"","amt":"","line":"","month":"09"},{"count":"","amt":"","line":"","month":"10"},{"count":"","amt":"","line":"","month":"11"},{"count":"","amt":"","line":"","month":"12"}];
				}
				//行金額合計
				var lineTotalAmt = Number(rst[i][1].amt) + Number(rst[i][2].amt) +Number(rst[i][3].amt) +Number(rst[i][4].amt) +Number(rst[i][5].amt) +Number(rst[i][6].amt) +Number(rst[i][7].amt) +Number(rst[i][8].amt) +Number(rst[i][9].amt) +Number(rst[i][10].amt) +Number(rst[i][11].amt) +Number(rst[i][12].amt);
				var lineTotalAmtLastYear =  Number(lastYearRstLine[1].amt) + Number(lastYearRstLine[2].amt) +Number(lastYearRstLine[3].amt) +Number(lastYearRstLine[4].amt) +Number(lastYearRstLine[5].amt) +Number(lastYearRstLine[6].amt) +Number(lastYearRstLine[7].amt) +Number(lastYearRstLine[8].amt) +Number(lastYearRstLine[9].amt) +Number(lastYearRstLine[10].amt) +Number(lastYearRstLine[11].amt) +Number(lastYearRstLine[12].amt);
				
				//行数量合計
				var lineTotalCount = setValue(rst[i][1].count,0) + setValue(rst[i][2].count,0) +setValue(rst[i][3].count,0) +setValue(rst[i][4].count,0) +setValue(rst[i][5].count,0) +setValue(rst[i][6].count,0) +setValue(rst[i][7].count,0) +setValue(rst[i][8].count,0) +setValue(rst[i][9].count,0) +setValue(rst[i][10].count,0) +setValue(rst[i][11].count,0) +setValue(rst[i][12].count,0);
				var lineTotalCountLastYear =  setValue(lastYearRstLine[1].count,0) + setValue(lastYearRstLine[2].count,0) +setValue(lastYearRstLine[3].count,0) +setValue(lastYearRstLine[4].count,0) +setValue(lastYearRstLine[5].count,0) +setValue(lastYearRstLine[6].count,0) +setValue(lastYearRstLine[7].count,0) +setValue(lastYearRstLine[8].count,0) +setValue(lastYearRstLine[9].count,0) +setValue(lastYearRstLine[10].count,0) +setValue(lastYearRstLine[11].count,0) +setValue(lastYearRstLine[12].count,0);

				//コスト(データなしの階層でCOSTが””です)
				var lineCost = "";
				for(var c = 12 ; c >= 1 ; c--){
					if(!isEmpty(rst[i][c].cost)){
						lineCost = rst[i][c].cost;
						break;
					}
				}
				var lineCostLastYear = "";
				for(var c = 12 ; c >= 1 ; c--){
					if(!isEmpty(lastYearRstLine[c].cost)){
						lineCostLastYear = lastYearRstLine[c].cost;
						break;
					}
				}
				
				//粗利益
				var lineSorieki = Number(lineTotalAmt) - Number(lineCost);
				var lineSoriekiLastYear = Number(lineTotalAmtLastYear) - Number(lineCostLastYear);
				
				//粗利率
				var lineSoriekiPer = "";
				if(Number(lineTotalAmt) != 0){
					lineSoriekiPer = lineSorieki /Number(lineTotalAmt);
				}else{
					lineSoriekiPer  =0;
				}
				var lineSoriekiPerLastYear = "";
				if(Number(lineTotalAmtLastYear) != 0){
					lineSoriekiPerLastYear = lineSoriekiLastYear /Number(lineTotalAmtLastYear);
				}else{
					lineSoriekiPerLastYear  =0;
				}


				//ライン設定
				htmlNote +='<tr>';
				if(getOpption(CONST_LINE)=="Item"){
					var itemLineTemp = replacetoxml(rst[i][0]);
					var currentItemLineArr = itemLineTemp.split('||');
					var currentItem = currentItemLineArr[0];
					htmlNote +='<td  colspan = "3" style="border-left:none;border-top:1px solid #538DD5;height:25px;vertical-align:top;">'+currentItem+'</td>';
				}else{
				htmlNote +='<td  colspan = "3" style="border-left:none;border-top:1px solid #538DD5;height:25px;vertical-align:top;">'+replacetoxml(rst[i][0])+'</td>';
				}
//				htmlNote +='<td  colspan = "3" style="border-left:none;border-top:1px solid #538DD5;height:25px;vertical-align:top;">'+replacetoxml(rst[i][0])+'</td>';
				htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][1],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[1],1),20))+'</td></tr></table></td>';
				htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][2],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[2],1),20))+'</td></tr></table></td>';
				htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][3],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[3],1),20))+'</td></tr></table></td>';
				htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][4],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[4],1),20))+'</td></tr></table></td>';
				htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][5],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[5],1),20))+'</td></tr></table></td>';
				htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][6],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[6],1),20))+'</td></tr></table></td>';
				htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][7],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[7],1),20))+'</td></tr></table></td>';
				htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][8],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[8],1),20))+'</td></tr></table></td>';
				htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][9],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[9],1),20))+'</td></tr></table></td>';
				htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][10],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[10],1),20))+'</td></tr></table></td>';
				htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][11],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[11],1),20))+'</td></tr></table></td>';
				htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;border-right:2px solid #1456A2;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][12],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[12],1),20))+'</td></tr></table></td>';
	
				if(CONST_AMT_OR_COUNT == '2'){
					htmlNote +='<td align="right" style="border-left:2px solid #1456A2;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(lineTotalCount,11))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(lineTotalCountLastYear,21))+'</td></tr></table></td>';
					htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(lineTotalAmt,12))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(lineTotalAmtLastYear,22))+'</td></tr></table></td>';
					htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(lineCost,13))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(lineCostLastYear,23))+'</td></tr></table></td>';

				}else if(CONST_AMT_OR_COUNT == '1'){
					htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(lineTotalAmt,12))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(lineTotalAmtLastYear,22))+'</td></tr></table></td>';
					htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(lineSorieki,14))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(lineSoriekiLastYear,24))+'</td></tr></table></td>';
					htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;border-right:none;"><table ><tr><td align="right">'+replacetoxml(setValue(lineSoriekiPer,15))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(lineSoriekiPerLastYear,25))+'</td></tr></table></td>';

					
				}
				
				htmlNote +='</tr>';
				
//				//CSV出力用
				var lineStrCode;
				var lineStrName;
				var lineStrTemp = replace(rst[i][0]);
				var lineStr = lineStrTemp.replace(/\s+/, '\x01').split('\x01');
				
				if(lineStr.length == 1){
					lineStrCode = '';
					lineStrName = lineStr[0];
				}else{
					if(lineStrTemp == '- None -'){
						lineStrCode = '- None -';
						lineStrName = '- None -';
					}else{
						lineStrCode = lineStr[0];
						lineStrName = lineStr[1];
					}
				}
				
				var Group1StrCode;
				var Group1StrName;
				var Group1StrTemp = replace(csvGroup1Text);
				var Group1Str = Group1StrTemp.replace(/\s+/, '\x01').split('\x01');
				
				if(Group1Str.length == 1){
					Group1StrCode = '';
					Group1StrName = Group1Str[0];
				}else{
					if(Group1StrTemp == '- None -'){
						Group1StrCode = '- None -';
						Group1StrName = '- None -';
					}else{
						Group1StrCode = Group1Str[0];
						Group1StrName = Group1Str[1];
					}
				}
				
				var Group2StrCode;
				var Group2StrName;
				var Group2StrTemp = replace(csvGroup2Text);
				var Group2Str = Group2StrTemp.replace(/\s+/, '\x01').split('\x01');
				
				if(Group2Str.length == 1){
					Group2StrCode = '';
					Group2StrName = Group2Str[0];
				}else{
					if(Group2StrTemp == '- None -'){
						Group2StrCode = '- None -';
						Group2StrName = '- None -';
					}else{
						Group2StrCode = Group2Str[0];
						Group2StrName = Group2Str[1];
					}
				}
				
				
				
				
				
				CSV_STR+=
					lineStrCode+','+
					lineStrName+','+
//					Group1StrCode+','+
//					Group1StrName+','+
//					Group2StrCode+','+
//					Group2StrName+','+
					
					Group2StrCode+','+
					Group2StrName+','+
					Group1StrCode+','+
					Group1StrName+','+
					
					
					(CONST_SHAGAIHI == 'T' || CONST_SUB == SUB_NBKK || CONST_SUB == SUB_ULKK  ? lineSorieki : '')+','+
					(lineTotalAmt)+','+
					(CONST_SHAGAIHI == 'T' || CONST_SUB == SUB_NBKK || CONST_SUB == SUB_ULKK  ? lineSoriekiLastYear : '')+','+
					(lineTotalAmtLastYear)+','+
					(setValue(rst[i][1],1))+','+
					(setValue(rst[i][2],1))+','+
					(setValue(rst[i][3],1))+','+
					(setValue(rst[i][4],1))+','+
					(setValue(rst[i][5],1))+','+
					(setValue(rst[i][6],1))+','+
					(setValue(rst[i][7],1))+','+
					(setValue(rst[i][8],1))+','+
					(setValue(rst[i][9],1))+','+
					(setValue(rst[i][10],1))+','+
					(setValue(rst[i][11],1))+','+
					(setValue(rst[i][12],1))+','+
					(setValue(lastYearRstLine[1],1))+','+
					(setValue(lastYearRstLine[2],1))+','+
					(setValue(lastYearRstLine[3],1))+','+
					(setValue(lastYearRstLine[4],1))+','+
					(setValue(lastYearRstLine[5],1))+','+
					(setValue(lastYearRstLine[6],1))+','+
					(setValue(lastYearRstLine[7],1))+','+
					(setValue(lastYearRstLine[8],1))+','+
					(setValue(lastYearRstLine[9],1))+','+
					(setValue(lastYearRstLine[10],1))+','+
					(setValue(lastYearRstLine[11],1))+','+
					(setValue(lastYearRstLine[12],1))+'\r\n'
				
				//列の合計
				colTotalMonth1+=setValue(setValue(rst[i][1],1),0);
				colTotalMonth2+=setValue(setValue(rst[i][2],1),0);
				colTotalMonth3+=setValue(setValue(rst[i][3],1),0);
				colTotalMonth4+=setValue(setValue(rst[i][4],1),0);
				colTotalMonth5+=setValue(setValue(rst[i][5],1),0);
				colTotalMonth6+=setValue(setValue(rst[i][6],1),0);
				colTotalMonth7+=setValue(setValue(rst[i][7],1),0);
				colTotalMonth8+=setValue(setValue(rst[i][8],1),0);
				colTotalMonth9+=setValue(setValue(rst[i][9],1),0);
				colTotalMonth10+=setValue(setValue(rst[i][10],1),0);
				colTotalMonth11+=setValue(setValue(rst[i][11],1),0);
				colTotalMonth12+=setValue(setValue(rst[i][12],1),0);
				colTotalCount+=setValue(lineTotalCount,0);
				colTotalAmt+=setValue(lineTotalAmt,0);
				colTotalCost+=setValue(lineCost,0);
				colTotalSorieki+=setValue(lineSorieki,0);
				colTotallineSoriekiPer+=setValue(lineSoriekiPer,0);
				
				colTotalMonth1LastYear+=setValue(setValue(lastYearRstLine[1],1),0);
				colTotalMonth2LastYear+=setValue(setValue(lastYearRstLine[2],1),0);
				colTotalMonth3LastYear+=setValue(setValue(lastYearRstLine[3],1),0);
				colTotalMonth4LastYear+=setValue(setValue(lastYearRstLine[4],1),0);
				colTotalMonth5LastYear+=setValue(setValue(lastYearRstLine[5],1),0);
				colTotalMonth6LastYear+=setValue(setValue(lastYearRstLine[6],1),0);
				colTotalMonth7LastYear+=setValue(setValue(lastYearRstLine[7],1),0);
				colTotalMonth8LastYear+=setValue(setValue(lastYearRstLine[8],1),0);
				colTotalMonth9LastYear+=setValue(setValue(lastYearRstLine[9],1),0);
				colTotalMonth10LastYear+=setValue(setValue(lastYearRstLine[10],1),0);
				colTotalMonth11LastYear+=setValue(setValue(lastYearRstLine[11],1),0);
				colTotalMonth12LastYear+=setValue(setValue(lastYearRstLine[12],1),0);
				colTotalCountLastYear+=setValue(lineTotalCountLastYear,0);
				colTotalAmtLastYear+=setValue(lineTotalAmtLastYear,0);
				colTotalCostLastYear+=setValue(lineCostLastYear,0);
				colTotalSoriekiLastYear+=setValue(lineSoriekiLastYear,0);
				colTotallineSoriekiPerLastYear+=setValue(lineSoriekiPerLastYear,0);
				
			}
			//合計列を設定
			htmlNote +='<tr>';
			htmlNote +='<td  colspan = "3" style="  border-left:none;border-top:2px solid #00255C;border-bottom:2px solid #00255C;height:25px;vertical-align:top;font-size:13px;color:#00255C;">'+getOpption(CONST_GROUP1)+'　　Total：'+csvGroup1Text+'</td>';
			htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth1,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth1LastYear,20)+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth2,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth2LastYear,20)+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth3,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth3LastYear,20)+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth4,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth4LastYear,20)+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth5,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth5LastYear,20)+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth6,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth6LastYear,20)+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth7,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth7LastYear,20)+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth8,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth8LastYear,20)+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth9,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth9LastYear,20)+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth10,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth10LastYear,20)+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth11,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth11LastYear,20)+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;border-right:2px solid #1456A2;" ><table ><tr><td align="right">'+setValue(colTotalMonth12,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth12LastYear,20)+'</td></tr></table></td>';
			
			if(CONST_AMT_OR_COUNT == '2'){
				htmlNote +='<td align="right" style="  border-left:2px solid #1456A2;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalCount,11)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalCountLastYear,21)+'</td></tr></table></td>';
				
				htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalAmt,12)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalAmtLastYear,22)+'</td></tr></table></td>';

				htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalCost,13)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalCostLastYear,23)+'</td></tr></table></td>';

			}else if(CONST_AMT_OR_COUNT == '1'){
				htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalAmt,12)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalAmtLastYear,22)+'</td></tr></table></td>';

				htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalSorieki,14)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalSoriekiLastYear,24)+'</td></tr></table></td>';
				htmlNote +='<td align="right" style="  border-right:none;border-left: 1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotallineSoriekiPer/i,15)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotallineSoriekiPerLastYear/i,25)+'</td></tr></table></td>';

				
			}
			
			htmlNote +='</tr>';
		
			
			//グループ１列の合計
			colGroup1TotalMonth1+=setValue(colTotalMonth1,0);
			colGroup1TotalMonth2+=setValue(colTotalMonth2,0);
			colGroup1TotalMonth3+=setValue(colTotalMonth3,0);
			colGroup1TotalMonth4+=setValue(colTotalMonth4,0);
			colGroup1TotalMonth5+=setValue(colTotalMonth5,0);
			colGroup1TotalMonth6+=setValue(colTotalMonth6,0);
			colGroup1TotalMonth7+=setValue(colTotalMonth7,0);
			colGroup1TotalMonth8+=setValue(colTotalMonth8,0);
			colGroup1TotalMonth9+=setValue(colTotalMonth9,0);
			colGroup1TotalMonth10+=setValue(colTotalMonth10,0);
			colGroup1TotalMonth11+=setValue(colTotalMonth11,0);
			colGroup1TotalMonth12+=setValue(colTotalMonth12,0);
			colGroup1TotalCount+=setValue(colTotalCount,0);
			colGroup1TotalAmt+=setValue(colTotalAmt,0);
			colGroup1TotalCost+=setValue(colTotalCost,0);
			colGroup1TotalSorieki+=setValue(colTotalSorieki,0);
			colGroup1TotallineSoriekiPer+=setValue(colTotallineSoriekiPer,0);
			
			colGroup1TotalMonth1LastYear+=setValue(colTotalMonth1LastYear,0);
			colGroup1TotalMonth2LastYear+=setValue(colTotalMonth2LastYear,0);
			colGroup1TotalMonth3LastYear+=setValue(colTotalMonth3LastYear,0);
			colGroup1TotalMonth4LastYear+=setValue(colTotalMonth4LastYear,0);
			colGroup1TotalMonth5LastYear+=setValue(colTotalMonth5LastYear,0);
			colGroup1TotalMonth6LastYear+=setValue(colTotalMonth6LastYear,0);
			colGroup1TotalMonth7LastYear+=setValue(colTotalMonth7LastYear,0);
			colGroup1TotalMonth8LastYear+=setValue(colTotalMonth8LastYear,0);
			colGroup1TotalMonth9LastYear+=setValue(colTotalMonth9LastYear,0);
			colGroup1TotalMonth10LastYear+=setValue(colTotalMonth10LastYear,0);
			colGroup1TotalMonth11LastYear+=setValue(colTotalMonth11LastYear,0);
			colGroup1TotalMonth12LastYear+=setValue(colTotalMonth12LastYear,0);
			colGroup1TotalCountLastYear+=setValue(colTotalCountLastYear,0);
			colGroup1TotalAmtLastYear+=setValue(colTotalAmtLastYear,0);
			colGroup1TotalCostLastYear+=setValue(colTotalCostLastYear,0);
			colGroup1TotalSoriekiLastYear+=setValue(colTotalSoriekiLastYear,0);
			colGroup1TotallineSoriekiPerLastYear+=setValue(colTotallineSoriekiPerLastYear,0);
		}
		
		//グループ１の合計列
		htmlNote +='<tr>';
		htmlNote +='<td  colspan = "3" style="border-left:none;border-top:2px solid #00255C;border-bottom:2px solid #00255C;height:25px;vertical-align:top;font-size:13px;color:#00255C;">'+getOpption(CONST_GROUP2)+'　　Total：'+csvGroup2Text+'</td>';
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth1,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth1LastYear,20)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth2,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth2LastYear,20)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth3,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth3LastYear,20)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth4,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth4LastYear,20)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth5,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth5LastYear,20)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth6,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth6LastYear,20)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth7,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth7LastYear,20)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth8,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth8LastYear,20)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth9,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth9LastYear,20)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth10,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth10LastYear,20)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth11,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth11LastYear,20)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;border-right:2px solid #1456A2;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth12,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth12LastYear,20)+'</td></tr></table></td>';
		
		
	
		if(CONST_AMT_OR_COUNT == '2'){
			htmlNote +='<td align="right" style="border-left:2px solid #1456A2;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalCount,11)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalCountLastYear,21)+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalAmt,12)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalAmtLastYear,22)+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalCost,13)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalCostLastYear,23)+'</td></tr></table></td>';

			
		}else if(CONST_AMT_OR_COUNT == '1'){
			htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalAmt,12)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalAmtLastYear,22)+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalSorieki,14)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalSoriekiLastYear,24)+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="border-right:none;border-left: 1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotallineSoriekiPer/i,15)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotallineSoriekiPerLastYear/i,25)+'</td></tr></table></td>';	
		}
		
		
		htmlNote +='</tr>';
		
		//グループ2列の合計
		colGroup2TotalMonth1+=setValue(colGroup1TotalMonth1,0);
		colGroup2TotalMonth2+=setValue(colGroup1TotalMonth2,0);
		colGroup2TotalMonth3+=setValue(colGroup1TotalMonth3,0);
		colGroup2TotalMonth4+=setValue(colGroup1TotalMonth4,0);
		colGroup2TotalMonth5+=setValue(colGroup1TotalMonth5,0);
		colGroup2TotalMonth6+=setValue(colGroup1TotalMonth6,0);
		colGroup2TotalMonth7+=setValue(colGroup1TotalMonth7,0);
		colGroup2TotalMonth8+=setValue(colGroup1TotalMonth8,0);
		colGroup2TotalMonth9+=setValue(colGroup1TotalMonth9,0);
		colGroup2TotalMonth10+=setValue(colGroup1TotalMonth10,0);
		colGroup2TotalMonth11+=setValue(colGroup1TotalMonth11,0);
		colGroup2TotalMonth12+=setValue(colGroup1TotalMonth12,0);
		colGroup2TotalCount+=setValue(colGroup1TotalCount,0);
		colGroup2TotalAmt+=setValue(colGroup1TotalAmt,0);
		colGroup2TotalCost+=setValue(colGroup1TotalCost,0);
		colGroup2TotalSorieki+=setValue(colGroup1TotalSorieki,0);
		colGroup2TotallineSoriekiPer+=setValue(colGroup1TotallineSoriekiPer,0);
		
		colGroup2TotalMonth1LastYear+=setValue(colGroup1TotalMonth1LastYear,0);
		colGroup2TotalMonth2LastYear+=setValue(colGroup1TotalMonth2LastYear,0);
		colGroup2TotalMonth3LastYear+=setValue(colGroup1TotalMonth3LastYear,0);
		colGroup2TotalMonth4LastYear+=setValue(colGroup1TotalMonth4LastYear,0);
		colGroup2TotalMonth5LastYear+=setValue(colGroup1TotalMonth5LastYear,0);
		colGroup2TotalMonth6LastYear+=setValue(colGroup1TotalMonth6LastYear,0);
		colGroup2TotalMonth7LastYear+=setValue(colGroup1TotalMonth7LastYear,0);
		colGroup2TotalMonth8LastYear+=setValue(colGroup1TotalMonth8LastYear,0);
		colGroup2TotalMonth9LastYear+=setValue(colGroup1TotalMonth9LastYear,0);
		colGroup2TotalMonth10LastYear+=setValue(colGroup1TotalMonth10LastYear,0);
		colGroup2TotalMonth11LastYear+=setValue(colGroup1TotalMonth11LastYear,0);
		colGroup2TotalMonth12LastYear+=setValue(colGroup1TotalMonth12LastYear,0);
		colGroup2TotalCountLastYear+=setValue(colGroup1TotalCountLastYear,0);
		colGroup2TotalAmtLastYear+=setValue(colGroup1TotalAmtLastYear,0);
		colGroup2TotalCostLastYear+=setValue(colGroup1TotalCostLastYear,0);
		colGroup2TotalSoriekiLastYear+=setValue(colGroup1TotalSoriekiLastYear,0);
		colGroup2TotallineSoriekiPerLastYear+=setValue(colGroup1TotallineSoriekiPerLastYear,0);
		
	}
	
	//グループ２の合計列
	htmlNote +='<tr>';
	htmlNote +='<td  colspan = "3" style="border-left:none;border-top:2px solid #00255C;border-bottom:2px solid #00255C;height:25px;vertical-align:top;font-size:13px;color:#00255C;">'+getOpption(CONST_LINE)+'　　Total：</td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup2TotalMonth1,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotalMonth1LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup2TotalMonth2,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotalMonth2LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup2TotalMonth3,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotalMonth3LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup2TotalMonth4,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotalMonth4LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup2TotalMonth5,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotalMonth5LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup2TotalMonth6,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotalMonth6LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup2TotalMonth7,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotalMonth7LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup2TotalMonth8,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotalMonth8LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup2TotalMonth9,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotalMonth9LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup2TotalMonth10,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotalMonth10LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup2TotalMonth11,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotalMonth11LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;border-right:2px solid #1456A2;" ><table ><tr><td align="right">'+setValue(colGroup2TotalMonth12,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotalMonth12LastYear,20)+'</td></tr></table></td>';
	
	
	if(CONST_AMT_OR_COUNT == '2'){
		htmlNote +='<td align="right" style="border-left:2px solid #1456A2;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup2TotalCount,11)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotalCountLastYear,21)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup2TotalAmt,12)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotalAmtLastYear,22)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup2TotalCost,13)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotalCostLastYear,23)+'</td></tr></table></td>';
	}else if(CONST_AMT_OR_COUNT == '1'){
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup2TotalAmt,12)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotalAmtLastYear,22)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup2TotalSorieki,14)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotalSoriekiLastYear,24)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="border-left:2px solid #1456A2;border-right:none;border-top:2px solid #00255C;border-bottom:2px solid #00255C;"><table ><tr><td align="right">'+setValue(colGroup2TotallineSoriekiPer/i,15)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotallineSoriekiPerLastYear/i,25)+'</td></tr></table></td>';

	}
	

	htmlNote +='</tr>';
	
	
	htmlNote+='</table>';
//	htmlNote+='</div>';
//	htmlNote += '</td></tr></table>'；
	return htmlNote;
}

//画面を書く ラインとグループ１
function setPageGroup1(rstGroup1,lastYearRstGroup1,htmlOrPdfCheckFlog){

	if(isEmpty(rstGroup1)){
		return "データがありませんでした。";
	}
	var htmlNote='';
	CSV_STR = '';
//	htmlNote +='<table><tr><td align="center">';	
//	htmlNote +='<div id="tablediv" style="overflow:scroll;height:400px;width:1040px;border:1px solid;">';
	
	htmlNote += '<table border="0" cellpadding="0" cellspacing="0" style="width:1020px;border-collapse:collapse;">'; //table c
	htmlNote +='<tr>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';


	htmlNote +='</tr>';
	//CH193で外す
	if(htmlOrPdfCheckFlog == 1){
	htmlNote +='<tr>';
	htmlNote +='<td colspan = "4" align="left" class="font_color" style="color:#00255C;font-size:17px;"><u><strong>'+CONST_SUB_TEXT+'</strong></u></td>';
	htmlNote +='<td colspan = "11" align="center" class="font_color" style="color:#00255C;font-size:18px;vertical-align:top;"><strong>＜＜'+getSalesOrQty()+' Per   '+getOpption(CONST_LINE)+'  Group1:'+getOpption(CONST_GROUP1)+'＞＞</strong></td>';
	htmlNote +='<td colspan = "3" align="right" style="font-size:13px;color:#00255C;vertical-align:top;">'+nlapiDateToString(getSystemTime())+'</td>';
	htmlNote +='</tr>';
	
	//社外秘表示
	if(CONST_SHAGAIHI == 'T'){
		htmlNote +='<tr>';
		htmlNote +='<td colspan = "18" align="center" style="font-weight: bold;color:#696969;font-size:50px;"><b>社外秘</b></td>';
		htmlNote +='</tr>';
	}
	}
	
	htmlNote += '</table>';

	htmlNote += '<table border="0" cellpadding="0" cellspacing="0" class= "table_main" style="overflow:scroll;margin-left:15px;margin-bottom:15px;width:1020px;border-collapse:collapse;">'; //table d
	if(htmlOrPdfCheckFlog == 1){
	htmlNote +='<tr >';
	htmlNote +='<td colspan = "16">'+DATE_TEXT+'</td>';
	htmlNote +='<td colspan = "2" align="right" style="font-size:11px;color:#00255C;min-width:39px">上段 本年</td>';
	htmlNote +='</tr>';
	htmlNote +='<tr >';
	htmlNote +='<td colspan = "16">&nbsp;</td>';
	htmlNote +='<td colspan = "2" align="right" style="font-size:11px;color:#00255C;min-width:39px">下段 前年</td>';
	htmlNote +='</tr>';
	
	htmlNote +='<tr>';
	htmlNote +='<td colspan = "15" style="height:30px">&nbsp;</td>';
	if(CONST_AMT_OR_COUNT == '2'){
		htmlNote +='<td align="right" style="font-size:11px;color:#00255C;">(単位 個)</td>';
		htmlNote +='<td align="right" style="font-size:11px;color:#00255C;">(千円)</td>';
		htmlNote +='<td align="right" style="font-size:11px;color:#00255C;">(円)</td>';
	}else if(CONST_AMT_OR_COUNT == '1'){
		htmlNote +='<td align="right" style="font-size:11px;color:#00255C;">(千円)</td>';
		htmlNote +='<td align="right" style="font-size:11px;color:#00255C;"></td>';
		htmlNote +='<td align="right" style="font-size:11px;color:#00255C;"></td>';
		
	}
	htmlNote +='</tr>';
	
	htmlNote +='<tr>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='</tr>';
	
	htmlNote +='<tr>';
	htmlNote +='<td colspan = "3" style="  line-height:93%;font-size:13px;color:#00255C;border-left:none;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto">'+getOpption(CONST_LINE)+'</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">1月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">2月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">3月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">4月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">5月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">6月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">7月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">8月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">9月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">10月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">11月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;border-right:2px solid #1456A2;width:39px">12月</td>';
	
	if(CONST_AMT_OR_COUNT == '2'){
		htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-top:1px solid #00255C;border-bottom:2px solid #00255C;border-left:2px solid #1456A2;width:39px">Total</td>'
			htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">Total</td>';
			htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">AvgPrice</td>';
	}else if(CONST_AMT_OR_COUNT == '1'){
		htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">Yearly</td>';
		htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto;min-width:39px">G.P</td>';
		htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-right:none; border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto">％</td>';
	}
	htmlNote +='</tr>';
	}
	
	
	
	
	var colGroup1TotalMonth1 = 0;
	var colGroup1TotalMonth2 = 0;
	var colGroup1TotalMonth3 = 0;
	var colGroup1TotalMonth4 = 0;
	var colGroup1TotalMonth5 = 0;
	var colGroup1TotalMonth6 = 0;
	var colGroup1TotalMonth7 = 0;
	var colGroup1TotalMonth8 = 0;
	var colGroup1TotalMonth9 = 0;
	var colGroup1TotalMonth10 = 0;
	var colGroup1TotalMonth11 = 0;
	var colGroup1TotalMonth12 = 0;
	var colGroup1TotalCount = 0;
	var colGroup1TotalAmt = 0;
	var colGroup1TotalCost = 0;
	var colGroup1TotalSorieki = 0;
	var colGroup1TotallineSoriekiPer = 0;
	
	var colGroup1TotalMonth1LastYear = 0;
	var colGroup1TotalMonth2LastYear = 0;
	var colGroup1TotalMonth3LastYear = 0;
	var colGroup1TotalMonth4LastYear = 0;
	var colGroup1TotalMonth5LastYear = 0;
	var colGroup1TotalMonth6LastYear = 0;
	var colGroup1TotalMonth7LastYear = 0;
	var colGroup1TotalMonth8LastYear = 0;
	var colGroup1TotalMonth9LastYear = 0;
	var colGroup1TotalMonth10LastYear = 0;
	var colGroup1TotalMonth11LastYear = 0;
	var colGroup1TotalMonth12LastYear = 0;
	var colGroup1TotalCountLastYear = 0;
	var colGroup1TotalAmtLastYear = 0;
	var colGroup1TotalCostLastYear = 0;
	var colGroup1TotalSoriekiLastYear = 0;
	var colGroup1TotallineSoriekiPerLastYear = 0;
	var csvGroup1Text = '';
	
	for(var j = 0 ; j < rstGroup1.length ; j++){
		
		var rst = rstGroup1[j];
		var lastYearRst = getOldYearDataGroup1(lastYearRstGroup1,rstGroup1[j][0]);
		
		csvGroup1Text = rstGroup1[j][0];
		if(CONST_GROUP1 == '4'){
			var csvGroup1Arr = csvGroup1Text.split('||');
			csvGroup1Text = csvGroup1Arr[0];
		}
		if(!isEmpty(csvGroup1Text)){
			csvGroup1Text = csvGroup1Text.replace(new RegExp("&","g"),"&amp;");
		}
		
		htmlNote +='<tr>';
		htmlNote +='<td colspan="18" style="font-size:13px;color:#00255C;height:25px;width:351px;border-left:none;border-right:none;border-top:1px solid #00255C;border-bottom-width:none;"><strong>'+getOpption(CONST_GROUP1)+' '+csvGroup1Text+'</strong></td>';
		htmlNote +='</tr>';
		
		//第一目を削除する。
		rst.shift();
		lastYearRst.shift();
		
		
		var colTotalMonth1 = 0;
		var colTotalMonth2 = 0;
		var colTotalMonth3 = 0;
		var colTotalMonth4 = 0;
		var colTotalMonth5 = 0;
		var colTotalMonth6 = 0;
		var colTotalMonth7 = 0;
		var colTotalMonth8 = 0;
		var colTotalMonth9 = 0;
		var colTotalMonth10 = 0;
		var colTotalMonth11 = 0;
		var colTotalMonth12 = 0;
		var colTotalCount = 0;
		var colTotalAmt = 0;
		var colTotalCost = 0;
		var colTotalSorieki = 0;
		var colTotallineSoriekiPer = 0;
		
		var colTotalMonth1LastYear = 0;
		var colTotalMonth2LastYear = 0;
		var colTotalMonth3LastYear = 0;
		var colTotalMonth4LastYear = 0;
		var colTotalMonth5LastYear = 0;
		var colTotalMonth6LastYear = 0;
		var colTotalMonth7LastYear = 0;
		var colTotalMonth8LastYear = 0;
		var colTotalMonth9LastYear = 0;
		var colTotalMonth10LastYear = 0;
		var colTotalMonth11LastYear = 0;
		var colTotalMonth12LastYear = 0;
		var colTotalCountLastYear = 0;
		var colTotalAmtLastYear = 0;
		var colTotalCostLastYear = 0;
		var colTotalSoriekiLastYear = 0;
		var colTotallineSoriekiPerLastYear = 0;

		for(var i = 0 ; i <rst.length ; i++ ){
			var lastYearRstLine = getOldYearDataLine(lastYearRst,rst[i][0]);
			if(rst[i][0] != lastYearRstLine[0]){
				lastYearRstLine = ["",{"count":"","amt":"","line":"","month":"01"},{"count":"","amt":"","line":"","month":"02"},{"count":"","amt":"","line":"","month":"03"},{"count":"","amt":"","line":"","month":"04"},{"count":"","amt":"","line":"","month":"05"},{"count":"","amt":"","line":"","month":"06"},{"count":"","amt":"","line":"","month":"07"},{"count":"","amt":"","line":"","month":"08"},{"count":"","amt":"","line":"","month":"09"},{"count":"","amt":"","line":"","month":"10"},{"count":"","amt":"","line":"","month":"11"},{"count":"","amt":"","line":"","month":"12"}];
			}
			//行金額合計
			var lineTotalAmt = Number(rst[i][1].amt) + Number(rst[i][2].amt) +Number(rst[i][3].amt) +Number(rst[i][4].amt) +Number(rst[i][5].amt) +Number(rst[i][6].amt) +Number(rst[i][7].amt) +Number(rst[i][8].amt) +Number(rst[i][9].amt) +Number(rst[i][10].amt) +Number(rst[i][11].amt) +Number(rst[i][12].amt);
			var lineTotalAmtLastYear =  Number(lastYearRstLine[1].amt) + Number(lastYearRstLine[2].amt) +Number(lastYearRstLine[3].amt) +Number(lastYearRstLine[4].amt) +Number(lastYearRstLine[5].amt) +Number(lastYearRstLine[6].amt) +Number(lastYearRstLine[7].amt) +Number(lastYearRstLine[8].amt) +Number(lastYearRstLine[9].amt) +Number(lastYearRstLine[10].amt) +Number(lastYearRstLine[11].amt) +Number(lastYearRstLine[12].amt);
			
			//行数量合計
			var lineTotalCount = setValue(rst[i][1].count,0) + setValue(rst[i][2].count,0) +setValue(rst[i][3].count,0) +setValue(rst[i][4].count,0) +setValue(rst[i][5].count,0) +setValue(rst[i][6].count,0) +setValue(rst[i][7].count,0) +setValue(rst[i][8].count,0) +setValue(rst[i][9].count,0) +setValue(rst[i][10].count,0) +setValue(rst[i][11].count,0) +setValue(rst[i][12].count,0);
			var lineTotalCountLastYear =  setValue(lastYearRstLine[1].count,0) + setValue(lastYearRstLine[2].count,0) +setValue(lastYearRstLine[3].count,0) +setValue(lastYearRstLine[4].count,0) +setValue(lastYearRstLine[5].count,0) +setValue(lastYearRstLine[6].count,0) +setValue(lastYearRstLine[7].count,0) +setValue(lastYearRstLine[8].count,0) +setValue(lastYearRstLine[9].count,0) +setValue(lastYearRstLine[10].count,0) +setValue(lastYearRstLine[11].count,0) +setValue(lastYearRstLine[12].count,0);

			//コスト(データなしの階層でCOSTが””です)
			var lineCost = "";
			for(var c = 12 ; c >= 1 ; c--){
				if(!isEmpty(rst[i][c].cost)){
					lineCost = rst[i][c].cost;
					break;
				}
			}
			var lineCostLastYear = "";
			for(var c = 12 ; c >= 1 ; c--){
				if(!isEmpty(lastYearRstLine[c].cost)){
					lineCostLastYear = lastYearRstLine[c].cost;
					break;
				}
			}
			
			//粗利益
			var lineSorieki = Number(lineTotalAmt) - Number(lineCost);
			var lineSoriekiLastYear = Number(lineTotalAmtLastYear) - Number(lineCostLastYear);
			
			//粗利率
			var lineSoriekiPer = "";
			if(Number(lineTotalAmt) != 0){
				lineSoriekiPer = lineSorieki /Number(lineTotalAmt);
			}else{
				lineSoriekiPer  =0;
			}
			var lineSoriekiPerLastYear = "";
			if(Number(lineTotalAmtLastYear) != 0){
				lineSoriekiPerLastYear = lineSoriekiLastYear /Number(lineTotalAmtLastYear);
			}else{
				lineSoriekiPerLastYear  =0;
			}
			
			
			//ライン設定
			htmlNote +='<tr>';
			if(getOpption(CONST_LINE)=="Item"){
				var itemLineTemp = replacetoxml(rst[i][0]);
				var currentItemLineArr = itemLineTemp.split('||');
				var currentItem = currentItemLineArr[0];
				htmlNote +='<td  colspan = "3" style="border-left:none;border-top:1px solid #538DD5;height:25px;vertical-align:top;">'+currentItem+'</td>';
			}else{
			htmlNote +='<td  colspan = "3" style="border-left:none;border-top:1px solid #538DD5;height:25px;vertical-align:top;">'+replacetoxml(rst[i][0])+'</td>';
			}
//			htmlNote +='<td  colspan = "3" style="border-left:none;border-top:1px solid #538DD5;height:25px;vertical-align:top;">'+replacetoxml(rst[i][0])+'</td>';
			htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][1],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[1],1),20))+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][2],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[2],1),20))+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][3],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[3],1),20))+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][4],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[4],1),20))+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][5],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[5],1),20))+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][6],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[6],1),20))+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][7],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[7],1),20))+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][8],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[8],1),20))+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][9],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[9],1),20))+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][10],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[10],1),20))+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][11],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[11],1),20))+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;border-right:2px solid #1456A2;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][12],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[12],1),20))+'</td></tr></table></td>';

			
			//数量と金額表示変更
			if(CONST_AMT_OR_COUNT == '2'){
				htmlNote +='<td align="right" style="border-left:2px solid #1456A2;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(lineTotalCount,11))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(lineTotalCountLastYear,21))+'</td></tr></table></td>';
				htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(lineTotalAmt,12))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(lineTotalAmtLastYear,22))+'</td></tr></table></td>';
				htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(lineCost,13))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(lineCostLastYear,23))+'</td></tr></table></td>';
			}else if(CONST_AMT_OR_COUNT == '1'){
				htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(lineTotalAmt,12))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(lineTotalAmtLastYear,22))+'</td></tr></table></td>';
				htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(lineSorieki,14))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(lineSoriekiLastYear,24))+'</td></tr></table></td>';
				htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;border-right:none;"><table ><tr><td align="right">'+replacetoxml(setValue(lineSoriekiPer,15))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(lineSoriekiPerLastYear,25))+'</td></tr></table></td>';

			}
			
			htmlNote +='</tr>';
			
			
//			//CSV出力用
			var lineStrCode;
			var lineStrName;
			var lineStrTemp = replace(rst[i][0]);
			var lineStr = lineStrTemp.replace(/\s+/, '\x01').split('\x01');
			
			if(lineStr.length == 1){
				lineStrCode = '';
				lineStrName = lineStr[0];
			}else{
				if(lineStrTemp == '- None -'){
					lineStrCode = '- None -';
					lineStrName = '- None -';
				}else{
					lineStrCode = lineStr[0];
					lineStrName = lineStr[1];
				}
			}
			
			var Group1StrCode;
			var Group1StrName;
			var Group1StrTemp = replace(csvGroup1Text);
			var Group1Str = Group1StrTemp.replace(/\s+/, '\x01').split('\x01');
			
			if(Group1Str.length == 1){
				Group1StrCode = '';
				Group1StrName = Group1Str[0];
			}else{
				if(Group1StrTemp == '- None -'){
					Group1StrCode = '- None -';
					Group1StrName = '- None -';
				}else{
					Group1StrCode = Group1Str[0];
					Group1StrName = Group1Str[1];
				}
			}
			
			CSV_STR+=
				lineStrCode+','+
				lineStrName+','+
				Group1StrCode+','+
				Group1StrName+','+
				''+','+
				''+','+
				(CONST_SHAGAIHI == 'T' || CONST_SUB == SUB_NBKK || CONST_SUB == SUB_ULKK ? lineSorieki : '')+','+
				(lineTotalAmt)+','+
				(CONST_SHAGAIHI == 'T' || CONST_SUB == SUB_NBKK || CONST_SUB == SUB_ULKK ? lineSoriekiLastYear : '')+','+
				(lineTotalAmtLastYear)+','+
				(setValue(rst[i][1],1))+','+
				(setValue(rst[i][2],1))+','+
				(setValue(rst[i][3],1))+','+
				(setValue(rst[i][4],1))+','+
				(setValue(rst[i][5],1))+','+
				(setValue(rst[i][6],1))+','+
				(setValue(rst[i][7],1))+','+
				(setValue(rst[i][8],1))+','+
				(setValue(rst[i][9],1))+','+
				(setValue(rst[i][10],1))+','+
				(setValue(rst[i][11],1))+','+
				(setValue(rst[i][12],1))+','+
				(setValue(lastYearRstLine[1],1))+','+
				(setValue(lastYearRstLine[2],1))+','+
				(setValue(lastYearRstLine[3],1))+','+
				(setValue(lastYearRstLine[4],1))+','+
				(setValue(lastYearRstLine[5],1))+','+
				(setValue(lastYearRstLine[6],1))+','+
				(setValue(lastYearRstLine[7],1))+','+
				(setValue(lastYearRstLine[8],1))+','+
				(setValue(lastYearRstLine[9],1))+','+
				(setValue(lastYearRstLine[10],1))+','+
				(setValue(lastYearRstLine[11],1))+','+
				(setValue(lastYearRstLine[12],1))+'\r\n'
			
			//列の合計
			colTotalMonth1+=setValue(setValue(rst[i][1],1),0);
			colTotalMonth2+=setValue(setValue(rst[i][2],1),0);
			colTotalMonth3+=setValue(setValue(rst[i][3],1),0);
			colTotalMonth4+=setValue(setValue(rst[i][4],1),0);
			colTotalMonth5+=setValue(setValue(rst[i][5],1),0);
			colTotalMonth6+=setValue(setValue(rst[i][6],1),0);
			colTotalMonth7+=setValue(setValue(rst[i][7],1),0);
			colTotalMonth8+=setValue(setValue(rst[i][8],1),0);
			colTotalMonth9+=setValue(setValue(rst[i][9],1),0);
			colTotalMonth10+=setValue(setValue(rst[i][10],1),0);
			colTotalMonth11+=setValue(setValue(rst[i][11],1),0);
			colTotalMonth12+=setValue(setValue(rst[i][12],1),0);
			colTotalCount+=setValue(lineTotalCount,0);
			colTotalAmt+=setValue(lineTotalAmt,0);
			colTotalCost+=setValue(lineCost,0);
			colTotalSorieki+=setValue(lineSorieki,0);
			colTotallineSoriekiPer+=setValue(lineSoriekiPer,0);
			
			colTotalMonth1LastYear+=setValue(setValue(lastYearRstLine[1],1),0);
			colTotalMonth2LastYear+=setValue(setValue(lastYearRstLine[2],1),0);
			colTotalMonth3LastYear+=setValue(setValue(lastYearRstLine[3],1),0);
			colTotalMonth4LastYear+=setValue(setValue(lastYearRstLine[4],1),0);
			colTotalMonth5LastYear+=setValue(setValue(lastYearRstLine[5],1),0);
			colTotalMonth6LastYear+=setValue(setValue(lastYearRstLine[6],1),0);
			colTotalMonth7LastYear+=setValue(setValue(lastYearRstLine[7],1),0);
			colTotalMonth8LastYear+=setValue(setValue(lastYearRstLine[8],1),0);
			colTotalMonth9LastYear+=setValue(setValue(lastYearRstLine[9],1),0);
			colTotalMonth10LastYear+=setValue(setValue(lastYearRstLine[10],1),0);
			colTotalMonth11LastYear+=setValue(setValue(lastYearRstLine[11],1),0);
			colTotalMonth12LastYear+=setValue(setValue(lastYearRstLine[12],1),0);
			colTotalCountLastYear+=setValue(lineTotalCountLastYear,0);
			colTotalAmtLastYear+=setValue(lineTotalAmtLastYear,0);
			colTotalCostLastYear+=setValue(lineCostLastYear,0);
			colTotalSoriekiLastYear+=setValue(lineSoriekiLastYear,0);
			colTotallineSoriekiPerLastYear+=setValue(lineSoriekiPerLastYear,0);
			
		}
		//合計列を設定
		htmlNote +='<tr>';
//		htmlNote +='<td  colspan = "3" style="  border-left:none;border-top:2px solid #00255C;border-bottom:2px solid #00255C;height:25px;vertical-align:top;font-size:13px;color:#00255C;">'+getOpption(CONST_LINE)+'　　Total：</td>';
		htmlNote +='<td  colspan = "3" style="  border-left:none;border-top:2px solid #00255C;border-bottom:2px solid #00255C;height:25px;vertical-align:top;font-size:13px;color:#00255C;">'+getOpption(CONST_GROUP1)+'　　Total：'+' '+csvGroup1Text+'</td>';
		htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth1,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth1LastYear,20)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth2,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth2LastYear,20)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth3,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth3LastYear,20)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth4,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth4LastYear,20)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth5,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth5LastYear,20)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth6,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth6LastYear,20)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth7,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth7LastYear,20)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth8,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth8LastYear,20)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth9,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth9LastYear,20)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth10,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth10LastYear,20)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth11,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth11LastYear,20)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;border-right:2px solid #1456A2;" ><table ><tr><td align="right">'+setValue(colTotalMonth12,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth12LastYear,20)+'</td></tr></table></td>';
		
		if(CONST_AMT_OR_COUNT == '2'){
			
			htmlNote +='<td align="right" style="  border-left:2px solid #1456A2;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalCount,11)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalCountLastYear,21)+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalAmt,12)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalAmtLastYear,22)+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalCost,13)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalCostLastYear,23)+'</td></tr></table></td>';

		}else if(CONST_AMT_OR_COUNT == '1'){
			htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalAmt,12)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalAmtLastYear,22)+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalSorieki,14)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalSoriekiLastYear,24)+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="  border-right:none;border-left: 1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotallineSoriekiPer/i,15)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotallineSoriekiPerLastYear/i,25)+'</td></tr></table></td>';
		}
		
		
		
		htmlNote +='</tr>';
		
		
		//グループ１列の合計
		colGroup1TotalMonth1+=setValue(colTotalMonth1,0);
		colGroup1TotalMonth2+=setValue(colTotalMonth2,0);
		colGroup1TotalMonth3+=setValue(colTotalMonth3,0);
		colGroup1TotalMonth4+=setValue(colTotalMonth4,0);
		colGroup1TotalMonth5+=setValue(colTotalMonth5,0);
		colGroup1TotalMonth6+=setValue(colTotalMonth6,0);
		colGroup1TotalMonth7+=setValue(colTotalMonth7,0);
		colGroup1TotalMonth8+=setValue(colTotalMonth8,0);
		colGroup1TotalMonth9+=setValue(colTotalMonth9,0);
		colGroup1TotalMonth10+=setValue(colTotalMonth10,0);
		colGroup1TotalMonth11+=setValue(colTotalMonth11,0);
		colGroup1TotalMonth12+=setValue(colTotalMonth12,0);
		colGroup1TotalCount+=setValue(colTotalCount,0);
		colGroup1TotalAmt+=setValue(colTotalAmt,0);
		colGroup1TotalCost+=setValue(colTotalCost,0);
		colGroup1TotalSorieki+=setValue(colTotalSorieki,0);
		colGroup1TotallineSoriekiPer+=setValue(colTotallineSoriekiPer,0);
		
		colGroup1TotalMonth1LastYear+=setValue(colTotalMonth1LastYear,0);
		colGroup1TotalMonth2LastYear+=setValue(colTotalMonth2LastYear,0);
		colGroup1TotalMonth3LastYear+=setValue(colTotalMonth3LastYear,0);
		colGroup1TotalMonth4LastYear+=setValue(colTotalMonth4LastYear,0);
		colGroup1TotalMonth5LastYear+=setValue(colTotalMonth5LastYear,0);
		colGroup1TotalMonth6LastYear+=setValue(colTotalMonth6LastYear,0);
		colGroup1TotalMonth7LastYear+=setValue(colTotalMonth7LastYear,0);
		colGroup1TotalMonth8LastYear+=setValue(colTotalMonth8LastYear,0);
		colGroup1TotalMonth9LastYear+=setValue(colTotalMonth9LastYear,0);
		colGroup1TotalMonth10LastYear+=setValue(colTotalMonth10LastYear,0);
		colGroup1TotalMonth11LastYear+=setValue(colTotalMonth11LastYear,0);
		colGroup1TotalMonth12LastYear+=setValue(colTotalMonth12LastYear,0);
		colGroup1TotalCountLastYear+=setValue(colTotalCountLastYear,0);
		colGroup1TotalAmtLastYear+=setValue(colTotalAmtLastYear,0);
		colGroup1TotalCostLastYear+=setValue(colTotalCostLastYear,0);
		colGroup1TotalSoriekiLastYear+=setValue(colTotalSoriekiLastYear,0);
		colGroup1TotallineSoriekiPerLastYear+=setValue(colTotallineSoriekiPerLastYear,0);
	}
	
	//グループ１の合計列
	htmlNote +='<tr>';
//	htmlNote +='<td  colspan = "3" style="border-left:none;border-top:2px solid #00255C;border-bottom:2px solid #00255C;height:25px;vertical-align:top;font-size:13px;color:#00255C;">'+getOpption(CONST_GROUP1)+'　　Total：</td>';
	htmlNote +='<td  colspan = "3" style="border-left:none;border-top:2px solid #00255C;border-bottom:2px solid #00255C;height:25px;vertical-align:top;font-size:13px;color:#00255C;">'+getOpption(CONST_LINE)+'　　Total：</td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth1,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth1LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth2,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth2LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth3,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth3LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth4,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth4LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth5,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth5LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth6,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth6LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth7,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth7LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth8,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth8LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth9,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth9LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth10,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth10LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth11,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth11LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;border-right:2px solid #1456A2;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth12,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth12LastYear,20)+'</td></tr></table></td>';
	

	if(CONST_AMT_OR_COUNT == '2'){
		htmlNote +='<td align="right" style="border-left:2px solid #1456A2;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalCount,11)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalCountLastYear,21)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalAmt,12)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalAmtLastYear,22)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalCost,13)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalCostLastYear,23)+'</td></tr></table></td>';

	}else if(CONST_AMT_OR_COUNT == '1'){
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalAmt,12)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalAmtLastYear,22)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalSorieki,14)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalSoriekiLastYear,24)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="border-right: none;border-left: 1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotallineSoriekiPer/i,15)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotallineSoriekiPerLastYear/i,25)+'</td></tr></table></td>';
		
	}
	
	
	htmlNote +='</tr>';
	
	
	htmlNote+='</table>';
//	htmlNote+='</div>';
//	htmlNote += '</td></tr></table>'；
	return htmlNote;
}

//画面を書く ラインのみ
function setPageLine(rst,lastYearRst,htmlOrPdfCheckFlog){
	if(isEmpty(rst)){
		return "データがありませんでした。";
	}
	
	var htmlNote='';
	CSV_STR = '';
//	htmlNote += '<table><tr><td align="center">'
//	htmlNote +='<div id="tablediv" style="overflow:scroll; height:400px; width:1040px; border:1px solid; ">';
	
	htmlNote += '<table border="0" cellpadding="0" cellspacing="0" style="width:1020px;border-collapse:collapse;">'; //table e
	htmlNote +='<tr>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	
	htmlNote +='</tr>';
	
	//CH193で外す
	if(htmlOrPdfCheckFlog == 1){
	htmlNote +='<tr>';
	htmlNote +='<td colspan = "4" align="left" class="font_color" style="color:#00255C;font-size:17px;"><u><strong>'+CONST_SUB_TEXT+'</strong></u></td>';
	htmlNote +='<td colspan = "11" align="center" class="font_color" style="color:#00255C;font-size:18px;vertical-align:top;"><strong>＜＜'+getSalesOrQty()+' Per   '+getOpption(CONST_LINE)+'＞＞</strong></td>';
	htmlNote +='<td colspan = "3" align="right" style="font-size:13px;color:#00255C;vertical-align:top;">'+nlapiDateToString(getSystemTime())+'</td>';
	htmlNote +='</tr>';
	
	//社外秘表示
	if(CONST_SHAGAIHI == 'T'){
		htmlNote +='<tr>';
		htmlNote +='<td colspan = "18" align="center" style="font-weight: bold;color:#696969;font-size:50px;"><b>社外秘</b></td>';
		htmlNote +='</tr>';
		}
	}
	
	htmlNote += '</table>';
	
	
	htmlNote += '<table border="0" cellpadding="0" cellspacing="0" class= "table_main" style="overflow:scroll;margin-left:15px;margin-bottom:15px;width:1020px;border-collapse:collapse;">';	 //table f
	if(htmlOrPdfCheckFlog == 1){
	htmlNote +='<tr >';
	htmlNote +='<td colspan = "16">'+DATE_TEXT+'</td>';
	htmlNote +='<td colspan = "2"  align="right" style="font-size:11px;color:#00255C;min-width:39px">上段 本年</td>';
	htmlNote +='</tr>';
	htmlNote +='<tr >';
	htmlNote +='<td colspan = "16">&nbsp;</td>';
	htmlNote +='<td  colspan = "2"  align="right" style="font-size:11px;color:#00255C;">下段 前年</td>';
	htmlNote +='</tr>';
	
	
	htmlNote +='<tr>';
	htmlNote +='<td colspan = "15" style="height:30px">&nbsp;</td>';
	if(CONST_AMT_OR_COUNT == '2'){
		htmlNote +='<td align="right" style="font-size:11px;color:#00255C;">(単位 個)</td>';
		htmlNote +='<td align="right" style="font-size:11px;color:#00255C;">(千円)</td>';
		htmlNote +='<td align="right" style="font-size:11px;color:#00255C;">(円)</td>';
	}else if(CONST_AMT_OR_COUNT == '1'){
		htmlNote +='<td align="right" style="font-size:11px;color:#00255C;">(千円)</td>';
		htmlNote +='<td align="right" style="font-size:11px;color:#00255C;"></td>';
		htmlNote +='<td align="right" style="font-size:11px;color:#00255C;"></td>';
		
	}
	
	htmlNote +='</tr>';
	
	htmlNote +='<tr>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='</tr>';
	
	
	htmlNote +='<tr>';
	htmlNote +='<td colspan = "3" style="  line-height:93%;font-size:13px;color:#00255C;border-left:none;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto">'+getOpption(CONST_LINE)+'</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">1月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">2月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">3月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">4月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">5月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">6月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">7月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">8月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">9月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">10月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">11月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;border-right:2px solid #1456A2;width:39px">12月</td>';
	
	if(CONST_AMT_OR_COUNT == '2'){
		htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-top:1px solid #00255C;border-bottom:2px solid #00255C;border-left:2px solid #1456A2;width:39px">Total</td>'
			htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">Total</td>';
			htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">AvgPrice</td>';
	}else if(CONST_AMT_OR_COUNT == '1'){
		htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">Yearly</td>';
		htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto;min-width:39px">G.P</td>';
		htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-right:none; border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto">％</td>';
	}
	
	htmlNote +='</tr>';
	}
	
	

	
	var colTotalMonth1 = 0;
	var colTotalMonth2 = 0;
	var colTotalMonth3 = 0;
	var colTotalMonth4 = 0;
	var colTotalMonth5 = 0;
	var colTotalMonth6 = 0;
	var colTotalMonth7 = 0;
	var colTotalMonth8 = 0;
	var colTotalMonth9 = 0;
	var colTotalMonth10 = 0;
	var colTotalMonth11 = 0;
	var colTotalMonth12 = 0;
	var colTotalCount = 0;
	var colTotalAmt = 0;
	var colTotalCost = 0;
	var colTotalSorieki = 0;
	var colTotallineSoriekiPer = 0;
	
	var colTotalMonth1LastYear = 0;
	var colTotalMonth2LastYear = 0;
	var colTotalMonth3LastYear = 0;
	var colTotalMonth4LastYear = 0;
	var colTotalMonth5LastYear = 0;
	var colTotalMonth6LastYear = 0;
	var colTotalMonth7LastYear = 0;
	var colTotalMonth8LastYear = 0;
	var colTotalMonth9LastYear = 0;
	var colTotalMonth10LastYear = 0;
	var colTotalMonth11LastYear = 0;
	var colTotalMonth12LastYear = 0;
	var colTotalCountLastYear = 0;
	var colTotalAmtLastYear = 0;
	var colTotalCostLastYear = 0;
	var colTotalSoriekiLastYear = 0;
	var colTotallineSoriekiPerLastYear = 0;
	for(var i = 0 ; i <rst.length ; i++ ){
		
			var lastYearRstLine = getOldYearDataLine(lastYearRst,rst[i][0]);
			if(rst[i][0] != lastYearRstLine[0]){
				lastYearRstLine = ["",{"count":"","amt":"","line":"","month":"01"},{"count":"","amt":"","line":"","month":"02"},{"count":"","amt":"","line":"","month":"03"},{"count":"","amt":"","line":"","month":"04"},{"count":"","amt":"","line":"","month":"05"},{"count":"","amt":"","line":"","month":"06"},{"count":"","amt":"","line":"","month":"07"},{"count":"","amt":"","line":"","month":"08"},{"count":"","amt":"","line":"","month":"09"},{"count":"","amt":"","line":"","month":"10"},{"count":"","amt":"","line":"","month":"11"},{"count":"","amt":"","line":"","month":"12"}];
			}
			//行金額合計
			var lineTotalAmt = setValue(rst[i][1].amt,0) + setValue(rst[i][2].amt,0) +setValue(rst[i][3].amt,0) +setValue(rst[i][4].amt,0) +setValue(rst[i][5].amt,0) +setValue(rst[i][6].amt,0) +setValue(rst[i][7].amt,0) +setValue(rst[i][8].amt,0) +setValue(rst[i][9].amt,0) +setValue(rst[i][10].amt,0) +setValue(rst[i][11].amt,0) +setValue(rst[i][12].amt,0);
			var lineTotalAmtLastYear =  setValue(lastYearRstLine[1].amt,0) + setValue(lastYearRstLine[2].amt,0) +setValue(lastYearRstLine[3].amt,0) +setValue(lastYearRstLine[4].amt,0) +setValue(lastYearRstLine[5].amt,0) +setValue(lastYearRstLine[6].amt,0) +setValue(lastYearRstLine[7].amt,0) +setValue(lastYearRstLine[8].amt,0) +setValue(lastYearRstLine[9].amt,0) +setValue(lastYearRstLine[10].amt,0) +setValue(lastYearRstLine[11].amt,0) +setValue(lastYearRstLine[12].amt,0);
			
			//行数量合計
			var lineTotalCount = setValue(rst[i][1].count,0) + setValue(rst[i][2].count,0) +setValue(rst[i][3].count,0) +setValue(rst[i][4].count,0) +setValue(rst[i][5].count,0) +setValue(rst[i][6].count,0) +setValue(rst[i][7].count,0) +setValue(rst[i][8].count,0) +setValue(rst[i][9].count,0) +setValue(rst[i][10].count,0) +setValue(rst[i][11].count,0) +setValue(rst[i][12].count,0);
			var lineTotalCountLastYear =  setValue(lastYearRstLine[1].count,0) + setValue(lastYearRstLine[2].count,0) +setValue(lastYearRstLine[3].count,0) +setValue(lastYearRstLine[4].count,0) +setValue(lastYearRstLine[5].count,0) +setValue(lastYearRstLine[6].count,0) +setValue(lastYearRstLine[7].count,0) +setValue(lastYearRstLine[8].count,0) +setValue(lastYearRstLine[9].count,0) +setValue(lastYearRstLine[10].count,0) +setValue(lastYearRstLine[11].count,0) +setValue(lastYearRstLine[12].count,0);
	
			//コスト(データなしの階層でCOSTが””です)
			var lineCost = "";
			for(var c = 12 ; c >= 1 ; c--){
				if(!isEmpty(rst[i][c].cost)){
					lineCost = rst[i][c].cost;
					break;
				}
			}
			var lineCostLastYear = "";
			for(var c = 12 ; c >= 1 ; c--){
				if(!isEmpty(lastYearRstLine[c].cost)){
					lineCostLastYear = lastYearRstLine[c].cost;
					break;
				}
			}
			
			//粗利益
			var lineSorieki = Number(lineTotalAmt) - Number(lineCost);
			var lineSoriekiLastYear = Number(lineTotalAmtLastYear) - Number(lineCostLastYear);
			
			//粗利率
			var lineSoriekiPer = "";
			if(Number(lineTotalAmt) != 0){
				lineSoriekiPer = lineSorieki /Number(lineTotalAmt);
			}else{
				lineSoriekiPer  =0;
			}
			var lineSoriekiPerLastYear = "";
			if(Number(lineTotalAmtLastYear) != 0){
				lineSoriekiPerLastYear = lineSoriekiLastYear /Number(lineTotalAmtLastYear);
			}else{
				lineSoriekiPerLastYear  =0;
			}
			
			//ライン設定
			htmlNote +='<tr>';
			if(getOpption(CONST_LINE)=="Item"){
				var itemLineTemp = replacetoxml(rst[i][0]);
				var currentItemLineArr = itemLineTemp.split('||');
				var currentItem = currentItemLineArr[0];
				htmlNote +='<td  colspan = "3" style="border-left:none;border-top:1px solid #538DD5;height:25px;vertical-align:top;">'+currentItem+'</td>';
			}else{
			htmlNote +='<td  colspan = "3" style="border-left:none;border-top:1px solid #538DD5;height:25px;vertical-align:top;">'+replacetoxml(rst[i][0])+'</td>';
			}
			htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][1],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[1],1),20))+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][2],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[2],1),20))+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][3],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[3],1),20))+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][4],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[4],1),20))+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][5],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[5],1),20))+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][6],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[6],1),20))+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][7],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[7],1),20))+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][8],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[8],1),20))+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][9],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[9],1),20))+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][10],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[10],1),20))+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][11],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[11],1),20))+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;border-right:2px solid #1456A2;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][12],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[12],1),20))+'</td></tr></table></td>';
			
			//数量と金額表示変更
			if(CONST_AMT_OR_COUNT == '2'){
				htmlNote +='<td align="right" style="border-left:2px solid #1456A2;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(lineTotalCount,11))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(lineTotalCountLastYear,21))+'</td></tr></table></td>';
				htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(lineTotalAmt,12))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(lineTotalAmtLastYear,22))+'</td></tr></table></td>';
				htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(lineCost,13))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(lineCostLastYear,23))+'</td></tr></table></td>';
			}else if(CONST_AMT_OR_COUNT == '1'){
				htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(lineTotalAmt,12))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(lineTotalAmtLastYear,22))+'</td></tr></table></td>';
				htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(lineSorieki,14))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(lineSoriekiLastYear,24))+'</td></tr></table></td>';
				htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;border-right:none;"><table ><tr><td align="right">'+replacetoxml(setValue(lineSoriekiPer,15))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(lineSoriekiPerLastYear,25))+'</td></tr></table></td>';

			}
			htmlNote +='</tr>';
			
			//changed by geng add start U080 20221124
//			//CSV出力用CH196 コード列＋名称列に変更
			var lineStrCode;
			var lineStrName;
			var lineStrTemp = replace(rst[i][0]);
			var lineStr = lineStrTemp.replace(/\s+/, '\x01').split('\x01');
//			nlapiLogExecution('DEBUG', 'str'+i, str);
//			nlapiLogExecution('DEBUG', 'str[0]', str[0]);
//			nlapiLogExecution('DEBUG', 'str[1]', str[1]);
			if(lineStr.length == 1){
				lineStrCode = '';
				lineStrName = lineStr[0];
			}else{
				if(lineStrTemp == '- None -'){
					lineStrCode = '- None -';
					lineStrName = '- None -';
				}else{
					lineStrCode = lineStr[0];
					lineStrName = lineStr[1];
				}
			}
			
			CSV_STR+=
//				replace(rst[i][0])+','+
				lineStrCode+','+
				lineStrName+','+
				''+','+
				''+','+
				''+','+
				''+','+
				(CONST_SHAGAIHI == 'T' || CONST_SUB == SUB_NBKK || CONST_SUB == SUB_ULKK ? lineSorieki : '')+','+
				(lineTotalAmt)+','+
				(CONST_SHAGAIHI == 'T' || CONST_SUB == SUB_NBKK || CONST_SUB == SUB_ULKK ? lineSoriekiLastYear : '')+','+
				(lineTotalAmtLastYear)+','+
				(setValue(rst[i][1],1))+','+
				(setValue(rst[i][2],1))+','+
				(setValue(rst[i][3],1))+','+
				(setValue(rst[i][4],1))+','+
				(setValue(rst[i][5],1))+','+
				(setValue(rst[i][6],1))+','+
				(setValue(rst[i][7],1))+','+
				(setValue(rst[i][8],1))+','+
				(setValue(rst[i][9],1))+','+
				(setValue(rst[i][10],1))+','+
				(setValue(rst[i][11],1))+','+
				(setValue(rst[i][12],1))+','+
				(setValue(lastYearRstLine[1],1))+','+
				(setValue(lastYearRstLine[2],1))+','+
				(setValue(lastYearRstLine[3],1))+','+
				(setValue(lastYearRstLine[4],1))+','+
				(setValue(lastYearRstLine[5],1))+','+
				(setValue(lastYearRstLine[6],1))+','+
				(setValue(lastYearRstLine[7],1))+','+
				(setValue(lastYearRstLine[8],1))+','+
				(setValue(lastYearRstLine[9],1))+','+
				(setValue(lastYearRstLine[10],1))+','+
				(setValue(lastYearRstLine[11],1))+','+
				(setValue(lastYearRstLine[12],1))+'\r\n'
				
			
			
			//列の合計
			colTotalMonth1+=setValue(setValue(rst[i][1],1),0);
			colTotalMonth2+=setValue(setValue(rst[i][2],1),0);
			colTotalMonth3+=setValue(setValue(rst[i][3],1),0);
			colTotalMonth4+=setValue(setValue(rst[i][4],1),0);
			colTotalMonth5+=setValue(setValue(rst[i][5],1),0);
			colTotalMonth6+=setValue(setValue(rst[i][6],1),0);
			colTotalMonth7+=setValue(setValue(rst[i][7],1),0);
			colTotalMonth8+=setValue(setValue(rst[i][8],1),0);
			colTotalMonth9+=setValue(setValue(rst[i][9],1),0);
			colTotalMonth10+=setValue(setValue(rst[i][10],1),0);
			colTotalMonth11+=setValue(setValue(rst[i][11],1),0);
			colTotalMonth12+=setValue(setValue(rst[i][12],1),0);
			colTotalCount+=setValue(lineTotalCount,0);
			colTotalAmt+=setValue(lineTotalAmt,0);
			colTotalCost+=setValue(lineCost,0);
			colTotalSorieki+=setValue(lineSorieki,0);
			colTotallineSoriekiPer+=setValue(lineSoriekiPer,0);
			
			colTotalMonth1LastYear+=setValue(setValue(lastYearRstLine[1],1),0);
			colTotalMonth2LastYear+=setValue(setValue(lastYearRstLine[2],1),0);
			colTotalMonth3LastYear+=setValue(setValue(lastYearRstLine[3],1),0);
			colTotalMonth4LastYear+=setValue(setValue(lastYearRstLine[4],1),0);
			colTotalMonth5LastYear+=setValue(setValue(lastYearRstLine[5],1),0);
			colTotalMonth6LastYear+=setValue(setValue(lastYearRstLine[6],1),0);
			colTotalMonth7LastYear+=setValue(setValue(lastYearRstLine[7],1),0);
			colTotalMonth8LastYear+=setValue(setValue(lastYearRstLine[8],1),0);
			colTotalMonth9LastYear+=setValue(setValue(lastYearRstLine[9],1),0);
			colTotalMonth10LastYear+=setValue(setValue(lastYearRstLine[10],1),0);
			colTotalMonth11LastYear+=setValue(setValue(lastYearRstLine[11],1),0);
			colTotalMonth12LastYear+=setValue(setValue(lastYearRstLine[12],1),0);
			colTotalCountLastYear+=setValue(lineTotalCountLastYear,0);
			colTotalAmtLastYear+=setValue(lineTotalAmtLastYear,0);
			colTotalCostLastYear+=setValue(lineCostLastYear,0);
			colTotalSoriekiLastYear+=setValue(lineSoriekiLastYear,0);
			colTotallineSoriekiPerLastYear+=setValue(lineSoriekiPerLastYear,0);
			
	}
	//合計列を設定
	htmlNote +='<tr>';
	htmlNote +='<td  colspan = "3" style="  border-left:none;border-top:2px solid #00255C;border-bottom:2px solid #00255C;height:25px;vertical-align:top;font-size:13px;color:#00255C;">'+getOpption(CONST_LINE)+'　　Total：</td>';
	htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth1,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth1LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth2,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth2LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth3,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth3LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth4,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth4LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth5,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth5LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth6,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth6LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth7,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth7LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth8,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth8LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth9,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth9LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth10,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth10LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth11,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth11LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;border-right:2px solid #1456A2;" ><table ><tr><td align="right">'+setValue(colTotalMonth12,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth12LastYear,20)+'</td></tr></table></td>';
	
	if(CONST_AMT_OR_COUNT == '2'){
		htmlNote +='<td align="right" style="  border-left:2px solid #1456A2;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalCount,11)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalCountLastYear,21)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalAmt,12)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalAmtLastYear,22)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalCost,13)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalCostLastYear,23)+'</td></tr></table></td>';
	}else if(CONST_AMT_OR_COUNT == '1'){
		htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalAmt,12)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalAmtLastYear,22)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalSorieki,14)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalSoriekiLastYear,24)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="  border-right:none;border-left: 1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotallineSoriekiPer/i,15)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotallineSoriekiPerLastYear/i,25)+'</td></tr></table></td>';

	}
		
	
	
	

	
	htmlNote +='</tr>';
	
	htmlNote+='</table>';
	
//	htmlNote+='</div>';
//	htmlNote += '</td></tr></table>';
	return htmlNote;
}

//changed by geng add start U080 20221124

function setPageGroup2New(rstGroup2,lastYearRstGroup2, htmlOrPdfCheckFlog){

	if(isEmpty(rstGroup2)){
		return "データがありませんでした。";
	}
	var htmlNote='';
	CSV_STRNew = '';
	
	htmlNote += '<table border="0"  cellpadding="0" cellspacing="0" style="margin-left:15px;width:1020px;border-collapse:collapse;">';//table a
	htmlNote +='<tr>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='<td style="width:39px">&nbsp;</td>';
	htmlNote +='</tr>';
	
	if(htmlOrPdfCheckFlog == 1){
	htmlNote +='<tr>';
	htmlNote +='<td colspan = "5" align="left" class="font_color" style="color:#00255C;font-size:17px;"><u><strong>'+CONST_SUB_TEXT+'</strong></u></td>';
	htmlNote +='<td colspan = "11" align="center" class="font_color" style="color:#00255C;font-size:18px;vertical-align:top;"><strong>＜＜'+getSalesOrQty()+' Per   '+getOpption(CONST_LINE)+'  Group1:'+getOpption(CONST_GROUP2)+'  Group2:'+getOpption(CONST_GROUP1)+'＞＞</strong></td>';
	htmlNote +='<td colspan = "3" align="right" style="font-size:13px;color:#00255C;vertical-align:top;">'+nlapiDateToString(getSystemTime())+'</td>';
	htmlNote +='</tr>';
	
	//社外秘表示
	if(CONST_SHAGAIHI == 'T'){
		htmlNote +='<tr>';
		htmlNote +='<td colspan = "20" align="center" style="font-weight: bold;color:#696969;font-size:50px;"><b>社外秘</b></td>';
		htmlNote +='</tr>';
	}
	}


	htmlNote += '</table>';
	htmlNote += '<table border="0" cellpadding="0" cellspacing="0" class= "table_main" style="overflow:scroll;margin-left:15px;margin-bottom:15px;width:1020px;border-collapse:collapse;">';//table b
	if(htmlOrPdfCheckFlog == 1){
	htmlNote +='<tr >';
	htmlNote +='<td colspan = "18">'+DATE_TEXT+'</td>';
	htmlNote +='<td colspan = "2" align="right" style="font-size:11px;color:#00255C;min-width:39px">上段 本年</td>';
	htmlNote +='</tr>';
	htmlNote +='<tr >';
	htmlNote +='<td colspan = "18">&nbsp;</td>';
	htmlNote +='<td colspan = "2" align="right" style="font-size:11px;color:#00255C;min-width:39px">下段 前年</td>';
	htmlNote +='</tr>';
	
	htmlNote +='<tr>';
	htmlNote +='<td colspan = "17" style="height:30px">&nbsp;</td>';
	if(CONST_AMT_OR_COUNT == '2'){
		htmlNote +='<td align="right" style="font-size:11px;color:#00255C;">(単位 個)</td>';
		htmlNote +='<td align="right" style="font-size:11px;color:#00255C;">(千円)</td>';
		htmlNote +='<td align="right" style="font-size:11px;color:#00255C;">(円)</td>';
	}else if(CONST_AMT_OR_COUNT == '1'){
		htmlNote +='<td align="right" style="font-size:11px;color:#00255C;">(千円)</td>';
		htmlNote +='<td align="right" style="font-size:11px;color:#00255C;"></td>';
		htmlNote +='<td align="right" style="font-size:11px;color:#00255C;"></td>';
		
	}
	htmlNote +='</tr>';
	
	htmlNote +='<tr>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='<td style="width:39px"></td>';
	htmlNote +='</tr>';
	
	htmlNote +='<tr>';
	if(getOpption(CONST_LINE)=="Item"){
		htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:none;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto">Item Code</td>';
		htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto">Product Code</td>';
		htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto">Vendor Name</td>';
		htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto">Display Name</td>';
		htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto">Standard</td>';
	}else{
		htmlNote +='<td align="center" colspan = "5" style="  line-height:93%;font-size:13px;color:#00255C;border-left:none;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto">'+getOpption(CONST_LINE)+'</td>';
	}
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">1月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">2月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">3月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">4月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">5月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">6月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">7月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">8月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">9月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">10月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">11月</td>';
	htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;border-right:2px solid #1456A2;width:39px">12月</td>';

	if(CONST_AMT_OR_COUNT == '2'){
		htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-top:1px solid #00255C;border-bottom:2px solid #00255C;border-left:2px solid #1456A2;width:39px">Total</td>'
			htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">Total</td>';
			htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">AvgPrice</td>';
	}else if(CONST_AMT_OR_COUNT == '1'){
		htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">Yearly</td>';
		htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto;min-width:39px">G.P</td>';
		htmlNote +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-right:none; border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto">％</td>';
	}
	
	htmlNote +='</tr>';
	}
	
	var colGroup2TotalMonth1 = 0;
	var colGroup2TotalMonth2 = 0;
	var colGroup2TotalMonth3 = 0;
	var colGroup2TotalMonth4 = 0;
	var colGroup2TotalMonth5 = 0;
	var colGroup2TotalMonth6 = 0;
	var colGroup2TotalMonth7 = 0;
	var colGroup2TotalMonth8 = 0;
	var colGroup2TotalMonth9 = 0;
	var colGroup2TotalMonth10 = 0;
	var colGroup2TotalMonth11 = 0;
	var colGroup2TotalMonth12 = 0;
	var colGroup2TotalCount = 0;
	var colGroup2TotalAmt = 0;
	var colGroup2TotalCost = 0;
	var colGroup2TotalSorieki = 0;
	var colGroup2TotallineSoriekiPer = 0;
	
	var colGroup2TotalMonth1LastYear = 0;
	var colGroup2TotalMonth2LastYear = 0;
	var colGroup2TotalMonth3LastYear = 0;
	var colGroup2TotalMonth4LastYear = 0;
	var colGroup2TotalMonth5LastYear = 0;
	var colGroup2TotalMonth6LastYear = 0;
	var colGroup2TotalMonth7LastYear = 0;
	var colGroup2TotalMonth8LastYear = 0;
	var colGroup2TotalMonth9LastYear = 0;
	var colGroup2TotalMonth10LastYear = 0;
	var colGroup2TotalMonth11LastYear = 0;
	var colGroup2TotalMonth12LastYear = 0;
	var colGroup2TotalCountLastYear = 0;
	var colGroup2TotalAmtLastYear = 0;
	var colGroup2TotalCostLastYear = 0;
	var colGroup2TotalSoriekiLastYear = 0;
	var colGroup2TotallineSoriekiPerLastYear = 0;
	var csvGroup2Text = '';

	for(var k = 0 ; k < rstGroup2.length ; k++){
		
		
		var rstGroup1 = rstGroup2[k];		
		var lastYearRstGroup1 = getOldYearDataGroup2(lastYearRstGroup2,rstGroup2[k][0]);
		
		csvGroup2Text = rstGroup2[k][0];
		if(CONST_GROUP2 == '4'){
			var csvGroup2Arr = csvGroup2Text.split('||');
			csvGroup2Text = csvGroup2Arr[0];
		}
		if(!isEmpty(csvGroup2Text)){
			csvGroup2Text = csvGroup2Text.replace(new RegExp("&","g"),"&amp;");
		}
		
		htmlNote +='<tr>';
		
		htmlNote +='<td align="left" colspan="20" style="font-size:13px;color:#00255C;height:25px;width:351px;border-left:none;border-right:none;border-top:1px solid #00255C;border-bottom-width:none;"><strong>'+getOpption(CONST_GROUP2)+' '+replacetoxml(rstGroup2[k][0])+'</strong></td>';
		
		
		htmlNote +='</tr>';
		
		//第一目を削除する。
		rstGroup1.shift();
		lastYearRstGroup1.shift();
		
		var colGroup1TotalMonth1 = 0;
		var colGroup1TotalMonth2 = 0;
		var colGroup1TotalMonth3 = 0;
		var colGroup1TotalMonth4 = 0;
		var colGroup1TotalMonth5 = 0;
		var colGroup1TotalMonth6 = 0;
		var colGroup1TotalMonth7 = 0;
		var colGroup1TotalMonth8 = 0;
		var colGroup1TotalMonth9 = 0;
		var colGroup1TotalMonth10 = 0;
		var colGroup1TotalMonth11 = 0;
		var colGroup1TotalMonth12 = 0;
		var colGroup1TotalCount = 0;
		var colGroup1TotalAmt = 0;
		var colGroup1TotalCost = 0;
		var colGroup1TotalSorieki = 0;
		var colGroup1TotallineSoriekiPer = 0;
		
		var colGroup1TotalMonth1LastYear = 0;
		var colGroup1TotalMonth2LastYear = 0;
		var colGroup1TotalMonth3LastYear = 0;
		var colGroup1TotalMonth4LastYear = 0;
		var colGroup1TotalMonth5LastYear = 0;
		var colGroup1TotalMonth6LastYear = 0;
		var colGroup1TotalMonth7LastYear = 0;
		var colGroup1TotalMonth8LastYear = 0;
		var colGroup1TotalMonth9LastYear = 0;
		var colGroup1TotalMonth10LastYear = 0;
		var colGroup1TotalMonth11LastYear = 0;
		var colGroup1TotalMonth12LastYear = 0;
		var colGroup1TotalCountLastYear = 0;
		var colGroup1TotalAmtLastYear = 0;
		var colGroup1TotalCostLastYear = 0;
		var colGroup1TotalSoriekiLastYear = 0;
		var colGroup1TotallineSoriekiPerLastYear = 0;
		var csvGroup1Text = '';
		
		for(var j = 0 ; j < rstGroup1.length ; j++){
			
			var rst = rstGroup1[j];		
			var lastYearRst = getOldYearDataGroup1(lastYearRstGroup1,rstGroup1[j][0]);
			
			csvGroup1Text = rstGroup1[j][0];
			if(CONST_GROUP1 == '4'){
				var csvGroup1Arr = csvGroup1Text.split('||');
				csvGroup1Text = csvGroup1Arr[0];
			}
			if(!isEmpty(csvGroup1Text)){
				csvGroup1Text = csvGroup1Text.replace(new RegExp("&","g"),"&amp;");
			}
			
			htmlNote +='<tr>';
			htmlNote +='<td align="left" colspan="20" style="font-size:13px;color:#00255C;height:25px;width:351px;border-left:none;border-right:none;border-top:1px solid #00255C;border-bottom-width:none;"><strong>'+getOpption(CONST_GROUP1)+' '+replacetoxml(rstGroup1[j][0])+'</strong></td>';
			htmlNote +='</tr>';
			
			//第一目を削除する。
			rst.shift();
			lastYearRst.shift();
			
			
			var colTotalMonth1 = 0;
			var colTotalMonth2 = 0;
			var colTotalMonth3 = 0;
			var colTotalMonth4 = 0;
			var colTotalMonth5 = 0;
			var colTotalMonth6 = 0;
			var colTotalMonth7 = 0;
			var colTotalMonth8 = 0;
			var colTotalMonth9 = 0;
			var colTotalMonth10 = 0;
			var colTotalMonth11 = 0;
			var colTotalMonth12 = 0;
			var colTotalCount = 0;
			var colTotalAmt = 0;
			var colTotalCost = 0;
			var colTotalSorieki = 0;
			var colTotallineSoriekiPer = 0;
			
			var colTotalMonth1LastYear = 0;
			var colTotalMonth2LastYear = 0;
			var colTotalMonth3LastYear = 0;
			var colTotalMonth4LastYear = 0;
			var colTotalMonth5LastYear = 0;
			var colTotalMonth6LastYear = 0;
			var colTotalMonth7LastYear = 0;
			var colTotalMonth8LastYear = 0;
			var colTotalMonth9LastYear = 0;
			var colTotalMonth10LastYear = 0;
			var colTotalMonth11LastYear = 0;
			var colTotalMonth12LastYear = 0;
			var colTotalCountLastYear = 0;
			var colTotalAmtLastYear = 0;
			var colTotalCostLastYear = 0;
			var colTotalSoriekiLastYear = 0;
			var colTotallineSoriekiPerLastYear = 0;
			for(var i = 0 ; i <rst.length ; i++ ){
				var itemValArr = [];
				var lastYearRstLine = getOldYearDataLine(lastYearRst,rst[i][0]);
				if(rst[i][0] != lastYearRstLine[0]){
					lastYearRstLine = ["",{"count":"","amt":"","line":"","month":"01"},{"count":"","amt":"","line":"","month":"02"},{"count":"","amt":"","line":"","month":"03"},{"count":"","amt":"","line":"","month":"04"},{"count":"","amt":"","line":"","month":"05"},{"count":"","amt":"","line":"","month":"06"},{"count":"","amt":"","line":"","month":"07"},{"count":"","amt":"","line":"","month":"08"},{"count":"","amt":"","line":"","month":"09"},{"count":"","amt":"","line":"","month":"10"},{"count":"","amt":"","line":"","month":"11"},{"count":"","amt":"","line":"","month":"12"}];
				}
				//行金額合計
				var lineTotalAmt = Number(rst[i][1].amt) + Number(rst[i][2].amt) +Number(rst[i][3].amt) +Number(rst[i][4].amt) +Number(rst[i][5].amt) +Number(rst[i][6].amt) +Number(rst[i][7].amt) +Number(rst[i][8].amt) +Number(rst[i][9].amt) +Number(rst[i][10].amt) +Number(rst[i][11].amt) +Number(rst[i][12].amt);
				var lineTotalAmtLastYear =  Number(lastYearRstLine[1].amt) + Number(lastYearRstLine[2].amt) +Number(lastYearRstLine[3].amt) +Number(lastYearRstLine[4].amt) +Number(lastYearRstLine[5].amt) +Number(lastYearRstLine[6].amt) +Number(lastYearRstLine[7].amt) +Number(lastYearRstLine[8].amt) +Number(lastYearRstLine[9].amt) +Number(lastYearRstLine[10].amt) +Number(lastYearRstLine[11].amt) +Number(lastYearRstLine[12].amt);
				
				//行数量合計
				var lineTotalCount = setValue(rst[i][1].count,0) + setValue(rst[i][2].count,0) +setValue(rst[i][3].count,0) +setValue(rst[i][4].count,0) +setValue(rst[i][5].count,0) +setValue(rst[i][6].count,0) +setValue(rst[i][7].count,0) +setValue(rst[i][8].count,0) +setValue(rst[i][9].count,0) +setValue(rst[i][10].count,0) +setValue(rst[i][11].count,0) +setValue(rst[i][12].count,0);
				var lineTotalCountLastYear =  setValue(lastYearRstLine[1].count,0) + setValue(lastYearRstLine[2].count,0) +setValue(lastYearRstLine[3].count,0) +setValue(lastYearRstLine[4].count,0) +setValue(lastYearRstLine[5].count,0) +setValue(lastYearRstLine[6].count,0) +setValue(lastYearRstLine[7].count,0) +setValue(lastYearRstLine[8].count,0) +setValue(lastYearRstLine[9].count,0) +setValue(lastYearRstLine[10].count,0) +setValue(lastYearRstLine[11].count,0) +setValue(lastYearRstLine[12].count,0);

				//コスト(データなしの階層でCOSTが””です)
				var lineCost = "";
				for(var c = 12 ; c >= 1 ; c--){
					if(!isEmpty(rst[i][c].cost)){
						lineCost = rst[i][c].cost;
						break;
					}
				}
				var lineCostLastYear = "";
				for(var c = 12 ; c >= 1 ; c--){
					if(!isEmpty(lastYearRstLine[c].cost)){
						lineCostLastYear = lastYearRstLine[c].cost;
						break;
					}
				}
				
				//粗利益
				var lineSorieki = Number(lineTotalAmt) - Number(lineCost);
				var lineSoriekiLastYear = Number(lineTotalAmtLastYear) - Number(lineCostLastYear);
				
				//粗利率
				var lineSoriekiPer = "";
				if(Number(lineTotalAmt) != 0){
					lineSoriekiPer = lineSorieki /Number(lineTotalAmt);
				}else{
					lineSoriekiPer  =0;
				}
				var lineSoriekiPerLastYear = "";
				if(Number(lineTotalAmtLastYear) != 0){
					lineSoriekiPerLastYear = lineSoriekiLastYear /Number(lineTotalAmtLastYear);
				}else{
					lineSoriekiPerLastYear  =0;
				}
				
				
				//ライン設定
				htmlNote +='<tr>';
				if(getOpption(CONST_LINE)=='Item'){
					itemValArr = searchItemId(rst[i][0]);	//
//					nlapiLogExecution('DEBUG', 'itemValArr'+i, itemValArr[4]);
					htmlNote +='<td align="left" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;height:25px;vertical-align:top;">'+defaultEmpty(replacetoxml(itemValArr[0]))+'</td>';
					htmlNote +='<td align="left" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;height:25px;vertical-align:top;">'+defaultEmpty(replacetoxml(itemValArr[1]))+'</td>';
					htmlNote +='<td align="left" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;height:25px;vertical-align:top;">'+defaultEmpty(replacetoxml(itemValArr[2]))+'</td>';
					htmlNote +='<td align="left" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;height:25px;vertical-align:top;">'+defaultEmpty(replacetoxml(itemValArr[3]))+'</td>';
					htmlNote +='<td align="left" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;height:25px;vertical-align:top;">'+defaultEmpty(replacetoxml(itemValArr[4]))+'</td>';
				}else{
					htmlNote +='<td align="left" colspan = "5" style="border-left:none;border-top:1px solid #538DD5;height:25px;vertical-align:top;">'+replacetoxml(rst[i][0])+'</td>';
				}
				
				
				
				
				htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][1],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[1],1),20))+'</td></tr></table></td>';
				htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][2],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[2],1),20))+'</td></tr></table></td>';
				htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][3],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[3],1),20))+'</td></tr></table></td>';
				htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][4],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[4],1),20))+'</td></tr></table></td>';
				htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][5],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[5],1),20))+'</td></tr></table></td>';
				htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][6],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[6],1),20))+'</td></tr></table></td>';
				htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][7],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[7],1),20))+'</td></tr></table></td>';
				htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][8],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[8],1),20))+'</td></tr></table></td>';
				htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][9],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[9],1),20))+'</td></tr></table></td>';
				htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][10],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[10],1),20))+'</td></tr></table></td>';
				htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][11],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[11],1),20))+'</td></tr></table></td>';
				htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;border-right:2px solid #1456A2;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][12],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[12],1),20))+'</td></tr></table></td>';
	
				if(CONST_AMT_OR_COUNT == '2'){
					htmlNote +='<td align="right" style="border-left:2px solid #1456A2;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+setValue(lineTotalCount,11)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(lineTotalCountLastYear,21)+'</td></tr></table></td>';
					htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+setValue(lineTotalAmt,12)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(lineTotalAmtLastYear,22)+'</td></tr></table></td>';
					htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+setValue(lineCost,13)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(lineCostLastYear,23)+'</td></tr></table></td>';

				}else if(CONST_AMT_OR_COUNT == '1'){
					htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+setValue(lineTotalAmt,12)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(lineTotalAmtLastYear,22)+'</td></tr></table></td>';
					htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+setValue(lineSorieki,14)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(lineSoriekiLastYear,24)+'</td></tr></table></td>';
					htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;border-right:none;"><table ><tr><td align="right">'+setValue(lineSoriekiPer,15)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(lineSoriekiPerLastYear,25)+'</td></tr></table></td>';

					
				}
				
				htmlNote +='</tr>';
				
//				//CSV出力用
				if(getOpption(CONST_LINE)=='Item'){
					CSV_STRNew+=
						defaultEmpty(replace(itemValArr[0]))+','+
						defaultEmpty(replace(itemValArr[1]))+','+
						defaultEmpty(replace(itemValArr[2]))+','+
						defaultEmpty(replace(itemValArr[3]))+','+
						defaultEmpty(replace(itemValArr[4]))+',';
				}else{
					CSV_STRNew+=
						replace(rst[i][0])+',';
				}
				
				var Group1StrCode;
				var Group1StrName;
				var Group1StrTemp = replace(csvGroup1Text);
				var Group1Str = Group1StrTemp.replace(/\s+/, '\x01').split('\x01');
				
				if(Group1Str.length == 1){
					Group1StrCode = '';
					Group1StrName = Group1Str[0];
				}else{
					if(Group1StrTemp == '- None -'){
						Group1StrCode = '- None -';
						Group1StrName = '- None -';
					}else{
						Group1StrCode = Group1Str[0];
						Group1StrName = Group1Str[1];
					}
				}
				
				var Group2StrCode;
				var Group2StrName;
				var Group2StrTemp = replace(csvGroup2Text);
				var Group2Str = Group2StrTemp.replace(/\s+/, '\x01').split('\x01');
				
				if(Group2Str.length == 1){
					Group2StrCode = '';
					Group2StrName = Group2Str[0];
				}else{
					if(Group2StrTemp == '- None -'){
						Group2StrCode = '- None -';
						Group2StrName = '- None -';
					}else{
						Group2StrCode = Group2Str[0];
						Group2StrName = Group2Str[1];
					}
				}
				CSV_STRNew+=
//					Group1StrCode+','+
//					Group1StrName+','+
//					Group2StrCode+','+
//					Group2StrName+','+
					
					Group2StrCode+','+
					Group2StrName+','+
					Group1StrCode+','+
					Group1StrName+','+
					
					
					(CONST_SHAGAIHI == 'T' || CONST_SUB == SUB_NBKK || CONST_SUB == SUB_ULKK  ? replace(lineSorieki) : '')+','+
					replace(lineTotalAmt)+','+
					(CONST_SHAGAIHI == 'T' || CONST_SUB == SUB_NBKK || CONST_SUB == SUB_ULKK  ? replace(lineSoriekiLastYear) : '')+','+
					(lineTotalAmtLastYear)+','+
					(setValue(rst[i][1],1))+','+
					(setValue(rst[i][2],1))+','+
					(setValue(rst[i][3],1))+','+
					(setValue(rst[i][4],1))+','+
					(setValue(rst[i][5],1))+','+
					(setValue(rst[i][6],1))+','+
					(setValue(rst[i][7],1))+','+
					(setValue(rst[i][8],1))+','+
					(setValue(rst[i][9],1))+','+
					(setValue(rst[i][10],1))+','+
					(setValue(rst[i][11],1))+','+
					(setValue(rst[i][12],1))+','+
					(setValue(lastYearRstLine[1],1))+','+
					(setValue(lastYearRstLine[2],1))+','+
					(setValue(lastYearRstLine[3],1))+','+
					(setValue(lastYearRstLine[4],1))+','+
					(setValue(lastYearRstLine[5],1))+','+
					(setValue(lastYearRstLine[6],1))+','+
					(setValue(lastYearRstLine[7],1))+','+
					(setValue(lastYearRstLine[8],1))+','+
					(setValue(lastYearRstLine[9],1))+','+
					(setValue(lastYearRstLine[10],1))+','+
					(setValue(lastYearRstLine[11],1))+','+
					(setValue(lastYearRstLine[12],1))+'\r\n'
				
				//列の合計
				colTotalMonth1+=setValue(setValue(rst[i][1],1),0);
				colTotalMonth2+=setValue(setValue(rst[i][2],1),0);
				colTotalMonth3+=setValue(setValue(rst[i][3],1),0);
				colTotalMonth4+=setValue(setValue(rst[i][4],1),0);
				colTotalMonth5+=setValue(setValue(rst[i][5],1),0);
				colTotalMonth6+=setValue(setValue(rst[i][6],1),0);
				colTotalMonth7+=setValue(setValue(rst[i][7],1),0);
				colTotalMonth8+=setValue(setValue(rst[i][8],1),0);
				colTotalMonth9+=setValue(setValue(rst[i][9],1),0);
				colTotalMonth10+=setValue(setValue(rst[i][10],1),0);
				colTotalMonth11+=setValue(setValue(rst[i][11],1),0);
				colTotalMonth12+=setValue(setValue(rst[i][12],1),0);
				colTotalCount+=setValue(lineTotalCount,0);
				colTotalAmt+=setValue(lineTotalAmt,0);
				colTotalCost+=setValue(lineCost,0);
				colTotalSorieki+=setValue(lineSorieki,0);
				colTotallineSoriekiPer+=setValue(lineSoriekiPer,0);
				
				colTotalMonth1LastYear+=setValue(setValue(lastYearRstLine[1],1),0);
				colTotalMonth2LastYear+=setValue(setValue(lastYearRstLine[2],1),0);
				colTotalMonth3LastYear+=setValue(setValue(lastYearRstLine[3],1),0);
				colTotalMonth4LastYear+=setValue(setValue(lastYearRstLine[4],1),0);
				colTotalMonth5LastYear+=setValue(setValue(lastYearRstLine[5],1),0);
				colTotalMonth6LastYear+=setValue(setValue(lastYearRstLine[6],1),0);
				colTotalMonth7LastYear+=setValue(setValue(lastYearRstLine[7],1),0);
				colTotalMonth8LastYear+=setValue(setValue(lastYearRstLine[8],1),0);
				colTotalMonth9LastYear+=setValue(setValue(lastYearRstLine[9],1),0);
				colTotalMonth10LastYear+=setValue(setValue(lastYearRstLine[10],1),0);
				colTotalMonth11LastYear+=setValue(setValue(lastYearRstLine[11],1),0);
				colTotalMonth12LastYear+=setValue(setValue(lastYearRstLine[12],1),0);
				colTotalCountLastYear+=setValue(lineTotalCountLastYear,0);
				colTotalAmtLastYear+=setValue(lineTotalAmtLastYear,0);
				colTotalCostLastYear+=setValue(lineCostLastYear,0);
				colTotalSoriekiLastYear+=setValue(lineSoriekiLastYear,0);
				colTotallineSoriekiPerLastYear+=setValue(lineSoriekiPerLastYear,0);
				
			}
			//合計列を設定
			htmlNote +='<tr>';
			htmlNote +='<td  colspan = "5" style="  border-left:none;border-top:2px solid #00255C;border-bottom:2px solid #00255C;height:25px;vertical-align:top;font-size:13px;color:#00255C;">'+getOpption(CONST_GROUP1)+'　　Total：'+csvGroup1Text+'</td>';
			htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth1,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth1LastYear,20)+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth2,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth2LastYear,20)+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth3,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth3LastYear,20)+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth4,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth4LastYear,20)+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth5,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth5LastYear,20)+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth6,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth6LastYear,20)+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth7,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth7LastYear,20)+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth8,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth8LastYear,20)+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth9,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth9LastYear,20)+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth10,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth10LastYear,20)+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth11,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth11LastYear,20)+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;border-right:2px solid #1456A2;" ><table ><tr><td align="right">'+setValue(colTotalMonth12,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth12LastYear,20)+'</td></tr></table></td>';
			
			if(CONST_AMT_OR_COUNT == '2'){
				htmlNote +='<td align="right" style="  border-left:2px solid #1456A2;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalCount,11)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalCountLastYear,21)+'</td></tr></table></td>';
				
				htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalAmt,12)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalAmtLastYear,22)+'</td></tr></table></td>';

				htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalCost,13)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalCostLastYear,23)+'</td></tr></table></td>';

			}else if(CONST_AMT_OR_COUNT == '1'){
				htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalAmt,12)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalAmtLastYear,22)+'</td></tr></table></td>';

				htmlNote +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalSorieki,14)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalSoriekiLastYear,24)+'</td></tr></table></td>';
				htmlNote +='<td align="right" style="  border-right:none;border-left: 1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotallineSoriekiPer/i,15)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotallineSoriekiPerLastYear/i,25)+'</td></tr></table></td>';

				
			}
			
			htmlNote +='</tr>';
		
			
			//グループ１列の合計
			colGroup1TotalMonth1+=setValue(colTotalMonth1,0);
			colGroup1TotalMonth2+=setValue(colTotalMonth2,0);
			colGroup1TotalMonth3+=setValue(colTotalMonth3,0);
			colGroup1TotalMonth4+=setValue(colTotalMonth4,0);
			colGroup1TotalMonth5+=setValue(colTotalMonth5,0);
			colGroup1TotalMonth6+=setValue(colTotalMonth6,0);
			colGroup1TotalMonth7+=setValue(colTotalMonth7,0);
			colGroup1TotalMonth8+=setValue(colTotalMonth8,0);
			colGroup1TotalMonth9+=setValue(colTotalMonth9,0);
			colGroup1TotalMonth10+=setValue(colTotalMonth10,0);
			colGroup1TotalMonth11+=setValue(colTotalMonth11,0);
			colGroup1TotalMonth12+=setValue(colTotalMonth12,0);
			colGroup1TotalCount+=setValue(colTotalCount,0);
			colGroup1TotalAmt+=setValue(colTotalAmt,0);
			colGroup1TotalCost+=setValue(colTotalCost,0);
			colGroup1TotalSorieki+=setValue(colTotalSorieki,0);
			colGroup1TotallineSoriekiPer+=setValue(colTotallineSoriekiPer,0);
			
			colGroup1TotalMonth1LastYear+=setValue(colTotalMonth1LastYear,0);
			colGroup1TotalMonth2LastYear+=setValue(colTotalMonth2LastYear,0);
			colGroup1TotalMonth3LastYear+=setValue(colTotalMonth3LastYear,0);
			colGroup1TotalMonth4LastYear+=setValue(colTotalMonth4LastYear,0);
			colGroup1TotalMonth5LastYear+=setValue(colTotalMonth5LastYear,0);
			colGroup1TotalMonth6LastYear+=setValue(colTotalMonth6LastYear,0);
			colGroup1TotalMonth7LastYear+=setValue(colTotalMonth7LastYear,0);
			colGroup1TotalMonth8LastYear+=setValue(colTotalMonth8LastYear,0);
			colGroup1TotalMonth9LastYear+=setValue(colTotalMonth9LastYear,0);
			colGroup1TotalMonth10LastYear+=setValue(colTotalMonth10LastYear,0);
			colGroup1TotalMonth11LastYear+=setValue(colTotalMonth11LastYear,0);
			colGroup1TotalMonth12LastYear+=setValue(colTotalMonth12LastYear,0);
			colGroup1TotalCountLastYear+=setValue(colTotalCountLastYear,0);
			colGroup1TotalAmtLastYear+=setValue(colTotalAmtLastYear,0);
			colGroup1TotalCostLastYear+=setValue(colTotalCostLastYear,0);
			colGroup1TotalSoriekiLastYear+=setValue(colTotalSoriekiLastYear,0);
			colGroup1TotallineSoriekiPerLastYear+=setValue(colTotallineSoriekiPerLastYear,0);
		}
		
		//グループ１の合計列
		htmlNote +='<tr>';
		htmlNote +='<td  colspan = "5" style="border-left:none;border-top:2px solid #00255C;border-bottom:2px solid #00255C;height:25px;vertical-align:top;font-size:13px;color:#00255C;">'+getOpption(CONST_GROUP2)+'　　Total：'+csvGroup2Text+'</td>';
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth1,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth1LastYear,20)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth2,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth2LastYear,20)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth3,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth3LastYear,20)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth4,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth4LastYear,20)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth5,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth5LastYear,20)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth6,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth6LastYear,20)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth7,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth7LastYear,20)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth8,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth8LastYear,20)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth9,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth9LastYear,20)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth10,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth10LastYear,20)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth11,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth11LastYear,20)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;border-right:2px solid #1456A2;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth12,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth12LastYear,20)+'</td></tr></table></td>';
		
		
	
		if(CONST_AMT_OR_COUNT == '2'){
			htmlNote +='<td align="right" style="border-left:2px solid #1456A2;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalCount,11)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalCountLastYear,21)+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalAmt,12)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalAmtLastYear,22)+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalCost,13)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalCostLastYear,23)+'</td></tr></table></td>';

			
		}else if(CONST_AMT_OR_COUNT == '1'){
			htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalAmt,12)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalAmtLastYear,22)+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalSorieki,14)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalSoriekiLastYear,24)+'</td></tr></table></td>';
			htmlNote +='<td align="right" style="border-right:none;border-left: 1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotallineSoriekiPer/i,15)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotallineSoriekiPerLastYear/i,25)+'</td></tr></table></td>';	
		}
		
		
		htmlNote +='</tr>';
		
		//グループ2列の合計
		colGroup2TotalMonth1+=setValue(colGroup1TotalMonth1,0);
		colGroup2TotalMonth2+=setValue(colGroup1TotalMonth2,0);
		colGroup2TotalMonth3+=setValue(colGroup1TotalMonth3,0);
		colGroup2TotalMonth4+=setValue(colGroup1TotalMonth4,0);
		colGroup2TotalMonth5+=setValue(colGroup1TotalMonth5,0);
		colGroup2TotalMonth6+=setValue(colGroup1TotalMonth6,0);
		colGroup2TotalMonth7+=setValue(colGroup1TotalMonth7,0);
		colGroup2TotalMonth8+=setValue(colGroup1TotalMonth8,0);
		colGroup2TotalMonth9+=setValue(colGroup1TotalMonth9,0);
		colGroup2TotalMonth10+=setValue(colGroup1TotalMonth10,0);
		colGroup2TotalMonth11+=setValue(colGroup1TotalMonth11,0);
		colGroup2TotalMonth12+=setValue(colGroup1TotalMonth12,0);
		colGroup2TotalCount+=setValue(colGroup1TotalCount,0);
		colGroup2TotalAmt+=setValue(colGroup1TotalAmt,0);
		colGroup2TotalCost+=setValue(colGroup1TotalCost,0);
		colGroup2TotalSorieki+=setValue(colGroup1TotalSorieki,0);
		colGroup2TotallineSoriekiPer+=setValue(colGroup1TotallineSoriekiPer,0);
		
		colGroup2TotalMonth1LastYear+=setValue(colGroup1TotalMonth1LastYear,0);
		colGroup2TotalMonth2LastYear+=setValue(colGroup1TotalMonth2LastYear,0);
		colGroup2TotalMonth3LastYear+=setValue(colGroup1TotalMonth3LastYear,0);
		colGroup2TotalMonth4LastYear+=setValue(colGroup1TotalMonth4LastYear,0);
		colGroup2TotalMonth5LastYear+=setValue(colGroup1TotalMonth5LastYear,0);
		colGroup2TotalMonth6LastYear+=setValue(colGroup1TotalMonth6LastYear,0);
		colGroup2TotalMonth7LastYear+=setValue(colGroup1TotalMonth7LastYear,0);
		colGroup2TotalMonth8LastYear+=setValue(colGroup1TotalMonth8LastYear,0);
		colGroup2TotalMonth9LastYear+=setValue(colGroup1TotalMonth9LastYear,0);
		colGroup2TotalMonth10LastYear+=setValue(colGroup1TotalMonth10LastYear,0);
		colGroup2TotalMonth11LastYear+=setValue(colGroup1TotalMonth11LastYear,0);
		colGroup2TotalMonth12LastYear+=setValue(colGroup1TotalMonth12LastYear,0);
		colGroup2TotalCountLastYear+=setValue(colGroup1TotalCountLastYear,0);
		colGroup2TotalAmtLastYear+=setValue(colGroup1TotalAmtLastYear,0);
		colGroup2TotalCostLastYear+=setValue(colGroup1TotalCostLastYear,0);
		colGroup2TotalSoriekiLastYear+=setValue(colGroup1TotalSoriekiLastYear,0);
		colGroup2TotallineSoriekiPerLastYear+=setValue(colGroup1TotallineSoriekiPerLastYear,0);
		
	}
	//グループ２の合計列
	htmlNote +='<tr>';
	htmlNote +='<td  colspan = "5" style="border-left:none;border-top:2px solid #00255C;border-bottom:2px solid #00255C;height:25px;vertical-align:top;font-size:13px;color:#00255C;">'+getOpption(CONST_LINE)+'　　Total：</td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup2TotalMonth1,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotalMonth1LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup2TotalMonth2,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotalMonth2LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup2TotalMonth3,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotalMonth3LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup2TotalMonth4,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotalMonth4LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup2TotalMonth5,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotalMonth5LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup2TotalMonth6,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotalMonth6LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup2TotalMonth7,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotalMonth7LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup2TotalMonth8,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotalMonth8LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup2TotalMonth9,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotalMonth9LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup2TotalMonth10,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotalMonth10LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup2TotalMonth11,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotalMonth11LastYear,20)+'</td></tr></table></td>';
	htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;border-right:2px solid #1456A2;" ><table ><tr><td align="right">'+setValue(colGroup2TotalMonth12,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotalMonth12LastYear,20)+'</td></tr></table></td>';
	
	
	if(CONST_AMT_OR_COUNT == '2'){
		htmlNote +='<td align="right" style="border-left:2px solid #1456A2;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup2TotalCount,11)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotalCountLastYear,21)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup2TotalAmt,12)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotalAmtLastYear,22)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup2TotalCost,13)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotalCostLastYear,23)+'</td></tr></table></td>';
	}else if(CONST_AMT_OR_COUNT == '1'){
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup2TotalAmt,12)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotalAmtLastYear,22)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup2TotalSorieki,14)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotalSoriekiLastYear,24)+'</td></tr></table></td>';
		htmlNote +='<td align="right" style="border-left:2px solid #1456A2;border-right:none;border-top:2px solid #00255C;border-bottom:2px solid #00255C;"><table ><tr><td align="right">'+setValue(colGroup2TotallineSoriekiPer/i,15)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup2TotallineSoriekiPerLastYear/i,25)+'</td></tr></table></td>';

	}
	htmlNote +='</tr>';
	htmlNote+='</table>';
	return htmlNote;	
}






function setPageGroup1New(rstGroup1,lastYearRstGroup1, htmlOrPdfCheckFlog){

	if(isEmpty(rstGroup1)){
		return "データがありませんでした。";
	}
	var htmlNoteNew='';
	CSV_STRNew = '';
	
	htmlNoteNew += '<table border="0" cellpadding="0" cellspacing="0" style="width:1020px;border-collapse:collapse;">'; //table c
	htmlNoteNew +='<tr>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';

	htmlNoteNew +='</tr>';
	if(htmlOrPdfCheckFlog == 1){
	htmlNoteNew +='<tr>';
	htmlNoteNew +='<td colspan = "5" align="left" class="font_color" style="color:#00255C;font-size:17px;"><u><strong>'+CONST_SUB_TEXT+'</strong></u></td>';
	htmlNoteNew +='<td colspan = "12" align="center" class="font_color" style="color:#00255C;font-size:18px;vertical-align:top;"><strong>＜＜'+getSalesOrQty()+' Per   '+getOpption(CONST_LINE)+'  Group1:'+getOpption(CONST_GROUP1)+'＞＞</strong></td>';
	htmlNoteNew +='<td colspan = "3" align="right" style="font-size:13px;color:#00255C;vertical-align:top;">'+nlapiDateToString(getSystemTime())+'</td>';
	htmlNoteNew +='</tr>';
	
	//社外秘表示
	if(CONST_SHAGAIHI == 'T'){
		htmlNoteNew +='<tr>';
		htmlNoteNew +='<td colspan = "19" align="center" style="font-weight: bold;color:#696969;font-size:50px;"><b>社外秘</b></td>';
		htmlNoteNew +='</tr>';
	}
	}
	
	htmlNoteNew += '</table>';

	htmlNoteNew += '<table border="0" cellpadding="0" cellspacing="0" class= "table_main" style="overflow:scroll;margin-left:15px;margin-bottom:15px;width:1020px;border-collapse:collapse;">'; //table d
	if(htmlOrPdfCheckFlog == 1){
	htmlNoteNew +='<tr >';
	htmlNoteNew +='<td colspan = "17">'+DATE_TEXT+'</td>';
	htmlNoteNew +='<td colspan = "2" align="right" style="font-size:11px;color:#00255C;min-width:39px">上段 本年</td>';
	htmlNoteNew +='</tr>';
	htmlNoteNew +='<tr >';
	htmlNoteNew +='<td colspan = "17">&nbsp;</td>';
	htmlNoteNew +='<td colspan = "2" align="right" style="font-size:11px;color:#00255C;min-width:39px">下段 前年</td>';
	htmlNoteNew +='</tr>';
	
	htmlNoteNew +='<tr>';
	htmlNoteNew +='<td colspan = "16" style="height:30px">&nbsp;</td>';
	if(CONST_AMT_OR_COUNT == '2'){
		htmlNoteNew +='<td align="right" style="font-size:11px;color:#00255C;">(単位 個)</td>';
		htmlNoteNew +='<td align="right" style="font-size:11px;color:#00255C;">(千円)</td>';
		htmlNoteNew +='<td align="right" style="font-size:11px;color:#00255C;">(円)</td>';
	}else if(CONST_AMT_OR_COUNT == '1'){
		htmlNoteNew +='<td align="right" style="font-size:11px;color:#00255C;">(千円)</td>';
		htmlNoteNew +='<td align="right" style="font-size:11px;color:#00255C;"></td>';
		htmlNoteNew +='<td align="right" style="font-size:11px;color:#00255C;"></td>';
		
	}
	htmlNoteNew +='</tr>';
	
	htmlNoteNew +='<tr>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='</tr>';
	
	htmlNoteNew +='<tr>';
	if(getOpption(CONST_LINE)=="Item"){
		htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:none;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto">Item Code</td>';
		htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto">Product Code</td>';
		htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto">Vendor Name</td>';
		htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto">Display Name</td>';
		htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto">Standard</td>';
	}else{
		htmlNoteNew +='<td align="center" colspan = "5" style="  line-height:93%;font-size:13px;color:#00255C;border-left:none;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto">'+getOpption(CONST_LINE)+'</td>';
	}
	htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">1月</td>';
	htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">2月</td>';
	htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">3月</td>';
	htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">4月</td>';
	htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">5月</td>';
	htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">6月</td>';
	htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">7月</td>';
	htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">8月</td>';
	htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">9月</td>';
	htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">10月</td>';
	htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">11月</td>';
	htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;border-right:2px solid #1456A2;width:39px">12月</td>';
	
	if(CONST_AMT_OR_COUNT == '2'){
		htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-top:1px solid #00255C;border-bottom:2px solid #00255C;border-left:2px solid #1456A2;width:39px">Total</td>'
			htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">Total</td>';
			htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">AvgPrice</td>';
	}else if(CONST_AMT_OR_COUNT == '1'){
		htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">Yearly</td>';
		htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto;min-width:39px">G.P</td>';
		htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-right:none; border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto">％</td>';
	}
	htmlNoteNew +='</tr>';
	}
	
	
	
	
	var colGroup1TotalMonth1 = 0;
	var colGroup1TotalMonth2 = 0;
	var colGroup1TotalMonth3 = 0;
	var colGroup1TotalMonth4 = 0;
	var colGroup1TotalMonth5 = 0;
	var colGroup1TotalMonth6 = 0;
	var colGroup1TotalMonth7 = 0;
	var colGroup1TotalMonth8 = 0;
	var colGroup1TotalMonth9 = 0;
	var colGroup1TotalMonth10 = 0;
	var colGroup1TotalMonth11 = 0;
	var colGroup1TotalMonth12 = 0;
	var colGroup1TotalCount = 0;
	var colGroup1TotalAmt = 0;
	var colGroup1TotalCost = 0;
	var colGroup1TotalSorieki = 0;
	var colGroup1TotallineSoriekiPer = 0;
	
	var colGroup1TotalMonth1LastYear = 0;
	var colGroup1TotalMonth2LastYear = 0;
	var colGroup1TotalMonth3LastYear = 0;
	var colGroup1TotalMonth4LastYear = 0;
	var colGroup1TotalMonth5LastYear = 0;
	var colGroup1TotalMonth6LastYear = 0;
	var colGroup1TotalMonth7LastYear = 0;
	var colGroup1TotalMonth8LastYear = 0;
	var colGroup1TotalMonth9LastYear = 0;
	var colGroup1TotalMonth10LastYear = 0;
	var colGroup1TotalMonth11LastYear = 0;
	var colGroup1TotalMonth12LastYear = 0;
	var colGroup1TotalCountLastYear = 0;
	var colGroup1TotalAmtLastYear = 0;
	var colGroup1TotalCostLastYear = 0;
	var colGroup1TotalSoriekiLastYear = 0;
	var colGroup1TotallineSoriekiPerLastYear = 0;
	var csvGroup1Text = '';
	for(var j = 0 ; j < rstGroup1.length; j++){
		
		var rst = rstGroup1[j];	
		var lastYearRst = getOldYearDataGroup1(lastYearRstGroup1,rstGroup1[j][0]);
		
//		csvGroup1Text = rstGroup1[j][0][0];
		csvGroup1Text = rstGroup1[j][0];
//		nlapiLogExecution('debug', 'rst[1][1]', rst[1])
		if(CONST_GROUP1 == '4'){
			var csvGroup1Arr = csvGroup1Text.split('||');
			csvGroup1Text = csvGroup1Arr[0];
		}
		if(!isEmpty(csvGroup1Text)){
			csvGroup1Text = csvGroup1Text.replace(new RegExp("&","g"),"&amp;");
		}

		
		htmlNoteNew +='<tr>';
		htmlNoteNew +='<td colspan="19" style="font-size:13px;color:#00255C;height:25px;width:351px;border-left:none;border-right:none;border-top:1px solid #00255C;border-bottom-width:none;"><strong>'+getOpption(CONST_GROUP1)+' '+replacetoxml(rstGroup1[j][0])+'</strong></td>';
		htmlNoteNew +='</tr>';
		
		//第一目を削除する。
		rst.shift();
		lastYearRst.shift();
		
		
		var colTotalMonth1 = 0;
		var colTotalMonth2 = 0;
		var colTotalMonth3 = 0;
		var colTotalMonth4 = 0;
		var colTotalMonth5 = 0;
		var colTotalMonth6 = 0;
		var colTotalMonth7 = 0;
		var colTotalMonth8 = 0;
		var colTotalMonth9 = 0;
		var colTotalMonth10 = 0;
		var colTotalMonth11 = 0;
		var colTotalMonth12 = 0;
		var colTotalCount = 0;
		var colTotalAmt = 0;
		var colTotalCost = 0;
		var colTotalSorieki = 0;
		var colTotallineSoriekiPer = 0;
		
		var colTotalMonth1LastYear = 0;
		var colTotalMonth2LastYear = 0;
		var colTotalMonth3LastYear = 0;
		var colTotalMonth4LastYear = 0;
		var colTotalMonth5LastYear = 0;
		var colTotalMonth6LastYear = 0;
		var colTotalMonth7LastYear = 0;
		var colTotalMonth8LastYear = 0;
		var colTotalMonth9LastYear = 0;
		var colTotalMonth10LastYear = 0;
		var colTotalMonth11LastYear = 0;
		var colTotalMonth12LastYear = 0;
		var colTotalCountLastYear = 0;
		var colTotalAmtLastYear = 0;
		var colTotalCostLastYear = 0;
		var colTotalSoriekiLastYear = 0;
		var colTotallineSoriekiPerLastYear = 0;
		for(var i=0;i<rst.length;i++){
			var itemValArr = [];
			var lastYearRstLine = getOldYearDataLine(lastYearRst,rst[i][0]);
			if(rst[i][0] != lastYearRstLine[0]){
				lastYearRstLine = ["",{"count":"","amt":"","line":"","month":"01"},{"count":"","amt":"","line":"","month":"02"},{"count":"","amt":"","line":"","month":"03"},{"count":"","amt":"","line":"","month":"04"},{"count":"","amt":"","line":"","month":"05"},{"count":"","amt":"","line":"","month":"06"},{"count":"","amt":"","line":"","month":"07"},{"count":"","amt":"","line":"","month":"08"},{"count":"","amt":"","line":"","month":"09"},{"count":"","amt":"","line":"","month":"10"},{"count":"","amt":"","line":"","month":"11"},{"count":"","amt":"","line":"","month":"12"}];
			}
			//行金額合計
			var lineTotalAmt = Number(rst[i][1].amt) + Number(rst[i][2].amt) +Number(rst[i][3].amt) +Number(rst[i][4].amt) +Number(rst[i][5].amt) +Number(rst[i][6].amt) +Number(rst[i][7].amt) +Number(rst[i][8].amt) +Number(rst[i][9].amt) +Number(rst[i][10].amt) +Number(rst[i][11].amt) +Number(rst[i][12].amt);
			var lineTotalAmtLastYear =  Number(lastYearRstLine[1].amt) + Number(lastYearRstLine[2].amt) +Number(lastYearRstLine[3].amt) +Number(lastYearRstLine[4].amt) +Number(lastYearRstLine[5].amt) +Number(lastYearRstLine[6].amt) +Number(lastYearRstLine[7].amt) +Number(lastYearRstLine[8].amt) +Number(lastYearRstLine[9].amt) +Number(lastYearRstLine[10].amt) +Number(lastYearRstLine[11].amt) +Number(lastYearRstLine[12].amt);
			
			//行数量合計
			var lineTotalCount = setValue(rst[i][1].count,0) + setValue(rst[i][2].count,0) +setValue(rst[i][3].count,0) +setValue(rst[i][4].count,0) +setValue(rst[i][5].count,0) +setValue(rst[i][6].count,0) +setValue(rst[i][7].count,0) +setValue(rst[i][8].count,0) +setValue(rst[i][9].count,0) +setValue(rst[i][10].count,0) +setValue(rst[i][11].count,0) +setValue(rst[i][12].count,0);
			var lineTotalCountLastYear =  setValue(lastYearRstLine[1].count,0) + setValue(lastYearRstLine[2].count,0) +setValue(lastYearRstLine[3].count,0) +setValue(lastYearRstLine[4].count,0) +setValue(lastYearRstLine[5].count,0) +setValue(lastYearRstLine[6].count,0) +setValue(lastYearRstLine[7].count,0) +setValue(lastYearRstLine[8].count,0) +setValue(lastYearRstLine[9].count,0) +setValue(lastYearRstLine[10].count,0) +setValue(lastYearRstLine[11].count,0) +setValue(lastYearRstLine[12].count,0);

			//コスト(データなしの階層でCOSTが””です)
			var lineCost = "";
			for(var c = 12 ; c >= 1 ; c--){
				if(!isEmpty(rst[i][c].cost)){
					lineCost = rst[i][c].cost;
					break;
				}
			}
			var lineCostLastYear = "";
			for(var c = 12 ; c >= 1 ; c--){
				if(!isEmpty(lastYearRstLine[c].cost)){
					lineCostLastYear = lastYearRstLine[c].cost;
					break;
				}
			}
			//粗利益
			var lineSorieki = Number(lineTotalAmt) - Number(lineCost);
			var lineSoriekiLastYear = Number(lineTotalAmtLastYear) - Number(lineCostLastYear);
			
			//粗利率
			var lineSoriekiPer = "";
			if(Number(lineTotalAmt) != 0){
				lineSoriekiPer = lineSorieki /Number(lineTotalAmt);
			}else{
				lineSoriekiPer  =0;
			}
			var lineSoriekiPerLastYear = "";
			if(Number(lineTotalAmtLastYear) != 0){
				lineSoriekiPerLastYear = lineSoriekiLastYear /Number(lineTotalAmtLastYear);
			}else{
				lineSoriekiPerLastYear  =0;
			}
			
			
			//ライン設定
			htmlNoteNew +='<tr>';
			if(getOpption(CONST_LINE)=='Item'){
				itemValArr = searchItemId(rst[i][0]);	
				htmlNoteNew +='<td align="left" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;height:25px;vertical-align:top;">'+defaultEmpty(replacetoxml(itemValArr[0]))+'</td>';
				htmlNoteNew +='<td align="left" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;height:25px;vertical-align:top;">'+defaultEmpty(replacetoxml(itemValArr[1]))+'</td>';
				htmlNoteNew +='<td align="left" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;height:25px;vertical-align:top;">'+defaultEmpty(replacetoxml(itemValArr[2]))+'</td>';
				htmlNoteNew +='<td align="left" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;height:25px;vertical-align:top;">'+defaultEmpty(replacetoxml(itemValArr[3]))+'</td>';
				htmlNoteNew +='<td align="left" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;height:25px;vertical-align:top;">'+defaultEmpty(replacetoxml(itemValArr[4]))+'</td>';
			}else{
				htmlNoteNew +='<td align="left" colspan = "5" style="border-left:none;border-top:1px solid #538DD5;height:25px;vertical-align:top;">'+replacetoxml(rst[i][0])+'</td>';
			}
			
			htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][1],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[1],1),20))+'</td></tr></table></td>';
			htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][2],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[2],1),20))+'</td></tr></table></td>';
			htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][3],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[3],1),20))+'</td></tr></table></td>';
			htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][4],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[4],1),20))+'</td></tr></table></td>';
			htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][5],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[5],1),20))+'</td></tr></table></td>';
			htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][6],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[6],1),20))+'</td></tr></table></td>';
			htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][7],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[7],1),20))+'</td></tr></table></td>';
			htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][8],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[8],1),20))+'</td></tr></table></td>';
			htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][9],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[9],1),20))+'</td></tr></table></td>';
			htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][10],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[10],1),20))+'</td></tr></table></td>';
			htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][11],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[11],1),20))+'</td></tr></table></td>';
			htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;border-right:2px solid #1456A2;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][12],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[12],1),20))+'</td></tr></table></td>';

			
			//数量と金額表示変更
			if(CONST_AMT_OR_COUNT == '2'){
				htmlNoteNew +='<td align="right" style="border-left:2px solid #1456A2;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+setValue(lineTotalCount,11)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(lineTotalCountLastYear,21)+'</td></tr></table></td>';
				htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+setValue(lineTotalAmt,12)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(lineTotalAmtLastYear,22)+'</td></tr></table></td>';
				htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+setValue(lineCost,13)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(lineCostLastYear,23)+'</td></tr></table></td>';
			}else if(CONST_AMT_OR_COUNT == '1'){
				htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+setValue(lineTotalAmt,12)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(lineTotalAmtLastYear,22)+'</td></tr></table></td>';
				htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+setValue(lineSorieki,14)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(lineSoriekiLastYear,24)+'</td></tr></table></td>';
				htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;border-right:none;"><table ><tr><td align="right">'+setValue(lineSoriekiPer,15)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(lineSoriekiPerLastYear,25)+'</td></tr></table></td>';

			}
			
			htmlNoteNew +='</tr>';
			
			
			//CSV出力用
			if(getOpption(CONST_LINE)=='Item'){
				CSV_STRNew+=
					defaultEmpty(replace(itemValArr[0]))+','+
					defaultEmpty(replace(itemValArr[1]))+','+
					defaultEmpty(replace(itemValArr[2]))+','+
					defaultEmpty(replace(itemValArr[3]))+','+
					defaultEmpty(replace(itemValArr[4]))+',';
			}else{
				CSV_STRNew+=
					replace(rst[i][0])+',';
			}
			
			var Group1StrCode;
			var Group1StrName;
			var Group1StrTemp = replace(csvGroup1Text);
			var Group1Str = Group1StrTemp.replace(/\s+/, '\x01').split('\x01');
			
			if(Group1Str.length == 1){
				Group1StrCode = '';
				Group1StrName = Group1Str[0];
			}else{
				if(Group1StrTemp == '- None -'){
					Group1StrCode = '- None -';
					Group1StrName = '- None -';
				}else{
					Group1StrCode = Group1Str[0];
					Group1StrName = Group1Str[1];
				}
			}
		
			CSV_STRNew+=
				Group1StrCode+','+
				Group1StrName+','+
				''+','+
				''+','+
				(CONST_SHAGAIHI == 'T' || CONST_SUB == SUB_NBKK || CONST_SUB == SUB_ULKK ? replace(lineSorieki) : '')+','+
				(lineTotalAmt)+','+
				(CONST_SHAGAIHI == 'T' || CONST_SUB == SUB_NBKK || CONST_SUB == SUB_ULKK ? replace(lineSoriekiLastYear) : '')+','+
				replace(lineTotalAmtLastYear)+','+
				(setValue(rst[i][1],1))+','+
				(setValue(rst[i][2],1))+','+
				(setValue(rst[i][3],1))+','+
				(setValue(rst[i][4],1))+','+
				(setValue(rst[i][5],1))+','+
				(setValue(rst[i][6],1))+','+
				(setValue(rst[i][7],1))+','+
				(setValue(rst[i][8],1))+','+
				(setValue(rst[i][9],1))+','+
				(setValue(rst[i][10],1))+','+
				(setValue(rst[i][11],1))+','+
				(setValue(rst[i][12],1))+','+
				(setValue(lastYearRstLine[1],1))+','+
				(setValue(lastYearRstLine[2],1))+','+
				(setValue(lastYearRstLine[3],1))+','+
				(setValue(lastYearRstLine[4],1))+','+
				(setValue(lastYearRstLine[5],1))+','+
				(setValue(lastYearRstLine[6],1))+','+
				(setValue(lastYearRstLine[7],1))+','+
				(setValue(lastYearRstLine[8],1))+','+
				(setValue(lastYearRstLine[9],1))+','+
				(setValue(lastYearRstLine[10],1))+','+
				(setValue(lastYearRstLine[11],1))+','+
				(setValue(lastYearRstLine[12],1))+'\r\n'
			
			//列の合計
			colTotalMonth1+=setValue(setValue(rst[i][1],1),0);
			colTotalMonth2+=setValue(setValue(rst[i][2],1),0);
			colTotalMonth3+=setValue(setValue(rst[i][3],1),0);
			colTotalMonth4+=setValue(setValue(rst[i][4],1),0);
			colTotalMonth5+=setValue(setValue(rst[i][5],1),0);
			colTotalMonth6+=setValue(setValue(rst[i][6],1),0);
			colTotalMonth7+=setValue(setValue(rst[i][7],1),0);
			colTotalMonth8+=setValue(setValue(rst[i][8],1),0);
			colTotalMonth9+=setValue(setValue(rst[i][9],1),0);
			colTotalMonth10+=setValue(setValue(rst[i][10],1),0);
			colTotalMonth11+=setValue(setValue(rst[i][11],1),0);
			colTotalMonth12+=setValue(setValue(rst[i][12],1),0);
			colTotalCount+=setValue(lineTotalCount,0);
			colTotalAmt+=setValue(lineTotalAmt,0);
			colTotalCost+=setValue(lineCost,0);
			colTotalSorieki+=setValue(lineSorieki,0);
			colTotallineSoriekiPer+=setValue(lineSoriekiPer,0);
			
			colTotalMonth1LastYear+=setValue(setValue(lastYearRstLine[1],1),0);
			colTotalMonth2LastYear+=setValue(setValue(lastYearRstLine[2],1),0);
			colTotalMonth3LastYear+=setValue(setValue(lastYearRstLine[3],1),0);
			colTotalMonth4LastYear+=setValue(setValue(lastYearRstLine[4],1),0);
			colTotalMonth5LastYear+=setValue(setValue(lastYearRstLine[5],1),0);
			colTotalMonth6LastYear+=setValue(setValue(lastYearRstLine[6],1),0);
			colTotalMonth7LastYear+=setValue(setValue(lastYearRstLine[7],1),0);
			colTotalMonth8LastYear+=setValue(setValue(lastYearRstLine[8],1),0);
			colTotalMonth9LastYear+=setValue(setValue(lastYearRstLine[9],1),0);
			colTotalMonth10LastYear+=setValue(setValue(lastYearRstLine[10],1),0);
			colTotalMonth11LastYear+=setValue(setValue(lastYearRstLine[11],1),0);
			colTotalMonth12LastYear+=setValue(setValue(lastYearRstLine[12],1),0);
			colTotalCountLastYear+=setValue(lineTotalCountLastYear,0);
			colTotalAmtLastYear+=setValue(lineTotalAmtLastYear,0);
			colTotalCostLastYear+=setValue(lineCostLastYear,0);
			colTotalSoriekiLastYear+=setValue(lineSoriekiLastYear,0);
			colTotallineSoriekiPerLastYear+=setValue(lineSoriekiPerLastYear,0);
			
		}
		//合計列を設定
		htmlNoteNew +='<tr>';
		htmlNoteNew +='<td  colspan = "5" style="  border-left:none;border-top:2px solid #00255C;border-bottom:2px solid #00255C;height:25px;vertical-align:top;font-size:13px;color:#00255C;">'+getOpption(CONST_GROUP1)+'　　Total：'+csvGroup1Text+'</td>';
		htmlNoteNew +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth1,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth1LastYear,20)+'</td></tr></table></td>';
		htmlNoteNew +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth2,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth2LastYear,20)+'</td></tr></table></td>';
		htmlNoteNew +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth3,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth3LastYear,20)+'</td></tr></table></td>';
		htmlNoteNew +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth4,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth4LastYear,20)+'</td></tr></table></td>';
		htmlNoteNew +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth5,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth5LastYear,20)+'</td></tr></table></td>';
		htmlNoteNew +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth6,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth6LastYear,20)+'</td></tr></table></td>';
		htmlNoteNew +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth7,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth7LastYear,20)+'</td></tr></table></td>';
		htmlNoteNew +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth8,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth8LastYear,20)+'</td></tr></table></td>';
		htmlNoteNew +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth9,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth9LastYear,20)+'</td></tr></table></td>';
		htmlNoteNew +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth10,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth10LastYear,20)+'</td></tr></table></td>';
		htmlNoteNew +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth11,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth11LastYear,20)+'</td></tr></table></td>';
		htmlNoteNew +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;border-right:2px solid #1456A2;" ><table ><tr><td align="right">'+setValue(colTotalMonth12,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth12LastYear,20)+'</td></tr></table></td>';
		
		if(CONST_AMT_OR_COUNT == '2'){
			
			htmlNoteNew +='<td align="right" style="  border-left:2px solid #1456A2;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalCount,11)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalCountLastYear,21)+'</td></tr></table></td>';
			htmlNoteNew +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalAmt,12)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalAmtLastYear,22)+'</td></tr></table></td>';
			htmlNoteNew +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalCost,13)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalCostLastYear,23)+'</td></tr></table></td>';

		}else if(CONST_AMT_OR_COUNT == '1'){
			htmlNoteNew +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalAmt,12)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalAmtLastYear,22)+'</td></tr></table></td>';
			htmlNoteNew +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalSorieki,14)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalSoriekiLastYear,24)+'</td></tr></table></td>';
			htmlNoteNew +='<td align="right" style="  border-right:none;border-left: 1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotallineSoriekiPer/i,15)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotallineSoriekiPerLastYear/i,25)+'</td></tr></table></td>';
		}
		
		
		
		htmlNoteNew +='</tr>';
		
		
		//グループ１列の合計
		colGroup1TotalMonth1+=setValue(colTotalMonth1,0);
		colGroup1TotalMonth2+=setValue(colTotalMonth2,0);
		colGroup1TotalMonth3+=setValue(colTotalMonth3,0);
		colGroup1TotalMonth4+=setValue(colTotalMonth4,0);
		colGroup1TotalMonth5+=setValue(colTotalMonth5,0);
		colGroup1TotalMonth6+=setValue(colTotalMonth6,0);
		colGroup1TotalMonth7+=setValue(colTotalMonth7,0);
		colGroup1TotalMonth8+=setValue(colTotalMonth8,0);
		colGroup1TotalMonth9+=setValue(colTotalMonth9,0);
		colGroup1TotalMonth10+=setValue(colTotalMonth10,0);
		colGroup1TotalMonth11+=setValue(colTotalMonth11,0);
		colGroup1TotalMonth12+=setValue(colTotalMonth12,0);
		colGroup1TotalCount+=setValue(colTotalCount,0);
		colGroup1TotalAmt+=setValue(colTotalAmt,0);
		colGroup1TotalCost+=setValue(colTotalCost,0);
		colGroup1TotalSorieki+=setValue(colTotalSorieki,0);
		colGroup1TotallineSoriekiPer+=setValue(colTotallineSoriekiPer,0);
		
		colGroup1TotalMonth1LastYear+=setValue(colTotalMonth1LastYear,0);
		colGroup1TotalMonth2LastYear+=setValue(colTotalMonth2LastYear,0);
		colGroup1TotalMonth3LastYear+=setValue(colTotalMonth3LastYear,0);
		colGroup1TotalMonth4LastYear+=setValue(colTotalMonth4LastYear,0);
		colGroup1TotalMonth5LastYear+=setValue(colTotalMonth5LastYear,0);
		colGroup1TotalMonth6LastYear+=setValue(colTotalMonth6LastYear,0);
		colGroup1TotalMonth7LastYear+=setValue(colTotalMonth7LastYear,0);
		colGroup1TotalMonth8LastYear+=setValue(colTotalMonth8LastYear,0);
		colGroup1TotalMonth9LastYear+=setValue(colTotalMonth9LastYear,0);
		colGroup1TotalMonth10LastYear+=setValue(colTotalMonth10LastYear,0);
		colGroup1TotalMonth11LastYear+=setValue(colTotalMonth11LastYear,0);
		colGroup1TotalMonth12LastYear+=setValue(colTotalMonth12LastYear,0);
		colGroup1TotalCountLastYear+=setValue(colTotalCountLastYear,0);
		colGroup1TotalAmtLastYear+=setValue(colTotalAmtLastYear,0);
		colGroup1TotalCostLastYear+=setValue(colTotalCostLastYear,0);
		colGroup1TotalSoriekiLastYear+=setValue(colTotalSoriekiLastYear,0);
		colGroup1TotallineSoriekiPerLastYear+=setValue(colTotallineSoriekiPerLastYear,0);
	}
	
	//グループ１の合計列
	htmlNoteNew +='<tr>';
	htmlNoteNew +='<td  colspan = "5" style="border-left:none;border-top:2px solid #00255C;border-bottom:2px solid #00255C;height:25px;vertical-align:top;font-size:13px;color:#00255C;">'+getOpption(CONST_LINE)+'　　Total：</td>';
	htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth1,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth1LastYear,20)+'</td></tr></table></td>';
	htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth2,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth2LastYear,20)+'</td></tr></table></td>';
	htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth3,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth3LastYear,20)+'</td></tr></table></td>';
	htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth4,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth4LastYear,20)+'</td></tr></table></td>';
	htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth5,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth5LastYear,20)+'</td></tr></table></td>';
	htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth6,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth6LastYear,20)+'</td></tr></table></td>';
	htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth7,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth7LastYear,20)+'</td></tr></table></td>';
	htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth8,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth8LastYear,20)+'</td></tr></table></td>';
	htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth9,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth9LastYear,20)+'</td></tr></table></td>';
	htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth10,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth10LastYear,20)+'</td></tr></table></td>';
	htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth11,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth11LastYear,20)+'</td></tr></table></td>';
	htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;border-right:2px solid #1456A2;" ><table ><tr><td align="right">'+setValue(colGroup1TotalMonth12,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalMonth12LastYear,20)+'</td></tr></table></td>';
	

	if(CONST_AMT_OR_COUNT == '2'){
		htmlNoteNew +='<td align="right" style="border-left:2px solid #1456A2;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalCount,11)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalCountLastYear,21)+'</td></tr></table></td>';
		htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalAmt,12)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalAmtLastYear,22)+'</td></tr></table></td>';
		htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalCost,13)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalCostLastYear,23)+'</td></tr></table></td>';

	}else if(CONST_AMT_OR_COUNT == '1'){
		htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalAmt,12)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalAmtLastYear,22)+'</td></tr></table></td>';
		htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotalSorieki,14)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotalSoriekiLastYear,24)+'</td></tr></table></td>';
		htmlNoteNew +='<td align="right" style="border-right: none;border-left: 1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colGroup1TotallineSoriekiPer/i,15)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colGroup1TotallineSoriekiPerLastYear/i,25)+'</td></tr></table></td>';
		
	}
	htmlNoteNew +='</tr>';
	htmlNoteNew+='</table>';
	return htmlNoteNew;

}







//画面を書く ラインのみ
function setPageLineNew(rst,lastYearRst,htmlOrPdfCheckFlog){
	if(isEmpty(rst)){
		return "データがありませんでした。";
	}
	
	var htmlNoteNew='';
	CSV_STRNew = '';

	htmlNoteNew += '<table border="0" cellpadding="0" cellspacing="0" style="width:1020px;border-collapse:collapse;">'; //table e
	htmlNoteNew +='<tr>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='<td style="width:39px">&nbsp;</td>';
	htmlNoteNew +='</tr>';
	
	if(htmlOrPdfCheckFlog == 1){
	htmlNoteNew +='<tr>';
	htmlNoteNew +='<td colspan = "5" align="left" class="font_color" style="color:#00255C;font-size:17px;"><u><strong>'+CONST_SUB_TEXT+'</strong></u></td>';
	htmlNoteNew +='<td colspan = "12" align="center" class="font_color" style="color:#00255C;font-size:18px;vertical-align:top;"><strong>＜＜'+getSalesOrQty()+' Per   '+getOpption(CONST_LINE)+'＞＞</strong></td>';
	htmlNoteNew +='<td colspan = "3" align="right" style="font-size:13px;color:#00255C;vertical-align:top;">'+nlapiDateToString(getSystemTime())+'</td>';
	htmlNoteNew +='</tr>';
	
	//社外秘表示
	if(CONST_SHAGAIHI == 'T'){
		htmlNoteNew +='<tr>';
		htmlNoteNew +='<td colspan = "19" align="center" style="font-weight: bold;color:#696969;font-size:50px;"><b>社外秘</b></td>';
		htmlNoteNew +='</tr>';
		}
	}
	
	htmlNoteNew += '</table>';
	
	
	htmlNoteNew += '<table border="0" cellpadding="0" cellspacing="0" class= "table_main" style="overflow:scroll;margin-left:15px;margin-bottom:15px;width:1020px;border-collapse:collapse;">';	 //table f
	if(htmlOrPdfCheckFlog == 1){
	htmlNoteNew +='<tr >';
	htmlNoteNew +='<td colspan = "17">'+DATE_TEXT+'</td>';
	htmlNoteNew +='<td colspan = "2"  align="right" style="font-size:11px;color:#00255C;min-width:39px">上段 本年</td>';
	htmlNoteNew +='</tr>';
	htmlNoteNew +='<tr >';
	htmlNoteNew +='<td colspan = "17">&nbsp;</td>';
	htmlNoteNew +='<td  colspan = "2"  align="right" style="font-size:11px;color:#00255C;">下段 前年</td>';
	htmlNoteNew +='</tr>';
	
	
	htmlNoteNew +='<tr>';
	htmlNoteNew +='<td colspan = "16" style="height:30px">&nbsp;</td>';
	if(CONST_AMT_OR_COUNT == '2'){
		htmlNoteNew +='<td align="right" style="font-size:11px;color:#00255C;">(単位 個)</td>';
		htmlNoteNew +='<td align="right" style="font-size:11px;color:#00255C;">(千円)</td>';
		htmlNoteNew +='<td align="right" style="font-size:11px;color:#00255C;">(円)</td>';
	}else if(CONST_AMT_OR_COUNT == '1'){
		htmlNoteNew +='<td align="right" style="font-size:11px;color:#00255C;">(千円)</td>';
		htmlNoteNew +='<td align="right" style="font-size:11px;color:#00255C;"></td>';
		htmlNoteNew +='<td align="right" style="font-size:11px;color:#00255C;"></td>';
		
	}
	
	htmlNoteNew +='</tr>';
	
	htmlNoteNew +='<tr>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='<td style="width:39px"></td>';
	htmlNoteNew +='</tr>';
	
	
	htmlNoteNew +='<tr>';
	if(getOpption(CONST_LINE)=="Item"){
		htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:none;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto">Item Code</td>';
		htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto">Product Code</td>';
		htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto">Vendor Name</td>';
		htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto">Display Name</td>';
		htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto">Standard</td>';
	}else{
		htmlNoteNew +='<td align="center" colspan = "5" style="  line-height:93%;font-size:13px;color:#00255C;border-left:none;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto">'+getOpption(CONST_LINE)+'</td>';
	}
	htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">1月</td>';
	htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">2月</td>';
	htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">3月</td>';
	htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">4月</td>';
	htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">5月</td>';
	htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">6月</td>';
	htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">7月</td>';
	htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">8月</td>';
	htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">9月</td>';
	htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">10月</td>';
	htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">11月</td>';
	htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;border-right:2px solid #1456A2;width:39px">12月</td>';
	
	if(CONST_AMT_OR_COUNT == '2'){
		htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-top:1px solid #00255C;border-bottom:2px solid #00255C;border-left:2px solid #1456A2;width:39px">Total</td>'
			htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">Total</td>';
			htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">AvgPrice</td>';
	}else if(CONST_AMT_OR_COUNT == '1'){
		htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:39px">Yearly</td>';
		htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto;min-width:39px">G.P</td>';
		htmlNoteNew +='<td align="center" style="  line-height:93%;font-size:13px;color:#00255C;border-right:none; border-left:1px solid #538DD5;border-top:1px solid #00255C;border-bottom:2px solid #00255C;width:auto">％</td>';
	}
	
	htmlNoteNew +='</tr>';
	}
	
	

	
	var colTotalMonth1 = 0;
	var colTotalMonth2 = 0;
	var colTotalMonth3 = 0;
	var colTotalMonth4 = 0;
	var colTotalMonth5 = 0;
	var colTotalMonth6 = 0;
	var colTotalMonth7 = 0;
	var colTotalMonth8 = 0;
	var colTotalMonth9 = 0;
	var colTotalMonth10 = 0;
	var colTotalMonth11 = 0;
	var colTotalMonth12 = 0;
	var colTotalCount = 0;
	var colTotalAmt = 0;
	var colTotalCost = 0;
	var colTotalSorieki = 0;
	var colTotallineSoriekiPer = 0;
	
	var colTotalMonth1LastYear = 0;
	var colTotalMonth2LastYear = 0;
	var colTotalMonth3LastYear = 0;
	var colTotalMonth4LastYear = 0;
	var colTotalMonth5LastYear = 0;
	var colTotalMonth6LastYear = 0;
	var colTotalMonth7LastYear = 0;
	var colTotalMonth8LastYear = 0;
	var colTotalMonth9LastYear = 0;
	var colTotalMonth10LastYear = 0;
	var colTotalMonth11LastYear = 0;
	var colTotalMonth12LastYear = 0;
	var colTotalCountLastYear = 0;
	var colTotalAmtLastYear = 0;
	var colTotalCostLastYear = 0;
	var colTotalSoriekiLastYear = 0;
	var colTotallineSoriekiPerLastYear = 0;
	for(var i = 0 ; i <rst.length ; i++ ){
			var itemValArr = [];
			var lastYearRstLine = getOldYearDataLine(lastYearRst,rst[i][0]);
			if(rst[i][0] != lastYearRstLine[0]){
				lastYearRstLine = ["",{"count":"","amt":"","line":"","month":"01"},{"count":"","amt":"","line":"","month":"02"},{"count":"","amt":"","line":"","month":"03"},{"count":"","amt":"","line":"","month":"04"},{"count":"","amt":"","line":"","month":"05"},{"count":"","amt":"","line":"","month":"06"},{"count":"","amt":"","line":"","month":"07"},{"count":"","amt":"","line":"","month":"08"},{"count":"","amt":"","line":"","month":"09"},{"count":"","amt":"","line":"","month":"10"},{"count":"","amt":"","line":"","month":"11"},{"count":"","amt":"","line":"","month":"12"}];
			}
			//行金額合計
			var lineTotalAmt = setValue(rst[i][1].amt,0) + setValue(rst[i][2].amt,0) +setValue(rst[i][3].amt,0) +setValue(rst[i][4].amt,0) +setValue(rst[i][5].amt,0) +setValue(rst[i][6].amt,0) +setValue(rst[i][7].amt,0) +setValue(rst[i][8].amt,0) +setValue(rst[i][9].amt,0) +setValue(rst[i][10].amt,0) +setValue(rst[i][11].amt,0) +setValue(rst[i][12].amt,0);
			var lineTotalAmtLastYear =  setValue(lastYearRstLine[1].amt,0) + setValue(lastYearRstLine[2].amt,0) +setValue(lastYearRstLine[3].amt,0) +setValue(lastYearRstLine[4].amt,0) +setValue(lastYearRstLine[5].amt,0) +setValue(lastYearRstLine[6].amt,0) +setValue(lastYearRstLine[7].amt,0) +setValue(lastYearRstLine[8].amt,0) +setValue(lastYearRstLine[9].amt,0) +setValue(lastYearRstLine[10].amt,0) +setValue(lastYearRstLine[11].amt,0) +setValue(lastYearRstLine[12].amt,0);
			
			//行数量合計
			var lineTotalCount = setValue(rst[i][1].count,0) + setValue(rst[i][2].count,0) +setValue(rst[i][3].count,0) +setValue(rst[i][4].count,0) +setValue(rst[i][5].count,0) +setValue(rst[i][6].count,0) +setValue(rst[i][7].count,0) +setValue(rst[i][8].count,0) +setValue(rst[i][9].count,0) +setValue(rst[i][10].count,0) +setValue(rst[i][11].count,0) +setValue(rst[i][12].count,0);
			var lineTotalCountLastYear =  setValue(lastYearRstLine[1].count,0) + setValue(lastYearRstLine[2].count,0) +setValue(lastYearRstLine[3].count,0) +setValue(lastYearRstLine[4].count,0) +setValue(lastYearRstLine[5].count,0) +setValue(lastYearRstLine[6].count,0) +setValue(lastYearRstLine[7].count,0) +setValue(lastYearRstLine[8].count,0) +setValue(lastYearRstLine[9].count,0) +setValue(lastYearRstLine[10].count,0) +setValue(lastYearRstLine[11].count,0) +setValue(lastYearRstLine[12].count,0);
	
			//コスト(データなしの階層でCOSTが””です)
			var lineCost = "";
			for(var c = 12 ; c >= 1 ; c--){
				if(!isEmpty(rst[i][c].cost)){
					lineCost = rst[i][c].cost;
					break;
				}
			}
			var lineCostLastYear = "";
			for(var c = 12 ; c >= 1 ; c--){
				if(!isEmpty(lastYearRstLine[c].cost)){
					lineCostLastYear = lastYearRstLine[c].cost;
					break;
				}
			}
			
			//粗利益
			var lineSorieki = Number(lineTotalAmt) - Number(lineCost);
			var lineSoriekiLastYear = Number(lineTotalAmtLastYear) - Number(lineCostLastYear);
			
			//粗利率
			var lineSoriekiPer = "";
			if(Number(lineTotalAmt) != 0){
				lineSoriekiPer = lineSorieki /Number(lineTotalAmt);
			}else{
				lineSoriekiPer  =0;
			}
			var lineSoriekiPerLastYear = "";
			if(Number(lineTotalAmtLastYear) != 0){
				lineSoriekiPerLastYear = lineSoriekiLastYear /Number(lineTotalAmtLastYear);
			}else{
				lineSoriekiPerLastYear  =0;
			}
			
								
			//ライン設定
			htmlNoteNew +='<tr>';
			if(getOpption(CONST_LINE)=='Item'){
				itemValArr = searchItemId(rst[i][0]);	
				htmlNoteNew +='<td align="left" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;height:25px;vertical-align:top;">'+defaultEmpty(replacetoxml(itemValArr[0]))+'</td>';
				htmlNoteNew +='<td align="left" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;height:25px;vertical-align:top;">'+defaultEmpty(replacetoxml(itemValArr[1]))+'</td>';
				htmlNoteNew +='<td align="left" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;height:25px;vertical-align:top;">'+defaultEmpty(replacetoxml(itemValArr[2]))+'</td>';
				htmlNoteNew +='<td align="left" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;height:25px;vertical-align:top;">'+defaultEmpty(replacetoxml(itemValArr[3]))+'</td>';
				htmlNoteNew +='<td align="left" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;height:25px;vertical-align:top;">'+defaultEmpty(replacetoxml(itemValArr[4]))+'</td>';
			}else{
				htmlNoteNew +='<td align="left" colspan = "5" style="border-left:none;border-top:1px solid #538DD5;height:25px;vertical-align:top;">'+replacetoxml(rst[i][0])+'</td>';
			}
			
			htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][1],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[1],1),20))+'</td></tr></table></td>';
			htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][2],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[2],1),20))+'</td></tr></table></td>';
			htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][3],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[3],1),20))+'</td></tr></table></td>';
			htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][4],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[4],1),20))+'</td></tr></table></td>';
			htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][5],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[5],1),20))+'</td></tr></table></td>';
			htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][6],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[6],1),20))+'</td></tr></table></td>';
			htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][7],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[7],1),20))+'</td></tr></table></td>';
			htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][8],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[8],1),20))+'</td></tr></table></td>';
			htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][9],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[9],1),20))+'</td></tr></table></td>';
			htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][10],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[10],1),20))+'</td></tr></table></td>';
			htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][11],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[11],1),20))+'</td></tr></table></td>';
			htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;border-right:2px solid #1456A2;" ><table ><tr><td align="right">'+replacetoxml(setValue(setValue(rst[i][12],1),10))+'</td></tr><tr><td align="right" style="color:#ff0000;">'+replacetoxml(setValue(setValue(lastYearRstLine[12],1),20))+'</td></tr></table></td>';
			
			//数量と金額表示変更
			if(CONST_AMT_OR_COUNT == '2'){
				htmlNoteNew +='<td align="right" style="border-left:2px solid #1456A2;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+setValue(lineTotalCount,11)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(lineTotalCountLastYear,21)+'</td></tr></table></td>';
				htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+setValue(lineTotalAmt,12)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(lineTotalAmtLastYear,22)+'</td></tr></table></td>';
				htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+setValue(lineCost,13)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(lineCostLastYear,23)+'</td></tr></table></td>';
			}else if(CONST_AMT_OR_COUNT == '1'){
				htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+setValue(lineTotalAmt,12)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(lineTotalAmtLastYear,22)+'</td></tr></table></td>';
				htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;" ><table ><tr><td align="right">'+setValue(lineSorieki,14)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(lineSoriekiLastYear,24)+'</td></tr></table></td>';
				htmlNoteNew +='<td align="right" style="border-left:1px solid #538DD5;border-top:1px solid #538DD5;border-right:none;"><table ><tr><td align="right">'+setValue(lineSoriekiPer,15)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(lineSoriekiPerLastYear,25)+'</td></tr></table></td>';

			}
			htmlNoteNew +='</tr>';
			
			//CSV出力用
			if(getOpption(CONST_LINE)=='Item'){
				CSV_STRNew+=
					defaultEmpty(replace(itemValArr[0]))+','+
					defaultEmpty(replace(itemValArr[1]))+','+
					defaultEmpty(replace(itemValArr[2]))+','+
					defaultEmpty(replace(itemValArr[3]))+','+
					defaultEmpty(replace(itemValArr[4]))+','+
					''+','+
					''+','+
					''+','+
					''+',';
			}else{
				CSV_STRNew+=
					replace(rst[i][0])+','+
				''+','+
				''+','+
				''+','+
				''+','+
				''+','+
				''+','+
				''+',';
			}
			
			CSV_STRNew+=(CONST_SHAGAIHI == 'T' || CONST_SUB == SUB_NBKK || CONST_SUB == SUB_ULKK ? replace(lineSorieki) : '')+','+
				(lineTotalAmt)+','+
				(CONST_SHAGAIHI == 'T' || CONST_SUB == SUB_NBKK || CONST_SUB == SUB_ULKK ? replace(lineSoriekiLastYear) : '')+','+
				replace(lineTotalAmtLastYear)+','+
				(setValue(rst[i][1],1))+','+
				(setValue(rst[i][2],1))+','+
				(setValue(rst[i][3],1))+','+
				(setValue(rst[i][4],1))+','+
				(setValue(rst[i][5],1))+','+
				(setValue(rst[i][6],1))+','+
				(setValue(rst[i][7],1))+','+
				(setValue(rst[i][8],1))+','+
				(setValue(rst[i][9],1))+','+
				(setValue(rst[i][10],1))+','+
				(setValue(rst[i][11],1))+','+
				(setValue(rst[i][12],1))+','+
				(setValue(lastYearRstLine[1],1))+','+
				(setValue(lastYearRstLine[2],1))+','+
				(setValue(lastYearRstLine[3],1))+','+
				(setValue(lastYearRstLine[4],1))+','+
				(setValue(lastYearRstLine[5],1))+','+
				(setValue(lastYearRstLine[6],1))+','+
				(setValue(lastYearRstLine[7],1))+','+
				(setValue(lastYearRstLine[8],1))+','+
				(setValue(lastYearRstLine[9],1))+','+
				(setValue(lastYearRstLine[10],1))+','+
				(setValue(lastYearRstLine[11],1))+','+
				(setValue(lastYearRstLine[12],1))+'\r\n'
				
				
			
			
			//列の合計
			colTotalMonth1+=setValue(setValue(rst[i][1],1),0);
			colTotalMonth2+=setValue(setValue(rst[i][2],1),0);
			colTotalMonth3+=setValue(setValue(rst[i][3],1),0);
			colTotalMonth4+=setValue(setValue(rst[i][4],1),0);
			colTotalMonth5+=setValue(setValue(rst[i][5],1),0);
			colTotalMonth6+=setValue(setValue(rst[i][6],1),0);
			colTotalMonth7+=setValue(setValue(rst[i][7],1),0);
			colTotalMonth8+=setValue(setValue(rst[i][8],1),0);
			colTotalMonth9+=setValue(setValue(rst[i][9],1),0);
			colTotalMonth10+=setValue(setValue(rst[i][10],1),0);
			colTotalMonth11+=setValue(setValue(rst[i][11],1),0);
			colTotalMonth12+=setValue(setValue(rst[i][12],1),0);
			colTotalCount+=setValue(lineTotalCount,0);
			colTotalAmt+=setValue(lineTotalAmt,0);
			colTotalCost+=setValue(lineCost,0);
			colTotalSorieki+=setValue(lineSorieki,0);
			colTotallineSoriekiPer+=setValue(lineSoriekiPer,0);
			
			colTotalMonth1LastYear+=setValue(setValue(lastYearRstLine[1],1),0);
			colTotalMonth2LastYear+=setValue(setValue(lastYearRstLine[2],1),0);
			colTotalMonth3LastYear+=setValue(setValue(lastYearRstLine[3],1),0);
			colTotalMonth4LastYear+=setValue(setValue(lastYearRstLine[4],1),0);
			colTotalMonth5LastYear+=setValue(setValue(lastYearRstLine[5],1),0);
			colTotalMonth6LastYear+=setValue(setValue(lastYearRstLine[6],1),0);
			colTotalMonth7LastYear+=setValue(setValue(lastYearRstLine[7],1),0);
			colTotalMonth8LastYear+=setValue(setValue(lastYearRstLine[8],1),0);
			colTotalMonth9LastYear+=setValue(setValue(lastYearRstLine[9],1),0);
			colTotalMonth10LastYear+=setValue(setValue(lastYearRstLine[10],1),0);
			colTotalMonth11LastYear+=setValue(setValue(lastYearRstLine[11],1),0);
			colTotalMonth12LastYear+=setValue(setValue(lastYearRstLine[12],1),0);
			colTotalCountLastYear+=setValue(lineTotalCountLastYear,0);
			colTotalAmtLastYear+=setValue(lineTotalAmtLastYear,0);
			colTotalCostLastYear+=setValue(lineCostLastYear,0);
			colTotalSoriekiLastYear+=setValue(lineSoriekiLastYear,0);
			colTotallineSoriekiPerLastYear+=setValue(lineSoriekiPerLastYear,0);
			
	}
	//合計列を設定
	htmlNoteNew +='<tr>';
	htmlNoteNew +='<td  colspan = "5" style="  border-left:none;border-top:2px solid #00255C;border-bottom:2px solid #00255C;height:25px;vertical-align:top;font-size:13px;color:#00255C;">'+getOpption(CONST_LINE)+'　　Total：</td>';
	htmlNoteNew +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth1,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth1LastYear,20)+'</td></tr></table></td>';
	htmlNoteNew +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth2,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth2LastYear,20)+'</td></tr></table></td>';
	htmlNoteNew +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth3,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth3LastYear,20)+'</td></tr></table></td>';
	htmlNoteNew +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth4,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth4LastYear,20)+'</td></tr></table></td>';
	htmlNoteNew +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth5,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth5LastYear,20)+'</td></tr></table></td>';
	htmlNoteNew +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth6,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth6LastYear,20)+'</td></tr></table></td>';
	htmlNoteNew +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth7,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth7LastYear,20)+'</td></tr></table></td>';
	htmlNoteNew +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth8,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth8LastYear,20)+'</td></tr></table></td>';
	htmlNoteNew +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth9,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth9LastYear,20)+'</td></tr></table></td>';
	htmlNoteNew +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth10,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth10LastYear,20)+'</td></tr></table></td>';
	htmlNoteNew +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalMonth11,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth11LastYear,20)+'</td></tr></table></td>';
	htmlNoteNew +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;border-right:2px solid #1456A2;" ><table ><tr><td align="right">'+setValue(colTotalMonth12,10)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalMonth12LastYear,20)+'</td></tr></table></td>';
	
	if(CONST_AMT_OR_COUNT == '2'){
		htmlNoteNew +='<td align="right" style="  border-left:2px solid #1456A2;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalCount,11)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalCountLastYear,21)+'</td></tr></table></td>';
		htmlNoteNew +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalAmt,12)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalAmtLastYear,22)+'</td></tr></table></td>';
		htmlNoteNew +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalCost,13)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalCostLastYear,23)+'</td></tr></table></td>';
	}else if(CONST_AMT_OR_COUNT == '1'){
		htmlNoteNew +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalSorieki,14)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalSoriekiLastYear,24)+'</td></tr></table></td>';
		htmlNoteNew +='<td align="right" style="  border-left:1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotalAmt,12)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotalAmtLastYear,22)+'</td></tr></table></td>';
		htmlNoteNew +='<td align="right" style="  border-right:none;border-left: 1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;" ><table ><tr><td align="right">'+setValue(colTotallineSoriekiPer/i,15)+'</td></tr><tr><td align="right" style="color:#ff0000;">'+setValue(colTotallineSoriekiPerLastYear/i,25)+'</td></tr></table></td>';

	}
	htmlNoteNew +='</tr>';
	htmlNoteNew+='</table>';
	return htmlNoteNew;
}
//changed by gneg add end U080 20221124




//HTML内容設定　 0:計算用  1:表示内容判断する     
//AB形式 A: 1今年　2:前年　B  0:月列　1：数量　2:売上金額 3:コスト 4:	粗利益（金額） 5:粗利益（％）
//金額/数量が０場合空白とする
function setValue(str, div) {
	
	var rst = "";
	
	//Number 化
	if(div == 0){
		if(isEmpty(str)){
			rst = 0;
		}else{
			rst = Number(Number(str) <= 0 ? str : str);
		}
		
	}
	
	//表示内容判断する
	if(div == 1){
		if(CONST_AMT_OR_COUNT == '1'){
			//金額場合
			if(isEmpty(str.amt)){
				rst = '';
			}else{
				rst = Number(Number(str.amt) <= 0 ? str.amt : str.amt);
			}
		}else{
			//数量場合
			if(isEmpty(str.count)){
				rst = '';
			}else{
				rst = Number(Number(str.count) <= 0 ? str.count : str.count);
			}
		}
		
	}

	
	//月列 　
	if (div == 10) {
		if(isEmpty(str)){
			return "&nbsp;";
		}
		if(str == '0'){
			return "&nbsp;";
		}
		rst = thousandsWithComa(Math.round(Number(str) <= 0 ? str : str));
	}
	
	//数量 列
	if(div == 11){
		if(str == '0'){
			return "&nbsp;";
		}
		rst = thousandsWithComa(parseInt(Number(str) <= 0 ? str : str));
	}
	
	
	
	//売上金額 列
	if(div == 12){
		if(str == '0'){
			return "&nbsp;";
		}
		if(CONST_SHAGAIHI == 'F' && (CONST_SUB == SUB_SCETI || CONST_SUB == SUB_DPKK)){
			return "&nbsp;";
		}
//		rst = thousandsWithComa(parseInt(Number(str) <= 0 ? str/1000 : str/1000));
		rst = thousandsWithComa(Math.round(Number(str) <= 0 ? str : str));//CH190
	}
	
	//コスト 列
	if(div == 13){
		if(str == '0'){
			return "&nbsp;";
		}
		if(CONST_SHAGAIHI == 'F' && (CONST_SUB == SUB_SCETI || CONST_SUB == SUB_DPKK)){
			return "&nbsp;";
		}
		rst = thousandsWithComa(Math.round(Number(str) <= 0 ? Number(str/1000) : Number(str/1000)));
//		rst = thousandsWithComa(parseInt(Number(str) <= 0 ? str : str));//CH190
	}
	
	//粗利益（金額） 列
	if(div == 14){
		if(str == '0'){
			return "&nbsp;";
		}
		if(CONST_SHAGAIHI == 'F' && (CONST_SUB == SUB_SCETI || CONST_SUB == SUB_DPKK)){
			return "&nbsp;";
		}
//		rst = thousandsWithComa(parseInt(Number(str) <= 0 ? str/1000 : str/1000));
		rst = thousandsWithComa(Math.round(Number(str) <= 0 ? str : str));//CH190
	}
	
	//粗利益（％）列
	if(div == 15){
		if(str == '0'){
			return "&nbsp;";
		}
		if(CONST_SHAGAIHI == 'F' && (CONST_SUB == SUB_SCETI || CONST_SUB == SUB_DPKK)){
			return "&nbsp;";
		}
		rst = Number(str) <= 0 ? Math.floor(str*100) : Math.floor(str*100);
	}
	
	//月列 前年度　
	if(div == 20){	
		if(str == '0'){
			return "&nbsp;";
		}
		if(CONST_LAST_YEAR == 'T'){
			if(isEmpty(str)){
				return "&nbsp;";
			}
			rst = thousandsWithComa(Math.round(Number(str) <= 0 ? str : str));
		}else{
			rst = "&nbsp;";
		}
	}
	
	//数量 列
	if(div == 21){
		if(str == '0'){
			return "&nbsp;";
		}
		if(CONST_LAST_YEAR == 'T'){
			rst = thousandsWithComa(parseInt(Number(str) <= 0 ? str : str));
		}else{
			rst = "";
		}
	}
	
	//売上金額 列 前年度
	if(div == 22){
		
		if(str == '0'){
			return "&nbsp;";
		}
		if(CONST_SHAGAIHI == 'F' && (CONST_SUB == SUB_SCETI || CONST_SUB == SUB_DPKK)){
			return "&nbsp;";
		}
		if(CONST_LAST_YEAR == 'T'){
//			rst = thousandsWithComa(parseInt(Number(str) <= 0 ? str/1000 : str/1000));
			rst = thousandsWithComa(parseInt(Number(str) <= 0 ? str : str));//CH190
		}else{
			rst = "";
		}
	}
	
	//コスト 列 前年度
	if(div == 23){
		if(str == '0'){
			return "&nbsp;";
		}
		if(CONST_SHAGAIHI == 'F' && (CONST_SUB == SUB_SCETI || CONST_SUB == SUB_DPKK)){
			return "&nbsp;";
		}
		if(CONST_LAST_YEAR == 'T'){
//			rst = thousandsWithComa(parseInt(Number(str) <= 0 ? str/1000 : str/1000));
			rst = thousandsWithComa(parseInt(Number(str) <= 0 ? str : str));//CH190
		}else{
			rst = "";
		}
	}
	
	//粗利益（金額） 列 前年度
	if(div == 24){
		if(str == '0'){
			return "&nbsp;";
		}
		if(CONST_SHAGAIHI == 'F' && (CONST_SUB == SUB_SCETI || CONST_SUB == SUB_DPKK)){
			return "&nbsp;";
		}
		if(CONST_LAST_YEAR == 'T'){
//			rst = thousandsWithComa(parseInt(Number(str) <= 0 ? str/1000 : str/1000));
			rst = thousandsWithComa(parseInt(Number(str) <= 0 ? str : str));//CH190
		}else{
			rst = "";
		}
	}
	
	
	//粗利益（％）列 前年度
	if(div == 25){
		if(str == '0'){
			return "&nbsp;";
		}
		if(CONST_SHAGAIHI == 'F' && (CONST_SUB == SUB_SCETI || CONST_SUB == SUB_DPKK)){
			return "&nbsp;";
		}
		if(CONST_LAST_YEAR == 'T'){
			rst = Number(str) <= 0 ? Math.floor(str*100) : Math.floor(str*100);
		}else{
			rst = "";
		}
	}
	
	return rst;
}

//去年のグループ2を取得する。
function getOldYearDataGroup2(arr,group2){
var rst = new Array();

	
	if(isEmpty(arr)){
		return rst;
	}
	
	for(var i = 0 ; i <arr.length; i++){
		if(group2 == arr[i][0]){
			return arr[i];
		}
	}
	return rst;
}

//去年のグループ１を取得する。
function getOldYearDataGroup1(arr,group1){
var rst = new Array();

	
	if(isEmpty(arr)){
		return rst;
	}
	
	for(var i = 0 ; i <arr.length; i++){
		if(group1 == arr[i][0]){
			return arr[i];
		}
	}
	return rst;
}

//去年のラインを取得する。
function getOldYearDataLine(arr,line){
	var rst = new Array();

	
	if(isEmpty(arr)){
		return rst;
	}
	
	for(var i = 0 ; i <arr.length; i++){
		if(line == arr[i][0]){
			return arr[i];
		}
	}
	return rst;
	
}

//対象データ取得する。
function getData(lastYearFlg ,subsidiaryValue,sessionValue,brandValue,employeeValue,itemValue,itemgroupValue,customerValue,customergroupValue,locationValue,deliveryValue,dateFromValue,dateToValue,areaValue,areaSubValue,deliverygroupValue,tantoValue){
	
	var line = CONST_LINE;
	var group1 = CONST_GROUP1;
	var group2 = CONST_GROUP2;
	
	//グループタイプを判断のため、フィールド名を重複しないため追加
	var lineType = CONST_LINE;
	var group1Type = CONST_GROUP1;
	var group2Type = CONST_GROUP2;
	
	//CH191start wang 20230103
//	var lastYear = 0;
	//CH191end

	//条件作成
	var filiter = new Array();
//	filiter.push([["type","anyof","CustInvc"],"AND",["createdfrom","isnotempty","@NONE@"]],"OR",[["type","anyof","CustCred"],"AND",["createdfrom","isnotempty","@NONE@"]]);
	filiter.push([["type","anyof","CustInvc"],"OR",["type","anyof","CustCred"]]);
//	filiter.push([["type","anyof","CustCred"],"AND",["createdfrom","isnotempty","@NONE@"]]);
//	filiter.push([["type","anyof","SalesOrd"],"OR",[["type","anyof","CustInvc"],"AND",["createdfrom","anyof","@NONE@"]]]);
	filiter.push("AND");
	filiter.push(["mainline", "is", "F"]);
	filiter.push("AND");
	filiter.push(["taxline", "is", "F"]);
	filiter.push("AND");
	filiter.push(["line", "isnotempty", ""]);
	//在庫アイテム保存検索条件
	filiter.push("AND");
	filiter.push( ["item.type","anyof","NonInvtPart","InvtPart","Service","Assembly","OthCharge"]);
	//以下はクアトロムでのことである。アセンブリ;サービス;その他の手数データの保存検索条件、必要に応じて修正または削除することができる
//	filiter.push("OR");
//	filiter.push(["item.type","anyof","NonInvtPart"]);
//	filiter.push("OR");
//	filiter.push(["item.type","anyof","Assembly"]); 
//	filiter.push("OR");
//	filiter.push(["item.type","anyof","Service"]);
//	filiter.push("OR");
//	filiter.push(["item.type","anyof","OthCharge"]);
	
	 
	


	
	//F:今年　T：去年
	//開始日と終了日設定
	
	var startDate = dateFromValue;
	var endDate = dateToValue;
	var nowDate = new Date();
	//期間入力していない場合開始日は今年1/1　終了日が12/31
	if(isEmpty(dateFromValue) && isEmpty(dateToValue)){
		if(lastYearFlg == 'F'){
			//今年
			startDate = nowDate.getFullYear() + '/01/01';
			endDate = nowDate.getFullYear() + '/12/31';
		}else{
			//去年
			startDate = nowDate.getFullYear()-1 + '/01/01';
			endDate = nowDate.getFullYear()-1 + '/12/31';
		}
//		lastYear = nowDate.getFullYear()-1;//CH191
	}else if(!isEmpty(dateFromValue) && !isEmpty(dateToValue)){
		//開始日と終了日両方設定場合
		if(lastYearFlg == 'T'){
			//去年で設定する
			startDate = nlapiStringToDate(startDate).getFullYear()-1+'/'+(nlapiStringToDate(startDate).getMonth()+1)+'/'+nlapiStringToDate(startDate).getDate();
			endDate = nlapiStringToDate(endDate).getFullYear()-1+'/'+(nlapiStringToDate(endDate).getMonth()+1)+'/'+nlapiStringToDate(endDate).getDate();
		}
//		lastYear = nlapiStringToDate(startDate).getFullYear()-1;//CH191
	}else{
		//期間Fromが空白場合設定する
		if(isEmpty(dateFromValue)){
//			lastYear = nlapiStringToDate(dateToValue).getFullYear()-1;//CH191
			if(lastYearFlg == 'F'){
				//開始日の年の1/1設定する
				//今年
				startDate = nlapiStringToDate(dateToValue).getFullYear() + '/01/01';
				endDate = dateToValue;
			}else{
				//去年
				startDate = nlapiStringToDate(dateToValue).getFullYear()-1 + '/01/01';
				endDate = nlapiStringToDate(dateToValue).getFullYear()-1+'/'+nlapiStringToDate(dateToValue).getMonth()+1+'/'+nlapiStringToDate(dateToValue).getDate();
			}
			
		}
		
		//期間Toが空白場合設定する
		if(isEmpty(dateToValue)){
//			lastYear = nlapiStringToDate(dateFromValue).getFullYear()-1;//CH191
			if(lastYearFlg == 'F'){
				//終了日の年の12/31設定する
				//今年
				endDate = nlapiStringToDate(dateFromValue).getFullYear() + '/12/31';
				startDate = dateFromValue;
			}else{
				//去年
				endDate= nlapiStringToDate(dateFromValue).getFullYear()-1 + '/12/31';
				 startDate = nlapiStringToDate(dateFromValue).getFullYear()-1+'/'+nlapiStringToDate(dateFromValue).getMonth()+1+'/'+nlapiStringToDate(dateFromValue).getDate();
			}

			
		}
	}
//	nlapiLogExecution('debug', lastYearFlg, startDate+" "+endDate)
	
	startDate = nlapiDateToString(nlapiStringToDate(startDate));
	endDate  =  nlapiDateToString(nlapiStringToDate(endDate));
	filiter.push("AND");
	filiter.push(["trandate","within",startDate,endDate]);


	

	
	
	//連結
	if(!isEmpty(subsidiaryValue)){
		filiter.push("AND");
		filiter.push(["subsidiary", "anyof", subsidiaryValue]);
	}
	
	//セクション
	if(!isEmpty(sessionValue)){
		filiter.push("AND");
		filiter.push(setMSelectParam("department", "anyof", sessionValue));
	}
	
	//ブランド
	if(!isEmpty(brandValue)){
		filiter.push("AND");
		filiter.push(setMSelectParam("item.custitem_djkk_class", "anyof", brandValue));
	}
	

	//担当者
	if(!isEmpty(employeeValue)){
		filiter.push("AND");
		filiter.push(setMSelectParam("salesrep", "anyof", employeeValue));
	}
	if(!isEmpty(tantoValue)){
		filiter.push("AND");
		filiter.push(setMSelectParam("customer.salesrep", "anyof", tantoValue));
	}
	
	//アイテム
	if(!isEmpty(itemValue)){
		filiter.push("AND");
//		filiter.push(["item", "anyof", itemValue]);
		filiter.push(setMSelectParam('item','anyof',itemValue));
		
	}
	
	//アイテムグループ
	if(!isEmpty(itemgroupValue)){
		filiter.push("AND");
		filiter.push(setMSelectParam("item.custitem_djkk_product_group", "anyof", itemgroupValue));
		
	}
	
	//顧客
	if(!isEmpty(customerValue)){
		filiter.push("AND");
		filiter.push(setMSelectParam("entity", "anyof", customerValue));
	}
	
	//顧客グループ
	if(!isEmpty(customergroupValue)){
		if(subsidiaryValue == SUB_SCETI || subsidiaryValue == SUB_DPKK){
			filiter.push("AND");
			filiter.push(setMSelectParam("customer.custentity_djkk_product_category_scetikk", "anyof", customergroupValue));
		}
		if(subsidiaryValue == SUB_NBKK || subsidiaryValue == SUB_ULKK){
			filiter.push("AND");
			filiter.push(setMSelectParam("customer.custentity_djkk_product_category_jp", "anyof", customergroupValue));
		}
		
	}
	
	//場所
	if(!isEmpty(locationValue)){
		filiter.push("AND");
		filiter.push(setMSelectParam("location", "anyof", locationValue));
	}
	
	//納品先
	if(!isEmpty(deliveryValue)){
		filiter.push("AND");
		filiter.push(setMSelectParam("custbody_djkk_delivery_destination", "anyof", deliveryValue));
	}
	
	//テリトリー
	if(!isEmpty(areaValue)){
		filiter.push("AND");
//		filiter.push(setMSelectParam("location.custrecord_djkk_location_area", "anyof", areaValue));
		filiter.push(setMSelectParam("custbody_djkk_delivery_destination.custrecord_djkk_area", "anyof", areaValue));
	}
	//小区分
//	if(CONST_SUB == SUB_NBKK || CONST_SUB == SUB_ULKK ){
	if(!isEmpty(areaSubValue)){
		filiter.push("AND");
		filiter.push(setMSelectParam("custbody_djkk_delivery_destination.custrecord_djkk_area_subdivision", "anyof", areaSubValue));
		}
//	}
	
	//納品先グループ
	if(!isEmpty(deliverygroupValue)){
		filiter.push("AND");
		filiter.push(setMSelectParam("custbody_djkk_delivery_destination.custrecord_djkk_delivery_delivery_group", "anyof", deliverygroupValue));
	}
	

	//結果コラム作成
	var columnArr = new Array();
	columnArr.push(new nlobjSearchColumn("quantity", null, "SUM"));
	columnArr.push(new nlobjSearchColumn("amount", null, "SUM"));

	getColumn(columnArr, group1);
	getColumn(columnArr, group2);
	getColumn(columnArr, line);
//	nlapiLogExecution('DEBUG', 'group1', group1);
//	nlapiLogExecution('DEBUG', 'group2', group2);
//	nlapiLogExecution('DEBUG', 'line', line);

	//月追加
	columnArr.push(new nlobjSearchColumn("formulatext", null, "GROUP").setFormula("TO_CHAR({trandate},'MM')").setSort(false));
	
	//コスト追加
	columnArr.push(new nlobjSearchColumn("formulacurrency",null,"SUM").setFormula("{item.averagecost} * {quantity}"));
	
	//結果を取得する。
	var salesorderSearch= nlapiSearchRecord("transaction", null,filiter,columnArr);
	
 
	
	var getDataRst = new Array();
	var codeArray = [3,7,8,10];//この場合はgetText
	
	//空白場合処理終了
	if(isEmpty(salesorderSearch)){
		return getDataRst;
	}

	//グループ１とグループ２なし場合
	if (group1 == 0 && group2 == 0) {

	    var searchRst = new Array();
	    var lineArr = new Array();
	    for (var i = 0; i < salesorderSearch.length; i++) {
	        var column = salesorderSearch[0].getAllColumns();
	        var json = {};
	        json.count = salesorderSearch[i].getValue(column[0]);
//	        json.amt = ((salesorderSearch[i].getValue(column[1]))/1000).toFixed(3);//CH190
	        json.amt = Number((salesorderSearch[i].getValue(column[1]))/1000);
	        
//	        json.line = salesorderSearch[i].getValue(column[2]);
	        if(codeArray.indexOf(Number(line))!=-1){
	        	json.line = salesorderSearch[i].getText(column[2]);	
	        }else{
	        	json.line = salesorderSearch[i].getValue(column[2]);
	        }
	        if(isEmpty(json.line)){
	        	json.line = '- None -';
//	        	nlapiLogExecution('DEBUG', 'NULL!!!')
	        }
//	        nlapiLogExecution('DEBUG', 'json.line='+i, json.line)
	        json.month = salesorderSearch[i].getValue(column[3]);
	        json.cost = Number((salesorderSearch[i].getValue(column[4]))/1000);//CH190

	        searchRst.push(json);
	        
	        if (lineArr.indexOf(json.line) < 0) {
	            lineArr.push(json.line);
	        }


	    }

	    
	    for (var i = 0; i < lineArr.length; i++) {
	        var detial = findGroup0(searchRst, lineArr[i]);
	        if (detial.length > 0) {
	            getDataRst.push(detial);
	        }
	    }
	}

	//グループ１とグループ２　任意一つなし場合
	if ((group1 == 0 && group2 != 0) || (group1 != 0 && group2 == 0)) {

	    //グループ１種類取得
	    var group1Arr = new Array();
	    var searchRst = new Array();
	    var lineArr = new Array();
	    for (var i = 0; i < salesorderSearch.length; i++) {
	        var column = salesorderSearch[0].getAllColumns();
	        var count = salesorderSearch[i].getValue(column[0]);
	        var amt = salesorderSearch[i].getValue(column[1]);
	        
//	        var group1 = salesorderSearch[i].getValue(column[2]);
//	        var line = salesorderSearch[i].getValue(column[3]);
	        if(codeArray.indexOf(Number(group1Type))!=-1){
	        	var group1 = salesorderSearch[i].getText(column[2]);	
	        }else{
	        	var group1 = salesorderSearch[i].getValue(column[2]);
	        }
	        if(codeArray.indexOf(Number(lineType))!=-1){
	        	var line = salesorderSearch[i].getText(column[3]);	
	        }else{
	        	var line = salesorderSearch[i].getValue(column[3]);
	        }
	        if(isEmpty(group1)){
	        	group1 = '- None -';
	        }
	        if(isEmpty(line)){
	        	line = '- None -';
	        }
	        
	        var month = salesorderSearch[i].getValue(column[4])
	        var cost = salesorderSearch[i].getValue(column[5]);

	        var json = {};
	        json.group1 = group1;
	        json.amt = Number((amt/1000))//.toFixed(3);//CH190;
	        json.count = count;
	        json.line = line;
	        json.month = month;
	        json.cost = Number(cost/1000);//CH190
	        searchRst.push(json);

	        if (group1Arr.indexOf(group1) < 0) {
	            group1Arr.push(group1);
	        }

	        if (lineArr.indexOf(line) < 0) {
	            lineArr.push(line);
	        }
	    }


	    for (var i = 0; i < group1Arr.length; i++) {
	        var rst1 = new Array();
	        for (var j = 0; j < lineArr.length; j++) {
	            var detial = findGroup1(searchRst, group1Arr[i], lineArr[j]);
	            if (detial.length > 0) {
	                if (rst1.indexOf(group1Arr[i]) < 0) {
	                    rst1.push(group1Arr[i]);
	                }
	                rst1.push(detial);
	            }

	        }
	        if (rst1.length > 0) {
	            getDataRst.push(rst1);
	        }

	    }

	}


	//グループ１とグループ２　選択場合
	if (group1 != 0 && group2 != 0) {

	    //グループ１とグループ２種類取得 
	    var searchRst = new Array();
	    var json = new Array();
	    var group1Arr = new Array();
	    var group2Arr = new Array();
	    var lineArr = new Array();
	    for (var i = 0; i < salesorderSearch.length; i++) {
	        var column = salesorderSearch[0].getAllColumns();
	        var count = salesorderSearch[i].getValue(column[0]);
	        var amt = salesorderSearch[i].getValue(column[1]);
	        
//	        var group2 = salesorderSearch[i].getValue(column[2]);
//	        var group1 = salesorderSearch[i].getValue(column[3]);   
//	        var line = salesorderSearch[i].getValue(column[4]);
	        
	        if(codeArray.indexOf(Number(group1Type))!=-1){
	        	var group2 = salesorderSearch[i].getText(column[2]);	
	        }else{
	        	var group2 = salesorderSearch[i].getValue(column[2]);
	        }
	        if(codeArray.indexOf(Number(group2Type))!=-1){
	        	var group1 = salesorderSearch[i].getText(column[3]);	
	        }else{
	        	var group1 = salesorderSearch[i].getValue(column[3]);
	        }
	        if(codeArray.indexOf(Number(lineType))!=-1){
	        	var line = salesorderSearch[i].getText(column[4]);	
	        }else{
	        	var line = salesorderSearch[i].getValue(column[4]);
	        }
	        
	        
	        if(isEmpty(group2)){
	        	group2 = '- None -';
	        }
	        
	        if(isEmpty(group1)){
	        	group1 = '- None -';
	        }
	        if(isEmpty(line)){
	        	line = '- None -';
	        }
	        
	        
	        var month = salesorderSearch[i].getValue(column[5])
	        var cost = salesorderSearch[i].getValue(column[6]);

	        var json = {};
	        json.group2 = group2;
	        json.group1 = group1;
	        json.amt = Number((amt/1000))//.toFixed(3);//CH190;
	        json.count = count;
	        json.line = line;
	        json.month = month;
	        json.cost = Number(cost/1000);//CH190
	        searchRst.push(json);

	        if (group1Arr.indexOf(group1) < 0) {
	            group1Arr.push(group1);
	        }

	        if (group2Arr.indexOf(group2) < 0) {
	            group2Arr.push(group2);
	        }

	        if (lineArr.indexOf(line) < 0) {
	            lineArr.push(line);
	        }
	    }

	    for (var i = 0; i < group1Arr.length; i++) {
	        var rst1 = new Array();
	        for (var j = 0; j < group2Arr.length; j++) {
	            var rst2 = new Array();
	            for (var m = 0; m < lineArr.length; m++) {
	                var detial = findGroup2(searchRst, group1Arr[i], group2Arr[j], lineArr[m]);
	                if (detial.length > 0) {
	                    if (rst2.indexOf(group2Arr[j]) < 0) {
	                        rst2.push(group2Arr[j]);
	                    }
	                    rst2.push(detial);
	                }
	            }

	            if (rst2.length > 0) {
	                if (rst1.indexOf(group1Arr[i]) < 0) {
	                    rst1.push(group1Arr[i]);
	                }
	                rst1.push(rst2)
	            }


	        }
	        if (rst1.length > 0) {
	            getDataRst.push(rst1);
	        }

	    }

	}
//	nlapiLogExecution('DEBUG', 'lastYear', lastYear);
//	getDataRst.push(lastYear);
//	nlapiLogExecution('DEBUG', 'getDataRst.length', getDataRst.length)
//	nlapiLogExecution('DEBUG', 'getDataRst[0]', getDataRst[0])
//	nlapiLogExecution('DEBUG', 'getDataRst[0][0]', getDataRst[0][0])
//	nlapiLogExecution('DEBUG', 'getDataRst[0][1]', getDataRst[0][1])
	return getDataRst;
}

//グループ１、２ライン選択肢追加
function addOpption(field){
	field.addSelectOption("0","");
	field.addSelectOption("1","Customer");
	field.addSelectOption("2","DelvCustomer");
	field.addSelectOption("3","Brand");
	field.addSelectOption("4","Item");
	field.addSelectOption("5","Section");
	field.addSelectOption("6","Warehouse");
	field.addSelectOption("7","Prod.Group");
	field.addSelectOption("8","Cust.Category");
	field.addSelectOption("9","Salesman");
	field.addSelectOption("18","Tanto");
	field.addSelectOption("19","Prod.Group X");
	field.addSelectOption("11","Prod.Group XX");
	field.addSelectOption("12","Prod.Group XXXX");
	field.addSelectOption("13","Cust.Category X");
	field.addSelectOption("14","Cust.Category XX");
	field.addSelectOption("15","Cust.Category XXXX");
	field.addSelectOption("16","Delivery.Area");//CH198
	var currentSub=getRoleSubsidiary();
//	if(currentSub != SUB_SCETI && currentSub != SUB_DPKK ){
	field.addSelectOption("17","Delivery.AreaSub");//CH198
//	}
//20221219 zhou memo:
//	CH201  表示項目のGROUPはX, XX, XXXX（4桁）。
//	before:セールスレポート画面ではX, XX, XXXとなっている。
//  old code:field.addSelectOption("12","Prod.Group XXX");field.addSelectOption("15","Cust.Category XXX");
}

function getSalesOrQty() {
	var rst = "";

	switch (CONST_AMT_OR_COUNT) {
	case '1':
		rst = "Sales"
		break;
	case '2':
		rst = "Qty"
		break;
	}
	return rst;
}

// 選択肢追より、表示名取得する。
//20221219 zhou memo:
//CH201  表示項目のGROUPはX, XX, XXXX（4桁）。
//before:セールスレポート画面ではX, XX, XXXとなっている。
function getOpption(div){
	var rst = "";
	
	switch(div){
	case '1':
		rst = "Customer"
        break;
	case '2':
		rst = "DelvCustomer"
        break;
	case '3':
		rst = "Brand"
        break;
	case '4':
		rst = "Item"
        break;
	case '5':
		rst = "Section"
        break;
	case '6':
		rst = "Warehouse"
        break;
	case '7':
		rst = "Prod.Group"
        break;
	case '8':
		rst = "Cust.Category"
        break;
	case '9':
		rst = "Salesman"
        break;
	case '19':
		rst = "Prod.Group X"
        break;
	case '11':
		rst = "Prod.Group XX"
        break;
	case '12':
		rst = "Prod.Group XXXX"
        break;
	case '13':
		rst = "Cust.Category X"
        break;
	case '14':
		rst = "Cust.Category XX"
        break;
	case '15':
		rst = "Cust.Category XXXX"
        break;
	case '16':
		rst = "Delivery.Area"//CH198
        break;
	case '17':
		rst = "Delivery.AreaSub"//CH198
			break;
	case '18':
		rst = "Tanto"//CH198
			break;
		
	}
	return rst;
}

//グループ１、２ライン条件追加
function getColumn(columnArr, div) {
    switch (div) {
        case '1':
//            columnArr.push(new nlobjSearchColumn("altname", "customer", "GROUP").setSort(false));
//            columnArr.push(new nlobjSearchColumn("formulatext", null, "GROUP").setFormula("CONCAT(CONCAT({customer.entityid}, '・'),{customer.altname})"));//CH192
            columnArr.push(new nlobjSearchColumn("formulatext", null, "GROUP").setFormula("CONCAT(CONCAT({customer.entityid}, ' '),{customer.altname})"));//CH192
            break;
        case '2':
//            columnArr.push(new nlobjSearchColumn("name", "CUSTBODY_DJKK_DELIVERY_DESTINATION", "GROUP").setSort(false));
//        	columnArr.push(new nlobjSearchColumn("formulatext", null, "GROUP").setFormula("CONCAT(CONCAT({CUSTBODY_DJKK_DELIVERY_DESTINATION.custrecord_djkk_delivery_code}, '・'),{CUSTBODY_DJKK_DELIVERY_DESTINATION.custrecorddjkk_name})"));//CH192
        	columnArr.push(new nlobjSearchColumn("formulatext", null, "GROUP").setFormula("CONCAT(CONCAT({CUSTBODY_DJKK_DELIVERY_DESTINATION.custrecord_djkk_delivery_code}, ' '),{CUSTBODY_DJKK_DELIVERY_DESTINATION.custrecorddjkk_name})"));//CH192
            break;
        case '3':
//            columnArr.push(new nlobjSearchColumn("name", "class", "GROUP").setSort(false));
            columnArr.push(new nlobjSearchColumn("custitem_djkk_class", "item", "GROUP").setSort(false));
            break;
        case '4':
            //U777　アイテム場合、PDF表示用変更する
        	//columnArr.push(new nlobjSearchColumn("itemid", "item", "GROUP").setSort(false));
            columnArr.push(new nlobjSearchColumn("custitem_dkjj_item_pdf_show", "item", "GROUP").setSort(false));
            break;
        case '5':
            columnArr.push(new nlobjSearchColumn("name", "department", "GROUP").setSort(false));
            break;
        case '6':
            columnArr.push(new nlobjSearchColumn("namenohierarchy", "location", "GROUP").setSort(false));
            break;
        case '7':
            columnArr.push(new nlobjSearchColumn("custitem_djkk_product_group", "item", "GROUP").setSort(false));
            break;
        case '8':

            //連結より、判断する
        	if(CONST_SUB == SUB_SCETI || CONST_SUB == SUB_DPKK ){
        		columnArr.push(new nlobjSearchColumn("custentity_djkk_product_category_scetikk", "customer", "GROUP").setSort(false));
        	}else if(CONST_SUB == SUB_NBKK || CONST_SUB == SUB_ULKK ){
        		columnArr.push(new nlobjSearchColumn("custentity_djkk_product_category_jp","customer","GROUP").setSort(false));
        	}
            break;
        case '9':
            columnArr.push(new nlobjSearchColumn("entityid", "salesRep", "GROUP").setSort(false));
            break;
        case '19':
            columnArr.push(new nlobjSearchColumn("custitem_djkk_product_group_x", "item", "GROUP").setSort(false));
            break;
        case '11':
            columnArr.push(new nlobjSearchColumn("custitem_djkk_product_group_xx", "item", "GROUP").setSort(false));
            break;
        case '12':
            columnArr.push(new nlobjSearchColumn("custitem_djkk_product_group_xxx", "item", "GROUP").setSort(false));
            break;
        case '13':

            //連結より、判断する
        	if(CONST_SUB == SUB_SCETI || CONST_SUB == SUB_DPKK ){
        		columnArr.push(new nlobjSearchColumn("custentity_djkk_customer_group_ls_x", "customer", "GROUP").setSort(false));
        	}else if(CONST_SUB == SUB_NBKK || CONST_SUB == SUB_ULKK ){
        		columnArr.push(new nlobjSearchColumn("custentity_djkk_customer_group_fd_x","customer","GROUP").setSort(false));
        	}
            break;
        case '14':

            //連結より、判断する
        	if(CONST_SUB == SUB_SCETI || CONST_SUB == SUB_DPKK ){
        		columnArr.push(new nlobjSearchColumn("custentity_djkk_customer_group_ls_xx", "customer", "GROUP").setSort(false));
        	}else if(CONST_SUB == SUB_NBKK || CONST_SUB == SUB_ULKK ){
        		columnArr.push(new nlobjSearchColumn("custentity_djkk_customer_group_fd_xx","customer","GROUP").setSort(false));
        	}
            break;
        case '15':

            //連結より、判断する
        	if(CONST_SUB == SUB_SCETI || CONST_SUB == SUB_DPKK ){
        		columnArr.push(new nlobjSearchColumn("custentity_djkk_customer_group_ls_xxx", "customer", "GROUP").setSort(false));
        	}else if(CONST_SUB == SUB_NBKK || CONST_SUB == SUB_ULKK ){
        		columnArr.push(new nlobjSearchColumn("custentity_djkk_customer_group_fd_xxx","customer","GROUP").setSort(false));
        	}
            break;
        case '16':
            columnArr.push(new nlobjSearchColumn("custrecord_djkk_area_pdf_show", "CUSTBODY_DJKK_DELIVERY_DESTINATION", "GROUP").setSort(false));//CH198
            break;
        case '17':
        	columnArr.push(new nlobjSearchColumn("custrecord_djkk_area_sub_pdf_show", "CUSTBODY_DJKK_DELIVERY_DESTINATION", "GROUP").setSort(false));//CH198
        	break;
        case '18':
        	columnArr.push(new nlobjSearchColumn("custentity_djkk_salesrep_pdf_show", "customer", "GROUP").setSort(false));//CH199
        	break;
    }

}

//グループ１とグループ２なし場合対象組立
function findGroup0(arr, line) {
    var addFlg = false;
    var rst = new Array();
    rst.push(line);

    for (var i = 1; i <= 12; i++) {
        var json = {};
        var month = i < 10 ? '0' + i : '' + i;
        json.month = month;
        json.amt = "";
        json.cost = "";
        rst.push(json)
    }

    for (var i = 0; i < arr.length; i++) {
        if (arr[i].line == line) {
            rst[Number(arr[i].month)] = arr[i]
            addFlg = true;
        }
    }
    if (!addFlg) {
        rst = new Array();
    }
    return rst;
}

//グループ１場合対象組立
function findGroup1(arr, group1, line) {
    var addFlg = false;
    var rst = new Array();
    rst.push(line);

    for (var i = 1; i <= 12; i++) {
        var json = {};
        var month = i < 10 ? '0' + i : '' + i;
        json.month = month;
        json.amt = "";
        json.cost = "";
        rst.push(json)
    }

    for (var i = 0; i < arr.length; i++) {
        if (arr[i].group1 == group1 && arr[i].line == line) {
            rst[Number(arr[i].month)] = arr[i]
            addFlg = true;
        }
    }
    if (!addFlg) {
        rst = new Array();
    }
    return rst;
}

//グループ１とグループ２場合対象組立
function findGroup2(arr, group1, group2, line) {
    var addFlg = false;
    var rst = new Array();
    rst.push(line)

    for (var i = 1; i <= 12; i++) {
        var json = {};
        var month = i < 10 ? '0' + i : '' + i;
        json.month = month;
        json.amt = "";
        json.cost = "";
        rst.push(json)
    }

    for (var i = 0; i < arr.length; i++) {
        if (arr[i].group1 == group1 && arr[i].group2 == group2 && arr[i].line == line) {
            rst[Number(arr[i].month)] = arr[i]
            addFlg = true;
        }
    }
    if (!addFlg) {
        rst = new Array();
    }
    return rst;
}

//CSV出力する
function getCsv(rst,lastYearRst,lastYear){
	
	var strCsv = '';
	
	
//	var lastYear = rst[rst.length-1];
	var thisYear = lastYear+1;
//	nlapiLogExecution('DEBUG', 'thisYear', thisYear);
//	nlapiLogExecution('DEBUG', 'lastYear', lastYear);
	//changed by geng add start U080 20221124
	//changed by wang change start CH191 20220103
	//old  
	//strCsv += 'LINE,GROUP1,GROUP2,MarginYearly,SalesValueYearly,LastMarginYearly,LastSalesValueYearly,01,02,03,04,05,06,07,08,09,10,11,12,01Last,02Last,03Last,04Last,05Last,06Last,07Last,08Last,09Last,10Last,11Last,12Last\r\n';
	//new
	if(getOpption(CONST_LINE)=='Item'){
		strCsv += 'ItemCode,ProductCode,VendorName,DisplayName,Standard,GROUP1Code,GROUP1Name,GROUP2Code,GROUP2Name,MarginYearly,SalesValueYearly,LastMarginYearly,LastSalesValueYearly,',
		strCsv += thisYear + '/01,',
		strCsv += thisYear + '/02,',
		strCsv += thisYear + '/03,',
		strCsv += thisYear + '/04,',
		strCsv += thisYear + '/05,',
		strCsv += thisYear + '/06,',
		strCsv += thisYear + '/07,',
		strCsv += thisYear + '/08,',
		strCsv += thisYear + '/09,',
		strCsv += thisYear + '/10,',
		strCsv += thisYear + '/11,',
		strCsv += thisYear + '/12,',
		strCsv += lastYear + '/01,',
		strCsv += lastYear + '/02,',
		strCsv += lastYear + '/03,',
		strCsv += lastYear + '/04,',
		strCsv += lastYear + '/05,',
		strCsv += lastYear + '/06,',
		strCsv += lastYear + '/07,',
		strCsv += lastYear + '/08,',
		strCsv += lastYear + '/09,',
		strCsv += lastYear + '/10,',
		strCsv += lastYear + '/11,',
		strCsv += lastYear + '/12\r\n';
	}else{
		strCsv += 'LineCode,LineName,GROUP1Code,GROUP1Name,GROUP2Code,GROUP2Name,MarginYearly,SalesValueYearly,LastMarginYearly,LastSalesValueYearly,'
		strCsv += thisYear + '/01,',
		strCsv += thisYear + '/02,',
		strCsv += thisYear + '/03,',
		strCsv += thisYear + '/04,',
		strCsv += thisYear + '/05,',
		strCsv += thisYear + '/06,',
		strCsv += thisYear + '/07,',
		strCsv += thisYear + '/08,',
		strCsv += thisYear + '/09,',
		strCsv += thisYear + '/10,',
		strCsv += thisYear + '/11,',
		strCsv += thisYear + '/12,',
		strCsv += lastYear + '/01,',
		strCsv += lastYear + '/02,',
		strCsv += lastYear + '/03,',
		strCsv += lastYear + '/04,',
		strCsv += lastYear + '/05,',
		strCsv += lastYear + '/06,',
		strCsv += lastYear + '/07,',
		strCsv += lastYear + '/08,',
		strCsv += lastYear + '/09,',
		strCsv += lastYear + '/10,',
		strCsv += lastYear + '/11,',
		strCsv += lastYear + '/12\r\n';
		
		
		
	}
	
	//changed by geng add end U080 20221124
	if(getOpption(CONST_LINE)=='Item'){
		strCsv+=CSV_STRNew
	}else{
		strCsv+=CSV_STR
	}

	
	try{
	    //CH762 20230817 add by zdj start
//		var xlsFile = nlapiCreateFile('セールスレポート' + '_' + getFormatYmdHms() + '.csv', 'CSV', strCsv);
	    var xlsFile = nlapiCreateFile('セールスレポート' + '_' + getDateYymmddFileName() + '.csv', 'CSV', strCsv);
		
	    //20230901 add by CH762 start 
//		xlsFile.setFolder(FILE_CABINET_ID_SALES_REPORT);
	    xlsFile.setFolder(REPORT_ADDRESS);
		//20230901 add by CH762 end 
//		xlsFile.setName('セールスレポート' + '_' + getFormatYmdHms() + '.csv');
		xlsFile.setName('セールスレポート' + '_' + getDateYymmddFileName() + '.csv');
		//CH762 20230817 add by zdj end
		xlsFile.setEncoding('SHIFT_JIS');
	    
		// save file
		var fileID = nlapiSubmitFile(xlsFile);
		var fl = nlapiLoadFile(fileID);
		var url= fl.getURL();
		return url; 
	}
	catch(e){
		nlapiLogExecution('DEBUG', '', e.message)
	}
	
}

//Excelを取得する。
function getExcel(htmlNote){
	
	var str ='<tr><td style="width:39px"></td><td style="width:39px"></td><td style="width:39px"></td><td style="width:39px"></td><td style="width:39px"></td><td style="width:39px"></td><td style="width:39px"></td><td style="width:39px"></td><td style="width:39px"></td><td style="width:39px"></td><td style="width:39px"></td><td style="width:39px"></td><td style="width:39px"></td><td style="width:39px"></td><td style="width:39px"></td><td style="width:39px"></td><td style="width:39px"></td><td style="width:39px"></td><td style="width:39px"></td><td style="width:39px"></td><td style="width:39px"></td><td style="width:39px"></td><td style="width:39px"></td><td style="width:39px"></td><td style="width:39px"></td></tr>';

	htmlNote = htmlNote.replace(str,'');

	
	
	var xmlString = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
    xmlString += '<meta http-equiv="Content-Type" charset=utf-8">';
    xmlString += '<head>';
    xmlString += '<!--[if gte mso 9]>';
    xmlString += '<![endif]-->';
    xmlString += '<style type="text/css">';
    xmlString += ' td.ll { border-left:1px solid gray !important; }';
    xmlString += ' td.lt { border-top:1px solid gray !important; }';
    xmlString += ' td.llt { border-left:1px solid gray !important; border-top:1px solid gray !important; }';
    xmlString += ' .show { display:inline-block; }';
    xmlString += ' table.report { font-family:"HG丸ｺﾞｼｯｸM-PRO";font-size:11pt; }';
    xmlString += '</style>';
    xmlString += '</head>';
    xmlString += '<xml>';
    xmlString += '    <x:ExcelWorkbook>';
    xmlString += '        <x:ExcelWorksheets>';
    xmlString += '            <x:ExcelWorksheet>';
    xmlString += '                <x:Name>セールスレポート</x:Name>';
    xmlString += '                <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>';
    xmlString += '            </x:ExcelWorksheet>';
    xmlString += '        </x:ExcelWorksheets>';
    xmlString += '    </x:ExcelWorkbook>';
    xmlString += '</xml>';
    xmlString += '<body>';
    xmlString+= htmlNote;//.replace(/&nbsp;/g,' ').replace(/&/g,'&amp;');
    xmlString += '</body>';
    xmlString += '</html>';
    
    //CH762 20230817 add by zdj start
    // var xlsFile = nlapiCreateFile('セールスレポート' + '_' + getFormatYmdHms() + '.xls', 'EXCEL', nlapiEncrypt(xmlString, 'base64'));
    var xlsFile = nlapiCreateFile('セールスレポート' + '_' + getDateYymmddFileName() + '.xls', 'EXCEL', nlapiEncrypt(xmlString, 'base64'));
    //CH762 20230817 add by zdj end
	
    //20230901 add by CH762 start 
//	xlsFile.setFolder(FILE_CABINET_ID_SALES_REPORT);
    xlsFile.setFolder(REPORT_ADDRESS);
	//20230901 add by CH762 end 
	//CH762 20230817 add by zdj start
//	xlsFile.setName('セールスレポート' + '_' + getFormatYmdHms() + '.xls');
	xlsFile.setName('セールスレポート' + '_' + getDateYymmddFileName() + '.xls');
	//CH762 20230817 add by zdj end
	xlsFile.setEncoding('SHIFT_JIS');
    
	// save file
	var fileID = nlapiSubmitFile(xlsFile);
	var fl = nlapiLoadFile(fileID);
	var url= fl.getURL();
	return url; 
    
}

//Excelを取得する。
function getPdf(pdfNote,pdfHeadNote){
	var xmlString = '';
	xmlString += '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">';
	xmlString += '<pdf>';
	xmlString += '<head>';
	xmlString += '<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />';
	xmlString += '<#if .locale == "zh_CN">';
	xmlString += '<link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />';
	xmlString += '<#elseif .locale == "zh_TW">';
	xmlString += '<link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />';
	xmlString += '<#elseif .locale == "ja_JP">';
	xmlString += '<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />';
	xmlString += '<#elseif .locale == "ko_KR">';
	xmlString += '<link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />';
	xmlString += '<#elseif .locale == "th_TH">';
	xmlString += '<link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />';
	xmlString += '</#if>';
	xmlString += '    <style type="text/css">* {';
	xmlString += '<#if .locale == "zh_CN">';
	xmlString += 'font-family: NotoSans, NotoSansCJKsc, sans-serif;';
	xmlString +=  '<#elseif .locale == "zh_TW">';
	xmlString +=  'font-family: NotoSans, NotoSansCJKtc, sans-serif;';
	xmlString +=  '<#elseif .locale == "ja_JP">';
	xmlString += 'font-family: NotoSans, heiseimin, sans-serif;';
	xmlString += '<#elseif .locale == "ko_KR">';
	xmlString += 'font-family: NotoSans, NotoSansCJKkr, sans-serif;';
	xmlString += '<#elseif .locale == "th_TH">';
	xmlString += 'font-family: NotoSans, NotoSansThai, sans-serif;';
	xmlString += '<#else>';
	xmlString += 'font-family: NotoSans,heiseimin, sans-serif;';
	xmlString += '</#if>';
	xmlString +=  '}';
	
	//CH193 20230104wang
	xmlString += '<macrolist>';
	xmlString += '<macro id="nlheader">';
	xmlString += '<table style="overflow: hidden; display: table;border-collapse: collapse;">';
//	xmlString += '<tr style="border-bottom:2px solid #6F8CAD;color:#4678d0;font-size:1.3em;margin-bottom:0.8em;">';
//	xmlString += '<td align="right" style="padding: 0em 0em 0em 0em;font-size:16pt;" valign="middle"><span>'+ 'legalname' +'</span></td>';
//	xmlString += '</tr>';
	
	xmlString += pdfHeadNote;
//	xmlString +='<tr>';
//	xmlString +='<td colspan = "4" align="left" class="font_color" style="color:#00255C;font-size:17px;"><u><strong>'+'CONST_SUB_TEXT'+'</strong></u></td>';
//	xmlString +='<td colspan = "11" align="center" class="font_color" style="color:#00255C;font-size:18px;vertical-align:top;"><strong>＜＜'+'getSalesOrQty()'+' Per   '+'getOpption(CONST_LINE)'+'＞＞</strong></td>';
//	xmlString +='<td colspan = "3" align="right" style="font-size:13px;color:#00255C;vertical-align:top;">'+'nlapiDateToString(getSystemTime())'+'</td>';
//	xmlString +='</tr>';
	xmlString += '</table>';
	xmlString += '</macro>';
	xmlString += '</macrolist>';
	
	
	
	
	xmlString += 'table { font-size: 9pt; table-layout: fixed; width: 100%;border-collapse:collapse;border-color:#538DD5; }';
	xmlString += 'th { font-weight: bold; font-size: 8pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #333333; padding-bottom: 10px; padding-top: 10px; }';
	xmlString += 'td {vertical-align:middle; padding: 4px 6px; border-color:#538DD5;font-size:11px;}';
	xmlString += '.font_color{color:#00255C;}';
	xmlString += '.table_main{border:none;}';
	xmlString += 'span{text-align:right!important;}';
	xmlString += 'b { font-weight: bold; color: #333333; }';
	xmlString += '.add_item{border: 1px solid #538DD5;border-bottom:1px solid white;}';
	xmlString += '.add_item_blew{border-right:1px solid #538DD5;border-left: 1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;}';
	xmlString += '.add_item_under_1{border-right: 1px solid #538DD5;border-left: 1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;}';
	xmlString += '.add_item_under_2{border-right: 1px solid #538DD5;border-left: 1px solid #538DD5;border-top:2px solid #00255C;border-bottom:2px solid #00255C;}';
//	xmlString += '.amount-table {width: 100%; border: 0;text-align: right}';
//	xmlString += '.amount-table td {text-align: right}';
	xmlString += '</style>';
	xmlString += '</head>';
	
	//CH193 20230104wang
	if(CONST_SHAGAIHI == 'T'){
		xmlString += '<body header="nlheader" header-height="23%" padding="0.5in 0.1in 0.5in 0.1in" size="A4-LANDSCAPE">';
	}else{
		xmlString += '<body header="nlheader" header-height="14%" padding="0.5in 0.1in 0.5in 0.1in" size="A4-LANDSCAPE">';
	}
	
//	xmlString += '<body padding="0.5in 0.1in 0.5in 0.1in" size="A4-LANDSCAPE">';
//	xmlString +='AAA'
    xmlString += pdfNote;//.replace(/&nbsp;/g,' ').replace(/&/g,'&amp;');
	xmlString += '</body>';
	xmlString += '</pdf>';
	var renderer = nlapiCreateTemplateRenderer();
	renderer.setTemplate(xmlString);
	var xml = renderer.renderToString();
	var xlsFile = nlapiXMLToPDF(xml);
	//CH762 20230817 add by zdj start
//	xlsFile.setName('セールスレポート' + '_' + getFormatYmdHms() + '.pdf');
	xlsFile.setName('セールスレポート' + '_' + getDateYymmddFileName() + '.pdf');
	//CH762 20230817 add by zdj end
	//20230901 add by CH762 start 
//	xlsFile.setFolder(FILE_CABINET_ID_SALES_REPORT);
	xlsFile.setFolder(REPORT_ADDRESS);
	//20230901 add by CH762 end 
	xlsFile.setIsOnline(true);
	
	
	// save file
	var fileID = nlapiSubmitFile(xlsFile);
	var fl = nlapiLoadFile(fileID);
	var url= fl.getURL();
	return url; 
    
}

//選択項目設定する
function setSelectOpption(type,field,subname,name){
	//20230516 changed by zhou start
	var filiter = new Array();
	var columns = new Array();
	filiter.push(["isinactive","is","F"]);
	if(subname != null){
		filiter.push('AND')
		filiter.push([subname, "anyof", CONST_SUB]);	
	}
	columns.push(new nlobjSearchColumn("internalid"));
	columns.push(new nlobjSearchColumn(name));
	var search = getSearchResults(type,null,filiter,columns);
	
	field.addSelectOption('', '');
	for(var i = 0; i<search.length;i++){
		if(type == 'item'){
			var nameValue = search[i].getValue(columns[1]);
//			var itemDisplayArr = nameValue.split('||');
			field.addSelectOption(search[i].getValue(columns[0]),nameValue);
		}else{
			field.addSelectOption(search[i].getValue(columns[0]),search[i].getValue(columns[1]));
		}
	}
	//end
}

//選択項目設定する
function setSelectedAreaOpption(type,field,subname,name){
	
	var filiter = new Array();
	if(subname != null){
		filiter.push([subname, "anyof", areaArray]);	
	}
	
	var search = getSearchResults(type,null,
			filiter, 
			[
			   new nlobjSearchColumn("internalid"), 
			   new nlobjSearchColumn(name)
			]
			);
//	nlapiLogExecution('DEBUG', 'search', search);
	
	field.addSelectOption('', '');
	for(var i = 0; i<search.length;i++){
		field.addSelectOption(search[i].getValue("internalid"),search[i].getValue(name));
	}
}


//複数条件の条件設定
function setMSelectParam(col,cal,value){
	
	var valueArr = value.split('');
	
	var rstArr = new Array();
	rstArr.push(col)
	rstArr.push(cal)
	for(var i = 0 ; i < valueArr.length; i++){
		rstArr.push(valueArr[i])
	}
	
	return rstArr;
}


//changed by geng add start U080 20221124

//csv replace ','
function replace(text){
	if(!isEmpty(text)){
		if (typeof(text)!= "string")
		 text = text.toString() ;
		text = text.replace(/,/g, "_") ;
	}
	return text ;
}
function replacetoxml(text){
	if(!isEmpty(text)){
		if (typeof(text)!= "string"){
			text = text.toString() ;
		}
		if((text.indexOf('&')>0)||(text.indexOf('<')>0)||(text.indexOf('>')>0)||(text.indexOf('"')>0)||(text.indexOf("'")>0)){
				text = text.replace(/&/g, "&amp;") ;
				text = text.replace(/</g, "&lt;") ;
				text = text.replace(/>/g, "&gt;") ;
				text = text.replace(/"/g, "&quot;") ;
				text = text.replace(/'/g, "&apos;") ;
		}
	}
	return text ;
}
//changed by geng add search item  common 
function searchItemId(val){
		var itemSearchArr = new Array();
		if(!isEmpty(val)){
			var itemArr = val.split('||');
			if(itemArr.length == 1){
				var value = itemArr[0].split('_');
				itemSearchArr.push(value[0]);
				itemSearchArr.push(value[1]);
				itemSearchArr.push(value[2]);
				itemSearchArr.push(value[3]);
				itemSearchArr.push(value[4]);
			}else{
				var value = itemArr[1].split('_');
				itemSearchArr.push(value[0]);
				itemSearchArr.push(value[1]);
				itemSearchArr.push(value[2]);
				itemSearchArr.push(value[3]);
				itemSearchArr.push(value[4]);
			}
		}else{
			itemSearchArr.push('');
			itemSearchArr.push('');
			itemSearchArr.push('');
			itemSearchArr.push('');
			itemSearchArr.push('');

		}
		return itemSearchArr;
	}
function defaultEmpty(src){
	return src || '';
}
//changed by geng add end U080 20221124

function getLastYear(dateFromValue,dateToValue){
	var nowDate = new Date();
	if(isEmpty(dateFromValue) && isEmpty(dateToValue)){
		lastYear = nowDate.getFullYear()-1;
	}else if(!isEmpty(dateFromValue) && !isEmpty(dateToValue)){
		lastYear = nlapiStringToDate(dateFromValue).getFullYear()-1;
	}else{
		if(isEmpty(dateFromValue)){
		lastYear = nlapiStringToDate(dateToValue).getFullYear()-1;
	}
		if(isEmpty(dateToValue)){
		lastYear = nlapiStringToDate(dateFromValue).getFullYear()-1;
		}
	}
	return lastYear;
}
