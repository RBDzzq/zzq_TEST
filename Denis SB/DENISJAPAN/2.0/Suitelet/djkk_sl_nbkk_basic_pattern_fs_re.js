/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/file', 'N/encode', 'N/runtime', 'N/format', 'N/search','N/record','/SuiteScripts/DENISJAPAN/2.0/Common/djkk_common'], function(file, encode, runtime, format, search,record,djkk_common) {

    /**
     * Definition of the Suitelet script trigger point.
     * 
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
        var request = context.request;
        var response = context.response;
        try {

            // �p�����[�^���擾����
            var currentScript = runtime.getCurrentScript();
            // �ۑ��t�H���_�[���擾����
            var saveFolder = currentScript.getParameter({
                name : 'custscript_tf_sl_basic_pattern_nbkk_save'
            });

            // ���ς̓���ID
            var estimateId = request.parameters.estimateId;

            log.debug("estimateId:", estimateId);
            var dataList = getOutputData(estimateId);

            var values = JSON.stringify(dataList);
            log.debug('values', values);

            var conditionsObj = lookupFields('estimate', estimateId);
            //20221209 changed by zhou  start CH163
//          var tranId = conditionsObj.tranid;
            var tranId = conditionsObj.transactionnumber;
            //end
            //modify by lj  start CH374
//            var fileName = '����' + conditionsObj.tranid + '_' + formatExcelFileName(getJapanDate()) + '.xls';
            //modify by lj  end 
            
            //CH762 20230818 add by zdj start
            var fileName = '����' + '_' + tranId + '_' + formatExcelFileName(getJapanDate()) + '.xls';
            //CH762 20230818 add by zdj end
            //20230901 add by CH762 start 
            var subsidiaryList = conditionsObj.subsidiary;
            var subsidiary = subsidiaryList[0].value;
            if (subsidiary == djkk_common.SUB_NBKK) {
                saveFolder = djkk_common.ESTIMATE_EXCEL_DJ_PATTERN_FS_NBKK;
            } else if(subsidiary == djkk_common.SUB_ULKK){
                saveFolder = djkk_common.ESTIMATE_EXCEL_DJ_PATTERN_FS_ULKK;
            } 
            //20230901 add by CH762 end 
            var fileId = createExcel(fileName, saveFolder, dataList, conditionsObj);

            if (fileId) {
                var objFile = file.load({
                    id : fileId
                });
                var url = objFile.url;
                response.writeLine({
                    output : url
                });
            }
        } catch (e) {
            log.error('�G���[', e.message);
            response.write({
                output : 'ERROR_' + e.name
            });
        }
    }

    function createExcel(fileName, folder, dataList, conditionsObj) {
        var excelxml = [];
        var userName = runtime.getCurrentUser().name;
        var createdDateTime = formatExcelData(getJapanDate());

        excelxml.push('<?xml version="1.0"?>');
        excelxml.push('<?mso-application progid="Excel.Sheet"?>');
        excelxml.push('<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"');
        excelxml.push(' xmlns:o="urn:schemas-microsoft-com:office:office"');
        excelxml.push(' xmlns:x="urn:schemas-microsoft-com:office:excel"');
        excelxml.push(' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"');
        excelxml.push(' xmlns:html="http://www.w3.org/TR/REC-html40">');
        excelxml.push(' <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">');
        excelxml.push('  <Author>' + userName + '</Author>');
        excelxml.push('  <LastAuthor>' + userName + '</LastAuthor>');
        excelxml.push('  <Created>' + createdDateTime + '</Created>');
        excelxml.push('  <Version>16.00</Version>');
        excelxml.push(' </DocumentProperties>');
        excelxml.push(' <OfficeDocumentSettings xmlns="urn:schemas-microsoft-com:office:office">');
        excelxml.push('  <AllowPNG/>');
        excelxml.push(' </OfficeDocumentSettings>');
        excelxml.push(' <ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel">');
        excelxml.push('  <WindowHeight>15840</WindowHeight>');
        excelxml.push('  <WindowWidth>29040</WindowWidth>');
        excelxml.push('  <WindowTopX>32767</WindowTopX>');
        excelxml.push('  <WindowTopY>32767</WindowTopY>');
        excelxml.push('  <ProtectStructure>False</ProtectStructure>');
        excelxml.push('  <ProtectWindows>False</ProtectWindows>');
        excelxml.push(' </ExcelWorkbook>');

        
        excelxml.push('    <Styles>');
        excelxml.push('      <Style ss:ID="Default" ss:Name="Normal">');
        excelxml.push('       <Alignment ss:Vertical="Bottom"/>');
        excelxml.push('       <Borders/>');
        excelxml.push('       <Font ss:FontName="Yu Gothic" x:CharSet="128" x:Family="Modern" ss:Size="11"');
        excelxml.push('        ss:Color="#000000"/>');
        excelxml.push('       <Interior/>');
        excelxml.push('       <NumberFormat/>');
        excelxml.push('       <Protection/>');
        excelxml.push('      </Style>');
        excelxml.push('      <Style ss:ID="s62" ss:Name="�W�� 2">');
        excelxml.push('       <Alignment ss:Vertical="Bottom"/>');
        excelxml.push('       <Borders/>');
        excelxml.push('       <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        excelxml.push('       <Interior/>');
        excelxml.push('       <NumberFormat/>');
        excelxml.push('       <Protection/>');
        excelxml.push('      </Style>');
        excelxml.push('      <Style ss:ID="s64" ss:Parent="s62">');
        excelxml.push('       <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        excelxml.push('       <Interior/>');
        excelxml.push('      </Style>');
        excelxml.push('      <Style ss:ID="s66" ss:Parent="s62">');
        //CH739 20230718 by zzq start
//      excelxml.push('       <Alignment ss:Horizontal="Center" ss:Vertical="Top"/>');
        excelxml.push('       <Alignment ss:Horizontal="Right" ss:Vertical="Top"/>');
        //CH739 20230718 by zzq end
        excelxml.push('       <Interior/>');
        excelxml.push('       <NumberFormat ss:Format="Long Date"/>');
        excelxml.push('      </Style>');
        excelxml.push('      <Style ss:ID="s68" ss:Parent="s62">');
        excelxml.push('       <Alignment ss:Horizontal="Center" ss:Vertical="Top"/>');
        excelxml.push('       <Interior/>');
        excelxml.push('       <NumberFormat ss:Format="[JPN][$-411]gggy&quot;�N&quot;m&quot;��&quot;d&quot;��&quot;"/>');
        excelxml.push('      </Style>');
        excelxml.push('      <Style ss:ID="s70">');
        //CH739 20230718 by zzq start
//      excelxml.push('       <Alignment ss:Horizontal="Center" ss:Vertical="Top"/>');
        excelxml.push('       <Alignment ss:Horizontal="Right" ss:Vertical="Top"/>');
        //CH739 20230718 by zzq end
        excelxml.push('       <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        excelxml.push('      </Style>');
        excelxml.push('      <Style ss:ID="s71" ss:Parent="s62">');
        //CH739 20230718 by zzq start
//      excelxml.push('       <Alignment ss:Horizontal="Center" ss:Vertical="Top"/>');
        excelxml.push('       <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>');
        //CH739 20230718 by zzq end
        excelxml.push('       <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="20"');
        excelxml.push('        ss:Bold="1"/>');
        excelxml.push('       <Interior/>');
        excelxml.push('      </Style>');
        excelxml.push('      <Style ss:ID="s73" ss:Parent="s62">');
        excelxml.push('       <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        excelxml.push('       <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="16"');
        excelxml.push('        ss:Bold="1"/>');
        excelxml.push('       <Interior/>');
        excelxml.push('      </Style>');
        excelxml.push('      <Style ss:ID="s74" ss:Parent="s62">');
        excelxml.push('       <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>');
        excelxml.push('       <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern"/>');
        excelxml.push('       <Interior/>');
        excelxml.push('      </Style>');
        excelxml.push('      <Style ss:ID="s75" ss:Parent="s62">');
        excelxml.push('       <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>');
        excelxml.push('       <Interior/>');
        excelxml.push('      </Style>');
        excelxml.push('      <Style ss:ID="s76" ss:Parent="s62">');
        excelxml.push('       <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        excelxml.push('       <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern"/>');
        excelxml.push('       <Interior/>');
        excelxml.push('      </Style>');
        excelxml.push('      <Style ss:ID="s78" ss:Parent="s62">');
        excelxml.push('       <Alignment ss:Horizontal="Left" ss:Vertical="Center" ss:ShrinkToFit="1"/>');
        excelxml.push('       <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="9"/>');
        excelxml.push('       <Interior/>');
        excelxml.push('      </Style>');
        excelxml.push('      <Style ss:ID="s79" ss:Parent="s62">');
        excelxml.push('       <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>');
        excelxml.push('       <Borders>');
        excelxml.push('        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        excelxml.push('        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        excelxml.push('        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        excelxml.push('        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        excelxml.push('       </Borders>');
        excelxml.push('       <Interior ss:Color="#C0C0C0" ss:Pattern="Solid"/>');
        excelxml.push('      </Style>');
        excelxml.push('      <Style ss:ID="s80" ss:Parent="s62">');
        excelxml.push('       <Alignment ss:Horizontal="Left" ss:Vertical="Center" ss:WrapText="1"/>');
        excelxml.push('       <Borders>');
        excelxml.push('        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        excelxml.push('        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        excelxml.push('        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        excelxml.push('        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        excelxml.push('       </Borders>');
        excelxml.push('       <Interior/>');
        excelxml.push('      </Style>');
        excelxml.push('      <Style ss:ID="s81" ss:Parent="s62">');
        excelxml.push('       <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>');
        excelxml.push('       <Borders>');
        excelxml.push('        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        excelxml.push('        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        excelxml.push('        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        excelxml.push('        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        excelxml.push('       </Borders>');
        excelxml.push('       <Interior/>');
        excelxml.push('      </Style>');
        excelxml.push('      <Style ss:ID="s82" ss:Parent="s62">');
        excelxml.push('       <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>');
        excelxml.push('       <Borders>');
        excelxml.push('        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        excelxml.push('        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        excelxml.push('        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        excelxml.push('        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        excelxml.push('       </Borders>');
        excelxml.push('       <Interior/>');
        excelxml.push('       <NumberFormat ss:Format="@"/>');
        excelxml.push('      </Style>');
        excelxml.push('      <Style ss:ID="s83" ss:Parent="s62">');
        excelxml.push('       <Alignment ss:Horizontal="Right" ss:Vertical="Center" ss:WrapText="1"/>');
        excelxml.push('       <Borders>');
        excelxml.push('        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        excelxml.push('        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        excelxml.push('        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        excelxml.push('        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        excelxml.push('       </Borders>');
        excelxml.push('       <Interior/>');
        excelxml.push('   <NumberFormat ss:Format="[$\\-411]#,##0_);[Red]\\([$\\-411]#,##0\\)"/>');
        excelxml.push('      </Style>');
        excelxml.push('      <Style ss:ID="s84">');
        excelxml.push('       <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        excelxml.push('       <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"');
        excelxml.push('        ss:Color="#FF0000"/>');
        excelxml.push('      </Style>');
        excelxml.push('      <Style ss:ID="s86">');
        excelxml.push('       <Alignment ss:Horizontal="Right" ss:Vertical="Top"/>');
        excelxml.push('       <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        excelxml.push('      </Style>');
        excelxml.push('      <Style ss:ID="s87">');
        excelxml.push('       <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        excelxml.push('      </Style>');
        excelxml.push('      <Style ss:ID="s88">');
        excelxml.push('       <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        excelxml.push('       <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"');
        excelxml.push('        ss:Color="#3366FF"/>');
        excelxml.push('      </Style>');
        excelxml.push('     </Styles>');
        var row = 12 + dataList.length + 11;
        excelxml.push(' <Worksheet ss:Name="��{�p�^�[��(NBKK)�@FS�@RE">');
        excelxml.push('  <Names>');
        excelxml.push('   <NamedRange ss:Name="Print_Area" ss:RefersTo="=' + "'��{�p�^�[��(NBKK)�@FS�@RE'" + '!C1:C9"/>');
        // CH162 zheng 20230219 start
        // excelxml.push('   <NamedRange ss:Name="Print_Titles" ss:RefersTo="=' + "'��{�p�^�[��(NBKK)�@FS�@RE'" + '!R1:R12"/>');
        excelxml.push('   <NamedRange ss:Name="Print_Titles" ss:RefersTo="=' + "'��{�p�^�[��(NBKK)�@FS�@RE'" + '!R1:R11"/>');
        // CH162 zheng 20230219 end
        excelxml.push('  </Names>');
//        excelxml.push('  <Table ss:ExpandedCWorksheetOptionsolumnCount="16" ss:ExpandedRowCount="' + row + '" x:FullColumns="1"');
        excelxml.push('  <Table  ss:ExpandedColumnCount="16" ss:ExpandedRowCount="83" x:FullColumns="1"');
        excelxml.push('   x:FullRows="1" ss:StyleID="s64" ss:DefaultColumnWidth="54"');
        excelxml.push('   ss:DefaultRowHeight="13.5">');
        excelxml.push('   <Column ss:StyleID="s64" ss:AutoFitWidth="0" ss:Width="42.6"/>');
        excelxml.push('   <Column ss:StyleID="s64" ss:AutoFitWidth="0" ss:Width="106.8"/>');
        excelxml.push('   <Column ss:StyleID="s64" ss:AutoFitWidth="0" ss:Width="178.8"/>');
        excelxml.push('   <Column ss:StyleID="s64" ss:AutoFitWidth="0" ss:Width="60"/>');
        excelxml.push('   <Column ss:StyleID="s64" ss:Width="31.8"/>');
        excelxml.push('   <Column ss:StyleID="s64" ss:AutoFitWidth="0" ss:Width="87.6"/>');
        
        excelxml.push('  <Column ss:Index="8" ss:StyleID="s64" ss:AutoFitWidth="0"');
        excelxml.push('      ss:Width="53.400000000000006"/>');
        excelxml.push('     <Column ss:StyleID="s64" ss:AutoFitWidth="0" ss:Width="83"/>');
        excelxml.push('     <Column ss:Index="11" ss:StyleID="s64" ss:AutoFitWidth="0" ss:Width="63"/>');
        excelxml.push('     <Column ss:Index="15" ss:StyleID="s64" ss:AutoFitWidth="0" ss:Width="61.8"/>');
        excelxml.push('     <Row ss:AutoFitHeight="0">');
        excelxml.push('      <Cell ss:Index="8" ss:MergeAcross="1" ss:StyleID="s66"><Data ss:Type="DateTime">' + createdDateTime + '</Data><NamedCell');
        excelxml.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('    <Cell ss:Index="16" ss:StyleID="s68"><NamedCell ss:Name="Print_Titles"/></Cell>');
        excelxml.push('   </Row>');

        excelxml.push('   <Row ss:AutoFitHeight="0">');
        //modify by lj  start CH374
        excelxml.push('    <Cell ss:Index="8" ss:MergeAcross="1" ss:StyleID="s70"><Data ss:Type="String">���Ϗ��ԍ��F' + conditionsObj.transactionnumber + '</Data><NamedCell');
        //modify by lj  end CH374
        excelxml.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('   </Row>');

        excelxml.push('   <Row ss:AutoFitHeight="0" ss:Height="24">');
        excelxml.push('    <Cell ss:MergeAcross="8" ss:StyleID="s71"><PhoneticText');
        excelxml.push('      xmlns="urn:schemas-microsoft-com:office:excel">�I�~�c�����V��</PhoneticText><Data');
        excelxml.push('      ss:Type="String">�䌩�Ϗ�</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        excelxml.push('      ss:Name="Print_Area"/></Cell>');
        excelxml.push('    <Cell ss:Index="16" ss:StyleID="s71"><NamedCell ss:Name="Print_Titles"/></Cell>');
        excelxml.push('   </Row>');
        excelxml.push('   <Row ss:AutoFitHeight="0">');
        excelxml.push('    <Cell ss:Index="16" ss:StyleID="s68"><NamedCell ss:Name="Print_Titles"/></Cell>');
        excelxml.push('   </Row>');
        var entityText = '';
        var entityList = conditionsObj.entity;
        if (entityList.length > 0) {
//            entityText = entityList[0].text + ' �䒆';
        	//add by song  start CH251
        	 var companynameObj = search.lookupFields({
                 type : 'customer',
                 id : entityList[0].value,
                 columns : ['companyname']
             });
         	
             entityText = companynameObj.companyname + ' �䒆';
             log.debug('entityText',entityText);
             //add by song  end CH251
        }
        
        //CH474
        var subsidiarySearch = search.create({
            type: search.Type.SUBSIDIARY,
            filters: ['internalid', 'is', 2],
            columns: ['name', 'phone','fax',
                      search.createColumn({
  		                name: 'custrecord_djkk_address_fax',
  		                join: 'address',
  		                label: 'FAX'
              }),'legalname','zip',
                      	search.createColumn({
		                name: 'custrecord_djkk_address_state',
		                join: 'address',
		                label: '�s���{��'
            }),'city','address1','address2','address3'],
          });

        var result = subsidiarySearch.run().getRange({
            start: 0,
            end: 1 
          })[0];
        
        var subsidiary = {
        		name: result.getValue('name'),
        		phone: result.getValue('phone'),
        		fax: result.getValue({name: 'custrecord_djkk_address_fax', join: 'address'}),
        		legalname: result.getValue('legalname'),
        		zip: result.getValue('zip'),
        	    state: result.getValue({name: 'custrecord_djkk_address_state', join: 'address'}),
        		city: result.getValue('city'),
        		address1: result.getValue('address1'),
        		address2: result.getValue('address2'),
        		address3: result.getValue('address3')
        	  };
        var subAddr = subsidiary.state + subsidiary.city + subsidiary.address1 + subsidiary.address2 + subsidiary.address3
        log.debug('subsidiary.legalname',subsidiary.legalname);
        log.debug('subAddr',subAddr);
        log.debug('subsidiary.phone',subsidiary.phone);
        log.debug('subsidiary.fax',subsidiary.fax);
        
        excelxml.push('   <Row ss:AutoFitHeight="0" ss:Height="18.75">');
        excelxml.push('    <Cell ss:StyleID="s73"><Data ss:Type="String">' + entityText + '</Data><NamedCell');
        excelxml.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('    <Cell ss:StyleID="s73"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        excelxml.push('      ss:Name="Print_Area"/></Cell>');
        excelxml.push('   </Row>');
        excelxml.push('   <Row ss:AutoFitHeight="0" ss:Height="18.75">');
        excelxml.push('    <Cell ss:StyleID="s73"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        excelxml.push('      ss:Name="Print_Area"/></Cell>');
        excelxml.push('    <Cell ss:StyleID="s73"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        excelxml.push('      ss:Name="Print_Area"/></Cell>');
        excelxml.push('    <Cell ss:Index="6" ss:StyleID="s74"><PhoneticText');
        excelxml.push('      xmlns="urn:schemas-microsoft-com:office:excel">�j�`�t�c�{�E�G�L�J�u�V�L�J�C�V��</PhoneticText><Data');
        excelxml.push('      ss:Type="String">'+subsidiary.legalname+'</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        
        var resultDic = {};
        var userID = conditionsObj.salesrep;
        if (userID.length > 0) {
        	userID = userID[0].value;
        }
        log.debug('userID',userID);
        
        if(userID.length > 0){
        	var searchType = 'employee';
    		var searchFilters = [ [ "internalid", "anyof", userID ] ];

    		var searchColumns = [
    		        // TODO
    				search.createColumn("internalid"),
    				search.createColumn("city"),
    				search.createColumn("address1"),
    				search.createColumn("address2"),
    				search.createColumn("altphone"),
    				search.createColumn("fax"),
    				search.createColumn("lastname"),
    				search.createColumn("firstname") ];
    		var userAddressSearch = createSearch(searchType, searchFilters, searchColumns);
    		if (userAddressSearch && userAddressSearch.length > 0) {
    			var tmpResult = userAddressSearch[0];
    			// TODO
    			//			resultDic.address1 = tmpResult.getValue(searchColumns[0]) + tmpResult.getValue(searchColumns[1]) + tmpResult.getValue(searchColumns[2]);
    			resultDic.address1 = tmpResult.getValue(searchColumns[1]) + tmpResult.getValue(searchColumns[2]);
    			resultDic.address2 = tmpResult.getValue(searchColumns[3]);
    			resultDic.phone = tmpResult.getValue(searchColumns[4]);
    			resultDic.fax = tmpResult.getValue(searchColumns[5]);
    			resultDic.name = tmpResult.getValue(searchColumns[6]) + tmpResult.getValue(searchColumns[7]);
    		}
            
        }else{
        	resultDic.address1 = '';
			resultDic.address2 = '';
			resultDic.phone = '';
			resultDic.fax = '';
			resultDic.name = '';
        }
        
        excelxml.push('      ss:Name="Print_Area"/></Cell>');
        excelxml.push('    <Cell ss:StyleID="s75"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        excelxml.push('      ss:Name="Print_Area"/></Cell>');
        excelxml.push('   </Row>');
        excelxml.push('   <Row ss:AutoFitHeight="0">');
        excelxml.push('    <Cell ss:Index="6" ss:StyleID="s76"><Data ss:Type="String">��' + subsidiary.zip + '</Data><NamedCell');
        excelxml.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('   </Row>');
        excelxml.push('   <Row ss:AutoFitHeight="0">');
        excelxml.push('    <Cell ss:Index="4" ss:StyleID="s75"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        excelxml.push('      ss:Name="Print_Area"/></Cell>');
        excelxml.push('    <Cell ss:Index="6" ss:StyleID="s76"><Data ss:Type="String">'+subAddr+'</Data><NamedCell');
        excelxml.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('   </Row>');
        excelxml.push('   <Row ss:AutoFitHeight="0">');
        excelxml.push('    <Cell ss:Index="6" ss:StyleID="s76"><Data ss:Type="String">TEL�F' + subsidiary.phone + '</Data><NamedCell');
        excelxml.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('   </Row>');
        excelxml.push('   <Row ss:AutoFitHeight="0">');
        excelxml.push('    <Cell ss:Index="6" ss:StyleID="s76"><Data ss:Type="String">FAX�F' + subsidiary.fax + '</Data><NamedCell');
        excelxml.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('   </Row>');
        excelxml.push('   <Row ss:AutoFitHeight="0">');
        excelxml.push('    <Cell ss:Index="5" ss:StyleID="s76"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        excelxml.push('      ss:Name="Print_Area"/></Cell>');
        excelxml.push('    <Cell ss:MergeAcross="2" ss:StyleID="s78"><Data ss:Type="String">�S���F' + resultDic.name + '</Data><NamedCell');
        excelxml.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('   </Row>');

        // �^�C�g��
        excelxml.push('   <Row ss:AutoFitHeight="0" ss:Height="27">');
        excelxml.push('    <Cell ss:StyleID="s79"><PhoneticText');
        excelxml.push('      xmlns="urn:schemas-microsoft-com:office:excel">�V���E�q��</PhoneticText><Data');
//        excelxml.push('      ss:Type="String">���i&#10;�R�[�h</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        excelxml.push('      ss:Type="String">�J�^���O&#10;�R�[�h</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');//CH162
        excelxml.push('      ss:Name="Print_Area"/></Cell>');
        excelxml.push('    <Cell ss:StyleID="s79"><PhoneticText');
        excelxml.push('      xmlns="urn:schemas-microsoft-com:office:excel">�i</PhoneticText><Data');
        excelxml.push('      ss:Type="String">�u�����h��</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        excelxml.push('      ss:Name="Print_Area"/></Cell>');
        excelxml.push('    <Cell ss:StyleID="s79"><PhoneticText');
        excelxml.push('      xmlns="urn:schemas-microsoft-com:office:excel">�V���E�q�����C</PhoneticText><Data');
        excelxml.push('      ss:Type="String">���i��</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        excelxml.push('      ss:Name="Print_Area"/></Cell>');
        excelxml.push('    <Cell ss:StyleID="s79"><Data ss:Type="String">�K�i</Data><NamedCell');
        excelxml.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('    <Cell ss:StyleID="s79"><PhoneticText');
        excelxml.push('      xmlns="urn:schemas-microsoft-com:office:excel">�C�X�E</PhoneticText><Data');
        excelxml.push('      ss:Type="String">����</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        excelxml.push('      ss:Name="Print_Area"/></Cell>');
        excelxml.push('    <Cell ss:StyleID="s79"><Data ss:Type="String">JAN�R�[�h</Data><NamedCell');
        excelxml.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('    <Cell ss:StyleID="s79"><PhoneticText');
        excelxml.push('      xmlns="urn:schemas-microsoft-com:office:excel">�V���E�~�L�J���Z�C�]�E�S</PhoneticText><Data');
        excelxml.push('      ss:Type="String">�ܖ�����&#10;�i������j</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        excelxml.push('      ss:Name="Print_Area"/></Cell>');
        excelxml.push('    <Cell ss:StyleID="s79"><PhoneticText');
        excelxml.push('      xmlns="urn:schemas-microsoft-com:office:excel">�V�L�J�J�N�[�C�k</PhoneticText><Data');
        excelxml.push('      ss:Type="String">�d�؉��i(�Ŕ�)</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        excelxml.push('      ss:Name="Print_Area"/></Cell>');
        excelxml.push('    <Cell ss:StyleID="s79"><PhoneticText');
        excelxml.push('      xmlns="urn:schemas-microsoft-com:office:excel">�T���R�E�n���o�C�J�J�N</PhoneticText><Data');
        excelxml.push('      ss:Type="String">�Q�l�̔����i</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        excelxml.push('      ss:Name="Print_Area"/></Cell>');
      //add by song  start CH162
//        excelxml.push('    <Cell ss:StyleID="s79"><PhoneticText');
//        excelxml.push('      xmlns="urn:schemas-microsoft-com:office:excel">�T���R�E�n���o�C�J�J�N</PhoneticText><Data');
//        excelxml.push('      ss:Type="String">DJ_���i�\����</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
//        excelxml.push('      ss:Name="Print_Area"/></Cell>');
      //add by song  end CH162
        excelxml.push('   </Row>');

        // ����
        for (var i = 0; i < dataList.length; i++) {

            var tempData = dataList[i];

            excelxml.push('   <Row ss:AutoFitHeight="0" ss:Height="27">');
            // ���i�R�[�h
            excelxml.push('    <Cell ss:StyleID="s80"><Data ss:Type="String">' + tempData.item + '</Data><NamedCell');
            excelxml.push('      ss:Name="Print_Area"/></Cell>');
            // �u�����h��
            excelxml.push('    <Cell ss:StyleID="s80"><Data ss:Type="String">' + tempData.brand + '</Data><NamedCell');
            excelxml.push('      ss:Name="Print_Area"/></Cell>');
            // ���i��
            excelxml.push('    <Cell ss:StyleID="s80"><Data ss:Type="String">' + tempData.productName + '</Data><NamedCell');
            excelxml.push('      ss:Name="Print_Area"/></Cell>');
            // �K�i
            excelxml.push('    <Cell ss:StyleID="s81"><Data ss:Type="String">' + tempData.abbreviationName + '</Data><NamedCell');
            excelxml.push('      ss:Name="Print_Area"/></Cell>');
            // �C�X�E
            excelxml.push('    <Cell ss:StyleID="s81"><Data ss:Type="Number">' + tempData.perunitquantity + '</Data><NamedCell');
            excelxml.push('      ss:Name="Print_Area"/></Cell>');
            // JAN�R�[�h
            excelxml.push('    <Cell ss:StyleID="s82"><Data ss:Type="String">' + tempData.jancode + '</Data><NamedCell');
            excelxml.push('      ss:Name="Print_Area"/></Cell>');
            // �ܖ����ԁi������j
            excelxml.push('    <Cell ss:StyleID="s82"><Data ss:Type="String">' + tempData.tastePeriod + '</Data><NamedCell');
            excelxml.push('      ss:Name="Print_Area"/></Cell>');
            // �d�؉��i(�Ŕ�)
            excelxml.push('    <Cell ss:StyleID="s83"><Data ss:Type="Number">' + tempData.shiPrice + '</Data><NamedCell');
            excelxml.push('      ss:Name="Print_Area"/></Cell>');
            // �Q�l�̔����i
            excelxml.push('    <Cell ss:StyleID="s83"><Data ss:Type="Number">' + tempData.referencePrice + '</Data><NamedCell');
            excelxml.push('      ss:Name="Print_Area"/></Cell>');
          //add by song  start CH162
//            //DJ_���i�\����
//            excelxml.push('    <Cell ss:StyleID="s31"><Data ss:Type="String">' + tempData.productName + '</Data><NamedCell');
//            excelxml.push('      ss:Name="Print_Area"/></Cell>');
          //add by song  end CH162
            excelxml.push('   </Row>');
        }

        // CH162 zheng 20230219 start
        var forCnt = 0;
        var page1Max = 26;
        var pageMoreMax = 27;
        var page1Line = 50;
        var pageMoreLine = 52;
        log.debug("dataList",dataList.length);
        if (dataList.length <= page1Max) {
            forCnt = djkk_common.getExcelPrintPage1(dataList.length, page1Line);
        } else {
            forCnt = djkk_common.getExcelPrintPage2(dataList.length, page1Max, pageMoreMax, pageMoreLine);
        }
        log.debug("forCnt",forCnt);
        for (var i = 0; i < forCnt; i++) {
            excelxml.push('<Row ss:AutoFitHeight="0">');
            excelxml.push('<Cell ss:Index="9" ss:StyleID="s84"><NamedCell ss:Name="Print_Area"/></Cell>');
            excelxml.push('</Row>');
        }
//        var subRow = 12 + dataList.length + 1;
//        excelxml.push('<Row ss:Index="' + subRow + '">');
//        excelxml.push('<Cell ss:Index="9" ss:StyleID="s77"><NamedCell ss:Name="Print_Area"/></Cell>');
//        excelxml.push('</Row>');
//        excelxml.push('<Row>');
//        excelxml.push('<Cell ss:Index="9" ss:StyleID="s77"><NamedCell ss:Name="Print_Area"/></Cell>');
//        excelxml.push('</Row>');
        // CH162 zheng 20230219 end
        excelxml.push('<Row ss:AutoFitHeight="0">');
        excelxml.push('<Cell ss:StyleID="s86"><Data ss:Type="String" x:Ticked="1">�P�D</Data><NamedCell');
        excelxml.push('  ss:Name="Print_Area"/></Cell>');
        excelxml.push('<Cell ss:StyleID="s87"><PhoneticText');
        excelxml.push('  xmlns="urn:schemas-microsoft-com:office:excel">�~�c�������E�R�E�L�Q��</PhoneticText><Data');
        excelxml.push('  ss:Type="String">��������</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('<Cell ss:Index="9" ss:StyleID="s84"><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('   </Row>');
        
        var showObj = {};

        showObj['showCon_a'] = 'A)�@1��̍Œᔭ������(�z�����b�g)';
    	showObj['showText1_a'] = '����';
        var conditonAList = conditionsObj.custbody_djkk_estimate_po_conditon_a;
        showObj['showText2_a'] = conditonAList.length > 0 ? conditonAList[0].text : '';

        showObj['showCon_b'] = 'B)�@�z����';
        var conditonB1List = conditionsObj.custbody_djkk_estimate_po_conditon_b1;
        var conditonB2List = conditionsObj.custbody_djkk_estimate_po_conditon_b2;
        showObj['showText1_b'] = conditonB2List.length > 0 ? conditonB2List[0].text : '';
      //add by song  start CH250
        var estimateRecordId = conditonB1List.length > 0 ? conditonB1List[0].value : '';
        log.debug('estimateRecordId',estimateRecordId);
        // CH162 zheng 20230219 start
        if (estimateRecordId) {
            estimateRecord = record.load({
                type: 'customrecord_djkk_estimate_po_coniton_b1',
                id: estimateRecordId
            });
            showObj['showText2_b'] = estimateRecord.getValue({fieldId: 'custrecord_djkk_estimate_subsidiary_no1'});
            showObj['showText3_b']  = estimateRecord.getValue({fieldId: 'custrecord_djkk_estimate_subsidiary_no2'});
        } else {
            showObj['showText2_b'] = "";
            showObj['showText3_b']  = "";
        }
        // CH162 zheng 20230219 end
        //add by song  end CH250
    
    	showObj['showCon_c'] = 'C)�@�[�i�ꏊ';
        var conditonCList = conditionsObj.custbody_djkk_estimate_po_conditon_c;
       	showObj['showText1_c'] = conditonCList.length > 0 ? conditonCList[0].text : '';
        showObj['showText2_c'] = '';

        showObj['showCon_d'] = 'D)�@�P�[�X�P��';
    	showObj['showText1_d'] = '';
    	showObj['showText2_d'] = '';
    	
    	showObj['showCon_e'] = 'E)�@FAX�ɂĒ����i���ʂ̂ݎ󂯕t���܂��j';
        var conditonDList = conditionsObj.custbody_djkk_estimate_po_conditon_d;
//       	showObj['showText1_e'] = conditonDList.length > 0 ? conditonDList[0].text : '';
//        showObj['showText2_e'] = '';
        //add by song  start CH250
        var poconitonRecordId = conditonDList.length > 0 ? conditonDList[0].value : '';
        // CH162 zheng 20230219 start
        if (poconitonRecordId) {
            poconitonRecord = record.load({
                type: 'customrecord_djkk_estimate_po_coniton_d',
                id: poconitonRecordId
            });
            showObj['showText1_e']= poconitonRecord.getValue({fieldId: 'custrecord_djkk_estimate_po_coniton_no1'});
            showObj['showText2_e']= poconitonRecord.getValue({fieldId: 'custrecord_djkk_estimate_po_coniton_no2'});
        } else {
            showObj['showText1_e']= "";
            showObj['showText2_e']= "";
        }
        // CH162 zheng 20230219 end
      //add by song  end CH250
        
        excelxml.push('   <Row ss:AutoFitHeight="0">');
        excelxml.push('<Cell ss:Index="2" ss:StyleID="s87"><PhoneticText');
        excelxml.push('  xmlns="urn:schemas-microsoft-com:office:excel">�n�C�\�E�����E</PhoneticText><Data');
        excelxml.push('  ss:Type="String">' + showObj.showCon_a + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('<Cell ss:Index="4" ss:StyleID="s87"><Data ss:Type="String">' + showObj.showText1_a + '</Data><NamedCell');
        excelxml.push('  ss:Name="Print_Area"/></Cell>');
        excelxml.push('<Cell ss:Index="6" ss:StyleID="s87"><PhoneticText');
        excelxml.push('  xmlns="urn:schemas-microsoft-com:office:excel">�G���[�C�k</PhoneticText><Data');
        excelxml.push('  ss:Type="String">' + showObj.showText2_a + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('   </Row>');

        excelxml.push('   <Row>');
        excelxml.push('</Row>');
        
        excelxml.push('   <Row ss:Index="67" ss:AutoFitHeight="0">');
        excelxml.push('<Cell ss:Index="2" ss:StyleID="s87"><PhoneticText');
        excelxml.push('  xmlns="urn:schemas-microsoft-com:office:excel">�n�C�\�E�����E</PhoneticText><Data');
        excelxml.push('  ss:Type="String">' + showObj.showCon_b + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('<Cell ss:Index="4" ss:StyleID="s87"><Data ss:Type="String">' + showObj.showText1_b + '</Data><NamedCell');
        excelxml.push('  ss:Name="Print_Area"/></Cell>');
        excelxml.push('<Cell ss:Index="6" ss:StyleID="s87"><PhoneticText');
        excelxml.push('  xmlns="urn:schemas-microsoft-com:office:excel">�G���[�C�k</PhoneticText><Data');
        excelxml.push('  ss:Type="String">' + showObj.showText2_b + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push(' <Cell ss:Index="12" ss:StyleID="s84"><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('   </Row>');
        
        excelxml.push('   <Row ss:AutoFitHeight="0">');
        excelxml.push('<Cell ss:Index="2" ss:StyleID="s87"><PhoneticText');
        excelxml.push('  xmlns="urn:schemas-microsoft-com:office:excel">�n�C�\�E�����E</PhoneticText><Data');
        excelxml.push('   ss:Type="String">�i���b�g�����̏ꍇ�z�����𒸑Ղ������܂��B�j</Data><NamedCell ss:Name="Print_Area"/></Cell>');
      //add by song  start CH250
        excelxml.push('<Cell ss:Index="6" ss:StyleID="s87"><PhoneticText');
        excelxml.push('  xmlns="urn:schemas-microsoft-com:office:excel">�G���[�C�k</PhoneticText><Data');
        excelxml.push('  ss:Type="String">' + showObj.showText3_b + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
      //add by song  end CH250
        excelxml.push('</Row>');
        
        excelxml.push('   <Row>');
        excelxml.push('</Row>');
        
        excelxml.push('   <Row ss:Index="70" ss:AutoFitHeight="0">');
        excelxml.push('<Cell ss:Index="2" ss:StyleID="s87"><PhoneticText');
        excelxml.push('  xmlns="urn:schemas-microsoft-com:office:excel">�n�C�\�E�����E</PhoneticText><Data');
        excelxml.push('  ss:Type="String">' + showObj.showCon_c + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('<Cell ss:Index="4" ss:StyleID="s88"><Data ss:Type="String">' + showObj.showText1_c + '</Data><NamedCell');
        excelxml.push('  ss:Name="Print_Area"/></Cell>');
        excelxml.push('<Cell ss:Index="6" ss:StyleID="s87"><PhoneticText');
        excelxml.push('  xmlns="urn:schemas-microsoft-com:office:excel">�G���[�C�k</PhoneticText><Data');
        excelxml.push('  ss:Type="String">' + showObj.showText2_c + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push(' <Cell ss:Index="12" ss:StyleID="s84"><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('   </Row>');
        
        excelxml.push('   <Row ss:AutoFitHeight="0">');
        excelxml.push('<Cell ss:Index="2" ss:StyleID="s87"><PhoneticText');
        excelxml.push('  xmlns="urn:schemas-microsoft-com:office:excel">�n�C�\�E�����E</PhoneticText><Data');
        excelxml.push('  ss:Type="String">' + showObj.showCon_d + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('<Cell ss:Index="4" ss:StyleID="s87"><Data ss:Type="String">' + showObj.showText1_d + '</Data><NamedCell');
        excelxml.push('  ss:Name="Print_Area"/></Cell>');
        
        excelxml.push('<Cell ss:Index="6" ss:StyleID="s87">');
        excelxml.push('<PhoneticText xmlns="urn:schemas-microsoft-com:office:excel">�G���[�C�k</PhoneticText>');
        excelxml.push('<Data ss:Type="String">' + showObj.showText2_d + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push(' <Cell ss:Index="12" ss:StyleID="s84"><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('   </Row>');
        
        excelxml.push('   <Row ss:AutoFitHeight="0">');
        excelxml.push('<Cell ss:Index="2" ss:StyleID="s87">');
        excelxml.push('<PhoneticText xmlns="urn:schemas-microsoft-com:office:excel">�n�C�\�E�����E</PhoneticText>');
        excelxml.push('<Data ss:Type="String">' + showObj.showCon_e + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('<Cell ss:Index="4" ss:StyleID="s87"><Data ss:Type="String">' + showObj.showText1_e + '</Data><NamedCell');
        excelxml.push('  ss:Name="Print_Area"/></Cell>');
//        excelxml.push('<Cell ss:Index="6" ss:StyleID="s79"><PhoneticText');
//        excelxml.push('  xmlns="urn:schemas-microsoft-com:office:excel">�G���[�C�k</PhoneticText><Data');
//        excelxml.push('  ss:Type="String">' + showObj.showText2_e + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
//        excelxml.push(' <Cell ss:Index="12" ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('   </Row>');
        
        //add by song  start CH250
        excelxml.push('   <Row ss:AutoFitHeight="0">');
        excelxml.push('<Cell ss:Index="2" ss:StyleID="s87">');
        excelxml.push('<PhoneticText xmlns="urn:schemas-microsoft-com:office:excel">�n�C�\�E�����E</PhoneticText>');
        excelxml.push('<Data ss:Type="String">' + '' + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('<Cell ss:Index="4" ss:StyleID="s87"><Data ss:Type="String">' + showObj.showText2_e + '</Data><NamedCell');
        excelxml.push('  ss:Name="Print_Area"/></Cell>');
        excelxml.push('   </Row>');
        //add by song  end CH250
        
        excelxml.push('   <Row>');
        excelxml.push('</Row>');
        
        var nouhinDateText = '';
        var nouhinDateList = conditionsObj.custbody_djkk_estimate_nouhin_date;
        if (nouhinDateList.length > 0) {
            nouhinDateText = nouhinDateList[0].text;
        }
        
        excelxml.push('   <Row ss:Index="75" ss:AutoFitHeight="0">');
        excelxml.push('<Cell ss:StyleID="s86"><Data ss:Type="String" x:Ticked="1">�Q�D</Data><NamedCell');
        excelxml.push('  ss:Name="Print_Area"/></Cell>');
        excelxml.push('<Cell ss:StyleID="s87"><PhoneticText');
        excelxml.push('  xmlns="urn:schemas-microsoft-com:office:excel">�~�c�������E�R�E�L�Q��</PhoneticText><Data');
        excelxml.push('  ss:Type="String">�[�i��</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('<Cell ss:Index="4" ss:StyleID="s88"><PhoneticText');
        excelxml.push('  xmlns="urn:schemas-microsoft-com:office:excel">�W���`���E�S�j�`�S�m�E�q��</PhoneticText><Data');
        excelxml.push('  ss:Type="String">' + nouhinDateText + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('<Cell ss:StyleID="s88"><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('<Cell ss:StyleID="s88"><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('<Cell ss:StyleID="s88"><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('<Cell ss:Index="9" ss:StyleID="s84"><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('   </Row>');
        
        excelxml.push('   <Row>');
        excelxml.push('</Row>');
        
        var payConditonsText = '';
        var payConditonsList = conditionsObj.custbody_djkk_estimate_pay_conditons;
        if (payConditonsList.length > 0) {
            payConditonsText = payConditonsList[0].text;
        }
        excelxml.push('   <Row ss:Index="77" ss:AutoFitHeight="0">');
        excelxml.push('<Cell ss:StyleID="s86"><Data ss:Type="String" x:Ticked="1">�R�D</Data><NamedCell');
        excelxml.push('  ss:Name="Print_Area"/></Cell>');
        excelxml.push('<Cell><PhoneticText xmlns="urn:schemas-microsoft-com:office:excel">�V�n���C�W���E�P��</PhoneticText><Data');
        excelxml.push('  ss:Type="String">�x������</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('<Cell ss:Index="4" ss:StyleID="s88"><Data ss:Type="String">' + payConditonsText + '</Data><NamedCell');
        excelxml.push('  ss:Name="Print_Area"/></Cell>');
//        excelxml.push('<Cell ss:StyleID="s80"><Data ss:Type="String"> </Data><NamedCell');
//        excelxml.push('  ss:Name="Print_Area"/></Cell>');
//        excelxml.push('<Cell ss:Index="9" ss:StyleID="s77"><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('   </Row>');
        
        
        excelxml.push('   <Row ss:AutoFitHeight="0">');
        excelxml.push('<Cell ss:StyleID="s86"><Data ss:Type="String" x:Ticked="1"></Data><NamedCell');
        excelxml.push('  ss:Name="Print_Area"/></Cell>');
        excelxml.push('<Cell><PhoneticText xmlns="urn:schemas-microsoft-com:office:excel">�V�n���C�W���E�P��</PhoneticText><Data');
        excelxml.push('  ss:Type="String"></Data><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push(' <Cell ss:Index="4" ss:StyleID="s87"><Data ss:Type="String">��s���@�F�@�O�HUFJ��s�@�R�ʎx�X�@����0568447</Data><NamedCell');
        excelxml.push('  ss:Name="Print_Area"/></Cell>');
//        excelxml.push('<Cell ss:StyleID="s80"><Data ss:Type="String"> </Data><NamedCell');
//        excelxml.push('  ss:Name="Print_Area"/></Cell>');
//        excelxml.push('<Cell ss:Index="9" ss:StyleID="s77"><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('   </Row>');
        
        excelxml.push('   <Row>');
        excelxml.push('</Row>');
        
        var yukouKikanText = '';
        var yukouKikanList = conditionsObj.custbody_djkk_estimate_yukou_kikan;
        if (yukouKikanList.length > 0) {
            yukouKikanText = yukouKikanList[0].text;
        }
        
        excelxml.push('   <Row ss:Index="80" ss:AutoFitHeight="0">');
        excelxml.push('<Cell ss:StyleID="s86"><Data ss:Type="String" x:Ticked="1">�S�D</Data><NamedCell');
        excelxml.push('  ss:Name="Print_Area"/></Cell>');
        excelxml.push('<Cell><PhoneticText xmlns="urn:schemas-microsoft-com:office:excel">�~�c�������E�R�E�L�Q��</PhoneticText><Data');
        excelxml.push('  ss:Type="String">���ϗL������</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('<Cell ss:Index="4" ss:StyleID="s88"><Data ss:Type="String">' + yukouKikanText + '</Data><NamedCell');
        excelxml.push('  ss:Name="Print_Area"/></Cell>');
        excelxml.push('<Cell ss:Index="9" ss:StyleID="s84"><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('   </Row>');
        excelxml.push('   <Row ss:AutoFitHeight="0">');
        excelxml.push('<Cell ss:Index="9" ss:StyleID="s84"><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('   </Row>');
        excelxml.push('   <Row ss:AutoFitHeight="0"> ');
        excelxml.push('<Cell ss:Index="9" ss:StyleID="s84"><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('   </Row>');
        excelxml.push('   <Row ss:AutoFitHeight="0">');
        excelxml.push('<Cell ss:Index="9" ss:StyleID="s84"><NamedCell ss:Name="Print_Area"/></Cell>');
        excelxml.push('   </Row>');

        excelxml.push('  </Table>');
        excelxml.push('  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">');
        excelxml.push('   <PageSetup>');
        excelxml.push('    <Header x:Margin="0.51181102362204722"/>');
        excelxml.push('    <Footer x:Margin="0.51181102362204722" x:Data="&amp;C&amp;P/&amp;N Page"/>');
        excelxml.push('    <PageMargins x:Bottom="0.98425196850393704" x:Left="0.34" x:Right="0.12"');
        excelxml.push('     x:Top="0.98425196850393704"/>');
        excelxml.push('   </PageSetup>');
        excelxml.push('   <Unsynced/>');
        excelxml.push('  <FitToPage/>');//quan
        
        excelxml.push('   <Print>');
        // CH162 zheng 20230219 start
        excelxml.push('    <FitHeight>0</FitHeight>');
        // CH162 zheng 20230219 end
        excelxml.push('    <ValidPrinterInfo/>');
        // CH162 zheng 20230219 start
        // excelxml.push('   <Scale>66</Scale>');//quan
        excelxml.push('   <Scale>77</Scale>');
        // CH162 zheng 20230219 end
        excelxml.push('    <PaperSizeIndex>9</PaperSizeIndex>');
        excelxml.push('    <HorizontalResolution>600</HorizontalResolution>');
        excelxml.push('    <VerticalResolution>600</VerticalResolution>');
        excelxml.push('   </Print>');
        excelxml.push('   <TabColorIndex>10</TabColorIndex>');
        excelxml.push('   <Zoom>115</Zoom>');
        excelxml.push('   <Selected/>');
        excelxml.push('   <FreezePanes/>');
        excelxml.push('   <FrozenNoSplit/>');
        excelxml.push('   <SplitHorizontal>12</SplitHorizontal>');
        excelxml.push('   <TopRowBottomPane>12</TopRowBottomPane>');
        excelxml.push('   <ActivePane>2</ActivePane>');
        excelxml.push('   <Panes>');
        excelxml.push('  <Pane>');
        excelxml.push('   <Number>3</Number>');
        excelxml.push('  </Pane>');
        excelxml.push('  <Pane>');
        excelxml.push('   <Number>2</Number>');
        excelxml.push('   <ActiveRow>21</ActiveRow>');
        excelxml.push('   <ActiveCol>7</ActiveCol>');
        excelxml.push('  </Pane>');
        excelxml.push('  </Panes>  ');
        excelxml.push('   <ProtectObjects>False</ProtectObjects>');
        excelxml.push('   <ProtectScenarios>False</ProtectScenarios>');
        excelxml.push('  </WorksheetOptions>');
        excelxml.push(' </Worksheet>');
        excelxml.push('</Workbook>');

        var textContent = excelxml.join('\r\n');
        var base64EncodedString = encode.convert({
            string : textContent,
            inputEncoding : encode.Encoding.UTF_8,
            outputEncoding : encode.Encoding.BASE_64
        });

        var excelFile = file.create({
            name : fileName,
            fileType : file.Type.EXCEL,
            contents : base64EncodedString
        });

        excelFile.folder = folder;
        var fileId = excelFile.save();
        log.debug('File Id', fileId);
        return fileId;
    }

    /**
     * EXCEL���t����
     */
    function formatExcelData(strDate) {
        // '2020-02-21T00:00:00.000';
        if (strDate == null || strDate == '') {
            return '';
        }
        var date = format.parse({
            type : format.Type.DATE,
            value : strDate
        });
        var year = date.getFullYear();
        var month = npad(date.getMonth() + 1);
        var day = npad(date.getDate());
        var hours = npad(date.getHours());
        var minutes = npad(date.getMinutes());
        var seconds = npad(date.getSeconds());
        var milliseconds = date.getMilliseconds();
        if (milliseconds < 10) {
            milliseconds = '00' + milliseconds;
        } else if (milliseconds < 1000 && milliseconds >= 10) {
            milliseconds = '0' + milliseconds;
        }
        return '' + year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':' + seconds + '.' + milliseconds;
    }

    /**
     * @param v
     * @returns
     */
    function npad(v) {
        if (v >= 10) {
            return v;
        } else {
            return '0' + v;
        }
    }

    /**
     * ��{�p�^�[��(NBKK) FS RE�f�[�^���擾����
     */
    function getOutputData(estimateId) {

        var resultList = [];

        var searchType = 'estimate';

        var searchFilters = [["type", "anyof", "Estimate"], "AND", ["mainline", "is", "F"], "AND", ["taxline", "is", "F"], "AND", ["cogs", "is", "F"], "AND", ["shipping", "is", "F"], "AND", ["internalid", "anyof", estimateId]];

        var searchColumns = [search.createColumn({
        	//CH162 ���i�R�[�h���J�^���O�R�[�h�ɂ���
//            name : "itemid",
//            join : "item",
//            label : "���O"
	          name : "custitem_djkk_product_code",
	          join : "item",
	          label : "�J�^���O�R�[�h"
        }), search.createColumn({
            name : "class",
            join : "item",
            label : "�u�����h"
        }), search.createColumn({
            name : "displayname",
            join : "item",
            label : "�\����"
        }), search.createColumn({
            name : "custcol_djkk_specifications",
            label : "DJ_�K�i"
        }), search.createColumn({
            name : "custcol_djkk_perunitquantity",
            label : "DJ_����"
        }), search.createColumn({
            name : "upccode",
            join : "item",
            label : "UPC�R�[�h"
        }), search.createColumn({
            name : "custitem_djkk_shelf_life",
            join : "item",
            label : "DJ_�ܖ���������"
        }), search.createColumn({
            name : "rate",
            label : "�P��/��"
        }), search.createColumn({
//            name : "custcol_djkk_reference_sales_price",
        	name : "custcol_djkk_suggested_retail_price",  //changed by song  add 20230614 start CH638
            label : "DJ_��]�������i"
        }), search.createColumn({
            name : "custitem_djkk_item_displayname",
            join : "item",
            label : "DJ_���i�\����"    	
        }), search.createColumn({
            name : "custitem_djkk_item_abbreviation_name",
            join : "item",
            label : "DJ_�K�i"
    	})];

        var searchResults = createSearch(searchType, searchFilters, searchColumns);
        if (searchResults && searchResults.length > 0) {
            for (var i = 0; i < searchResults.length; i++) {
                var lineDataDic = {};
                var searchResult = searchResults[i];
                // ���i�R�[�h
                var item = searchResult.getValue(searchColumns[0]);
                lineDataDic.item = item;
                // �u�����h��
                // CH162�@�u�����h�R�[�h���O��
                var brandAll = searchResult.getText(searchColumns[1]);
                var brandLength = brandAll.length; 
                var brand = brandAll.substring(6,brandLength);
//                var brand = searchResult.getText(searchColumns[1]);
                lineDataDic.brand = brand;
                // ���i��
                var itemText = searchResult.getValue(searchColumns[2]);
                lineDataDic.itemText = itemText;
                // �K�i
                var specifications = searchResult.getValue(searchColumns[3]);
                lineDataDic.specifications = specifications;
                // ����
                var perunitquantity = searchResult.getValue(searchColumns[4]);
                lineDataDic.perunitquantity = perunitquantity;
                // JAN�R�[�h
                var jancode = searchResult.getValue(searchColumns[5]);
                lineDataDic.jancode = jancode;
                // �ܖ����ԁi������j
                var tastePeriod = searchResult.getValue(searchColumns[6]);
                lineDataDic.tastePeriod = tastePeriod;
                // �d�؉��i(�Ŕ�)
                var shiPrice = searchResult.getValue(searchColumns[7]);
                log.debug("shiPrice",shiPrice);
                lineDataDic.shiPrice = shiPrice;
                // �Q�l�̔����i
                var referencePrice = searchResult.getValue(searchColumns[8]);
                log.debug("referencePrice",referencePrice);
                lineDataDic.referencePrice = referencePrice;

                //DJ_���i�\����
                var productName = searchResult.getValue(searchColumns[9]);
                lineDataDic.productName = productName;
                
              //DJ_�K�i
                var abbreviationName = searchResult.getValue(searchColumns[10]);
                lineDataDic.abbreviationName = abbreviationName;
                
                resultList.push(lineDataDic);
            }
        }

        return resultList;
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

    return {
        onRequest : onRequest
    };

    /**
     * �{�f�B�t�B�[���h�̌������\�b�h
     */
    function lookupFields(type, id) {

        var columns = [];
        columns.push('custbody_djkk_estimate_yukou_kikan');
        columns.push('custbody_djkk_estimate_pay_conditons');
        columns.push('custbody_djkk_estimate_nouhin_date');
        columns.push('custbody_djkk_estimate_po_conditons');
        columns.push('custbody_djkk_estimate_po_conditon_a');
        columns.push('custbody_djkk_estimate_po_conditon_b1');
        columns.push('custbody_djkk_estimate_po_conditon_b2');
        columns.push('custbody_djkk_estimate_po_conditon_c');
        columns.push('custbody_djkk_estimate_po_conditon_d');
        columns.push('entity');
        columns.push('tranid');
        columns.push('salesrep');
        columns.push('transactionnumber');
        columns.push('subsidiary');
        var fields = search.lookupFields({
            type : type,
            id : id,
            columns : columns
        });
        return fields;
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
     * EXCEL���t����
     */
    function formatExcelFileName(strDate) {
        if (strDate == null || strDate == '') {
            return '';
        }
        var date = format.parse({
            type : format.Type.DATE,
            value : strDate
        });
        var year = date.getFullYear();
        var month = npad(date.getMonth() + 1);
        var day = npad(date.getDate());
        var hours = npad(date.getHours());
        var minutes = npad(date.getMinutes());
        var seconds = npad(date.getSeconds());
        return '' + year + month + day + hours + minutes + seconds;
    }
});
