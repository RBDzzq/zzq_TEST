/**
 * DJ_BP入力_sl
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 Aug 2022     ZHOU
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	nlapiLogExecution('debug','start','start')
	// request parameter: 連結
	var subsidiaryValue=request.getParameter('subsidiary');
    // request parameter: DJ_ブランド
    var blandValue = request.getParameter('bland');
    // request parameter: DJ_仕入先
    var vendorValue = request.getParameter('vendor');
    // request parameter: DJ_製品グループ
    var productGroupValue = request.getParameter('productGroup');
    // request parameter: DJ_BP
    var bpValue = request.getParameter('bp');
    // request parameter: DJ_場所エリア
    var locationValue = request.getParameter('location');
    // request parameter: DJ_関連ID(非表示)
    var associationIdValue = request.getParameter('associationId');
    // request parameter: selectFlg
    var selectFlg = request.getParameter('selectFlg');   
    
    
    var form = nlapiCreateForm('DJ_BP入力_LS',false);
    form.setScript('customscript_djkk_cs_fc_bp_input');
    form.addFieldGroup('custpage_group_filter', '検索項目');
    form.addButton('btn_make', 'BPレジストを生成', 'createRecord()')
    //attention: no selectFlg.
    // DJ_連結を作成
    var subsidiaryField = form.addField('custpage_subsidiary', 'select', 'DJ_連結', null,'custpage_group_filter');
    subsidiaryField.setMandatory(true);
    var subsidiary = getRoleSubsidiariesAndAddSelectOption(subsidiaryField);
	if(isEmpty(subsidiaryValue)){
		 subsidiaryValue = subsidiary;
	}
	subsidiaryField.setDefaultValue(subsidiaryValue);
	
    // DJ_ブランドを作成
    var blandField = form.addField('custpage_bland', 'multiselect', 'DJ_ブランド', null, 'custpage_group_filter');
    blandField.setDisplaySize(240,15);
    // DJ_仕入先を作成
    var vendorField = form.addField('custpage_vendor', 'multiselect', 'DJ_仕入先', null, 'custpage_group_filter');
    vendorField.setDisplaySize(240,15);
    // DJ_製品グループを作成
    var productGroupField = form.addField('custpage_productgroup', 'multiselect', 'DJ_製品グループ', null, 'custpage_group_filter');
    productGroupField.setDisplaySize(240,13);
    // DJ_BPを作成
    var bpField = form.addField('custpage_bp', 'multiselect', 'DJ_BP', null, 'custpage_group_filter');
    bpField.setMandatory(true);
    bpField.setDisplaySize(240,18);
    // DJ_場所エリアを作成
    var locationField = form.addField('custpage_location', 'multiselect', 'DJ_場所エリア', null, 'custpage_group_filter');
    locationField.setMandatory(true);
   
    // DJ_アイテムを作成
    var itemField = form.addField('custpage_item', 'multiselect', 'DJ_アイテム', null, 'custpage_group_filter');
    itemField.setMandatory(true);
    itemField.setDisplaySize(240,27);
    // DJ_関連ID(非表示)を作成
    var associationIdField = form.addField('custpage_associationid', 'text', 'DJ_関連ID(非表示)', null, 'custpage_group_filter');
    associationIdField.setDisplayType('hidden');

//    // keyを作成
//    var keyField = form.addField('custpage_key', 'text', 'key', null, 'custpage_group_filter');
//    keyField.setDisplayType('hidden');
    
    //ページに入ると力相関値が入ります
	//DJ_場所エリア&&DJ_関連ID(非表示)
	nlapiSetFieldValue('custpage_location','');
	var locationAreaSearch = nlapiSearchRecord("customrecord_djkk_location_area",null,
			[
			 	["custrecord_djkk_location_subsidiary","anyof",subsidiary]
			], 
			[
			   new nlobjSearchColumn("name").setSort(false), 
			   new nlobjSearchColumn("scriptid"), 
			   new nlobjSearchColumn("custrecord_djkk_location_subsidiary"), 
			   new nlobjSearchColumn("internalid")
			]
			);
	if(locationAreaSearch != null){
		for(var i = 0 ; i < locationAreaSearch.length ; i++){
			var selected = false ; 
			if(locationAreaSearch[i].getValue("name") == '関東'){
				selected = true ; 
			}
			locationField.addSelectOption(locationAreaSearch[i].getValue("internalid"), locationAreaSearch[i].getValue("name"),selected)
		}
	}
	// DJ_ブランド
	nlapiSetFieldValue('custpage_bland','');
	var blandSearch = nlapiSearchRecord("classification",null,
			[
			   ["subsidiary","anyof",subsidiary]
			], 
			[
			   new nlobjSearchColumn("name").setSort(false), 
			   new nlobjSearchColumn("custrecord_djkk_cs_subsidiary"), 
			   new nlobjSearchColumn("internalid")
			]
			);
	if(blandSearch != null){
		for(var m = 0 ; m < blandSearch.length ; m++){
			blandField.addSelectOption(blandSearch[m].getValue("internalid"), blandSearch[m].getValue("name"),false)
		}
	}
	// DJ_仕入先
	nlapiSetFieldValue('custpage_vendor','');
	var vendorSearch = nlapiSearchRecord("vendor",null,
			[
			   ["msesubsidiary.internalid","anyof",subsidiary]
			], 
			[
			   new nlobjSearchColumn("entityid").setSort(false), 
			   new nlobjSearchColumn("altname"), 
			   new nlobjSearchColumn("internalid")
			]
			);

	if(vendorSearch != null){
		for(var n = 0 ; n < vendorSearch.length ; n++){
			var name =  vendorSearch[n].getValue("entityid") + ' '+vendorSearch[n].getValue("altname")
			vendorField.addSelectOption(vendorSearch[n].getValue("internalid"), name,false)
		}
	}
	// DJ_BP
	nlapiSetFieldValue('custpage_bp','');
	var employeeSearch = nlapiSearchRecord("employee",null,
			[
			], 
			[
			   new nlobjSearchColumn("entityid").setSort(false), 
			   new nlobjSearchColumn("internalid")
			   
			]
			);

	if(employeeSearch != null){
		for(var n = 0 ; n < employeeSearch.length ; n++){
			bpField.addSelectOption(employeeSearch[n].getValue("internalid"), employeeSearch[n].getValue("entityid"),false)
		}
	}
	//DJ_製品グループ
	nlapiSetFieldValue('custpage_productgroup','');
	var productGroupSearch = nlapiSearchRecord("customrecord_djkk_product_group",null,
			[
			   ["custrecord_djkk_pg_subsidiary","anyof",subsidiary]
			], 
			[
			   new nlobjSearchColumn("name").setSort(false), 
			   new nlobjSearchColumn("custrecord_djkk_pg_id"), 
			   new nlobjSearchColumn("internalid")
			]
			);
	if(productGroupSearch != null){
		for(var n = 0 ; n < productGroupSearch.length ; n++){
			productGroupField.addSelectOption(productGroupSearch[n].getValue("internalid"), productGroupSearch[n].getValue("name"),false)
		}
	}
	
    //make form
    response.writePage(form);
}
