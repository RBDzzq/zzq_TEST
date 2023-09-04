/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/file', 'N/encode', 'N/runtime', 'N/format', 'N/search','N/record', '/SuiteScripts/DENISJAPAN/2.0/Common/djkk_common'], function(file, encode, runtime, format, search,record, djkk_common) {

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
                name : 'custscript_djkk_sl_immed_pull_nbkk_save'
            });

            // 見積の内部ID
            var estimateId = request.parameters.estimateId;

            log.debug("estimateId:", estimateId);
            var dataList = getOutputData(estimateId);
            log.debug("dataList", dataList);
            var values = JSON.stringify(dataList);
            log.error('values', values);

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

    function createExcel(fileName, folder, dataList, conditionsObj) {
        var xmlArray = [];
        var userName = runtime.getCurrentUser().name;
        var createdDateTime = formatExcelData(getJapanDate());
        xmlArray.push('<?xml version="1.0"?>');
        xmlArray.push('<?mso-application progid="Excel.Sheet"?>');
        xmlArray.push('<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"');
        xmlArray.push(' xmlns:o="urn:schemas-microsoft-com:office:office"');
        xmlArray.push(' xmlns:x="urn:schemas-microsoft-com:office:excel"');
        xmlArray.push(' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"');
        xmlArray.push(' xmlns:html="http://www.w3.org/TR/REC-html40">');
        xmlArray.push(' <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">');
        xmlArray.push('  <Author>' + userName + '</Author>');
        xmlArray.push('  <LastAuthor>' + userName + '</LastAuthor>');
        xmlArray.push('  <Created>' + createdDateTime + '</Created>');
        xmlArray.push('  <Company>Denis Japan</Company>');
        xmlArray.push('  <Version>15.00</Version>');
        xmlArray.push(' </DocumentProperties>');
        xmlArray.push(' <OfficeDocumentSettings xmlns="urn:schemas-microsoft-com:office:office">');
        xmlArray.push('  <AllowPNG/>');
        xmlArray.push(' </OfficeDocumentSettings>');
        xmlArray.push(' <ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel">');
        xmlArray.push('  <WindowHeight>12930</WindowHeight>');
        xmlArray.push('  <WindowWidth>23490</WindowWidth>');
        xmlArray.push('  <WindowTopX>5355</WindowTopX>');
        xmlArray.push('  <WindowTopY>45</WindowTopY>');
        xmlArray.push('  <TabRatio>744</TabRatio>');
        xmlArray.push('  <RefModeR1C1/>');
        xmlArray.push('  <ProtectStructure>False</ProtectStructure>');
        xmlArray.push('  <ProtectWindows>False</ProtectWindows>');
        xmlArray.push(' </ExcelWorkbook>');
        xmlArray.push(' <Styles>');
        xmlArray.push('  <Style ss:ID="Default" ss:Name="Normal">');
        xmlArray.push('   <Alignment ss:Vertical="Bottom"/>');
        xmlArray.push('   <Borders/>');
        xmlArray.push('   <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('   <Interior/>');
        xmlArray.push('   <NumberFormat/>');
        xmlArray.push('   <Protection/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s16" ss:Name="桁区切り">');
        xmlArray.push('   <NumberFormat ss:Format="#,##0;[Red]\\-#,##0"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s18">');
        xmlArray.push('   <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        xmlArray.push('   <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s19">');
        xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Top"/>');
        xmlArray.push('   <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('   <NumberFormat ss:Format="[JPN][$-411]gggy&quot;年&quot;m&quot;月&quot;d&quot;日&quot;"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s20">');
        //CH739 20230718 by zzq start
//      xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Top"/>');
        xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>');
        //CH739 20230718 by zzq end
        xmlArray.push('   <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="20"');
        xmlArray.push('    ss:Bold="1"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s21">');
        xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Top"/>');
        xmlArray.push('   <Borders/>');
        xmlArray.push('   <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('   <NumberFormat ss:Format="[JPN][$-411]gggy&quot;年&quot;m&quot;月&quot;d&quot;日&quot;"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s22">');
        xmlArray.push('   <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        xmlArray.push('   <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="16"');
        xmlArray.push('    ss:Bold="1"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s23">');
        xmlArray.push('   <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        xmlArray.push('   <Borders/>');
        xmlArray.push('   <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s24">');
        xmlArray.push('   <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        xmlArray.push('   <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s25">');
        xmlArray.push('   <Alignment ss:Horizontal="Left" ss:Vertical="Center" ss:WrapText="1"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s26">');
        xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('   <NumberFormat ss:Format="@"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s27">');
        xmlArray.push('   <Alignment ss:Horizontal="Right" ss:Vertical="Center" ss:WrapText="1"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('   <NumberFormat ss:Format="#,##0;[Red]\\-#,##0"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s28">');
        xmlArray.push('   <Alignment ss:Horizontal="Right" ss:Vertical="Center" ss:WrapText="1"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('   <NumberFormat ss:Format="[$\\-411]#,##0_);[Red]\\([$\\-411]#,##0\\)"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s29">');
        xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s30">');
        xmlArray.push('   <Alignment ss:Horizontal="Right" ss:Vertical="Center" ss:WrapText="1"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('   <NumberFormat ss:Format="&quot;\\&quot;#,##0;&quot;\\&quot;\\-#,##0"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s31">');
        xmlArray.push('   <Alignment ss:Vertical="Top"/>');
        xmlArray.push('   <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('   <NumberFormat ss:Format="Long Date"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s32">');
        xmlArray.push('   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>');
        xmlArray.push('   <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s33">');
        xmlArray.push('   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>');
        xmlArray.push('   <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s34">');
        xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Interior ss:Color="#C0C0C0" ss:Pattern="Solid"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s35">');
        xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('   <Interior ss:Color="#C0C0C0" ss:Pattern="Solid"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s36">');
        xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('   <Interior ss:Color="#C0C0C0" ss:Pattern="Solid"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s38">');
        xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('   <Interior ss:Color="#BFBFBF" ss:Pattern="Solid"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s39">');
        xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Interior ss:Color="#C0C0C0" ss:Pattern="Solid"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s40">');
        xmlArray.push('   <Alignment ss:Horizontal="Left" ss:Vertical="Center" ss:ShrinkToFit="1"/>');
        xmlArray.push('   <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="9"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s41" ss:Parent="s16">');
        xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"');
        xmlArray.push('    ss:Color="#000000"/>');
        xmlArray.push('   <Interior ss:Color="#BFBFBF" ss:Pattern="Solid"/>');
        xmlArray.push('   <NumberFormat ss:Format="#,##0.00;[Red]\\-#,##0.00"/>');
        xmlArray.push('   <Protection ss:Protected="0"/>');
        xmlArray.push('  </Style>');
        //CH739 20230718 by zzq start
        xmlArray.push('  <Style ss:ID="s45">');
//      xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Top"/>');
        xmlArray.push('   <Alignment ss:Horizontal="Right" ss:Vertical="Top"/>');
        //CH739 20230718 by zzq end
        xmlArray.push('   <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('   <NumberFormat ss:Format="Long Date"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('<Style ss:ID="s87">');
        xmlArray.push(' <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        xmlArray.push(' <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"');
        xmlArray.push('  ss:Color="#FF0000"/>');
        xmlArray.push('</Style>');
        xmlArray.push('<Style ss:ID="s88">');
        xmlArray.push(' <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        xmlArray.push('</Style>');
        xmlArray.push('<Style ss:ID="s90">');
        xmlArray.push(' <Alignment ss:Horizontal="Right" ss:Vertical="Top"/>');
        xmlArray.push(' <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('</Style>');
        xmlArray.push('<Style ss:ID="s91">');
        xmlArray.push(' <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        xmlArray.push(' <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"');
        xmlArray.push('  ss:Color="#3366FF"/>');
        xmlArray.push('</Style>');
        xmlArray.push('<Style ss:ID="s93">');
        xmlArray.push(' <Alignment ss:Horizontal="Right" ss:Vertical="Top"/>');
        xmlArray.push('</Style>');
        xmlArray.push('  <Style ss:ID="s117">');
        //CH739 20230718 by zzq start
//      xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Top"/>');
        xmlArray.push('   <Alignment ss:Horizontal="Right" ss:Vertical="Top"/>');
        //CH739 20230718 by zzq end
        xmlArray.push('   <Font ss:FontName="ＭＳ Ｐゴシック" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('   <NumberFormat/>');
        xmlArray.push('  </Style>');
        xmlArray.push(' </Styles>');
        var row = 21 + dataList.length + 1;
        xmlArray.push(' <Worksheet ss:Name="即引き用(NBKK) RE">');
        xmlArray.push('  <Names>');
        xmlArray.push('   <NamedRange ss:Name="Print_Area" ss:RefersTo="=' + "'即引き用(NBKK) RE'" + '!C1:C10"/>');
        xmlArray.push('   <NamedRange ss:Name="Print_Titles" ss:RefersTo="=' + "'即引き用(NBKK) RE'" + '!R1:R12"/>');
        xmlArray.push('  </Names>');
//        xmlArray.push('  <Table ss:ExpandedColumnCount="17" ss:ExpandedRowCount="' + row + '" x:FullColumns="1"');
        xmlArray.push('  <Table x:FullColumns="1"');
        xmlArray.push('   x:FullRows="1" ss:StyleID="s18" ss:DefaultColumnWidth="54"');
        xmlArray.push('   ss:DefaultRowHeight="13.5">');
        xmlArray.push('   <Column ss:Index="2" ss:StyleID="s18" ss:AutoFitWidth="0" ss:Width="103.5"/>');
        xmlArray.push('   <Column ss:StyleID="s18" ss:AutoFitWidth="0" ss:Width="106.5"/>');
        xmlArray.push('   <Column ss:StyleID="s18" ss:AutoFitWidth="0" ss:Width="215.25"/>');
        xmlArray.push('   <Column ss:StyleID="s18" ss:AutoFitWidth="0" ss:Width="60"/>');
        xmlArray.push('   <Column ss:StyleID="s18" ss:AutoFitWidth="0" ss:Width="45.75"/>');
        xmlArray.push('   <Column ss:StyleID="s18" ss:AutoFitWidth="0" ss:Width="115"/>');//51.75
        xmlArray.push('   <Column ss:Index="9" ss:StyleID="s18" ss:AutoFitWidth="0" ss:Width="80"/>');//59.25
        xmlArray.push('   <Column ss:StyleID="s18" ss:AutoFitWidth="0" ss:Width="80"/>');//60.75
        xmlArray.push('   <Column ss:StyleID="s18" ss:AutoFitWidth="0" ss:Width="77.25" ss:Span="1"/>');
        xmlArray.push('   <Column ss:Index="16" ss:StyleID="s18" ss:AutoFitWidth="0" ss:Width="61.5"/>');
        xmlArray.push('   <Row>');
        //CH739 20230719 by zzq start
//      xmlArray.push('    <Cell ss:Index="8" ss:MergeAcross="1" ss:StyleID="s45"><Data ss:Type="DateTime">' + createdDateTime + '</Data><NamedCell');
        xmlArray.push('    <Cell ss:Index="9" ss:MergeAcross="1" ss:StyleID="s45"><Data ss:Type="DateTime">' + createdDateTime + '</Data><NamedCell');
        //CH739 20230719 by zzq end
        xmlArray.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s31"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="17" ss:StyleID="s19"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('   </Row>');
        xmlArray.push('   <Row>');
        //modify by lj  start CH374
        //CH739 20230719 by zzq start
//      xmlArray.push('    <Cell ss:Index="8" ss:MergeAcross="1" ss:StyleID="s117"><Data ss:Type="String">見積書番号：' + conditionsObj.transactionnumber + '</Data><NamedCell');
        xmlArray.push('    <Cell ss:Index="9" ss:MergeAcross="1" ss:StyleID="s117"><Data ss:Type="String">見積書番号：' + conditionsObj.transactionnumber + '</Data><NamedCell');
        //CH739 20230719 by zzq end
        //modify by lj  end CH374
        xmlArray.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('   </Row>');
        xmlArray.push('   <Row ss:Height="24">');
        //CH739 20230719 by zzq start
//      xmlArray.push('    <Cell ss:MergeAcross="8" ss:StyleID="s20"><PhoneticText');
        xmlArray.push('    <Cell ss:MergeAcross="9" ss:StyleID="s20"><PhoneticText');
        //CH739 20230719 by zzq end
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">オミツモリショ</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">御見積書</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="17" ss:StyleID="s20"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('   </Row>');
        xmlArray.push('   <Row>');
        xmlArray.push('    <Cell ss:Index="17" ss:StyleID="s21"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('   </Row>');
        var entityText = '';
        var entityList = conditionsObj.entity;
        
        log.error('entityList', entityList);
        
        if (entityList.length > 0) {

            var companynameObj = search.lookupFields({
                type : 'customer',
                id : entityList[0].value,
                columns : ['companyname']
            });
        	
            entityText = companynameObj.companyname + ' 御中';
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

        
        
        xmlArray.push('   <Row ss:Height="18.75">');
        xmlArray.push('    <Cell ss:StyleID="s22"><Data ss:Type="String">' + entityText + '</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s22"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="17" ss:StyleID="s23"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('   </Row>');
        xmlArray.push('   <Row ss:Height="18.75">');
        xmlArray.push('    <Cell ss:StyleID="s22"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s22"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="7" ss:StyleID="s32"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">ニチフツボウエキカブシキカイシャ</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">'+subsidiary.legalname+'</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');

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
		
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s33"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="17" ss:StyleID="s23"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('   </Row>');
        xmlArray.push('   <Row>');
        xmlArray.push('    <Cell ss:Index="7" ss:StyleID="s24"><Data ss:Type="String">〒' + subsidiary.zip + '</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="17" ss:StyleID="s23"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('   </Row>');
        xmlArray.push('   <Row>');
        xmlArray.push('    <Cell ss:Index="4" ss:StyleID="s33"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="7" ss:StyleID="s24"><Data ss:Type="String">' + subAddr + '</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="17" ss:StyleID="s23"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('   </Row>');
        xmlArray.push('   <Row>');
        xmlArray.push('    <Cell ss:Index="7" ss:StyleID="s24"><Data ss:Type="String">TEL：' + subsidiary.phone + '</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('   </Row>');
        xmlArray.push('   <Row>');
        xmlArray.push('    <Cell ss:Index="7" ss:StyleID="s24"><Data ss:Type="String">FAX：' + subsidiary.fax + '</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('   </Row>');
        xmlArray.push('   <Row>');
        xmlArray.push('    <Cell ss:Index="6" ss:StyleID="s24"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:MergeAcross="2" ss:StyleID="s40"><Data ss:Type="String">担当：' + resultDic.name + '</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('   </Row>');
        xmlArray.push('   <Row>');
        xmlArray.push('    <Cell ss:Index="6" ss:StyleID="s24"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s40"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s40"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s40"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('   </Row>');
        xmlArray.push('   <Row ss:AutoFitHeight="0" ss:Height="38.25">');
        xmlArray.push('    <Cell ss:StyleID="s35"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">ショウヒン</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">カタログ&#10;コード</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');//CH162
//        xmlArray.push('      ss:Type="String">商品&#10;コード</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s36"><Data ss:Type="String">JANコード</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s34"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">ナ</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">ブランド名</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s36"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">ショウヒンメイ</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">商品名</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s36"><Data ss:Type="String">規格</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s36"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">イスウ</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">入数</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s34"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">ショウミキカンセイゾウゴ</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">賞味期間（製造後）</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s38"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">ゼイリツ</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">税率</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s34"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">シキカカクゼイヌ</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">仕切価格(税抜)</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s34"><Data ss:Type="String">希望小売価格</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s41"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">ツウジョウクライ</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">通常リベート&#10;（倉入リベート）</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s41"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">テイバンジョウケンハンバイジゴ</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">定番条件&#10;（販売事後）</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s41"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">カカク</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">NET価格</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
     // add by song  start CH162
//        xmlArray.push('    <Cell ss:StyleID="s41"><PhoneticText');
//        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">カカク</PhoneticText><Data');
//        xmlArray.push('      ss:Type="String">DJ_製品表示名</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
//        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
     // add by song  end CH162
        xmlArray.push('   </Row>');
        // 明細
        for (var i = 0; i < dataList.length; i++) {

            var tempData = dataList[i];
            log.debug('tempData',tempData);
            xmlArray.push('   <Row ss:AutoFitHeight="0" ss:Height="25.3125">');
            xmlArray.push('    <Cell ss:StyleID="s25"><Data ss:Type="String">' + tempData.item + '</Data><NamedCell');
            xmlArray.push('      ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s26"><Data ss:Type="String">' + tempData.jancode + '</Data><NamedCell');
            xmlArray.push('      ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s25"><Data ss:Type="String">' + tempData.brand + '</Data><NamedCell');
            xmlArray.push('      ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s25"><Data ss:Type="String">' + tempData.productName + '</Data><NamedCell');
            xmlArray.push('      ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s26"><Data ss:Type="String">' + tempData.abbreviationName + '</Data><NamedCell');
            xmlArray.push('      ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s29"><Data ss:Type="Number">' + tempData.perunitquantity + '</Data><NamedCell');
            xmlArray.push('      ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s26"><Data ss:Type="String">' + tempData.tastePeriod + '</Data><NamedCell');
            xmlArray.push('      ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s26"><Data ss:Type="String">' + tempData.taxRate + '</Data><NamedCell');
            xmlArray.push('      ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s28"><Data ss:Type="Number">' + tempData.shiPrice + '</Data><NamedCell');
            xmlArray.push('      ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s28"><Data ss:Type="Number">' + tempData.retailRrice + '</Data><NamedCell');
            xmlArray.push('      ss:Name="Print_Area"/></Cell>');
//            xmlArray.push('    <Cell ss:StyleID="s26"><Data ss:Type="String">' + tempData.retailRrice + '</Data><NamedCell');
//            xmlArray.push('      ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s27"><Data ss:Type="Number">' + tempData.rebate + '</Data><NamedCell');
            xmlArray.push('      ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s25"><Data ss:Type="String">' + tempData.conditions + '</Data><NamedCell');
            xmlArray.push('      ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s27"><Data ss:Type="Number">' + tempData.netPrice + '</Data><NamedCell');
            xmlArray.push('      ss:Name="Print_Area"/></Cell>');
         // add by song  start CH162
//            xmlArray.push('    <Cell ss:StyleID="s27"><Data ss:Type="String">' + tempData.productName + '</Data><NamedCell');
//            xmlArray.push('      ss:Name="Print_Area"/></Cell>');
         // add by song  end CH162
            xmlArray.push('   </Row>');
        }
        
        // CH162 zheng 20230218 start
        var forCnt = 0;
        var page1Max = 44;
        var pageMoreMax = 45;
        var page1Line = 81;
        var pageMoreLine = 83;
        if (dataList.length <= page1Max) {
            forCnt = djkk_common.getExcelPrintPage1(dataList.length, page1Line);
        } else {
            forCnt = djkk_common.getExcelPrintPage2(dataList.length, page1Max, pageMoreMax, pageMoreLine);
        }
        for (var i = 0; i < forCnt; i++) {
            xmlArray.push('<Row ss:AutoFitHeight="0">');
            xmlArray.push(' <Cell ss:Index="12" ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
            xmlArray.push(' <Cell ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
            xmlArray.push('</Row>');
        }
        
//        xmlArray.push('<Row ss:AutoFitHeight="0">');
//        xmlArray.push(' <Cell ss:Index="12" ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
//        xmlArray.push(' <Cell ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
//        xmlArray.push('</Row>');
//        xmlArray.push('<Row ss:AutoFitHeight="0">');
//        xmlArray.push(' <Cell ss:Index="10" ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
//        xmlArray.push(' <Cell ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
//        xmlArray.push('</Row>');
//        xmlArray.push('<Row ss:AutoFitHeight="0">');
//        xmlArray.push(' <Cell ss:Index="12" ss:StyleID="s88"><NamedCell ss:Name="Print_Area"/></Cell>');
//        xmlArray.push('</Row>');
//        xmlArray.push('<Row ss:AutoFitHeight="0">');
//        xmlArray.push(' <Cell ss:Index="10" ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
//        xmlArray.push(' <Cell ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
//        xmlArray.push(' <Cell ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
//        xmlArray.push('</Row>');
        // CH162 zheng 20230218 end
        xmlArray.push('<Row ss:AutoFitHeight="0">');
        xmlArray.push(' <Cell ss:Index="2" ss:StyleID="s90"><Data ss:Type="String" x:Ticked="1">１．</Data><NamedCell');
        xmlArray.push('   ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:StyleID="s88"><PhoneticText');
        xmlArray.push('   xmlns="urn:schemas-microsoft-com:office:excel">ハッチュウジョウケン</PhoneticText><Data');
        xmlArray.push('   ss:Type="String">発注条件</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="10" ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('</Row>');

        var showObj = {};

        showObj['showCon_a'] = 'A)　1回の最低発注数量(配送ロット)';
    	showObj['showText1_a'] = '混載';
        var conditonAList = conditionsObj.custbody_djkk_estimate_po_conditon_a;
        showObj['showText2_a'] = conditonAList.length > 0 ? conditonAList[0].text : '';

        showObj['showCon_b'] = 'B)　配送料';
        var conditonB1List = conditionsObj.custbody_djkk_estimate_po_conditon_b1;
        var conditonB2List = conditionsObj.custbody_djkk_estimate_po_conditon_b2;
        showObj['showText1_b'] = conditonB2List.length > 0 ? conditonB2List[0].text : '';
      //add by song  start CH250
        var estimateRecordId = conditonB1List.length > 0 ? conditonB1List[0].value : '';
        log.debug('estimateRecordId',estimateRecordId);
        // CH163 lj 20230303 start
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
        // CH163 lj 20230303 end
        //add by song  end CH250
        
    
    	showObj['showCon_c'] = 'C)　納品場所';
        var conditonCList = conditionsObj.custbody_djkk_estimate_po_conditon_c;
       	showObj['showText1_c'] = conditonCList.length > 0 ? conditonCList[0].text : '';
        showObj['showText2_c'] = '';

        showObj['showCon_d'] = 'D)　ケース単位';
    	showObj['showText1_d'] = '';
    	showObj['showText2_d'] = '';
    	
    	showObj['showCon_e'] = 'E)　FAXにて注文（書面のみ受け付けます）';
        var conditonDList = conditionsObj.custbody_djkk_estimate_po_conditon_d;
//       	showObj['showText1_e'] = conditonDList.length > 0 ? conditonDList[0].text : '';
//        showObj['showText2_e'] = '';
        //add by song  start CH250
        var poconitonRecordId = conditonDList.length > 0 ? conditonDList[0].value : '';
        // CH163 lj 20230303 start
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
        // CH163 lj 20230303 end
      //add by song  end CH250
        
        
        xmlArray.push('<Row ss:AutoFitHeight="0">');
        xmlArray.push(' <Cell ss:Index="3" ss:StyleID="s88"><PhoneticText');
        xmlArray.push('   xmlns="urn:schemas-microsoft-com:office:excel">ハイソウリョウ</PhoneticText><Data');
        xmlArray.push('   ss:Type="String">' + showObj.showCon_a + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="5" ss:StyleID="s88"><Data ss:Type="String">' + showObj.showText1_a + '</Data><NamedCell');
        xmlArray.push('   ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="7" ss:StyleID="s88"><PhoneticText');
        xmlArray.push('   xmlns="urn:schemas-microsoft-com:office:excel">エンゼイヌ</PhoneticText><Data');
        xmlArray.push('   ss:Type="String">' + showObj.showText2_a + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="12" ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('</Row>');
        
        xmlArray.push('<Row ss:AutoFitHeight="0">');
        xmlArray.push('</Row>');
        
        xmlArray.push('<Row ss:AutoFitHeight="0">');
        xmlArray.push(' <Cell ss:Index="3" ss:StyleID="s88"><PhoneticText');
        xmlArray.push('   xmlns="urn:schemas-microsoft-com:office:excel">ハイソウリョウ</PhoneticText><Data');
        xmlArray.push('   ss:Type="String">' + showObj.showCon_b + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="5" ss:StyleID="s88"><Data ss:Type="String">' + showObj.showText1_b + '</Data><NamedCell');
        xmlArray.push('   ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="7" ss:StyleID="s88"><PhoneticText');
        xmlArray.push('   xmlns="urn:schemas-microsoft-com:office:excel">エンゼイヌ</PhoneticText><Data');
        xmlArray.push('   ss:Type="String">' + showObj.showText2_b + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="12" ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('</Row>');
        
        xmlArray.push('<Row ss:AutoFitHeight="0">');
        xmlArray.push(' <Cell ss:Index="3" ss:StyleID="s88"><PhoneticText');
        xmlArray.push('   xmlns="urn:schemas-microsoft-com:office:excel">ハイソウリョウ</PhoneticText><Data');
        xmlArray.push('   ss:Type="String">（ロット未満の場合配送料を頂戴いたします。）</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        //add by song  start CH250
        xmlArray.push('<Cell ss:Index="7" ss:StyleID="s88"><PhoneticText');
        xmlArray.push('  xmlns="urn:schemas-microsoft-com:office:excel">エンゼイヌ</PhoneticText><Data');
        xmlArray.push('  ss:Type="String">' + showObj.showText3_b + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
      //add by song  end CH250
        xmlArray.push('</Row>');
        
        xmlArray.push('<Row ss:AutoFitHeight="0">');
        xmlArray.push('</Row>');
        
        xmlArray.push('<Row ss:AutoFitHeight="0">');
        xmlArray.push(' <Cell ss:Index="3" ss:StyleID="s88"><PhoneticText');
        xmlArray.push('   xmlns="urn:schemas-microsoft-com:office:excel">ハイソウリョウ</PhoneticText><Data');
        xmlArray.push('   ss:Type="String">' + showObj.showCon_c + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="5" ss:StyleID="s91"><Data ss:Type="String">' + showObj.showText1_c + '</Data><NamedCell');
        xmlArray.push('   ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="7" ss:StyleID="s88"><PhoneticText');
        xmlArray.push('   xmlns="urn:schemas-microsoft-com:office:excel">エンゼイヌ</PhoneticText><Data');
        xmlArray.push('   ss:Type="String">' + showObj.showText2_c + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="12" ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('</Row>');
        
        xmlArray.push('<Row ss:AutoFitHeight="0">');
        xmlArray.push(' <Cell ss:Index="3" ss:StyleID="s88"><PhoneticText');
        xmlArray.push('   xmlns="urn:schemas-microsoft-com:office:excel">ハイソウリョウ</PhoneticText><Data');
        xmlArray.push('   ss:Type="String">' + showObj.showCon_d + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="5" ss:StyleID="s88"><Data ss:Type="String">' + showObj.showText1_d + '</Data><NamedCell');
        xmlArray.push('   ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="7" ss:StyleID="s88"><PhoneticText');
        xmlArray.push('   xmlns="urn:schemas-microsoft-com:office:excel">エンゼイヌ</PhoneticText><Data');
        xmlArray.push('   ss:Type="String">' + showObj.showText2_d + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="12" ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('</Row>');
        
        xmlArray.push('<Row ss:AutoFitHeight="0">');
        xmlArray.push(' <Cell ss:Index="3" ss:StyleID="s88"><PhoneticText');
        xmlArray.push('   xmlns="urn:schemas-microsoft-com:office:excel">ハイソウリョウ</PhoneticText><Data');
        xmlArray.push('   ss:Type="String">' + showObj.showCon_e + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="5" ss:StyleID="s88"><Data ss:Type="String">' + showObj.showText1_e + '</Data><NamedCell');
        xmlArray.push('   ss:Name="Print_Area"/></Cell>');
//        xmlArray.push(' <Cell ss:Index="7" ss:StyleID="s88"><PhoneticText');
//        xmlArray.push('   xmlns="urn:schemas-microsoft-com:office:excel">エンゼイヌ</PhoneticText><Data');
//        xmlArray.push('   ss:Type="String">' + showObj.showText2_e + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
//        xmlArray.push(' <Cell ss:Index="12" ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
//        xmlArray.push(' <Cell ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('</Row>');
        
        //add by song  start CH250
        xmlArray.push('   <Row>');
        xmlArray.push('<Cell ss:Index="3" ss:StyleID="s88"><PhoneticText');
        xmlArray.push('  xmlns="urn:schemas-microsoft-com:office:excel">ハイソウリョウ</PhoneticText><Data');
        xmlArray.push('  ss:Type="String">' + '' + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('<Cell ss:Index="5" ss:StyleID="s88"><Data ss:Type="String">' + showObj.showText2_e + '</Data><NamedCell');
        xmlArray.push('  ss:Name="Print_Area"/></Cell>');
        xmlArray.push('   </Row>');
        //add by song  end CH250
        
        
        xmlArray.push('<Row ss:AutoFitHeight="0">');
        xmlArray.push('</Row>');
        
        var nouhinDateText = '';
        var nouhinDateList = conditionsObj.custbody_djkk_estimate_nouhin_date;
        if (nouhinDateList.length > 0) {
            nouhinDateText = nouhinDateList[0].text;
        }
        xmlArray.push('<Row ss:AutoFitHeight="0">');
        xmlArray.push(' <Cell ss:Index="2" ss:StyleID="s90"><Data ss:Type="String" x:Ticked="1">２．</Data><NamedCell');
        xmlArray.push('   ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:StyleID="s88"><PhoneticText');
        xmlArray.push('   xmlns="urn:schemas-microsoft-com:office:excel">ノウヒンイリヒ</PhoneticText><Data');
        xmlArray.push('   ss:Type="String">納品日</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="5" ss:StyleID="s91"><PhoneticText');
        xmlArray.push('   xmlns="urn:schemas-microsoft-com:office:excel">ジュチュウゴニチゴノウヒン</PhoneticText><Data');
        xmlArray.push('   ss:Type="String">' + nouhinDateText + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:StyleID="s91"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:StyleID="s91"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:StyleID="s91"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="10" ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('</Row>');
        xmlArray.push('<Row ss:AutoFitHeight="0">');
        xmlArray.push('</Row>');
        var payConditonsText = '';
        var payConditonsList = conditionsObj.custbody_djkk_estimate_pay_conditons;
        if (payConditonsList.length > 0) {
            payConditonsText = payConditonsList[0].text;
        }
        xmlArray.push('<Row ss:AutoFitHeight="0">');
        xmlArray.push(' <Cell ss:Index="2" ss:StyleID="s93"><Data ss:Type="String" x:Ticked="1">３．</Data><NamedCell');
        xmlArray.push('   ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell><PhoneticText xmlns="urn:schemas-microsoft-com:office:excel">シハライジョウケン</PhoneticText><Data');
        xmlArray.push('   ss:Type="String">支払条件</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="5" ss:StyleID="s91"><Data ss:Type="String">' + payConditonsText + '</Data><NamedCell');
        xmlArray.push('   ss:Name="Print_Area"/></Cell>');
//        xmlArray.push(' <Cell ss:StyleID="s91"><NamedCell ss:Name="Print_Area"/></Cell>');
//        xmlArray.push(' <Cell ss:Index="10" ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
//        xmlArray.push(' <Cell ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
//        xmlArray.push(' <Cell ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
//        xmlArray.push(' <Cell ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('</Row>');
        
        xmlArray.push('<Row ss:AutoFitHeight="0">');
        xmlArray.push(' <Cell ss:Index="2" ss:StyleID="s93"><Data ss:Type="String" x:Ticked="1"></Data><NamedCell');
        xmlArray.push('   ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell><PhoneticText xmlns="urn:schemas-microsoft-com:office:excel">シハライジョウケン</PhoneticText><Data');
        xmlArray.push('   ss:Type="String"></Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="5" ss:StyleID="s88"><Data ss:Type="String">銀行名　：　三菱UFJ銀行　青山通支店　当座0568447</Data><NamedCell');
        xmlArray.push('   ss:Name="Print_Area"/></Cell>');
//        xmlArray.push(' <Cell ss:Index="7" ss:StyleID="s88"><PhoneticText');
//        xmlArray.push('   xmlns="urn:schemas-microsoft-com:office:excel">エンゼイヌ</PhoneticText><Data');
//        xmlArray.push('   ss:Type="String"></Data><NamedCell ss:Name="Print_Area"/></Cell>');
//        xmlArray.push(' <Cell ss:Index="12" ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
//        xmlArray.push(' <Cell ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('</Row>');
        
        
        xmlArray.push('<Row ss:AutoFitHeight="0">');
        xmlArray.push('</Row>');
        var yukouKikanText = '';
        var yukouKikanList = conditionsObj.custbody_djkk_estimate_yukou_kikan;
        if (yukouKikanList.length > 0) {
            yukouKikanText = yukouKikanList[0].text;
        }
        xmlArray.push('<Row ss:AutoFitHeight="0">');
        xmlArray.push(' <Cell ss:Index="2" ss:StyleID="s93"><Data ss:Type="String" x:Ticked="1">４．</Data><NamedCell');
        xmlArray.push('   ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell><PhoneticText xmlns="urn:schemas-microsoft-com:office:excel">ミツモリユウコウキゲン</PhoneticText><Data');
        xmlArray.push('   ss:Type="String">見積有効期限</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="5" ss:StyleID="s91"><Data ss:Type="String">' + yukouKikanText + '</Data><NamedCell');
        xmlArray.push('   ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="10" ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('</Row>');
        xmlArray.push('  </Table>');
        xmlArray.push('  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">');
        xmlArray.push('   <PageSetup>');
        //xmlArray.push('    <Layout x:Orientation="Landscape" x:CenterHorizontal="1"/>');
        xmlArray.push('    <Header x:Margin="0.51181102362204722"/>');
        xmlArray.push('    <Footer x:Margin="0.51181102362204722" x:Data="&amp;C&amp;P/&amp;N Page"/>');
        xmlArray.push('    <PageMargins x:Bottom="0.98425196850393704" x:Left="0.43307086614173229"');
        xmlArray.push('     x:Right="0.27559055118110237" x:Top="0.98425196850393704"/>');
        xmlArray.push('   </PageSetup>');
        xmlArray.push('  <FitToPage/>');//quan
        
        xmlArray.push('   <Print>');
        // CH162 zheng 20230217 start
        xmlArray.push('     <FitHeight>0</FitHeight>');
        // CH162 zheng 20230217 end
        xmlArray.push('    <ValidPrinterInfo/>');
        // CH162 zheng 20230217 start
        //xmlArray.push('   <Scale>66</Scale>');//quan
        xmlArray.push('     <Scale>57</Scale>');
        // CH162 zheng 20230217 end
        xmlArray.push('    <PaperSizeIndex>9</PaperSizeIndex>');
        xmlArray.push('    <Scale>65</Scale>');
        xmlArray.push('    <HorizontalResolution>600</HorizontalResolution>');
        xmlArray.push('    <VerticalResolution>600</VerticalResolution>');
        xmlArray.push('   </Print>');
        xmlArray.push('   <TabColorIndex>22</TabColorIndex>');
        xmlArray.push('   <PageBreakZoom>100</PageBreakZoom>');
        xmlArray.push('   <Selected/>');
        xmlArray.push('   <FreezePanes/>');
        xmlArray.push('   <FrozenNoSplit/>');
        xmlArray.push('   <SplitHorizontal>12</SplitHorizontal>');
        xmlArray.push('   <TopRowBottomPane>12</TopRowBottomPane>');
        xmlArray.push('   <ActivePane>2</ActivePane>');
        xmlArray.push('   <Panes>');
        xmlArray.push('    <Pane>');
        xmlArray.push('     <Number>3</Number>');
        xmlArray.push('    </Pane>');
        xmlArray.push('    <Pane>');
        xmlArray.push('     <Number>2</Number>');
        // CH162 zheng 20230217 start
        xmlArray.push('     <ActiveRow>0</ActiveRow>');
        // CH162 zheng 20230217 end
        xmlArray.push('    </Pane>');
        xmlArray.push('   </Panes>');
        xmlArray.push('   <ProtectContents>False</ProtectContents>');
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
     * 即引き用(NBKK) REデータを取得する
     */
    function getOutputData(estimateId) {

        var resultList = [];

        var searchType = 'estimate';

        var searchFilters = [["type", "anyof", "Estimate"], "AND", ["mainline", "is", "F"], "AND", ["taxline", "is", "F"], "AND", ["cogs", "is", "F"], "AND", ["shipping", "is", "F"], "AND", ["internalid", "anyof", estimateId]];

        var searchColumns = [search.createColumn({
        	//CH162 商品コードをカタログコードにする
//        	name : "itemid",
//            join : "item",
//            label : "名前"
            name : "custitem_djkk_product_code",
  	        join : "item",
  	        label : "カタログコード"
        }), search.createColumn({
            name : "upccode",
            join : "item",
            label : "UPCコード"
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
            name : "custitem_djkk_shelf_life",
            join : "item",
            label : "DJ_賞味期限日数"
        }), search.createColumn({
            name : "rate",
            join : "taxItem",
            label : "税率"
        }), search.createColumn({
            name : "rate",
            label : "単価/率"
        }), search.createColumn({
            name : "custcol_djkk_suggested_retail_price",
            label : "DJ_希望小売価格"
        }), search.createColumn({
            name : "custcol_djkk_normal_rebate",
            label : "DJ_通常リベート"
        }), search.createColumn({
            name : "custcol_djkk_conditions_after_sale",
            label : "DJ_定番条件_販売事後"
        }), search.createColumn({
            name : "custcol_djkk_net_price",
            label : "DJ_NET価格"
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
                // JANコード
                var jancode = searchResult.getValue(searchColumns[1]);
                lineDataDic.jancode = jancode;
                // ブランド名
//                var brand = searchResult.getText(searchColumns[2]);
                // CH162　ブランドコードを外す
                var brandAll = searchResult.getText(searchColumns[2]);
                var brandLength = brandAll.length; 
                var brand = brandAll.substring(6,brandLength);
                lineDataDic.brand = brand;
                // 商品名
                var itemText = searchResult.getValue(searchColumns[3]);
                lineDataDic.itemText = itemText;
                // 規格
                var specifications = searchResult.getValue(searchColumns[4]);
                lineDataDic.specifications = specifications;
                // 入数
                var perunitquantity = searchResult.getValue(searchColumns[5]);
                lineDataDic.perunitquantity = perunitquantity;

                // 賞味期間（製造後）
                var tastePeriod = searchResult.getValue(searchColumns[6]);
                lineDataDic.tastePeriod = tastePeriod;
                // 税率
                var taxRate = searchResult.getValue(searchColumns[7]);
                lineDataDic.taxRate = taxRate;
                // 仕切価格(税抜)
                var shiPrice = searchResult.getValue(searchColumns[8]);
                lineDataDic.shiPrice = shiPrice;
                // 希望小売価格
                var retailRrice = searchResult.getValue(searchColumns[9]);
                lineDataDic.retailRrice = retailRrice;

                // 通常リベート（倉入リベート）
                var rebate = searchResult.getValue(searchColumns[10]);
                lineDataDic.rebate = rebate;

                // 定番条件（販売事後）
                var conditions = searchResult.getValue(searchColumns[11]);
                lineDataDic.conditions = conditions;

                // NET価格
                var netPrice = searchResult.getValue(searchColumns[12]);
                lineDataDic.netPrice = netPrice;
                
                //DJ_製品表示名
                var productName = searchResult.getValue(searchColumns[13]);
                lineDataDic.productName = productName;
                
              //DJ_規格
                var abbreviationName = searchResult.getValue(searchColumns[14]);
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
    
    return {
        onRequest : onRequest
    };

});
