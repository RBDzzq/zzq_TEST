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
            // パラメータを取得する
            var currentScript = runtime.getCurrentScript();
            // 保存フォルダーを取得する
            var saveFolder = currentScript.getParameter({
                name : 'custscript_djkk_sl_basic_pattern_ul_save'
            });

            // 見積の内部ID
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
            //var fileName = '見積' + conditionsObj.tranid + '_' + formatExcelFileName(getJapanDate()) + '.xls';
            //modify by lj  end CH374
            //CH762 20230818 add by zdj start
            var fileName = '見積' + '_' + tranId + '_' + formatExcelFileName(getJapanDate()) + '.xls';
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
            log.error('エラー', e.message);
            response.write({
                output : 'ERROR_' + e.name
            });
        }
    }

    function createExcel(fileName, folder, dataList, conditionsObj) {
        var xmlArray = [];
        var userName = runtime.getCurrentUser().name;
        var createdDateTime = formatExcelData(getJapanDate());
        //20221122 changed by zhou start
        /************old************/
        xmlArray.push('<?xml version="1.0"?>');
        /************old************/
        /************new************/
//      xmlArray.push('< ? xml version = "1.0" encoding = "UTF-8" standalone = "yes" ? >');
        /************new************/
        //end
        xmlArray.push('<?mso-application progid="Excel.Sheet"?>');
        xmlArray.push('<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"');
        xmlArray.push(' xmlns:o="urn:schemas-microsoft-com:office:office"');
        xmlArray.push(' xmlns:x="urn:schemas-microsoft-com:office:excel"');
        xmlArray.push(' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"');
        xmlArray.push(' xmlns:html="http://www.w3.org/TR/REC-html40">');
        /************new************/
//      xmlArray.push('xmlns: dt = "uuid:C2F41010-65B3-11d1-A29F-00AA00C14882" >');
        /************new************/
        xmlArray.push(' <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">');
        xmlArray.push('  <Author>' + userName + '</Author>');
        xmlArray.push('  <LastAuthor>' + userName + '</LastAuthor>');
        xmlArray.push('  <Created>' + createdDateTime + '</Created>');
        xmlArray.push('  <Company>Denis Japan</Company>');
        xmlArray.push('  <Version>15.00</Version>');
        xmlArray.push(' </DocumentProperties>');
        /************old************/
		xmlArray.push(' <OfficeDocumentSettings xmlns="urn:schemas-microsoft-com:office:office">');
		xmlArray.push(' <AllowPNG/>');
		xmlArray.push(' </OfficeDocumentSettings>');
        /************old************/
        /************new************/
//      xmlArray.push('<CustomDocumentProperties xmlns="urn:schemas-microsoft-com:office:office">');
//		xmlArray.push('<ICV dt:dt="string">0D9F1E01698048199EA1D14E9E0B7CE7</ICV>');
//		xmlArray.push('<KSOProductBuildVer dt:dt="string">2052-11.1.0.12763</KSOProductBuildVer>');
//		xmlArray.push('</CustomDocumentProperties>');
        /************new************/
        xmlArray.push(' <ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel">');
        xmlArray.push('  <WindowHeight>12930</WindowHeight>');
        xmlArray.push('  <WindowWidth>23490</WindowWidth>');
        xmlArray.push('  <WindowTopX>5355</WindowTopX>');
        xmlArray.push('  <WindowTopY>45</WindowTopY>');
        xmlArray.push('  <TabRatio>744</TabRatio>');
        xmlArray.push('  <ProtectStructure>False</ProtectStructure>');
        xmlArray.push('  <ProtectWindows>False</ProtectWindows>');
        xmlArray.push(' </ExcelWorkbook>');
   
        
        
        xmlArray.push('   <Styles>');
        xmlArray.push('       <Style ss:ID="Default" ss:Name="Normal">');
        xmlArray.push('           <Alignment ss:Vertical="Bottom"/>');
        xmlArray.push('           <Borders/>');
        xmlArray.push('           <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('           <Interior/>');
        xmlArray.push('           <NumberFormat/>');
        xmlArray.push('           <Protection/>');
        xmlArray.push('       </Style>');
        xmlArray.push('       <Style ss:ID="s62">');
        xmlArray.push('           <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        xmlArray.push('           <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('       </Style>');
        xmlArray.push('       <Style ss:ID="s64">');
        //CH739 20230718 by zzq start
//      xmlArray.push('           <Alignment ss:Horizontal="Center" ss:Vertical="Top"/>');
        xmlArray.push('           <Alignment ss:Horizontal="Right" ss:Vertical="Top"/>');
       //CH739 20230718 by zzq end
        xmlArray.push('           <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('           <NumberFormat ss:Format="Long Date"/>');
        xmlArray.push('       </Style>');
        xmlArray.push('       <Style ss:ID="s65">');
        xmlArray.push('           <Alignment ss:Horizontal="Center" ss:Vertical="Top"/>');
        xmlArray.push('           <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('           <NumberFormat ss:Format="[JPN][$-411]gggy&quot;年&quot;m&quot;月&quot;d&quot;日&quot;"/>');
        xmlArray.push('       </Style>');
        xmlArray.push('       <Style ss:ID="s67">');
        //CH739 20230718 by zzq start
//      xmlArray.push('           <Alignment ss:Horizontal="Center" ss:Vertical="Top"/>');
        xmlArray.push('           <Alignment ss:Horizontal="Right" ss:Vertical="Top"/>');
        //CH739 20230718 by zzq end
        xmlArray.push('           <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('       </Style>');
        xmlArray.push('       <Style ss:ID="s68">');
        //CH739 20230718 by zzq start
//      xmlArray.push('           <Alignment ss:Horizontal="Center" ss:Vertical="Top"/>');
        xmlArray.push('           <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>');
        //CH739 20230718 by zzq end
        xmlArray.push('           <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="20"');
        xmlArray.push('                 ss:Bold="1"/>');
        xmlArray.push('       </Style>');
        xmlArray.push('       <Style ss:ID="s70">');
        xmlArray.push('           <Alignment ss:Horizontal="Center" ss:Vertical="Top"/>');
        xmlArray.push('           <Borders/>');
        xmlArray.push('           <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('           <NumberFormat ss:Format="[JPN][$-411]gggy&quot;年&quot;m&quot;月&quot;d&quot;日&quot;"/>');
        xmlArray.push('       </Style>');
        xmlArray.push('       <Style ss:ID="s71">');
        xmlArray.push('           <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        xmlArray.push('           <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="16"');
        xmlArray.push('                 ss:Bold="1"/>');
        xmlArray.push('       </Style>');
        xmlArray.push('       <Style ss:ID="s72">');
        xmlArray.push('           <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        xmlArray.push('           <Borders/>');
        xmlArray.push('           <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('       </Style>');
        xmlArray.push('       <Style ss:ID="s73">');
        xmlArray.push('           <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>');
        xmlArray.push('           <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern"/>');
        xmlArray.push('       </Style>');
        xmlArray.push('       <Style ss:ID="s74">');
        xmlArray.push('           <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>');
        xmlArray.push('           <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('       </Style>');
        xmlArray.push('       <Style ss:ID="s75">');
        xmlArray.push('           <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        xmlArray.push('           <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern"/>');
        xmlArray.push('       </Style>');
        xmlArray.push('       <Style ss:ID="s77">');
        xmlArray.push('           <Alignment ss:Horizontal="Left" ss:Vertical="Center" ss:ShrinkToFit="1"/>');
        xmlArray.push('           <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="9"/>');
        xmlArray.push('       </Style>');
        xmlArray.push('       <Style ss:ID="s78">');
        xmlArray.push('           <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>');
        xmlArray.push('           <Borders>');
        xmlArray.push('               <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('               <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('               <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('               <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('           </Borders>');
        xmlArray.push('           <Interior ss:Color="#C0C0C0" ss:Pattern="Solid"/>');
        xmlArray.push('       </Style>');
        xmlArray.push('       <Style ss:ID="s79">');
        xmlArray.push('           <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>');
        xmlArray.push('           <Borders>');
        xmlArray.push('               <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('               <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('               <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('               <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('           </Borders>');
        xmlArray.push('           <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('           <Interior ss:Color="#C0C0C0" ss:Pattern="Solid"/>');
        xmlArray.push('       </Style>');
        xmlArray.push('       <Style ss:ID="s80">');
        xmlArray.push('           <Alignment ss:Horizontal="Left" ss:Vertical="Center" ss:WrapText="1"/>');
        xmlArray.push('           <Borders>');
        xmlArray.push('               <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('               <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('               <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('               <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('           </Borders>');
        xmlArray.push('           <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('       </Style>');
        xmlArray.push('       <Style ss:ID="s81">');
        xmlArray.push('           <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>');
        xmlArray.push('           <Borders>');
        xmlArray.push('               <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('               <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('               <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('               <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('           </Borders>');
        xmlArray.push('           <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('           <NumberFormat ss:Format="@"/>');
        xmlArray.push('       </Style>');
        xmlArray.push('       <Style ss:ID="s82">');
        xmlArray.push('           <Alignment ss:Horizontal="Right" ss:Vertical="Center" ss:WrapText="1"/>');
        xmlArray.push('           <Borders>');
        xmlArray.push('               <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('               <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('               <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('               <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('           </Borders>');
        xmlArray.push('           <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('           <NumberFormat ss:Format="[$\\-411]#,##0_);[Red]\\([$\\-411]#,##0\\)"/>');
        xmlArray.push('       </Style>');
        xmlArray.push('       <Style ss:ID="s83">');
        xmlArray.push('           <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        xmlArray.push('           <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"');
        xmlArray.push('                 ss:Color="#FF0000"/>');
        xmlArray.push('       </Style>');
        xmlArray.push('       <Style ss:ID="s85">');
        xmlArray.push('           <Alignment ss:Horizontal="Right" ss:Vertical="Top"/>');
        xmlArray.push('           <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('       </Style>');
        xmlArray.push('       <Style ss:ID="s86">');
        xmlArray.push('           <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        xmlArray.push('       </Style>');
        xmlArray.push('       <Style ss:ID="s87">');
        xmlArray.push('           <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        xmlArray.push('           <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"');
        xmlArray.push('                 ss:Color="#3366FF"/>');
        xmlArray.push('       </Style>');
        xmlArray.push('       <Style ss:ID="s89">');
        xmlArray.push('           <Alignment ss:Horizontal="Right" ss:Vertical="Top"/>');
        xmlArray.push('       </Style>');
        xmlArray.push('       <Style ss:ID="s90">');
        xmlArray.push('           <Alignment ss:Horizontal="Center" ss:Vertical="Top"/>');
        xmlArray.push('           <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('           <NumberFormat ss:Format="Long Date"/>');
        xmlArray.push('       </Style>');
        xmlArray.push('   </Styles>');
        
        var row = 12 + dataList.length + 12;
        xmlArray.push(' <Worksheet ss:Name="基本パターン(UL)">');
        xmlArray.push('  <Names>');
        xmlArray.push('   <NamedRange ss:Name="Print_Area" ss:RefersTo="=' + "'基本パターン(UL)'" + '!C1:C9"/>');
        // CH162 zheng 20230219 start
        // xmlArray.push('   <NamedRange ss:Name="Print_Titles" ss:RefersTo="=' + "'基本パターン(UL)'" + '!R1:R12"/>');
        xmlArray.push('   <NamedRange ss:Name="Print_Titles" ss:RefersTo="=' + "'基本パターン(UL)'" + '!R1:R11"/>');
        // CH162 zheng 20230219 end
        xmlArray.push('  </Names>');
//        xmlArray.push('  <Table ss:ExpandedColumnCount="17" ss:ExpandedRowCount="' + row + '" x:FullColumns="1"');
        xmlArray.push('  <Table ss:ExpandedColumnCount="16" ss:ExpandedRowCount="91" x:FullColumns="1"');
        xmlArray.push('   x:FullRows="1" ss:StyleID="s62" ss:DefaultColumnWidth="54"');
        xmlArray.push('   ss:DefaultRowHeight="13.5">');
        xmlArray.push('   <Column ss:StyleID="s62" ss:AutoFitWidth="0" ss:Width="52.8"/>');
        xmlArray.push('   <Column ss:StyleID="s62" ss:AutoFitWidth="0" ss:Width="106.5"/>');
        xmlArray.push('   <Column ss:StyleID="s62" ss:AutoFitWidth="0" ss:Width="163.1"/>');
        xmlArray.push('   <Column ss:StyleID="s62" ss:AutoFitWidth="0" ss:Width="60"/>');
        xmlArray.push('   <Column ss:StyleID="s62" ss:Width="31.5"/>');
        xmlArray.push('   <Column ss:StyleID="s62" ss:AutoFitWidth="0" ss:Width="87.75"/>');
        xmlArray.push('   <Column ss:Index="8" ss:StyleID="s62" ss:AutoFitWidth="0" ss:Width="53.25"/>');
        xmlArray.push('   <Column ss:StyleID="s62" ss:AutoFitWidth="0" ss:Width="83.4"/>');
        xmlArray.push('   <Column ss:Index="11" ss:StyleID="s62" ss:AutoFitWidth="0" ss:Width="63"/>');
        xmlArray.push('   <Column ss:Index="15" ss:StyleID="s62" ss:AutoFitWidth="0" ss:Width="61.5"/>');
        xmlArray.push('   <Row  ss:AutoFitHeight="0">');
        xmlArray.push('    <Cell ss:Index="8" ss:MergeAcross="1" ss:StyleID="s64"><Data ss:Type="DateTime">' + createdDateTime + '</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="16" ss:StyleID="s65"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('   </Row>');
        xmlArray.push('   <Row  ss:AutoFitHeight="0">');
        //modify by lj  start CH374
        xmlArray.push('    <Cell ss:Index="8" ss:MergeAcross="1" ss:StyleID="s67"><Data ss:Type="String">見積書番号：' + conditionsObj.transactionnumber + '</Data><NamedCell');
        //modify by lj  end CH374
        xmlArray.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('   </Row>');
        xmlArray.push('   <Row  ss:AutoFitHeight="0" ss:Height="24">');
        xmlArray.push('    <Cell ss:MergeAcross="8" ss:StyleID="s68"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">オミツモリショ</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">御見積書</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="16" ss:StyleID="s68"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('   </Row>');
        xmlArray.push('   <Row ss:AutoFitHeight="0" >');
        xmlArray.push('    <Cell ss:Index="16" ss:StyleID="s70"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('   </Row>');
        var entityText = '';
        var entityList = conditionsObj.entity;
        if (entityList.length > 0) {
//            entityText = entityList[0].text + ' 御中';
        	//add by song  start CH251
       	 var companynameObj = search.lookupFields({
                type : 'customer',
                id : entityList[0].value,
                columns : ['companyname']
            });

            entityText = companynameObj.companyname + ' 御中';
            log.debug('entityText',entityText);
            //add by song  end CH251

        }

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
        
        //CH474
        var subsidiarySearch = search.create({
            type: search.Type.SUBSIDIARY,
            filters: ['internalid', 'is', 4],
            columns: ['name', 'phone','fax',
                      search.createColumn({
  		                name: 'custrecord_djkk_address_fax',
  		                join: 'address',
  		                label: 'FAX'
              }),'legalname','zip',
                      	search.createColumn({
		                name: 'custrecord_djkk_address_state',
		                join: 'address',
		                label: '都道府県'
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


        xmlArray.push('   <Row ss:AutoFitHeight="0" ss:Height="18.75">');
        xmlArray.push('    <Cell ss:StyleID="s71"><Data ss:Type="String">' + entityText + '</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s71"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="16" ss:StyleID="s72"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('   </Row>');
        xmlArray.push('   <Row ss:AutoFitHeight="0" ss:Height="18.75">');
        xmlArray.push('    <Cell ss:StyleID="s71"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s71"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="6" ss:StyleID="s73"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">カブシキカイシャ</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">'+subsidiary.legalname+'</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s74"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="16" ss:StyleID="s72"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('   </Row>');
        xmlArray.push('   <Row ss:AutoFitHeight="0" >');
        xmlArray.push('    <Cell ss:Index="6" ss:StyleID="s75"><Data ss:Type="String">〒' + subsidiary.zip + '</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="16" ss:StyleID="s72"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('   </Row>');
        xmlArray.push('   <Row ss:AutoFitHeight="0">');
        xmlArray.push('    <Cell ss:Index="4" ss:StyleID="s74"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="6" ss:StyleID="s75"><Data ss:Type="String">' + subAddr + '</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="16" ss:StyleID="s72"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('   </Row>');
        xmlArray.push('   <Row ss:AutoFitHeight="0">');
        xmlArray.push('    <Cell ss:Index="6" ss:StyleID="s75"><Data ss:Type="String">TEL：' + subsidiary.phone + '</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="16" ss:StyleID="s72"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('   </Row>');
        xmlArray.push('   <Row ss:AutoFitHeight="0">');
        xmlArray.push('    <Cell ss:Index="6" ss:StyleID="s75"><Data ss:Type="String">FAX：' + subsidiary.fax + '</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('   </Row>');
        xmlArray.push('   <Row ss:AutoFitHeight="0">');
        xmlArray.push('    <Cell ss:Index="5" ss:StyleID="s75"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:MergeAcross="2" ss:StyleID="s77"><Data ss:Type="String">担当：' + resultDic.name + '</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('   </Row>');
        xmlArray.push('   <Row ss:AutoFitHeight="0" ss:Height="27">');
        xmlArray.push('    <Cell ss:StyleID="s78"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">ショウヒン</PhoneticText><Data');
//        xmlArray.push('      ss:Type="String">商品&#10;コード</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Type="String">カタログ&#10;コード</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');//CH162
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s78"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">ナ</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">ブランド名</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s79"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">ショウヒンメイ</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">商品名</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s78"><Data ss:Type="String">規格</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s79"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">イスウ</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">入数</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s78"><Data ss:Type="String">JANコード</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s78"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">ショウミキカンセイゾウゴ</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">賞味期間&#10;（製造後）</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s78"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">シキカカクゼイヌ</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">仕切価格(税抜)</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s78"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">サンコウハンバイカカク</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">参考販売価格</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        // add by song  start CH162
//        xmlArray.push('    <Cell ss:StyleID="s78"><PhoneticText');
//        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">サンコウハンバイカカク</PhoneticText><Data');
//        xmlArray.push('      ss:Type="String">DJ_製品表示名</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
//        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        // add by song  end CH162
        xmlArray.push('   </Row>');
        // 明細
        for (var i = 0; i < dataList.length; i++) {

            var tempData = dataList[i];

            xmlArray.push('   <Row ss:AutoFitHeight="0" ss:Height="27">');
            xmlArray.push('    <Cell ss:StyleID="s80"><Data ss:Type="String">' + tempData.item + '</Data><NamedCell');
            xmlArray.push('      ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s80"><Data ss:Type="String">' + tempData.brand + '</Data><NamedCell');
            xmlArray.push('      ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s80"><Data ss:Type="String">' + tempData.productName + '</Data><NamedCell');
            xmlArray.push('      ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s81"><Data ss:Type="String">' + tempData.abbreviationName + '</Data><NamedCell');
            xmlArray.push('      ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s81"><Data ss:Type="Number">' + tempData.perunitquantity + '</Data><NamedCell');
            xmlArray.push('      ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s81"><Data ss:Type="String">' + tempData.jancode + '</Data><NamedCell');
            xmlArray.push('      ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s81"><Data ss:Type="String">' + tempData.tastePeriod + '</Data><NamedCell');
            xmlArray.push('      ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s82"><Data ss:Type="Number">' + tempData.shiPrice + '</Data><NamedCell');
            xmlArray.push('      ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s82"><Data ss:Type="Number">' + tempData.referencePrice + '</Data><NamedCell');
            xmlArray.push('      ss:Name="Print_Area"/></Cell>');
         // add by song  start CH162
//            xmlArray.push('    <Cell ss:StyleID="s29"><Data ss:Type="String">' + tempData.productName + '</Data><NamedCell');
//            xmlArray.push('      ss:Name="Print_Area"/></Cell>');
         // add by song  end CH162
            xmlArray.push('   </Row>');
        }

        // CH162 zheng 20230218 start
        var forCnt = 0;
        var page1Max = 34;
        var pageMoreMax = 35;
        var page1Line = 56;
        var pageMoreLine = 68;
        if (dataList.length <= page1Max) {
            forCnt = djkk_common.getExcelPrintPage1(dataList.length, page1Line);
        } else {
            forCnt = djkk_common.getExcelPrintPage2(dataList.length, page1Max, pageMoreMax, pageMoreLine);
        }
        for (var i = 0; i < forCnt; i++) {
            xmlArray.push('   <Row ss:AutoFitHeight="0">');
            xmlArray.push('    <Cell ss:Index="9" ss:StyleID="s83"><NamedCell ss:Name="Print_Area"/></Cell>');
            xmlArray.push('   </Row>');
        }
//        xmlArray.push('   <Row>');
//        xmlArray.push('    <Cell ss:Index="9" ss:StyleID="s85"><NamedCell ss:Name="Print_Area"/></Cell>');
//        xmlArray.push('   </Row>');
//        xmlArray.push('   <Row>');
//        xmlArray.push('    <Cell ss:Index="9" ss:StyleID="s85"><NamedCell ss:Name="Print_Area"/></Cell>');
//        xmlArray.push('   </Row>');
//        xmlArray.push('   <Row>');
//        xmlArray.push('    <Cell ss:Index="9" ss:StyleID="s85"><NamedCell ss:Name="Print_Area"/></Cell>');
//        xmlArray.push('   </Row>');
//        xmlArray.push('   <Row>');
//        xmlArray.push('    <Cell ss:Index="9" ss:StyleID="s85"><NamedCell ss:Name="Print_Area"/></Cell>');
//        xmlArray.push('   </Row>');
        // CH162 zheng 20230218 end
        xmlArray.push('   <Row ss:AutoFitHeight="0">');
        xmlArray.push('    <Cell ss:StyleID="s85"><Data ss:Type="String" x:Ticked="1">１．</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s86"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">ハッチュウジョウケン</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">発注条件</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="9" ss:StyleID="s83"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('   </Row>');


        var showObj = {};

        showObj['showCon_a'] = 'A)　1回の最低発注数量(配送ロット)';
    	showObj['showText1_a'] = '混載';
        var conditonAList = conditionsObj.custbody_djkk_estimate_po_conditon_a;
        showObj['showText2_a'] = conditonAList.length > 0 ? conditonAList[0].text : '';

//        showObj['showCon_b'] = 'b)　配送料';
//        var conditonB2List = conditionsObj.custbody_djkk_estimate_po_conditon_b2;
//        showObj['showText1_b'] = conditonB2List.length > 0 ? conditonB2List[0].text : '';
//        var conditonB1List = conditionsObj.custbody_djkk_estimate_po_conditon_b1;
//        showObj['showText2_b'] = conditonB1List.length > 0 ? conditonB1List[0].text : '';
//
        showObj['showCon_b'] = 'B)　配送料';
        var conditonB1List = conditionsObj.custbody_djkk_estimate_po_conditon_b1;
        var conditonB2List = conditionsObj.custbody_djkk_estimate_po_conditon_b2;
        showObj['showText1_b'] = conditonB2List.length > 0 ? conditonB2List[0].text : '';
        log.debug('conditonB2List',conditonB2List);
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


    	showObj['showCon_c'] = 'C)　納品場所';
        var conditonCList = conditionsObj.custbody_djkk_estimate_po_conditon_c;
       	showObj['showText1_c'] = conditonCList.length > 0 ? conditonCList[0].text : '';
        showObj['showText2_c'] = '';

        showObj['showCon_d'] = 'D)　ケース単位';
    	showObj['showText1_d'] = '';
    	showObj['showText2_d'] = '';

//    	showObj['showCon_e'] = 'e)　FAXにて注文（書面のみ受け付けます）';
//        var conditonDList = conditionsObj.custbody_djkk_estimate_po_conditon_d;
//       	showObj['showText1_e'] = conditonDList.length > 0 ? conditonDList[0].text : '';
//        showObj['showText2_e'] = '';


    	showObj['showCon_e'] = 'E)　FAXにて注文（書面のみ受け付けます）';
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


        xmlArray.push('   <Row ss:AutoFitHeight="0">');
        xmlArray.push('<Cell ss:Index="2" ss:StyleID="s86"><PhoneticText');
        xmlArray.push('  xmlns="urn:schemas-microsoft-com:office:excel">ハイソウリョウ</PhoneticText><Data');
        xmlArray.push('  ss:Type="String">' + showObj.showCon_a + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('<Cell ss:Index="4" ss:StyleID="s86"><Data ss:Type="String">' + showObj.showText1_a + '</Data><NamedCell');
        xmlArray.push('  ss:Name="Print_Area"/></Cell>');
        xmlArray.push('<Cell ss:Index="6" ss:StyleID="s86"><PhoneticText');
        xmlArray.push('  xmlns="urn:schemas-microsoft-com:office:excel">エンゼイヌ</PhoneticText><Data');
        xmlArray.push('  ss:Type="String">' + showObj.showText2_a + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('   </Row>');

        xmlArray.push('   <Row>');
        xmlArray.push('</Row>');

        xmlArray.push('   <Row ss:Index="75" ss:AutoFitHeight="0">');
        xmlArray.push('<Cell ss:Index="2" ss:StyleID="s86"><PhoneticText');
        xmlArray.push('  xmlns="urn:schemas-microsoft-com:office:excel">ハイソウリョウ</PhoneticText><Data');
        xmlArray.push('  ss:Type="String">' + showObj.showCon_b + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('<Cell ss:Index="4" ss:StyleID="s86"><Data ss:Type="String">' + showObj.showText2_b + '</Data><NamedCell');
        xmlArray.push('  ss:Name="Print_Area"/></Cell>');
//        xmlArray.push('<Cell ss:Index="6" ss:StyleID="s86"><PhoneticText');
//        xmlArray.push('  xmlns="urn:schemas-microsoft-com:office:excel">エンゼイヌ</PhoneticText><Data');
//        xmlArray.push('  ss:Type="String"></Data><NamedCell ss:Name="Print_Area"/></Cell>');
//        xmlArray.push(' <Cell ss:Index="12" ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('   </Row>');

        xmlArray.push('   <Row ss:AutoFitHeight="0">');
        xmlArray.push('<Cell ss:Index="2" ss:StyleID="s86"><PhoneticText');
        xmlArray.push('  xmlns="urn:schemas-microsoft-com:office:excel">ハイソウリョウ</PhoneticText><Data');
        xmlArray.push('   ss:Type="String">（ロット未満の場合配送料を頂戴いたします。）</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        //add by song  start CH250
        xmlArray.push('<Cell ss:Index="4" ss:StyleID="s86"><PhoneticText');
        xmlArray.push('  xmlns="urn:schemas-microsoft-com:office:excel">エンゼイヌ</PhoneticText><Data');
        xmlArray.push('  ss:Type="String">' + showObj.showText3_b + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
      //add by song  end CH250
        xmlArray.push('</Row>');

        xmlArray.push('   <Row>');
        xmlArray.push('</Row>');

        xmlArray.push('   <Row ss:Index="78" ss:AutoFitHeight="0">');
        xmlArray.push('<Cell ss:Index="2" ss:StyleID="s86"><PhoneticText');
        xmlArray.push('  xmlns="urn:schemas-microsoft-com:office:excel">ハイソウリョウ</PhoneticText><Data');
        xmlArray.push('  ss:Type="String">' + showObj.showCon_c + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('<Cell ss:Index="4" ss:StyleID="s87"><Data ss:Type="String">' + showObj.showText1_c + '</Data><NamedCell');
        xmlArray.push('  ss:Name="Print_Area"/></Cell>');
        xmlArray.push('<Cell ss:Index="6" ss:StyleID="s86"><PhoneticText');
        xmlArray.push('  xmlns="urn:schemas-microsoft-com:office:excel">エンゼイヌ</PhoneticText><Data');
        xmlArray.push('  ss:Type="String">' + showObj.showText2_c + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="12" ss:StyleID="s83"/>');
        xmlArray.push('   </Row>');

        xmlArray.push('   <Row ss:AutoFitHeight="0">');
        xmlArray.push('<Cell ss:Index="2" ss:StyleID="s86"><PhoneticText');
        xmlArray.push('  xmlns="urn:schemas-microsoft-com:office:excel">ハイソウリョウ</PhoneticText><Data');
        xmlArray.push('  ss:Type="String">' + showObj.showCon_d + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('<Cell ss:Index="4" ss:StyleID="s86"><Data ss:Type="String">' + showObj.showText1_d + '</Data><NamedCell');
        xmlArray.push('  ss:Name="Print_Area"/></Cell>');
        xmlArray.push('<Cell ss:Index="6" ss:StyleID="s86"><PhoneticText');
        xmlArray.push('  xmlns="urn:schemas-microsoft-com:office:excel">エンゼイヌ</PhoneticText><Data');
        xmlArray.push('  ss:Type="String">' + showObj.showText2_d + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="12" ss:StyleID="s83"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('   </Row>');

        xmlArray.push('   <Row ss:AutoFitHeight="0">');
        xmlArray.push('<Cell ss:Index="2" ss:StyleID="s86"><PhoneticText');
        xmlArray.push('  xmlns="urn:schemas-microsoft-com:office:excel">ハイソウリョウ</PhoneticText><Data');
        xmlArray.push('  ss:Type="String">' + showObj.showCon_e + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('<Cell ss:Index="4" ss:StyleID="s86"><Data ss:Type="String">' + showObj.showText1_e + '</Data><NamedCell');
        xmlArray.push('  ss:Name="Print_Area"/></Cell>');
//        xmlArray.push('<Cell ss:Index="6" ss:StyleID="s86"><PhoneticText');
//        xmlArray.push('  xmlns="urn:schemas-microsoft-com:office:excel">エンゼイヌ</PhoneticText><Data');
//        xmlArray.push('  ss:Type="String">' + showObj.showText2_e + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
//        xmlArray.push(' <Cell ss:Index="12" ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('   </Row>');

        //add by song  start CH250
        xmlArray.push('   <Row ss:AutoFitHeight="0">');
        xmlArray.push('<Cell ss:Index="2" ss:StyleID="s86"><PhoneticText');
        xmlArray.push('  xmlns="urn:schemas-microsoft-com:office:excel">ハイソウリョウ</PhoneticText><Data');
        xmlArray.push('  ss:Type="String">' + '' + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('<Cell ss:Index="4" ss:StyleID="s86"><Data ss:Type="String">' + showObj.showText2_e + '</Data><NamedCell');
        xmlArray.push('  ss:Name="Print_Area"/></Cell>');
        xmlArray.push('   </Row>');
        //add by song  end CH250

        xmlArray.push('   <Row>');
        xmlArray.push('</Row>');

        var nouhinDateText = '';
        var nouhinDateList = conditionsObj.custbody_djkk_estimate_nouhin_date;
        if (nouhinDateList.length > 0) {
            nouhinDateText = nouhinDateList[0].text;
        }
        xmlArray.push('   <Row ss:Index="83" ss:AutoFitHeight="0" >');
        xmlArray.push('    <Cell ss:StyleID="s85"><Data ss:Type="String" x:Ticked="1">２．</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s86"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">ノウヒンイリヒ</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">納品日</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="4" ss:StyleID="s87"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">ジュチュウゴニチゴノウヒン</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">' + nouhinDateText + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="9" ss:StyleID="s83"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('   </Row>');

        xmlArray.push('   <Row>');
        xmlArray.push('</Row>');

        var payConditonsText = '';
        var payConditonsList = conditionsObj.custbody_djkk_estimate_pay_conditons;
        if (payConditonsList.length > 0) {
            payConditonsText = payConditonsList[0].text;
        }
        xmlArray.push('   <Row ss:Index="85" ss:AutoFitHeight="0" >');
        xmlArray.push('    <Cell ss:StyleID="s89"><Data ss:Type="String" x:Ticked="1">３．</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell><PhoneticText xmlns="urn:schemas-microsoft-com:office:excel">シハライジョウケン</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">支払条件</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="4" ss:StyleID="s87"><Data ss:Type="String">' + payConditonsText + '</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
//        xmlArray.push('    <Cell ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
//        xmlArray.push('    <Cell ss:Index="9" ss:StyleID="s85"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('   </Row>');

        xmlArray.push('   <Row ss:AutoFitHeight="0" >');
        xmlArray.push('<Cell ss:StyleID="s90"><Data ss:Type="String" x:Ticked="1"></Data><NamedCell');
        xmlArray.push('  ss:Name="Print_Area"/></Cell>');
        xmlArray.push('<Cell><PhoneticText xmlns="urn:schemas-microsoft-com:office:excel">シハライジョウケン</PhoneticText>');
        xmlArray.push('<Data ss:Type="String"></Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="4" ss:StyleID="s86"><Data ss:Type="String">銀行名　：　三菱UFJ銀行　青山通支店　当座1895356</Data><NamedCell');
        xmlArray.push('  ss:Name="Print_Area"/></Cell>');
//        xmlArray.push('<Cell ss:StyleID="s80"><Data ss:Type="String"> </Data><NamedCell');
//        xmlArray.push('  ss:Name="Print_Area"/></Cell>');
//        xmlArray.push('<Cell ss:Index="9" ss:StyleID="s85"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('   </Row>');

        var yukouKikanText = '';
        var yukouKikanList = conditionsObj.custbody_djkk_estimate_yukou_kikan;
        if (yukouKikanList.length > 0) {
            yukouKikanText = yukouKikanList[0].text;
        }
        xmlArray.push('   <Row ss:Index="88" ss:AutoFitHeight="0" >');
        xmlArray.push('    <Cell ss:StyleID="s89"><Data ss:Type="String" x:Ticked="1">４．</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell><PhoneticText xmlns="urn:schemas-microsoft-com:office:excel">ミツモリユウコウキゲン</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">見積有効期限</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="4" ss:StyleID="s87"><Data ss:Type="String">' + yukouKikanText + '</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="9" ss:StyleID="s83"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('   </Row>');
        xmlArray.push('   <Row ss:AutoFitHeight="0" >');
        xmlArray.push('    <Cell ss:Index="9" ss:StyleID="s83"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('   </Row>');
        xmlArray.push('   <Row ss:AutoFitHeight="0" >');
        xmlArray.push('    <Cell ss:Index="9" ss:StyleID="s83"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('   </Row>');
        xmlArray.push('   <Row ss:AutoFitHeight="0" >');
        xmlArray.push('    <Cell ss:Index="9" ss:StyleID="s83"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('   </Row>');

        xmlArray.push('  </Table>');
        xmlArray.push('  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">');
        xmlArray.push('   <PageSetup>');
        xmlArray.push('    <Header x:Margin="0.51181102362204722"/>');
        xmlArray.push('    <Footer x:Margin="0.51181102362204722" x:Data="&amp;C&amp;P/&amp;N Page"/>');
        xmlArray.push('    <PageMargins x:Bottom="0.98425196850393704" x:Left="0.34" x:Right="0.12"');
        xmlArray.push('     x:Top="0.98425196850393704"/>');
        xmlArray.push('   </PageSetup>');
        xmlArray.push('   <Unsynced/>');
        xmlArray.push('  <FitToPage/>');//quan
        
        xmlArray.push('   <Print>');
        // CH162 zheng 20230219 start
        xmlArray.push('    <FitHeight>0</FitHeight>');
        // CH162 zheng 20230219 end
        xmlArray.push('    <ValidPrinterInfo/>');
        // CH162 zheng 20230219 start
        // xmlArray.push('   <Scale>66</Scale>');//quan
        xmlArray.push('   <Scale>79</Scale>');
        // CH162 zheng 20230219 end

        xmlArray.push('    <PaperSizeIndex>9</PaperSizeIndex>');
        xmlArray.push('    <HorizontalResolution>600</HorizontalResolution>');
        xmlArray.push('    <VerticalResolution>600</VerticalResolution>');
        xmlArray.push('   </Print>');
        xmlArray.push('   <TabColorIndex>10</TabColorIndex>');
        xmlArray.push('   <Zoom>115</Zoom>');
        xmlArray.push('   <Selected/>');
        xmlArray.push('   <FreezePanes/>');
        xmlArray.push('   <FrozenNoSplit/>');
        xmlArray.push('   <SplitHorizontal>12</SplitHorizontal>');
        xmlArray.push('   <TopRowBottomPane>54</TopRowBottomPane>');
        xmlArray.push('   <ActivePane>2</ActivePane>');
        xmlArray.push('   <Panes>');
        xmlArray.push('    <Pane>');
        xmlArray.push('     <Number>3</Number>');
        xmlArray.push('     <ActiveRow>19</ActiveRow>');
        xmlArray.push('     <ActiveCol>8</ActiveCol>');
        xmlArray.push('    </Pane>');
        xmlArray.push('    <Pane>');
        xmlArray.push('     <Number>2</Number>');
        xmlArray.push('     <ActiveRow>60</ActiveRow>');
        xmlArray.push('     <ActiveCol>9</ActiveCol>');
        xmlArray.push('    </Pane>');
        xmlArray.push('   </Panes>');
        xmlArray.push('   <ProtectObjects>False</ProtectObjects>');
        xmlArray.push('   <ProtectScenarios>False</ProtectScenarios>');
        xmlArray.push('  </WorksheetOptions>');
        xmlArray.push(' </Worksheet>');
        xmlArray.push('</Workbook>');

        var textContent = xmlArray.join('\r\n');
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
     * 基本パターン(NBKK) FS REデータを取得する
     */
    function getOutputData(estimateId) {

        var resultList = [];

        var searchType = 'estimate';

        var searchFilters = [["type", "anyof", "Estimate"], "AND", ["mainline", "is", "F"], "AND", ["taxline", "is", "F"], "AND", ["cogs", "is", "F"], "AND", ["shipping", "is", "F"], "AND", ["internalid", "anyof", estimateId]];

        var searchColumns = [search.createColumn({
        	//CH162 商品コードをカタログコードにする        	
//            name : "itemid",
//            join : "item",
//            label : "名前"
        	name : "custitem_djkk_product_code",
  	        join : "item",
  	        label : "カタログコード"
        }), search.createColumn({
            name : "class",
            join : "item",
            label : "ブランド"
        }), search.createColumn({
            name : "displayname",
            join : "item",
            label : "表示名"
        }), search.createColumn({
            name : "custcol_djkk_specifications",
            label : "DJ_規格"
        }), search.createColumn({
            name : "custcol_djkk_perunitquantity",
            label : "DJ_入数"
        }), search.createColumn({
            name : "upccode",
            join : "item",
            label : "UPCコード"
        }), search.createColumn({
            name : "custitem_djkk_shelf_life",
            join : "item",
            label : "DJ_賞味期限日数"
        }), search.createColumn({
            name : "rate",
            label : "単価/率"
        }), search.createColumn({
            name : "custcol_djkk_suggested_retail_price",//changed by song  add 20230614 start CH638
            label : "DJ_希望小売価格"
        }), search.createColumn({
            name : "custitem_djkk_item_displayname",
            join : "item",
            label : "DJ_製品表示名"
        }), search.createColumn({
            name : "custitem_djkk_item_abbreviation_name",
            join : "item",
            label : "DJ_規格"
    	})];

        var searchResults = createSearch(searchType, searchFilters, searchColumns);
        if (searchResults && searchResults.length > 0) {
            for (var i = 0; i < searchResults.length; i++) {
                var lineDataDic = {};
                var searchResult = searchResults[i];
                // 商品コード
                var item = searchResult.getValue(searchColumns[0]);
                lineDataDic.item = item;
                // ブランド名
                // CH162　ブランドコードを外す
//                var brand = searchResult.getText(searchColumns[1]);
                var brandAll = searchResult.getText(searchColumns[1]);
                var brandLength = brandAll.length; 
                var brand = brandAll.substring(6,brandLength);
                lineDataDic.brand = brand;
                // 商品名
                var itemText = searchResult.getValue(searchColumns[2]);
                lineDataDic.itemText = itemText;
                // 規格
                var specifications = searchResult.getValue(searchColumns[3]);
                lineDataDic.specifications = specifications;
                // 入数
                var perunitquantity = searchResult.getValue(searchColumns[4]);
                lineDataDic.perunitquantity = perunitquantity;
                // JANコード
                var jancode = searchResult.getValue(searchColumns[5]);
                lineDataDic.jancode = jancode;
                // 賞味期間（製造後）
                var tastePeriod = searchResult.getValue(searchColumns[6]);
                lineDataDic.tastePeriod = tastePeriod;
                // 仕切価格(税抜)
                var shiPrice = searchResult.getValue(searchColumns[7]);
                lineDataDic.shiPrice = shiPrice;
                // 参考販売価格
                var referencePrice = searchResult.getValue(searchColumns[8]);
                lineDataDic.referencePrice = referencePrice;
                //DJ_製品表示名
                var productName = searchResult.getValue(searchColumns[9]);
                lineDataDic.productName = productName;
                
              //DJ_規格
                var abbreviationName = searchResult.getValue(searchColumns[10]);
                lineDataDic.abbreviationName = abbreviationName;
                resultList.push(lineDataDic);
            }
        }

        return resultList;
    }

    /**
     * 検索共通メソッド
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
     * EXCEL日付処理
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

    return {
        onRequest : onRequest
    };

    /**
     * ボディフィールドの検索メソッド
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
     * 日本の日付を取得する
     * 
     * @returns 日本の日付
     */
    function getJapanDate() {

        var now = new Date();
        var offSet = now.getTimezoneOffset();
        var offsetHours = 9 + (offSet / 60);
        now.setHours(now.getHours() + offsetHours);

        return now;
    }

    /**
     * EXCEL日付処理
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
