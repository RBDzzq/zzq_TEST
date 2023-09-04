/**
 * DJ_BP����_sl
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
	// request parameter: �A��
	var subsidiaryValue=request.getParameter('subsidiary');
    // request parameter: DJ_�u�����h
    var blandValue = request.getParameter('bland');
    // request parameter: DJ_�d����
    var vendorValue = request.getParameter('vendor');
    // request parameter: DJ_���i�O���[�v
    var productGroupValue = request.getParameter('productGroup');
    // request parameter: DJ_BP
    var bpValue = request.getParameter('bp');
    // request parameter: DJ_�ꏊ�G���A
    var locationValue = request.getParameter('location');
    // request parameter: DJ_�֘AID(��\��)
    var associationIdValue = request.getParameter('associationId');
    // request parameter: selectFlg
    var selectFlg = request.getParameter('selectFlg');   
    
    
    var form = nlapiCreateForm('DJ_BP����_LS',false);
    form.setScript('customscript_djkk_cs_fc_bp_input');
    form.addFieldGroup('custpage_group_filter', '��������');
    form.addButton('btn_make', 'BP���W�X�g�𐶐�', 'createRecord()')
    //attention: no selectFlg.
    // DJ_�A�����쐬
    var subsidiaryField = form.addField('custpage_subsidiary', 'select', 'DJ_�A��', null,'custpage_group_filter');
    subsidiaryField.setMandatory(true);
    var subsidiary = getRoleSubsidiariesAndAddSelectOption(subsidiaryField);
	if(isEmpty(subsidiaryValue)){
		 subsidiaryValue = subsidiary;
	}
	subsidiaryField.setDefaultValue(subsidiaryValue);
	
    // DJ_�u�����h���쐬
    var blandField = form.addField('custpage_bland', 'multiselect', 'DJ_�u�����h', null, 'custpage_group_filter');
    blandField.setDisplaySize(240,15);
    // DJ_�d������쐬
    var vendorField = form.addField('custpage_vendor', 'multiselect', 'DJ_�d����', null, 'custpage_group_filter');
    vendorField.setDisplaySize(240,15);
    // DJ_���i�O���[�v���쐬
    var productGroupField = form.addField('custpage_productgroup', 'multiselect', 'DJ_���i�O���[�v', null, 'custpage_group_filter');
    productGroupField.setDisplaySize(240,13);
    // DJ_BP���쐬
    var bpField = form.addField('custpage_bp', 'multiselect', 'DJ_BP', null, 'custpage_group_filter');
    bpField.setMandatory(true);
    bpField.setDisplaySize(240,18);
    // DJ_�ꏊ�G���A���쐬
    var locationField = form.addField('custpage_location', 'multiselect', 'DJ_�ꏊ�G���A', null, 'custpage_group_filter');
    locationField.setMandatory(true);
   
    // DJ_�A�C�e�����쐬
    var itemField = form.addField('custpage_item', 'multiselect', 'DJ_�A�C�e��', null, 'custpage_group_filter');
    itemField.setMandatory(true);
    itemField.setDisplaySize(240,27);
    // DJ_�֘AID(��\��)���쐬
    var associationIdField = form.addField('custpage_associationid', 'text', 'DJ_�֘AID(��\��)', null, 'custpage_group_filter');
    associationIdField.setDisplayType('hidden');

//    // key���쐬
//    var keyField = form.addField('custpage_key', 'text', 'key', null, 'custpage_group_filter');
//    keyField.setDisplayType('hidden');
    
    //�y�[�W�ɓ���Ɨ͑��֒l������܂�
	//DJ_�ꏊ�G���A&&DJ_�֘AID(��\��)
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
			if(locationAreaSearch[i].getValue("name") == '�֓�'){
				selected = true ; 
			}
			locationField.addSelectOption(locationAreaSearch[i].getValue("internalid"), locationAreaSearch[i].getValue("name"),selected)
		}
	}
	// DJ_�u�����h
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
	// DJ_�d����
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
	//DJ_���i�O���[�v
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
