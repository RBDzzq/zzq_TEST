/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope Public
 * @NAmdConfig ../Common/myconfig.json
 *
 * DJ_�����ו��X�V�i��́j
 * Version    Date            Author           Remarks
 * 1.00       2021/09/26      RUI.YX           Initial
 *
 */
define(['N/render', 'N/error', 'N/http', 'N/https', 'N/record', 'N/ui/serverWidget','N/runtime', 'N/log', 'N/search', 'N/file', 'N/encode', 'me', 'lib','N/url', '/SuiteScripts/DENISJAPAN/2.0/Common/file_cabinet_common'],
    /**
     * @param {error} error
     * @param {http} http
     * @param {https} https
     * @param {record} record
     * @param {serverWidget} serverWidget
     * @param {runtime} runtime
     * @param {log} log
     * @param {search} search
     * @param {file} file
     * @param {encode} encode
     * @param {me} me
     * @param {lib} lib
     */

		
		
    function(render, error, http, https, record, serverWidget, runtime, log, search, file, encode, me, lib,url, cabinet) {
        const FROM_TITLE = 'DJ_�����ו��X�V(���)';
        const SEARCH_TYPE = 'inboundshipment';
        const SEARCH_ID = 'customsearch_djkk_inboundshipment_repo_2';
        const SEARCH_FILTERS_DEFAULT = ["status","anyof","inTransit","partiallyReceived","toBeShipped"];   // �X�e�[�^�X
        const CLIENT_SCRIPT_FILE = '../Client/djkk_cs_ibs_report.js';
        const OP_SEARCH = 's';        //����:����
        const SAVE_FOLDER_ID = cabinet.fileCabinetId('dj_receipt_update');  // �ۑ��t�H���_�[ID <DJ_�����ו��X�V�i��́j�o��>
        const EXPORT_FILE_NAME = 'DJ_�����ו��X�V(���)_';
        
        var ITEM_LIST ='';
        var LOCATION_LIST ='';
        var NO_LIST ='';
//        var condition_subsidiary_new = '';
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            try {
            	if (scriptContext.request.method == 'POST') {
            		
            		 postcreate(scriptContext);
            		
            		
            	}else{
            		
            		doGet(scriptContext);
            	}
            	
            } catch (e) {
                log.error({title: e.name, details: e.message});
            }
        }

        function doGet(context){
            //Get parameter
            var condition_data = getSearchConditionData(context);
            	 createPage(context, condition_data);
        }
     
        
        function postcreate(context) {
//        	var subId = '6'
        	var subId = context.request.parameters.custpage_subsidiary;//sub
        	var status = context.request.parameters.custpage_status;//status
        	var shippingid = context.request.parameters.custpage_shippingid;//custpage_shippingid
        	var poid = context.request.parameters.custpage_poid;//custpage_poid
        	var activity = context.request.parameters.custpage_activity;//custpage_activity
        	var vendorcode = context.request.parameters.custpage_vendorcode;//custpage_vendorcode
        	var vendorname = context.request.parameters.custpage_vendorname;//custpage_vendorname
        	var itemid = context.request.parameters.custpage_itemid;//custpage_itemid
        	var shopenglish = context.request.parameters.custpage_shopenglish;//custpage_shopenglish
        	var shopjapan = context.request.parameters.custpage_shopjapan;//custpage_shopjapan
        	var vendorshopcode = context.request.parameters.custpage_vendorshopcode;//custpage_vendorshopcode
        	var forwarder = context.request.parameters.custpage_forwarder;//custpage_forwarder
        	var seaair = context.request.parameters.custpage_seaair;//custpage_seaair
        	var customsbroker = context.request.parameters.custpage_customsbroker;//custpage_customsbroker
        	var receiptdate = context.request.parameters.custpage_receiptdate;//custpage_receiptdate
        	var receiptdateEnd = context.request.parameters.custpage_receiptdate_end;//custpage_receiptdate_end
        	var entryperson = context.request.parameters.custpage_entryperson;//custpage_entryperson
        	
        	var lineCount = context.request.getLineCount({
        		group : 'custpage_result_list'
			});
	          var lineDataArray = [];
	          var detailData = [];
        	for(var k=0;k<lineCount;k++){
        		var checkboxFlag = context.request.getSublistValue({
					group : 'custpage_result_list',
					name : 'sub_list_checkbox',
					line : k
				});
        		if(checkboxFlag=='T'){
                  var itemObj = {};
                  // �Z�N�V����
                     itemObj.activity = context.request.getSublistValue({
                    	 group : 'custpage_result_list',
                     	 name : 'sub_list_activity',
                         line: k
                     });
                  // �����ו�ID
                     itemObj.shippingid = context.request.getSublistValue({
                    	 group : 'custpage_result_list',
                    	 name : 'sub_list_shippingid',
                         line: k
                     }); 
                  // ����
                     itemObj.poid = context.request.getSublistValue({
                    	 group : 'custpage_result_list',
                    	 name : 'sub_list_po',
                         line: k
                     }); 
                  // �d����i�R�[�h�j
                     itemObj.suppliercode = context.request.getSublistValue({
                    	 group : 'custpage_result_list',
                    	 name : 'sub_list_suppliercode',
                         line: k
                     });
                  // �d����(���O)
                     itemObj.suppliername = context.request.getSublistValue({
                    	 group : 'custpage_result_list',
                    	 name : 'sub_list_suppliername',
                         line: k
                     });
                  //�X�e�[�^�X
                     itemObj.status = context.request.getSublistValue({
                    	 group : 'custpage_result_list',
                    	 name : 'sub_list_status',
                         line: k
                     });
                     //�A�C�e��ID
                     itemObj.itemid = context.request.getSublistValue({
                    	 group : 'custpage_result_list',
                    	 name : 'sub_list_itemid',
                         line: k
                     });
                   //���i���iEnglish�j
                     itemObj.itemenglish = context.request.getSublistValue({
                    	 group : 'custpage_result_list',
                    	 name : 'sub_list_itemenglish',
                         line: k
                     });
                     //���i���i���{��j
                     itemObj.itemjapan = context.request.getSublistValue({
                    	 group : 'custpage_result_list',
                    	 name : 'sub_list_itemjapan',
                         line: k
                     });
                     //�d���揤�i�R�[�h
                     itemObj.vendoritemcode = context.request.getSublistValue({
                    	 group : 'custpage_result_list',
                    	 name : 'sub_list_vendoritemcode',
                         line: k
                     });
                     //�C���R�^�[��
                     itemObj.incoterms = context.request.getSublistValue({
                    	 group : 'custpage_result_list',
                    	 name : 'sub_list_incoterms',
                         line: k
                     });
                     //�C���R�^�[���ꏊ
                     itemObj.incotermslocation = context.request.getSublistValue({
                    	 group : 'custpage_result_list',
                    	 name : 'sub_list_incotermslocation',
                         line: k
                     });
                     //�ړI�n
                     itemObj.finaldestination = context.request.getSublistValue({
                    	 group : 'custpage_result_list',
                    	 name : 'sub_list_finaldestination',
                         line: k
                     });
                     
                     //�t�H�[���[�_�[
                     itemObj.forwarder = context.request.getSublistValue({
                    	 group : 'custpage_result_list',
                    	 name : 'sub_list_forwarder',
                         line: k
                     });
                     //�t�H�[���[�_�[
                     itemObj.customsbroker = context.request.getSublistValue({
                    	 group : 'custpage_result_list',
                    	 name : 'sub_list_customsbroker',
                         line: k
                     });
                   //�z�����@
                     itemObj.shipvia = context.request.getSublistValue({
                    	 group : 'custpage_result_list',
                    	 name : 'sub_list_shipvia',
                         line: k
                     });
                     //SEA�EAIR
                     itemObj.seaair = context.request.getSublistValue({
                    	 group : 'custpage_result_list',
                    	 name : 'sub_list_seaair',
                         line: k
                     });
                     //��̗\���
                     itemObj.receiptdate = context.request.getSublistValue({
                    	 group : 'custpage_result_list',
                    	 name : 'sub_list_receiptdate',
                         line: k
                     });
                     //�o�����{��
                     itemObj.shippeddate = context.request.getSublistValue({
                    	 group : 'custpage_result_list',
                    	 name : 'sub_list_shippeddate',
                         line: k
                     });
                     
                     //�������{��
                     itemObj.arriveddate = context.request.getSublistValue({
                    	 group : 'custpage_result_list',
                    	 name : 'sub_list_arriveddate',
                         line: k
                     });
                     //B/L No
                     itemObj.blnum = context.request.getSublistValue({
                    	 group : 'custpage_result_list',
                    	 name : 'sub_list_blnum',
                         line: k
                     });
                   //Vessel Name
                     itemObj.vesselname = context.request.getSublistValue({
                    	 group : 'custpage_result_list',
                    	 name : 'sub_list_vesselname',
                         line: k
                     });
                   //Container No
                     itemObj.container = context.request.getSublistValue({
                    	 group : 'custpage_result_list',
                    	 name : 'sub_list_container',
                         line: k
                     });
                   //Seal No
                     itemObj.sealno = context.request.getSublistValue({
                    	 group : 'custpage_result_list',
                    	 name : 'sub_list_sealno',
                         line: k
                     });
                   //MAWB No
                     itemObj.mawbno = context.request.getSublistValue({
                    	 group : 'custpage_result_list',
                    	 name : 'sub_list_mawbno',
                         line: k
                     });
                   //HAWB No
                     itemObj.hawbno = context.request.getSublistValue({
                    	 group : 'custpage_result_list',
                    	 name : 'sub_list_hawbno',
                         line: k
                     });
                   //Flight No
                     itemObj.flightno = context.request.getSublistValue({
                    	 group : 'custpage_result_list',
                     	 name : 'sub_list_flightno',
                         line: k
                     });
                     
                     //Entry Person
                     itemObj.entryperson = context.request.getSublistValue({
                    	 group : 'custpage_result_list',
                     	 name : 'sub_list_entryperson',
                         line: k
                     });                                     
  
 
                     var item = [];
                     item.push(replace(convertToDispay(itemObj.activity)));
                     item.push(replace(convertToDispay(itemObj.shippingid)));
                     item.push(replace(convertToDispay(itemObj.poid)));
                     item.push(replace(convertToDispay(itemObj.suppliercode)));
                     item.push(replace(convertToDispay(itemObj.suppliername)));
                     item.push(replace(convertToDispay(itemObj.status)));
                     item.push(replace(convertToDispay(itemObj.itemid)));
                     item.push(replace(convertToDispay(itemObj.itemenglish)));
                     item.push(replace(convertToDispay(itemObj.itemjapan)));
                     item.push(replace(convertToDispay(itemObj.vendoritemcode)));
                     item.push(replace(convertToDispay(itemObj.incoterms)));
                     item.push(replace(convertToDispay(itemObj.incotermslocation)));
                     item.push(replace(convertToDispay(itemObj.finaldestination)));
                     item.push(replace(convertToDispay(itemObj.forwarder)));
                     item.push(replace(convertToDispay(itemObj.customsbroker)));
                     item.push(replace(convertToDispay(itemObj.shipvia)));
                     item.push(replace(convertToDispay(itemObj.seaair)));
                     item.push(replace(convertToDispay(itemObj.receiptdate)));
                     item.push(replace(convertToDispay(itemObj.shippeddate)));
                     item.push(replace(convertToDispay(itemObj.arriveddate)));
                     item.push(replace(convertToDispay(itemObj.blnum)));
                     item.push(replace(convertToDispay(itemObj.vesselname)));
                     item.push(replace(convertToDispay(itemObj.container)));
                     item.push(replace(convertToDispay(itemObj.sealno)));
                     item.push(replace(convertToDispay(itemObj.mawbno)));
                     item.push(replace(convertToDispay(itemObj.hawbno)));
                     item.push(replace(convertToDispay(itemObj.flightno)));
                     item.push(replace(convertToDispay(itemObj.entryperson)));
 
                     lineDataArray.push(item);
                    
        		}
             } //for end
        	
             var headArray = [];
             headArray.push('�Z�N�V����');
             //headArray.push('�����ו�ID ');
             headArray.push('�����ԍ�');//changeByWang 22/11/19
             headArray.push('����');
             headArray.push('�d����(�R�[�h)');
             headArray.push('�d����(���O)');
             headArray.push('�X�e�[�^�X');
             headArray.push('�A�C�e��ID');
             headArray.push('���i��(ENGLISH)');
             headArray.push('���i��(���{��)');
             headArray.push('�d���揤�i�R�[�h ');
             headArray.push('�C���R�^�[��');
             headArray.push('�C���R�^�[���ꏊ');
             headArray.push('�ړI�n');
             headArray.push('�t�H�[���[�_�[ ');
             headArray.push('�ʊ֋Ǝ�');
             headArray.push('�z�����@');
             headArray.push('SEA�EAIR');
             headArray.push('��̗\���');
             headArray.push('�o�����{��');
             headArray.push('�������{��');
             headArray.push('B/L NO');
             headArray.push('VESSEL NAME');
             headArray.push('CONTAINER NO');
             headArray.push('SEAL NO');
             headArray.push('MAWB NO');
             headArray.push('HAWB NO');
             headArray.push('FLIGHT NO');
             headArray.push('ENTRY PERSON');
 
             var script = runtime.getCurrentScript();
 
             var createDate = getJapanDate();
             var strCreateDate = dateToStr(createDate);
             var strCDateYmd = strCreateDate.substring(0, 8);
             var subFileName = EXPORT_FILE_NAME + strCDateYmd;
             var resultNum = getMaxFileName(SAVE_FOLDER_ID, subFileName);
             if (!resultNum) {
                 resultNum = 1;
             } else {
                 resultNum = parseInt(resultNum) + 1;
             }
 
             var fileName = subFileName + zeropad(resultNum, 4);
             var csvFileName = fileName + ".csv";
             var excelFileName = fileName + ".pdf";
 
            
//             //CSV�t�@�C�����쐬
             var csvFileId = createCsvFile(lineDataArray, headArray, csvFileName, SAVE_FOLDER_ID);
 
             //PDF�t�@�C�����쐬
             var pdfFileId =  createPDFFile(context, lineDataArray, headArray, excelFileName, SAVE_FOLDER_ID,subId);
        	
        	 var formnew = serverWidget.createForm({
                 title: 'DJ_�����ו��X�V(���)'
             });
         
           var pdfFileInfo = file.load({id:pdfFileId});
           var csvFileInfo = file.load({id:csvFileId});
           var search_rank_over = 'search_condition_over';
           formnew.addFieldGroup({
               id: 'search_condition_over',
               label: '���s����'
           });
           formnew.addButton({
           id: 'btn_csv',
           label: 'CSV�o��',
           functionName: 'btnCSVButton("'+csvFileInfo.url+'");'
       });
           formnew.addButton({
               id: 'btn_csv',
               label: 'PDF�o��',
               functionName: 'btnPDFButton("' + pdfFileInfo.url +'");'
           });
           formnew.addButton({
               id: 'btn_search_return',
               label: '���s�ɖ߂�',
               functionName: 'btnOverButton();'
           });
           
           
           var custpage_subsidiary_over = formnew.addField({
               id: 'custpage_subsidiary_over',
               label: '�A��',
               type: serverWidget.FieldType.TEXT,
               container: search_rank_over
           });
           custpage_subsidiary_over.updateDisplayType({
               displayType: serverWidget.FieldDisplayType.HIDDEN
           });
           var custpage_status_over = formnew.addField({
               id: 'custpage_status_over',
               label: '�X�e�[�^�X',
               type: serverWidget.FieldType.TEXT,
               container: search_rank_over
           });
           custpage_status_over.updateDisplayType({
               displayType: serverWidget.FieldDisplayType.HIDDEN
           });
           var custpage_shippingid_over = formnew.addField({
               id: 'custpage_shippingid_over',
//               label: '�����ו�ID',
               label: '�����ԍ�',//changeByWang 22/11/19
               type: serverWidget.FieldType.TEXT,
               container: search_rank_over
           });
           custpage_shippingid_over.updateDisplayType({
               displayType: serverWidget.FieldDisplayType.HIDDEN
           });
           var custpage_poid_over = formnew.addField({
               id: 'custpage_poid_over',
               label: '����',
               type: serverWidget.FieldType.TEXT,
               container: search_rank_over
           });
           custpage_poid_over.updateDisplayType({
               displayType: serverWidget.FieldDisplayType.HIDDEN
           });
           var custpage_activity_over = formnew.addField({
               id: 'custpage_activity_over',
               label: '�Z�N�V����',
               type: serverWidget.FieldType.TEXT,
               container: search_rank_over
           });
           custpage_activity_over.updateDisplayType({
               displayType: serverWidget.FieldDisplayType.HIDDEN
           });
           var custpage_vendorcode_over = formnew.addField({
               id: 'custpage_vendorcode_over',
               label: '�d����(�R�[�h)',
               type: serverWidget.FieldType.TEXT,
               container: search_rank_over
           });
           custpage_vendorcode_over.updateDisplayType({
               displayType: serverWidget.FieldDisplayType.HIDDEN
           });
           var custpage_vendorname_over = formnew.addField({
               id: 'custpage_vendorname_over',
               label: '�d����(���O)',
               type: serverWidget.FieldType.TEXT,
               container: search_rank_over
           });
           custpage_vendorname_over.updateDisplayType({
               displayType: serverWidget.FieldDisplayType.HIDDEN
           });
           var custpage_itemid_over = formnew.addField({
               id: 'custpage_itemid_over',
               label: '�A�C�e��ID',
               type: serverWidget.FieldType.TEXT,
               container: search_rank_over
           });
           custpage_itemid_over.updateDisplayType({
               displayType: serverWidget.FieldDisplayType.HIDDEN
           });
           var custpage_shopenglish_over = formnew.addField({
               id: 'custpage_shopenglish_over',
               label: '���i��(ENGLISH)',
               type: serverWidget.FieldType.TEXT,
               container: search_rank_over
           });
           custpage_shopenglish_over.updateDisplayType({
               displayType: serverWidget.FieldDisplayType.HIDDEN
           });
           var custpage_shopjapan_over = formnew.addField({
               id: 'custpage_shopjapan_over',
               label: '���i��(���{��)',
               type: serverWidget.FieldType.TEXT,
               container: search_rank_over
           });
           custpage_shopjapan_over.updateDisplayType({
               displayType: serverWidget.FieldDisplayType.HIDDEN
           });
           var custpage_vendorshopcode_over = formnew.addField({
               id: 'custpage_vendorshopcode_over',
               label: '�d���揤�i�R�[�h',
               type: serverWidget.FieldType.TEXT,
               container: search_rank_over
           });
           custpage_vendorshopcode_over.updateDisplayType({
               displayType: serverWidget.FieldDisplayType.HIDDEN
           });
           var custpage_forwarder_over = formnew.addField({
               id: 'custpage_forwarder_over',
               label: '�t�H�[���[�_�[',
               type: serverWidget.FieldType.TEXT,
               container: search_rank_over
           });
           custpage_forwarder_over.updateDisplayType({
               displayType: serverWidget.FieldDisplayType.HIDDEN
           });
           var custpage_seaair_over = formnew.addField({
               id: 'custpage_seaair_over',
               label: 'SEA�EAIR',
               type: serverWidget.FieldType.TEXT,
               container: search_rank_over
           });
           custpage_seaair_over.updateDisplayType({
               displayType: serverWidget.FieldDisplayType.HIDDEN
           });
           var custpage_customsbroker_over = formnew.addField({
               id: 'custpage_customsbroker_over',
               label: '�ʊ֋Ǝ�(�f�t�H���g�z����̈���)',
               type: serverWidget.FieldType.TEXT,
               container: search_rank_over
           });
           custpage_customsbroker_over.updateDisplayType({
               displayType: serverWidget.FieldDisplayType.HIDDEN
           });
           var custpage_receiptdate_over = formnew.addField({
               id: 'custpage_receiptdate_over',
               label: '��̗\��� FROM',
               type: serverWidget.FieldType.TEXT,
               container: search_rank_over
           });
           custpage_receiptdate_over.updateDisplayType({
               displayType: serverWidget.FieldDisplayType.HIDDEN
           });
           var custpage_receiptdate_end_over = formnew.addField({
               id: 'custpage_receiptdate_end_over',
               label: '��̗\���TO',
               type: serverWidget.FieldType.TEXT,
               container: search_rank_over
           });
           custpage_receiptdate_end_over.updateDisplayType({
               displayType: serverWidget.FieldDisplayType.HIDDEN
           });
           var custpage_entryperson_over = formnew.addField({
               id: 'custpage_entryperson_over',
               label: '���͎�',
               type: serverWidget.FieldType.TEXT,
               container: search_rank_over
           });
           custpage_entryperson_over.updateDisplayType({
               displayType: serverWidget.FieldDisplayType.HIDDEN
           });
           custpage_subsidiary_over.defaultValue = subId;
           custpage_status_over.defaultValue = status;
           custpage_shippingid_over.defaultValue = shippingid;
           custpage_poid_over.defaultValue = poid;
           custpage_activity_over.defaultValue = activity;
           custpage_vendorcode_over.defaultValue = vendorcode;
           custpage_vendorname_over.defaultValue = vendorname;
           custpage_itemid_over.defaultValue = itemid;
           custpage_shopenglish_over.defaultValue = shopenglish;
           custpage_shopjapan_over.defaultValue = shopjapan;
           custpage_vendorshopcode_over.defaultValue = vendorshopcode;
           custpage_forwarder_over.defaultValue = forwarder;
           custpage_seaair_over.defaultValue  = seaair;
           custpage_customsbroker_over.defaultValue  = customsbroker;
           custpage_receiptdate_over.defaultValue  = receiptdate;
	       custpage_receiptdate_end_over.defaultValue=receiptdateEnd;
	       custpage_entryperson_over.defaultValue=entryperson;
	       
	       
	       
            formnew.clientScriptModulePath = CLIENT_SCRIPT_FILE;
            context.response.writePage(formnew);
        	 
        }
        
        
        function createPage(context, condition_data) {
        	
        	
            var form = serverWidget.createForm({
                title: FROM_TITLE
            });
            
            
            //���������G���A
            buildFormCondition(context, form, condition_data);

            //��������
            var detailList = buildFormDetail(context,form,condition_data);
            
            
            

            //�@����:�������̏ꍇ
            if (condition_data.op == '') {
                form.addButton({
                    id: 'btn_clear',
                    label: '����',
                    functionName: 'btnSearchButton();'
                });
                form.addButton({
                    id: 'btn_clear',
                    label: '�N���A',
                    functionName: 'btnClearButton();'
                });
            }

//             ����:���������̏ꍇ
            if (condition_data.op == OP_SEARCH) {

            	
                form.addButton({
                    id: 'btn_back',
                    label: '�����ɖ߂�',
                    functionName: 'btnBackButton();'
                });
                if(detailList.lineCount>0){ 
                	form.addSubmitButton({
                    	label:'���s'
                    })
                }
                

            }
            form.clientScriptModulePath = CLIENT_SCRIPT_FILE;
            context.response.writePage(form);

        }

        

        /**
         * ���������̎擾(GET)
         *
         * @param context
         * @returns {{}}
         */
        function getSearchConditionData(context) {
            var split_mark = ',';
            var condition_data = {};

//            //����
            condition_data.op = getParamValue(context.request.parameters.op);
            //�A��
            condition_data.subsidiary = getParamValue(context.request.parameters.subsidiary);
            condition_subsidiary_new=condition_data.subsidiary;
            condition_data.entryperson = getParamValue(context.request.parameters.entryperson);
            condition_data.customsbroker = getParamValue(context.request.parameters.customsbroker);
            condition_data.receiptdate = getParamValue(context.request.parameters.receiptdate);
            condition_data.receiptdateEnd = getParamValue(context.request.parameters.receiptdateend);
            
            condition_data.seaair = getParamValue(context.request.parameters.seaair);
            condition_data.forwarder = getParamValue(context.request.parameters.forwarder);
            condition_data.vendorshopcode = getParamValue(context.request.parameters.vendorshopcode);
            condition_data.shopjapan = getParamValue(context.request.parameters.shopjapan);
            condition_data.shopenglish = getParamValue(context.request.parameters.shopenglish);
            condition_data.vendorname = getParamValue(context.request.parameters.vendorname);
            condition_data.vendorcode = getParamValue(context.request.parameters.vendorcode);
            condition_data.itemid = getParamValue(context.request.parameters.itemid);
            condition_data.activity = getParamValue(context.request.parameters.activity);
            condition_data.poid = getParamValue(context.request.parameters.poid);
            condition_data.shippingid = getParamValue(context.request.parameters.shippingid);
            condition_data.status = getParamValue(context.request.parameters.status);
            condition_data.statusText = getParamValue(context.request.parameters.statusText);
            condition_data.pdf = getParamValue(context.request.parameters.pdf);
            return condition_data;
        }

        /**
         * ���������̎擾(POST)
         *
         * @param context
         * @returns {{}}
         */
//        function getSearchConditionDataForPost(context) {
//            var split_mark = ',';
//            var condition_data = {};
//
//            //��̏ꏊ
//            condition_data.recLocation = getParamValue(context.request.parameters.hidden_reclocation).split(split_mark);
//           // log.debug({title:"condition_data.recLocation",details:condition_data.recLocation});
//            //�o�הԍ�
//            condition_data.shipNo = getParamValue(context.request.parameters.hidden_shipno).split(split_mark);
//
//            return condition_data;
//        }

        /**
         * ���������G���A�\�z
         *
         * @param context
         * @param form
         * @param condition_data
         */
        function buildFormCondition(context, form, condition_data) {
        
        	
            var search_rank_id = 'search_condition_rank';
            form.addFieldGroup({
                id: 'search_condition_rank',
                label: '��������'
            });
            
            //�A��
            var custpage_subsidiary = form.addField({
                id: 'custpage_subsidiary',
                label: '�A��',
                type: serverWidget.FieldType.SELECT,
                container: search_rank_id
//                ,source: 'subsidiary'
            });
            var defaultSubsidiary = getRoleSubsidiariesAndAddSelectOption(custpage_subsidiary);
//         	 if(me.isEmpty(condition_subsidiary_new)){
//         		 condition_subsidiary_new = selectSub;
//         	 }
           
           
            
            //�X�e�[�^�X
            var custpage_status = form.addField({
                id: 'custpage_status',
                label: '�X�e�[�^�X',
                type: serverWidget.FieldType.SELECT,
                container: search_rank_id
            });
            custpage_status.addSelectOption({ value: '',text: '',isSelected: true});         
//            custpage_status.addSelectOption({ value: 'toBeShipped',text: '�o�׍ς�'});
//            custpage_status.addSelectOption({ value: 'inTransit',text: '�A����'});
//            custpage_status.addSelectOption({ value: 'partiallyReceived',text: '�ꕔ��̍�'});
//            custpage_status.addSelectOption({ value: 'received',text: '��̍�'});
//            custpage_status.addSelectOption({ value: 'closed',text: '����'});
            custpage_status.addSelectOption({ value: '1',text: 'PRODUCTION IN PROGRESS�E������'});
            custpage_status.addSelectOption({ value: '2',text: 'BOARDING IN PROGRESS�E���n�o�׍ς�'});
            custpage_status.addSelectOption({ value: '3',text: 'IN TRANSIT�E�A����'});
            custpage_status.addSelectOption({ value: '4',text: 'CUSTOMS CLEARANCE IN PROGRESS�E�ʊ֒�'});
            custpage_status.addSelectOption({ value: '5',text: 'CUSTOMS CLEARED-INLAND TRANSIT�E�ʊ֊���-�����z����'});
            custpage_status.addSelectOption({ value: '6',text: 'DELIVERED�E��̍ς�'});
            custpage_status.addSelectOption({ value: '7',text: 'DELIVERED AND PAID�E��̎x�����ς�'});
            
            
            //changed by geng add start U380
            //�����ו�ID
            var custpage_shippingid = form.addField({
                id: 'custpage_shippingid',
//                label: '�����ו�ID',
                label: '�����ԍ�',//changeByWang 22/11/19
                type: serverWidget.FieldType.SELECT,
                container: search_rank_id       
            });
            var selectShippingidText = bindShippingid(custpage_shippingid, condition_data);
            
            //����
            var custpage_poid = form.addField({
                id: 'custpage_poid',
                label: '����',
                type: serverWidget.FieldType.SELECT,
                container: search_rank_id       
            });
            var selectpoidText = bindPoid(custpage_poid, condition_data);
            
            //�Z�N�V����
            var custpage_activity = form.addField({
                id: 'custpage_activity',
                label: '�Z�N�V����',
                type: serverWidget.FieldType.SELECT,
                container: search_rank_id       
            });
            var selectActivityText = bindActivity(custpage_activity, condition_data);
            
            
          //���͎�
            var custpage_entryperson = form.addField({
                id: 'custpage_entryperson',
                label: '���͎� ',
                type: serverWidget.FieldType.SELECT,
                container: search_rank_id       
            });
            var selectentrypersonText = bindEntryperson(custpage_entryperson, condition_data);
            
          //�d����i�R�[�h�j
            var custpage_vendorcode = form.addField({
                id: 'custpage_vendorcode',
                label: '�d����(�R�[�h)',
                type: serverWidget.FieldType.TEXT,
                container: search_rank_id       
            });
            
          //�d����i���O�j
            var custpage_vendorname = form.addField({
                id: 'custpage_vendorname',
                label: '�d����(���O)',
                type: serverWidget.FieldType.TEXT,
                container: search_rank_id       
            });
            
          //�A�C�e��ID
            var custpage_itemid = form.addField({
                id: 'custpage_itemid',
                label: '�A�C�e��ID',
                type: serverWidget.FieldType.SELECT,
                container: search_rank_id       
            }); 
            var selectItemidText = bindItemid(custpage_itemid, condition_data);
            
          //���i���iEnglish�j
            var custpage_shopenglish = form.addField({
                id: 'custpage_shopenglish',
                label: '���i��(English)',
                type: serverWidget.FieldType.TEXT,
                container: search_rank_id       
            }); 
            
            //���i���i���{��j
            var custpage_shopjapan = form.addField({
                id: 'custpage_shopjapan',
                label: '���i��(���{��)',
                type: serverWidget.FieldType.TEXT,
                container: search_rank_id       
            }); 
            
            //�d���揤�i�R�[�h
            var custpage_vendorshopcode = form.addField({
                id: 'custpage_vendorshopcode',
                label: '�d���揤�i�R�[�h',
                type: serverWidget.FieldType.TEXT,
                container: search_rank_id       
            }); 
            
          //�t�H�[���[�_�[
            var custpage_forwarder = form.addField({
                id: 'custpage_forwarder',
                label: '�t�H�[���[�_�[',
                type: serverWidget.FieldType.TEXT,
                container: search_rank_id       
            });
            
          //SEA�EAIR
            var custpage_seaair = form.addField({
                id: 'custpage_seaair',
                label: 'SEA�EAIR',
                type: serverWidget.FieldType.SELECT,
                container: search_rank_id       
            });
            custpage_seaair.addSelectOption({ value: ' ',text: ' '});
            custpage_seaair.addSelectOption({ value: '1',text: 'SEA'});
            custpage_seaair.addSelectOption({ value: '2',text: 'AIR'});
            
          //�ʊ֋Ǝ� 
            var custpage_customsbroker = form.addField({
                id: 'custpage_customsbroker',
                label: '�ʊ֋Ǝ�(�f�t�H���g�z����̈���) ',
                type: serverWidget.FieldType.TEXT,
                container: search_rank_id       
            });
            
          //��̗\���start
            var custpage_receiptdate = form.addField({
                id: 'custpage_receiptdate',
                label: '��̗\��� From',
                type: serverWidget.FieldType.DATE,
                container: search_rank_id       
            });
          //��̗\���end
            var custpage_receiptdate_end = form.addField({
                id: 'custpage_receiptdate_end',
                label: '��̗\���To ',
                type: serverWidget.FieldType.DATE,
                container: search_rank_id       
            });
            

          //changed by geng add end U380
 

            
            
            //�l�ݒ�
            if (me.isEmpty(condition_data.subsidiary)) {
            	//log.debug({title:"condition_data.subsidiary",details:condition_data.subsidiary});
            	custpage_subsidiary.defaultValue = defaultSubsidiary;
            }else{
            	custpage_subsidiary.defaultValue  = condition_data.subsidiary;
            }
            
            condition_data.subsidiary = custpage_subsidiary.defaultValue;
            custpage_customsbroker.defaultValue = condition_data.customsbroker;
            custpage_receiptdate.defaultValue = condition_data.receiptdate;
            custpage_seaair.defaultValue = condition_data.seaair;
            custpage_forwarder.defaultValue = condition_data.forwarder;
            custpage_vendorshopcode.defaultValue = condition_data.vendorshopcode;
            custpage_shopjapan.defaultValue = condition_data.shopjapan;
            custpage_shopenglish.defaultValue = condition_data.shopenglish;
            custpage_vendorname.defaultValue = condition_data.vendorname;
            custpage_vendorcode.defaultValue = condition_data.vendorcode;
            custpage_activity.defaultValue = condition_data.activity;
            custpage_itemid.defaultValue = condition_data.itemid;
            custpage_poid.defaultValue  = condition_data.poid;
            custpage_shippingid.defaultValue  = condition_data.shippingid;
        	custpage_status.defaultValue  = condition_data.status;
        	custpage_entryperson.defaultValue=condition_data.entryperson;
        	custpage_receiptdate_end.defaultValue=condition_data.receiptdateEnd;


            // ����:���������̏ꍇ
            if (condition_data.op == OP_SEARCH ) {
//                // <Style: 1 [MULTISELECT] HIDDEN-> DISABLED>
//                // <Style: 2 [LABEL]>

//                
//                // �A��
                custpage_subsidiary.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.INLINE
                });
                custpage_customsbroker.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.INLINE
                });
                custpage_receiptdate.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.INLINE
                });
                custpage_seaair.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.INLINE
                });
                custpage_forwarder.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.INLINE
                });
                custpage_vendorshopcode.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.INLINE
                });
                custpage_shopjapan.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.INLINE
                });
                custpage_shopenglish.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.INLINE
                });
                custpage_vendorname.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.INLINE
                });
                custpage_vendorcode.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.INLINE
                });
                custpage_activity.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.INLINE
                });
                custpage_itemid.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.INLINE
                });
                custpage_poid.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.INLINE
                });
                custpage_shippingid.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.INLINE
                });
                custpage_status.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.INLINE
                });
                custpage_entryperson.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.INLINE
                });
                custpage_receiptdate_end.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.INLINE
                });
             
            }

        }
        //���͎� search
        function bindEntryperson(con,condition_data){
        	con.addSelectOption({
                value: '',
                text:  ''
            });
        	var filters = new Array();
        	if(condition_data.subsidiary){
        		filters.push(["subsidiary","anyof",[condition_data.subsidiary]]);
        	}else{
          		 var user = runtime.getCurrentUser();
             	 var roleid=user.role;//nlapiGetRole()
             	 var searchfil = [];
             	 searchfil.push(["internalid","anyof",roleid]);
             	 var roleType='role';
             	 var rolecolumns = [
                               search.createColumn({
                                   name: "custrecord_syokuseki",
                                   sort: search.Sort.ASC
                               })
                           ]
             	 var roleResult = createSearch(roleType,searchfil,rolecolumns);
             	 if(roleResult){
             		 var roleSub = roleResult[0].getValue({name:"custrecord_syokuseki"});
             		 if (roleSub) {
                         filters.push(["subsidiary","anyof",roleSub]);   
             		 }
             	 }
        	 }
        		var sraechType='employee';
        		var columns = [
                               search.createColumn({
                                   name: "entityid",
                                   sort: search.Sort.ASC
                               }),
                               search.createColumn({
                                   name: "internalid",
                                   sort: search.Sort.ASC
                               })
                           ]
        		var searchResrult = createSearch(sraechType,filters,columns);
        		if(searchResrult){
        			for(var a=0;a<searchResrult.length;a++){
        				con.addSelectOption({
        					value:searchResrult[a].getValue({name: "internalid"}),
        					text:searchResrult[a].getValue({name: "entityid"})
        				})
        			}
        		}
        }
        
        //�A�C�e��IDsearch
        function bindItemid(con,condition_data){
        	con.addSelectOption({
                value: '',
                text:  ''
            });
        	var filters = new Array();
        	if(condition_data.subsidiary){
        		filters.push(["subsidiary","anyof",[condition_data.subsidiary]]);
        		filters.push("AND");
        	}else{
          		 var user = runtime.getCurrentUser();
             	 var roleid=user.role;//nlapiGetRole()
             	 var searchfil = [];
             	 searchfil.push(["internalid","anyof",roleid]);
             	 var roleType='role';
             	 var rolecolumns = [
                               search.createColumn({
                                   name: "custrecord_syokuseki",
                                   sort: search.Sort.ASC
                               })
                           ]
             	 var roleResult = createSearch(roleType,searchfil,rolecolumns);
             	 if(roleResult){
             		 var roleSub = roleResult[0].getValue({name:"custrecord_syokuseki"});
             		 if (roleSub) {
                         filters.push(["subsidiary","anyof",roleSub]);
                         filters.push("AND");   
             		 }
             	 }
        	 }
        		filters.push(["type","anyof","InvtPart"]);
        		var sraechType='item';
        		var columns = [
                               search.createColumn({
                                   name: "itemid",
                                   sort: search.Sort.ASC
                               }),
                               search.createColumn({
                                   name: "internalid",
                                   sort: search.Sort.ASC
                               })
                           ]
        		var searchResrult = createSearch(sraechType,filters,columns);
        		if(searchResrult){
        			for(var a=0;a<searchResrult.length;a++){
        				con.addSelectOption({
        					value:searchResrult[a].getValue({name: "internalid"}),
        					text:searchResrult[a].getValue({name: "itemid"})
        				})
        			}
        		}
        }
        //�Z�N�V����search
        function bindActivity(con,condition_data){
        	con.addSelectOption({
                value: '',
                text:  ''
            });
        	var filters = new Array();
        	if(condition_data.subsidiary){
        		filters.push(["custrecord_djkk_dp_subsidiary","anyof",[condition_data.subsidiary]]);
        	}else{
       		 var user = runtime.getCurrentUser();
         	 var roleid=user.role;//nlapiGetRole()
         	 var searchfil = [];
         	 searchfil.push(["internalid","anyof",roleid]);
         	 var roleType='role';
         	 var rolecolumns = [
                           search.createColumn({
                               name: "custrecord_syokuseki",
                               sort: search.Sort.ASC
                           })
                       ]
         	 var roleResult = createSearch(roleType,searchfil,rolecolumns);
         	 if(roleResult){
         		 var roleSub = roleResult[0].getValue({name:"custrecord_syokuseki"});
         		 if (roleSub) {
                     filters.push(["custrecord_djkk_dp_subsidiary","anyof",roleSub]);
         		 }
         	 }
    	 }
        		var sraechType='department';
        		var columns = [
                               search.createColumn({
                                   name: "internalid",
                                   sort: search.Sort.ASC
                               }),
                               search.createColumn({
                                   name: "name",
                                   sort: search.Sort.ASC
                               })
                           ]
        		var searchResrult = createSearch(sraechType,filters,columns);
        		if(searchResrult){
        			for(var a=0;a<searchResrult.length;a++){
        				con.addSelectOption({
        					value:searchResrult[a].getValue({name: "internalid"}),
        					text:searchResrult[a].getValue({name: "name"})
        				})
        			}
        		}
        
        }
        //����Id search
        function bindPoid(con,condition_data){
        	con.addSelectOption({
                value: '',
                text:  ''
            });
        	var filters = new Array();
        	if(condition_data.subsidiary){
        		filters.push(["subsidiary","anyof",[condition_data.subsidiary]]);
        		filters.push("AND");
        		filters.push(["approvalstatus","anyof","2"]);
        	 }else{
        		 var user = runtime.getCurrentUser();
             	 var roleid=user.role;//nlapiGetRole()
             	 var searchfil = [];
             	 searchfil.push(["internalid","anyof",roleid]);
             	 var roleType='role';
             	 var rolecolumns = [
                               search.createColumn({
                                   name: "custrecord_syokuseki",
                                   sort: search.Sort.ASC
                               })
                           ]
             	 var roleResult = createSearch(roleType,searchfil,rolecolumns);
             	 if(roleResult){
             		 var roleSub = roleResult[0].getValue({name:"custrecord_syokuseki"});
             		 if (roleSub) {
                         filters.push(["subsidiary","anyof",roleSub]);
                         filters.push("AND");   
             		 }
             		 filters.push(["approvalstatus","anyof","2"]);
             	 }
        	 }
        		var sraechType='purchaseorder';
        		var columns = [
                               search.createColumn({
                                   name: "tranid",
                                   sort: search.Sort.ASC
                               }),
                               search.createColumn({
                                   name: "internalid",
                                   sort: search.Sort.ASC
                               })
                           ]
        		var searchResrult = createSearch(sraechType,filters,columns);
        		if(searchResrult){
        			var valArr = [];
        			var textArr = [];
        			for(var a=0;a<searchResrult.length;a++){
        				var searchValue = searchResrult[a].getValue({name: "internalid"});
        				var searchText = searchResrult[a].getValue({name: "tranid"});
        				if(valArr.indexOf(searchValue)<0){
        					valArr.push(searchValue)
        				}
        				if(textArr.indexOf(searchText)<0){
        					textArr.push(searchText)
        				}
        				
        			}
        			for(var s=0;s<valArr.length;s++){
        				con.addSelectOption({
        					value:valArr[s],
        					text:textArr[s]
        				})
        			}
        		}
        }
        //�����ו�ID search
        function bindShippingid(con,condition_data){
        	con.addSelectOption({
                value: '',
                text:  ''
            });
            var filters = new Array();
        	if(condition_data.subsidiary){
        		filters.push(["custrecord_djkk_subsidiary_header","anyof",[condition_data.subsidiary]]);
        		if(condition_data.status){
        			filters.push("AND");
        			filters.push(["custrecord_djkk_inboundshipment_status","anyof",[condition_data.status]]);
        		}
        	 }else{
        		 var user = runtime.getCurrentUser();
             	 var roleid=user.role;//nlapiGetRole()
             	 var searchfil = [];
             	 searchfil.push(["internalid","anyof",roleid]);
             	 var roleType='role';
             	 var rolecolumns = [
                               search.createColumn({
                                   name: "custrecord_syokuseki",
                                   sort: search.Sort.ASC
                               })
                           ]
             	 var roleResult = createSearch(roleType,searchfil,rolecolumns);
             	 if(roleResult){
             		 var roleSub = roleResult[0].getValue({name:"custrecord_syokuseki"});
             		 if (roleSub) {
                         filters.push(["custrecord_djkk_subsidiary_header","anyof",roleSub]);
             		 }
            		 if(condition_data.status){
            			filters.push("AND");
            			filters.push(["custrecord_djkk_inboundshipment_status","anyof",[condition_data.status]]);
            		}
             	 }
        	 }
        		
        		var sraechType='inboundshipment';
        		var columns = [
                               search.createColumn({
                                   name: "internalid",
                                   sort: search.Sort.ASC
                               }),
                               search.createColumn({
                                   name: "shipmentnumber",
                                   sort: search.Sort.ASC
                               })
                   
                           ]
        		var searchResrult = createSearch(sraechType,filters,columns);
        		if(searchResrult){
        			for(var a=0;a<searchResrult.length;a++){
        				con.addSelectOption({
        					value:searchResrult[a].getValue({name: "internalid"}),
        					text:searchResrult[a].getValue({name: "shipmentnumber"})
        				})
        			}
        		}
       

        }
  

        /**
         * �������׃G���A�\�z
         *
         * @param context
         * @param form
         * @param condition_data
         */
        function buildFormDetail(context, form, condition_data) {
            var detail_rank_id = 'detail_rank';
            form.addFieldGroup({
                id: detail_rank_id,
                label: '���׍���'
            });

            var detailList = form.addSublist({
                id: 'custpage_result_list',
                type: serverWidget.SublistType.LIST,
                label: '�A�C�e��',
                container: detail_rank_id
            });
            detailList.addMarkAllButtons();
         // checkbox
            detailList.addField({
                id: 'sub_list_checkbox',
                type: serverWidget.FieldType.CHECKBOX,
                label: '�`�F�b�N'
            });
            //changed by geng add start U380
            // �Z�N�V����
            detailList.addField({
                id: 'sub_list_activity',
                type: serverWidget.FieldType.TEXT,
                label: '�Z�N�V����'
            });
            
            // �����ו�ID
            detailList.addField({
                id: 'sub_list_shippingid',
                type: serverWidget.FieldType.TEXT,
//                label: '�����ו�ID'
                label: '�����ԍ�'//changeByWang 22/11/19
            });
            
         // ����
            detailList.addField({
                id: 'sub_list_po',
                type: serverWidget.FieldType.TEXT,
                label: '����'
            });
            
         // �d����i�R�[�h�j
            detailList.addField({
                id: 'sub_list_suppliercode',
                type: serverWidget.FieldType.TEXT,
                label: '�d����(�R�[�h)'
            });
            
         // �d����(���O)
            detailList.addField({
                id: 'sub_list_suppliername',
                type: serverWidget.FieldType.TEXT,
                label: '�d����(���O)'
            });
            
         //�X�e�[�^�X
            detailList.addField({
                id: 'sub_list_status',
                type: serverWidget.FieldType.TEXT,
                label: '�X�e�[�^�X'
            });
            
            //�A�C�e��ID
            detailList.addField({
                id: 'sub_list_itemid',
                type: serverWidget.FieldType.TEXT,
                label: '�A�C�e��ID'
            });
            
          //���i���iEnglish�j
            detailList.addField({
                id: 'sub_list_itemenglish',
                type: serverWidget.FieldType.TEXT,
                label: '���i��(English)'
            });
            
            //���i���i���{��j
            detailList.addField({
                id: 'sub_list_itemjapan',
                type: serverWidget.FieldType.TEXT,
                label: '���i��(���{��)'
            });
            
            //�d���揤�i�R�[�h
            detailList.addField({
                id: 'sub_list_vendoritemcode',
                type: serverWidget.FieldType.TEXT,
                label: '�d���揤�i�R�[�h'
            });
            
            //�C���R�^�[��
            detailList.addField({
                id: 'sub_list_incoterms',
                type: serverWidget.FieldType.TEXT,
                label: '�C���R�^�[��'
            });
            
            //�C���R�^�[���ꏊ
            detailList.addField({
                id: 'sub_list_incotermslocation',
                type: serverWidget.FieldType.TEXT,
                label: '�C���R�^�[���ꏊ'
            });
            
            //�ړI�n
            detailList.addField({
                id: 'sub_list_finaldestination',
                type: serverWidget.FieldType.TEXT,
                label: '�ړI�n'
            });
            
            //�t�H�[���[�_�[
            detailList.addField({
                id: 'sub_list_forwarder',
                type: serverWidget.FieldType.TEXT,
                label: '�t�H�[���[�_�['
            });
            
            //�t�H�[���[�_�[
            detailList.addField({
                id: 'sub_list_customsbroker',
                type: serverWidget.FieldType.TEXT,
                label: '�ʊ֋Ǝ�'
            });
            
          //�z�����@
            detailList.addField({
                id: 'sub_list_shipvia',
                type: serverWidget.FieldType.TEXT,
                label: '�z�����@'
            });
            
            //SEA�EAIR
            detailList.addField({
                id: 'sub_list_seaair',
                type: serverWidget.FieldType.TEXT,
                label: 'SEA�EAIR'
            });
            
            //��̗\���
            detailList.addField({
                id: 'sub_list_receiptdate',
                type: serverWidget.FieldType.TEXT,
                label: '��̗\���'
            });
            
            //�o�����{��
            detailList.addField({
                id: 'sub_list_shippeddate',
                type: serverWidget.FieldType.TEXT,
                label: '�o�����{��'
            });
            
            //�������{��
            detailList.addField({
                id: 'sub_list_arriveddate',
                type: serverWidget.FieldType.TEXT,
                label: '�������{��'
            });
            
            //B/L No
            detailList.addField({
                id: 'sub_list_blnum',
                type: serverWidget.FieldType.TEXT,
                label: 'B/L No'
            });
            
          //Vessel Name
            detailList.addField({
                id: 'sub_list_vesselname',
                type: serverWidget.FieldType.TEXT,
                label: 'Vessel Name'
            });
            
          //Container No
            detailList.addField({
                id: 'sub_list_container',
                type: serverWidget.FieldType.TEXT,
                label: 'Container No'
            });
            
          //Seal No
            detailList.addField({
                id: 'sub_list_sealno',
                type: serverWidget.FieldType.TEXT,
                label: 'Seal No'
            });
            
          //MAWB No
            detailList.addField({
                id: 'sub_list_mawbno',
                type: serverWidget.FieldType.TEXT,
                label: 'MAWB No'
            });
            
          //HAWB No
            detailList.addField({
                id: 'sub_list_hawbno',
                type: serverWidget.FieldType.TEXT,
                label: 'HAWB No'
            });
            
          //Flight No
            detailList.addField({
                id: 'sub_list_flightno',
                type: serverWidget.FieldType.TEXT,
                label: 'Flight No'
            });
            
            //Entry Person
            detailList.addField({
                id: 'sub_list_entryperson',
                type: serverWidget.FieldType.TEXT,
                label: 'Entry Person'
            });
          //changed by geng add end U380


            var resultData = [];
            if (condition_data.op == OP_SEARCH) {
                resultData = doSearch(condition_data);
//                log.debug('resultData',resultData.length);
            }
            if(!me.isEmpty(resultData)){
            	for(var j=0;j<resultData.length;j++){
            		   detailList.setSublistValue({
                         id: 'sub_list_activity',
                         line: j,
                         value: me.isEmpty(resultData[j].objactivity)?" ":resultData[j].objactivity
                     });
            		   detailList.setSublistValue({
                           id: 'sub_list_shippingid',
                           line: j,
                           value: me.isEmpty(resultData[j].objshipmentnumber)?" ":resultData[j].objshipmentnumber
                       });
            		   detailList.setSublistValue({
                           id: 'sub_list_po',
                           line: j,
                           value: me.isEmpty(resultData[j].objpurchaseorder)?" ":resultData[j].objpurchaseorder
                       });
            		   detailList.setSublistValue({
                           id: 'sub_list_suppliercode',
                           line: j,
                           value: me.isEmpty(resultData[j].objentityid)?" ":resultData[j].objentityid
                       });
            		   detailList.setSublistValue({
                           id: 'sub_list_suppliername',
                           line: j,
                           value: me.isEmpty(resultData[j].objaltname)?" ":resultData[j].objaltname
                       });
            		   detailList.setSublistValue({
                           id: 'sub_list_status',
                           line: j,
                           value: me.isEmpty(resultData[j].objstatus)?" ":resultData[j].objstatus
                       });
            		   detailList.setSublistValue({
                           id: 'sub_list_itemid',
                           line: j,
                           value: me.isEmpty(resultData[j].objitem)?" ":resultData[j].objitem
                       });
            		   detailList.setSublistValue({
                           id: 'sub_list_itemenglish',
                           line: j,
                           value: me.isEmpty(resultData[j].objshopenglish)?" ":resultData[j].objshopenglish
                       });
            		   detailList.setSublistValue({
                           id: 'sub_list_itemjapan',
                           line: j,
                           value: me.isEmpty(resultData[j].objshopjapan)?" ":resultData[j].objshopjapan
                       });
            		   detailList.setSublistValue({
                           id: 'sub_list_vendoritemcode',
                           line: j,
                           value: me.isEmpty(resultData[j].objvendorname)?" ":resultData[j].objvendorname
                       });
            		   detailList.setSublistValue({
                           id: 'sub_list_incoterms',
                           line: j,
                           value: me.isEmpty(resultData[j].objincoterm)?" ":resultData[j].objincoterm
                       });
            		   detailList.setSublistValue({
                           id: 'sub_list_forwarder',
                           line: j,
                           value: me.isEmpty(resultData[j].objforwarder)?" ":resultData[j].objforwarder
                       });
            		   detailList.setSublistValue({
                           id: 'sub_list_customsbroker',
                           line: j,
                           value: me.isEmpty(resultData[j].objcustomsbroker)?" ":resultData[j].objcustomsbroker
                       });
            		   detailList.setSublistValue({
                           id: 'sub_list_shipvia',
                           line: j,
                           value: me.isEmpty(resultData[j].objmeans)?" ":resultData[j].objmeans
                       });
            		   detailList.setSublistValue({
                           id: 'sub_list_shippeddate',
                           line: j,
                           value: me.isEmpty(resultData[j].objactualdeliverydate)?" ":resultData[j].objactualdeliverydate
                       });
            		   detailList.setSublistValue({
                           id: 'sub_list_arriveddate',
                           line: j,
                           value: me.isEmpty(resultData[j].objarrivaldate)?" ":resultData[j].objarrivaldate
                       });
            		   detailList.setSublistValue({
                           id: 'sub_list_receiptdate',
                           line: j,
                           value: me.isEmpty(resultData[j].objreceiptdate)?" ":resultData[j].objreceiptdate
                       });
            		   detailList.setSublistValue({
                           id: 'sub_list_blnum',
                           line: j,
                           value: me.isEmpty(resultData[j].objbilloflading)?" ":resultData[j].objbilloflading
                       });
            		   detailList.setSublistValue({
                           id: 'sub_list_vesselname',
                           line: j,
                           value: me.isEmpty(resultData[j].objvesselnumber)?" ":resultData[j].objvesselnumber
                       });
            		   detailList.setSublistValue({
                           id: 'sub_list_container',
                           line: j,
                           value: me.isEmpty(resultData[j].objcontainerno)?" ":resultData[j].objcontainerno
                       });
            		   detailList.setSublistValue({
                           id: 'sub_list_sealno',
                           line: j,
                           value: me.isEmpty(resultData[j].objsealnumber)?" ":resultData[j].objsealnumber
                       });
            		   detailList.setSublistValue({
                           id: 'sub_list_mawbno',
                           line: j,
                           value: me.isEmpty(resultData[j].objmawb)?" ":resultData[j].objmawb
                       });
            		   detailList.setSublistValue({
                           id: 'sub_list_hawbno',
                           line: j,
                           value: me.isEmpty(resultData[j].objhawb)?" ":resultData[j].objhawb
                       });
            		   detailList.setSublistValue({
                           id: 'sub_list_flightno',
                           line: j,
                           value: me.isEmpty(resultData[j].objflight)?" ":resultData[j].objflight
                       });
            		   detailList.setSublistValue({
                           id: 'sub_list_entryperson',
                           line: j,
                           value: me.isEmpty(resultData[j].objcreateUser)?" ":resultData[j].objcreateUser
                       });
            		   detailList.setSublistValue({
                           id: 'sub_list_seaair',
                           line: j,
                           value: me.isEmpty(resultData[j].objseaair)?" ":resultData[j].objseaair
                       });
            		   detailList.setSublistValue({
                           id: 'sub_list_incotermslocation',
                           line: j,
                           value: me.isEmpty(resultData[j].objincotermsLocation)?" ":resultData[j].objincotermsLocation
                       });
            		   detailList.setSublistValue({
                           id: 'sub_list_finaldestination',
                           line: j,
                           value: me.isEmpty(resultData[j].objfinalDestination)?" ":resultData[j].objfinalDestination
                       });
            	}
            }

            return detailList;
        }

        // ����
        function doSearch(condition_data) {
        	var searchType='inboundshipment';
            var filters = [];
//            filters.push(["internalid","isnotempty",""])
//            filters.push("AND");
            filters.push(["custrecord_djkk_subsidiary_header","anyof",condition_data.subsidiary])
            //�X�e�[�^�X
            //filters.push(SEARCH_FILTERS_DEFAULT);
            if(!me.isEmpty(condition_data.status)){
            	log.debug('test','test');
            	filters.push("AND");
            	filters.push(["custrecord_djkk_inboundshipment_status","anyof",condition_data.status])
            }
            //�����ו�ID
            if(!me.isEmpty(condition_data.shippingid)){
            	filters.push("AND");
            	filters.push(["internalid","anyof",condition_data.shippingid])
            }
          //����
            if(!me.isEmpty(condition_data.poid)){
            	filters.push("AND");
            	filters.push(["purchaseorder","anyof",condition_data.poid])
            }
          //�Z�N�V����
            if(!me.isEmpty(condition_data.activity)){
            	filters.push("AND");
            	filters.push(["custrecord_djkk_activity","anyof",condition_data.activity])
            }
          //�A�C�e��ID
            if(!me.isEmpty(condition_data.itemid)){
            	filters.push("AND");
            	filters.push(["item","anyof",condition_data.itemid])
            }
            //�t�H�[���[�_�[
            if(!me.isEmpty(condition_data.forwarder)){
            	filters.push("AND");
            	filters.push(["custrecord_djkk_forwarder","is",condition_data.forwarder])
            }
          //�ʊ֋ƎҔz����̈���
            if(!me.isEmpty(condition_data.customsbroker)){
            	filters.push("AND");
            	filters.push(["formulatext: {vendor.shipaddressee}","is",condition_data.customsbroker])
            }
       
          //���i��(ENGLISH)
            if(!me.isEmpty(condition_data.shopenglish)){
            	filters.push("AND");
            	filters.push(["item.custitem_djkk_product_name_line1","is",condition_data.shopenglish])
            }
          //���i��(���{��)
            if(!me.isEmpty(condition_data.shopjapan)){
            	filters.push("AND");
            	filters.push(["item.custitem_djkk_product_name_jpline1","is",condition_data.shopjapan])
            }
          //�d����(���O)
            if(!me.isEmpty(condition_data.vendorname)){
            	filters.push("AND");
            	filters.push(["vendor.altname","is",condition_data.vendorname])
            }
            //�d����(�R�[�h)
            if(!me.isEmpty(condition_data.vendorcode)){
            	filters.push("AND");
            	filters.push(["vendor.entityid","is",condition_data.vendorcode])
            }
          //�d���揤�i�R�[�h
            if(!me.isEmpty(condition_data.vendorshopcode)){
            	filters.push("AND");
            	filters.push(["item.vendorname","is",condition_data.vendorshopcode])
            }
          //��̗\���
            if(!me.isEmpty(condition_data.receiptdate)){
            	filters.push("AND");
            	filters.push(["inboundshipmentitem.custrecord_djkk_receipt_date","onorafter",condition_data.receiptdate])
            }
//            ��̗\���to
            if(!me.isEmpty(condition_data.receiptdateEnd)){
            	filters.push("AND");
            	filters.push(["inboundshipmentitem.custrecord_djkk_receipt_date","onorbefore",condition_data.receiptdateEnd])
            }
          //���͎�
            if(!me.isEmpty(condition_data.entryperson)){
            	filters.push("AND");
            	filters.push(["custrecord_djkk_arriv_appr_create_user","anyof",condition_data.entryperson])
            }
          //SEA�EAIR
            if(!me.isEmpty(condition_data.seaair)){
            	filters.push("AND");
            	filters.push(["custrecord_djkk_sea_air","anyof",condition_data.seaair])
            }
            var columns = [
	                           //DJ_�Z�N�V����/ACTIVITY
								search.createColumn({
								  name: "custrecord_djkk_activity",
								  label: "DJ_�Z�N�V����/ACTIVITY"
								}),
								//�����ו�ID 
								search.createColumn({
									  name: "shipmentnumber",
									  label: "�o�הԍ�"
									}),
								//���� 
								search.createColumn({
									  name: "purchaseorder"
									}),
								//�d����(�R�[�h) 
								search.createColumn({
									name: "entityid",
			                        join: "vendor",
									}),
								//�d����(���O)
								search.createColumn({
									name: "altname",
				                    join: "vendor",
									}),
								//�X�e�[�^�X 
								search.createColumn({
									name: "custrecord_djkk_inboundshipment_status"
									}),
								//�A�C�e��ID
								search.createColumn({
									name: "item",
									}),
								//���i��(ENGLISH)
								search.createColumn({
									name: "custitem_djkk_product_name_line1",
									join: "item"
									}),
								//���i��(���{��)
								search.createColumn({
									name: "custitem_djkk_product_name_jpline1",
									join: "item"
									}),
								//�d���揤�i�R�[�h
								search.createColumn({
									name: "vendorname",
									join: "item"
									}),	
								//�C���R�^�[��
								search.createColumn({
									name: "custrecord_djkk_cust_incoterms",
									join: "inboundShipmentItem"
									}),
								//�t�H�[���[�_�[
								search.createColumn({
									name: "custrecord_djkk_forwarder"
									}),
								//�ʊ֋Ǝ�"�z���戶��
								search.createColumn({
									 name: "shipaddressee",
							         join: "vendor"
									}),
								//�z�����@ 
								search.createColumn({
									name: "custrecord_djkk_transportation_means"
									}),
								//��̗\���
								search.createColumn({
									name: "custrecord_djkk_receipt_date",
									join: "inboundShipmentItem"
									}),
								//�o�����{�� 
								search.createColumn({
									name: "actualdeliverydate"
									}),
								//�������{��
								search.createColumn({
									name: "custrecord_djkk_actual_arrival_date"
									}),
								//B/L NO
								search.createColumn({
									name: "billoflading"
									}),
								//VESSEL NAME 
								search.createColumn({
									name: "vesselnumber"
									}),
								//CONTAINER NO  
								search.createColumn({
									name: "custrecord_djkk_container_no"
									}),
								//SEAL NO 
								search.createColumn({
									name: "custrecord_djkk_seal_number"
									}),
								//MAWB NO 
								search.createColumn({
									name: "custrecord_djkk_mawb"
									}),
								//HAWB NO 
								search.createColumn({
									name: "custrecord_djkk_hawb"
									}),
								//FLIGHT NO 
								search.createColumn({
									name: "custrecord_djkk_flight"
									}),
								//���͎�
								search.createColumn({
									name: "custbody_djkk_input_person",
									join: "purchaseOrder"
									}),
								//�C���R�^�[���ꏊ
								search.createColumn({
									name: "custrecord_djkk_incoterms_location",
									join: "inboundShipmentItem"
									}),
								//�ړI�n
								search.createColumn({
									name: "custrecord_djkk_final_destination"
									}),
								//SEA�EAIR
								search.createColumn({
									name: "custrecord_djkk_sea_air"//  quantityexpected
									})
									
									
								
								
                           ];
	            
	            
            	var objSearch = createSearch(searchType,filters,columns);
            	var restult = [];
//            	var obj = {};
            	if(objSearch){
            		for(var k=0;k<objSearch.length;k++){
            			
            			var objactivity = objSearch[k].getText({name: "custrecord_djkk_activity"});
            			var objshipmentnumber = objSearch[k].getValue({name: "shipmentnumber"});
            			var objpurchaseorder = objSearch[k].getText({name: "purchaseorder"});
            			var objentityid = objSearch[k].getValue({name: "entityid",join: "vendor"});
            			var objaltname = objSearch[k].getValue({name: "altname",join: "vendor"});
            			var objstatus = objSearch[k].getText({name: "custrecord_djkk_inboundshipment_status"});
            			var objitem = objSearch[k].getText({name: "item"});
            			var objshopenglish = objSearch[k].getValue({name: "custitem_djkk_product_name_line1",join: "item"});
            			var objshopjapan = objSearch[k].getValue({name: "custitem_djkk_product_name_jpline1",join: "item"});
            			var objvendorname = objSearch[k].getValue({name: "vendorname",join: "item"});
            			var objincoterm = objSearch[k].getValue({name: "custrecord_djkk_cust_incoterms",join:"inboundShipmentItem"});
            			var objforwarder = objSearch[k].getValue({name: "custrecord_djkk_forwarder"});
            			var objcustomsbroker = objSearch[k].getValue({name: "shipaddressee",join:"vendor"});
            			var objmeans = objSearch[k].getText({name: "custrecord_djkk_transportation_means"});
            			var objreceiptdate = objSearch[k].getValue({name: "custrecord_djkk_receipt_date",join:"inboundShipmentItem"});
            			var objactualdeliverydate = objSearch[k].getValue({name: "actualdeliverydate"});
            			var objarrivaldate = objSearch[k].getValue({name: "custrecord_djkk_actual_arrival_date"});
            			var objbilloflading = objSearch[k].getValue({name: "billoflading"});
            			var objvesselnumber = objSearch[k].getValue({name: "vesselnumber"});
            			var objcontainerno = objSearch[k].getValue({name: "custrecord_djkk_container_no"});
            			var objsealnumber = objSearch[k].getValue({name: "custrecord_djkk_seal_number"});
            			var objmawb = objSearch[k].getValue({name: "custrecord_djkk_mawb"});
            			var objhawb = objSearch[k].getValue({name: "custrecord_djkk_hawb"});
            			var objflight = objSearch[k].getValue({name: "custrecord_djkk_flight"});
            			var objcreateUser = objSearch[k].getText({name: "custbody_djkk_input_person",join:"purchaseOrder"});
            			var objincotermsLocation = objSearch[k].getValue({name: "custrecord_djkk_incoterms_location",join:"inboundShipmentItem"});
            			var objfinalDestination = objSearch[k].getValue({name: "custrecord_djkk_final_destination"});
            			var objseaair = objSearch[k].getText({name: "custrecord_djkk_sea_air"});
            			
            			restult.push({
            				objactivity:objactivity,
            				objshipmentnumber:objshipmentnumber,
            				objpurchaseorder:objpurchaseorder,
            				objentityid:objentityid,
            				objaltname:objaltname,
            				objstatus:objstatus,
            				objitem:objitem,
            				objshopenglish:objshopenglish,
            				objshopjapan:objshopjapan,
            				objvendorname:objvendorname,
            				objincoterm:objincoterm,
            				objforwarder:objforwarder,
            				objcustomsbroker:objcustomsbroker,
            				objmeans:objmeans,
            				objreceiptdate:objreceiptdate,
            				objactualdeliverydate:objactualdeliverydate,
                			objarrivaldate:objarrivaldate,
	            			 objbilloflading:objbilloflading,
	            			 objvesselnumber:objvesselnumber,
	            			 objcontainerno:objcontainerno,
	            			 objsealnumber:objsealnumber,
	            			 objmawb:objmawb,
	            			 objhawb:objhawb,
	            			 objflight:objflight,
	            			 objcreateUser:objcreateUser,
	            			 objincotermsLocation:objincotermsLocation,
	            			 objfinalDestination:objfinalDestination,
	            			 objseaair:objseaair
            				
            			});
            		}
            		return restult;
            	}
            	
        }

        function getParamValue(para) {
            if(!me.isEmpty(para)) {
                return para;
            }
            return "";
        }

//        function getArrFilters(arr_data, filter_id, filter_op, filter_rel) {
//            var arrFilters = [];
//            if(arr_data.length > 0) {
//                for (var i = 0; i < arr_data.length; i++) {
//                    if(!me.isEmpty(arr_data[i])) {
//                        if (arr_data[i] == 'ALL') {
//                            continue;
//                        } else if (arr_data[i] == 'NONE') {
//                            arrFilters.push([filter_id, filter_op, "@NONE@"]);
//                        } else {
//                            arrFilters.push([filter_id, filter_op, arr_data[i]]);
//                        }
//
//                        arrFilters.push(filter_rel);
//                    }
//                }
//            }
//            if (arrFilters.length > 0) {
//                arrFilters.splice(arrFilters.length - 1, 1);
//            }
//
//            return arrFilters;
//        }

        /**
         * CSV�t�@�C���ۑ�
         *
         * @param lineDataArray
         * @param headArray
         * @param filename
         * @param folder
         */
        function createCsvFile(lineDataArray, headArray, filename, folder) {
            var csvArray = [];
            // CSV�w�b�_���쐬����
            if (headArray && headArray.length > 0) {
                csvArray.push(headArray.join(','));
            }
            // CSV�f�[�^���쐬����
            lineDataArray.forEach(function(lineData) {
                csvArray.push(lineData.join(','));
            });
            var csvStr = csvArray.join('\r\n');
            // FileCabinet�ɕۑ�����
            return createFile(csvStr, file.Type.CSV, filename, folder);
        }

        /**
         * PDF�t�@�C���ۑ�
         *
         * @param lineDataArray
         * @param headArray
         * @param filename
         * @param folder
         */
        function createPDFFile(context, lineDataArray, headArray, filename, folder,subId) {
            var pdfxml = [];
            pdfxml.push('<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">');
            pdfxml.push('<pdf>');
            pdfxml.push('<head>');
            pdfxml.push('  <link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />');
            pdfxml.push('  <#if .locale == "zh_CN">');
            pdfxml.push('    <link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />');
            pdfxml.push('  <#elseif .locale == "zh_TW">');
            pdfxml.push('    <link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />');
            pdfxml.push('  <#elseif .locale == "ja_JP">');
            pdfxml.push('    <link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />');
            pdfxml.push('  <#elseif .locale == "ko_KR">');
            pdfxml.push('    <link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />');
            pdfxml.push('  <#elseif .locale == "th_TH">');
            pdfxml.push('    <link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />');
            pdfxml.push('  </#if>');
            pdfxml.push('    <macrolist>');
            pdfxml.push('        <macro id="nlfooter">');
            pdfxml.push('            <table>');
            pdfxml.push('              <tr><td align="right"><pagenumber/> of <totalpages/></td></tr>');
            pdfxml.push('          </table>');
            pdfxml.push('        </macro>');
            pdfxml.push('    </macrolist>');
            pdfxml.push('    <style type="text/css">* {');
            pdfxml.push('    <#if .locale == "zh_CN">');
            pdfxml.push('      font-family: NotoSans, NotoSansCJKsc, sans-serif;');
            pdfxml.push('    <#elseif .locale == "zh_TW">');
            pdfxml.push('      font-family: NotoSans, NotoSansCJKtc, sans-serif;');
            pdfxml.push('    <#elseif .locale == "ja_JP">');
            pdfxml.push('      font-family: NotoSans, NotoSansCJKjp, sans-serif;');
            pdfxml.push('    <#elseif .locale == "ko_KR">');
            pdfxml.push('      font-family: NotoSans, NotoSansCJKkr, sans-serif;');
            pdfxml.push('    <#elseif .locale == "th_TH">');
            pdfxml.push('      font-family: NotoSans, NotoSansThai, sans-serif;');
            pdfxml.push('    <#else>');
            pdfxml.push('      font-family: NotoSans, sans-serif;');
            pdfxml.push('    </#if>');
            pdfxml.push('    }');
            pdfxml.push('      table { font-size: 9pt; table-layout: fixed; width: 100%; }');
            pdfxml.push('th { font-weight: bold; font-size: 8pt; vertical-align: middle; padding: 5px 6px 3px; background-color: #e3e3e3; color: #333333; padding-bottom: 10px; padding-top: 10px; }');
            pdfxml.push('td { padding: 4px 6px; }');
            pdfxml.push('b { font-weight: bold; color: #333333; }');
            pdfxml.push('</style>');
            pdfxml.push('</head>');
            pdfxml.push('<body footer="nlfooter" footer-height="20pt" padding="0.25in 0.25in 0.25in 0.25in" size="A4-LANDSCAPE">');
//            pdfxml.push('    <table border="0" cellpadding="1" cellspacing="1" style="height:200px;width:660px;"><tr>');
//            pdfxml.push('  <td colspan="2" style="width: 315px; height: 20px;">${companyinformation.thirdpartyzipcode}</td>');
//            pdfxml.push('  <td rowspan="7" style="width: 311px;"><span style="font-size:20px;"><img src="https://5722722-sb1.secure.netsuite.com/core/media/media.nl?id=8386&amp;c=5722722_SB1&amp;h=DZtE1f2JHVzDYzOgXZNHKeYaTvtUcIYWTCka_0uLMSVpRxJs" style="width: 150px; height: 80px;" /></span><br /><span style="font-size:24px;"><strong><span style="color:#3498db;">SCETI<br />�Z�e�B�������</span></strong></span></td>');
//            pdfxml.push('  </tr>');
//            pdfxml.push('  <tr>');
//            pdfxml.push('  <td colspan="2" style="width: 315px; height: 20px;">${companyinformation.dropdownstate}</td>');
//            pdfxml.push('  </tr>');
//            pdfxml.push('  <tr>');
//            pdfxml.push('  <td colspan="2" style="width: 315px; height: 20px;">${companyinformation.addresstext}</td>');
//            pdfxml.push('  </tr>');
//            pdfxml.push('  <tr>');
//            pdfxml.push('  <td colspan="2" style="width: 315px; height: 20px;">&nbsp;</td>');
//            pdfxml.push('  </tr>');
//            pdfxml.push('  <tr>');
//            pdfxml.push('  <td colspan="2" style="width: 315px; height: 20px;">&nbsp;</td>');
//            pdfxml.push('  </tr></table>');
            
            
            var sub = record.load({
                type: 'subsidiary',
                id: subId
          });
            
            pdfxml.push('  <table border="0" cellpadding="1" cellspacing="1" style="width:100%;"><tr>');
//            pdfxml.push('  <td style="width: 177px;">&nbsp;</td>');
            pdfxml.push('  <td align="center" style="width: 100%;"><span style="color:#3498db;"><strong><span style="font-size:24px;text-align:center;">'+sub.getValue({fieldId: 'legalname'})+'</span></strong></span></td>');
//            pdfxml.push('  <td style="width: 68px;">&nbsp;</td>');
            pdfxml.push('  </tr></table>');
            
            pdfxml.push('<br />');
            
            var header ="";
            
//            if(!me.isEmpty(condition_data.status)){
//            	header+="�X�e�[�^�X: "+condition_data.statusText
//            	header+="<br />"
//            }
//            if(!me.isEmpty(condition_data.expectedshippingdate)){
//            	header+="�o�ח\���: "+condition_data.expectedshippingdate
//            	header+="<br />"
//            }
//            if(!me.isEmpty(condition_data.actualshippingdate)){
//            	header+="���ۏo�ד�: "+condition_data.actualshippingdate
//            	header+="<br />"
//            }
//            if(!me.isEmpty(condition_data.expecteddeliverydate)){
//            	header+="�\��z����: "+condition_data.expecteddeliverydate
//            	header+="<br />"
//            }
//            if(!me.isEmpty(condition_data.actualdeliverydate)){
//            	header+="���۔z����: "+condition_data.actualdeliverydate
//            	header+="<br />"
//            }
//            if(!me.isEmpty(condition_data.vesselnumber)){
//            	header+="�D���ԍ�: "+condition_data.vesselnumber
//            	header+="<br />"
//            }
//            if(!me.isEmpty(condition_data.billoflading)){
//            	header+="�D�׏،�: "+condition_data.billoflading
//            	header+="<br />"
//            }
//            if(!me.isEmpty(condition_data.delivery_date)){
//            	header+="�[�i���\���: "+condition_data.delivery_date
//            	header+="<br />"
//            }
//            
//            if(!me.isEmpty(LOCATION_LIST)){
//            	header+="��̏ꏊ: "+LOCATION_LIST
//            	header+="<br />"
//            }
//            if(!me.isEmpty(NO_LIST)){
//            	header+="�����ԍ�: "+NO_LIST
//            	header+="<br />"
//            }
//            if(!me.isEmpty(ITEM_LIST)){
//            	header+="�A�C�e��: "+ITEM_LIST
//            	header+="<br />"
//            }
            
            pdfxml.push('  <table border="0" cellpadding="1" cellspacing="1" style="width: 100%;"><tr>');
            pdfxml.push('  <td colspan="5" rowspan="7">'+header+'</td>');
//            pdfxml.push('  <td >'+condition_data.expectedshippingdate+'</td>');
//            pdfxml.push('  <td colspan="1" rowspan="7">��̏ꏊ :'+LOCATION_LIST+'</td>');
//            pdfxml.push('  <td colspan="1" rowspan="7">�o�הԍ�: '+NO_LIST+'</td>');
//            pdfxml.push('  <td colspan="1" rowspan="7">�A�C�e��:'+ITEM_LIST+'</td>');
//            pdfxml.push('  </tr>');
//            pdfxml.push('  <tr>');
//            pdfxml.push('  <td>���ۏo�ד�:</td>');
//            pdfxml.push('  <td style="width: 117px;">'+condition_data.actualshippingdate+'</td>');
//            pdfxml.push('  </tr>');
//            pdfxml.push('  <tr>');
//            pdfxml.push('  <td>�\��z����:</td>');
//            pdfxml.push('  <td style="width: 117px;">'+condition_data.expecteddeliverydate+'</td>');
//            pdfxml.push('  </tr>');
//            pdfxml.push('  <tr>');
//            pdfxml.push('  <td>���۔z����:</td>');
//            pdfxml.push('  <td style="width: 117px;">'+condition_data.actualdeliverydate+'</td>');
//            pdfxml.push('  </tr>');
//            pdfxml.push('  <tr>');
//            pdfxml.push('  <td>�D���ԍ�:</td>');
//            pdfxml.push('  <td style="width: 117px;">'+condition_data.vesselnumber+'</td>');
//            pdfxml.push('  </tr>');
//            pdfxml.push('  <tr>');
//            pdfxml.push('  <td>�D�׏،�:</td>');
//            pdfxml.push('  <td style="width: 117px;">'+condition_data.billoflading+'</td>');
//            pdfxml.push('  </tr>');
//            pdfxml.push('  <tr>');
//            pdfxml.push('  <td>�[�i���\���:</td>');
//            pdfxml.push('  <td style="width: 117px;">'+condition_data.delivery_date+'</td>');
            pdfxml.push('  </tr></table>');
            

            
            
            pdfxml.push('');
            pdfxml.push('<table border="2" cellpadding="1" cellspacing="1" style="width:100%; "><tr>');
//            pdfxml.push('  <td style="width:230px">&nbsp;</td>');
//            pdfxml.push('  <td>&nbsp;</td>');
            pdfxml.push('  </tr>');
            pdfxml.push('  <tr>');
//            pdfxml.push('  <td>&nbsp;</td>');
            pdfxml.push('  <td align="center"><span style="font-size:22px;text-align:center;">�����ו��ꗗ</span></td>');
            pdfxml.push('  </tr>');
            pdfxml.push('  <tr>');
//            pdfxml.push('  <td colspan="2">&nbsp;</td>');
            pdfxml.push('  </tr></table>');
            pdfxml.push('&nbsp;');
            pdfxml.push('');
            pdfxml.push('<table>');
            pdfxml.push('<thead>');
            pdfxml.push('  <tr>');

            // �w�b�_���쐬����
            if (headArray && headArray.length > 0) {
                for (var i = 0; i < headArray.length; i++) {
                    pdfxml.push('  <th style="font-size:6px;">' + headArray[i] + '</th>');
                }
            }
            pdfxml.push('  </tr>');
            pdfxml.push('</thead>');

            // �f�[�^���쐬����
            lineDataArray.forEach(function(lineData) {
            	//log.debug({title:'lineData',details:lineData});
                pdfxml.push('<tr>');
                for (var i = 0; i < lineData.length; i++) {
                    var itemValue = lineData[i];
                    //log.debug({title:'itemValue',details:itemValue});
                    if (i >= 5) {
                        pdfxml.push('<td align="right" style="font-size:6px;">'+aaa(itemValue)+'</td>');
                    } 
                    else {
                        pdfxml.push('<td style="font-size:6px;">'+aaa(itemValue)+'</td>');
                    }
                }
                pdfxml.push('</tr>');
            });
            pdfxml.push('</table>');
            pdfxml.push('</body>');
            pdfxml.push('</pdf>');

            var myFile = render.create();
            myFile.templateContent = pdfxml.join('');
            var pdfFile = myFile.renderAsPdf();
            pdfFile.name = filename;
            pdfFile.folder = folder;

            return pdfFile.save();
        }

        /**
         * �t�@�C���ۑ�
         *
         * @param contents
         * @param fileType
         * @param filename
         * @param folder
         * @return fileId
         */
        function createFile(contents, fileType, filename, folder) {
            var fileId = 0;
            try {
                var fileObj = file.create({
                    name : filename,
                    fileType : fileType,
                    contents : contents
                });
                fileObj.folder = folder;
                fileObj.encoding = file.Encoding.SHIFT_JIS;
                fileId = fileObj.save();
            } catch (err) {
                log.error({
                    title : 'Create File',
                    details : err.name + err.description
                });
            }
            return fileId;
        }

        /**
         * MAX�t�@�C�������擾����()
         */
        function getMaxFileName(folderId, subFileName) {

            var result = '';

            // �����^�C�v
            var searchType = 'folder';

            // ��������
            var searchFilters = [["internalid", "anyof", folderId], "AND", ["file.name", "contains", subFileName], "AND",
                ["file.name", "doesnotcontain", ".hed"]];

            // �����R����
            var searchColumns = [search.createColumn({
                name : "formulanumeric",
                summary : "MAX",
                formula : "TO_NUMBER(SUBSTR(REPLACE({file.name}, '.csv', ''), LENGTH(REPLACE({file.name}, '.csv', '')) - 3))",
                label : "�v�Z���i���l�j"
            })];

            var searchResults = createSearch(searchType, searchFilters, searchColumns);
            if (searchResults && searchResults.length > 0) {
                var tmpResult = searchResults[0];
                result = tmpResult.getValue(searchColumns[0]);
            }

            return result;
        }

        /**
         * �������ʃ��\�b�h
         */    
        
        function createSearch(searchType, searchFilters, searchColumns) {

            var resultList = [];
            var resultIndex = 0;
            var resultStep = 1000;

            var objSearch = search.create({
                type : searchType,
                filters : searchFilters,
                columns : searchColumns
            });
            var objResultSet = objSearch.run();

            do {
                var results = objResultSet.getRange({
                    start : resultIndex,
                    end : resultIndex + resultStep
                });

                if (results.length > 0) {
                    resultList = resultList.concat(results);
                    resultIndex = resultIndex + resultStep;
                }
            } while (results.length == 1000);

            return resultList;
        }

        /**
         * ���{�̓��t���擾����
         *
         * @returns ���{�̓��t
         */
        function getJapanDate() {

            var now = new Date();
            var offSet = now.getTimezoneOffset();
            var offsetHours = 9 + (offSet / 60);
            now.setHours(now.getHours() + offsetHours);

            return now;
        }

        /**
         * YYYYMMDDHHMMSS�ɕω�
         */
        function dateToStr(date) {
            var year = date.getFullYear();
            var month = pad(date.getMonth() + 1);
            var day = pad(date.getDate());
            var hour = pad(date.getHours());
            var minute = pad(date.getMinutes());
            var second = pad(date.getSeconds());
            return '' + year + month + day + hour + minute + second;
        }

        /**
         * @param v
         * @returns
         */
        function pad(v) {
            if (v >= 10) {
                return v;
            } else {
                return "0" + v;
            }
        }

        /**
         * ���l�f�[�^���O���߂ŏo�͂���
         *
         * @param {string} str
         * @param {Number} length
         * @return {string}
         */
        function zeropad(str, length) {
            return (new Array(length).join('0') + str).slice(-length);
        }

        function convertToDispay(val) {
            if(val == null){
                return '';
            }

            return val;
        }
             
        
        function aaa(text)
        {
       if ( typeof(text)!= "string" )
           text = text.toString() ;

       text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

        return text ;
        }
        function replace(text)
        {
        if ( typeof(text)!= "string" )
           text = text.toString() ;

        text = text.replace(/,/g, "_") ;

        return text ;
        }
        
        
        function getRoleSubsidiariesAndAddSelectOption(custpage_subsidiary) {        	
        	var syokuseki='';
        	try{
        		
        	var user = runtime.getCurrentUser();
        	var roleid=user.role;//nlapiGetRole()
        	
            // �ۑ������̌Ăяo��
            var filters = new Array();
            
//            log.debug({title:'debug0',details:000});
            
            filters.push(search.createFilter({
            	name:'internalId',
            	join:'',
            	operator:'anyof',
            	values:roleid,
            	})
              );//???
 
//            log.debug({title:'debug1',details: roleid});
           
            var savedSearch = search.load({
            	id: 'customsearch_djkk_role_subsearch',
            	type:'Role',
            		});
            var oldFilters = savedSearch.filters;
            oldFilters.forEach(function(c) {
                filters.push(c);
            });
            savedSearch.filters = filters;
               // �ۑ������̎��s
            var resultset = savedSearch.run();  //.runSearch()  
                var searchCount = 0;
                var searchlinesResults;
                if(resultset.getRange({start:0,end:1})){
                do {
                    searchlinesResults = resultset.getRange({start:searchCount, end:searchCount + 1000});
                     syokuseki= searchlinesResults[0].getValue('custrecord_syokuseki');
                    
                        for (var i = 0; i < searchlinesResults.length; i++) {
                        	custpage_subsidiary.addSelectOption({
                        			value: searchlinesResults[i].getValue('subsidiaries'),
                        			text: searchlinesResults[i].getText('subsidiaries')
                        	});

                            }
                    searchCount += 1000;
                } while (searchlinesResults.length == 1000);
                }else{
                	
                	syokuseki=user.subsidiary;//nlapiGetSubsidiary()       	

                	//2.0
            		var subsidiarySearch= search.create({
        				type: "subsidiary",
        				columns:
        					[
    						  search.createColumn({
    						  name: "internalid",
    						  sort: search.Sort.ASC
    						   }),
    									
        					  search.createColumn({name: "name"})
        					]
        			});        		

                    var resultSet = subsidiarySearch.run().getRange({start: 0, end: 1000});
        			for (var j = 0; j < resultSet.length; j++) {
        				custpage_subsidiary.addSelectOption({
    						value: resultSet[j].getValue({name: 'internalid'}),
    						text: resultSet[j].getValue({name: 'name'})
        				});
        			}
    			}
            }
        catch(e){
            	syokuseki=user.subsidiary;//nlapiGetSubsidiary()
            	//2.0
        		var subsidiarySearch= search.create({
    				type: "subsidiary",
    				columns:
    					[
						  search.createColumn({
						  name: "internalid",
						  sort: search.Sort.ASC
						   }),
									
    					  search.createColumn({name: "name"})
    					]
    			});        		

                var resultSet = subsidiarySearch.run().getRange({start: 0, end: 1000});
    			for (var j = 0; j < resultSet.length; j++) {
    				custpage_subsidiary.addSelectOption({
						value: resultSet[j].getValue({name: 'internalid'}),
						text: resultSet[j].getValue({name: 'name'})
    				});
    			}
            
            }
            return syokuseki.toString();
        }
      //2.0  
        return {
            onRequest: onRequest
        };
        
    });
