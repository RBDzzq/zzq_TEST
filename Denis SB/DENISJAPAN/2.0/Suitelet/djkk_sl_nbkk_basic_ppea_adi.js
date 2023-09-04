/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/file', 'N/encode', 'N/runtime', 'N/format', 'N/search', '/SuiteScripts/DENISJAPAN/2.0/Common/file_cabinet_common','N/record', '/SuiteScripts/DENISJAPAN/2.0/Common/djkk_common'], function(file, encode, runtime, format, search, cabinet, record, djkk_common) {

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
                name : 'custscript_djkk_sl_basic_patt_nbkk_save'
            });

            // ���ς̓���ID
            var estimateId = request.parameters.estimateId;

            log.debug("estimateId:", estimateId);
            var dataList = getOutputData(estimateId);

            var values = JSON.stringify(dataList);
            log.error('values', values);

            var conditionsObj = lookupFields('estimate', estimateId);

            //20221209 changed by zhou  start CH163
//          var tranId = conditionsObj.tranid;
            var tranId = conditionsObj.transactionnumber;
            //end
            //modify by lj  start CH374
            //var fileName = '����' + conditionsObj.tranid + '_' + formatExcelFileName(getJapanDate()) + '.xls';
            //modify by lj  end CH374
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
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('   <Interior/>');
        xmlArray.push('   <NumberFormat/>');
        xmlArray.push('   <Protection/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s16" ss:Name="����؂�">');
        xmlArray.push('   <NumberFormat ss:Format="#,##0;[Red]\-#,##0"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s18">');
        xmlArray.push('   <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s19">');
        xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Top"/>');
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('   <NumberFormat ss:Format="[JPN][$-411]gggy&quot;�N&quot;m&quot;��&quot;d&quot;��&quot;"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s20">');
        //CH739 20230718 by zzq start
//      xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Top"/>');
        xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>');
        //CH739 20230718 by zzq end
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="20"');
        xmlArray.push('    ss:Bold="1"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s21">');
        xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Top"/>');
        xmlArray.push('   <Borders/>');
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('   <NumberFormat ss:Format="[JPN][$-411]gggy&quot;�N&quot;m&quot;��&quot;d&quot;��&quot;"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s22">');
        xmlArray.push('   <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="16"');
        xmlArray.push('    ss:Bold="1"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s23">');
        xmlArray.push('   <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        xmlArray.push('   <Borders/>');
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s24">');
        xmlArray.push('   <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s25">');
        xmlArray.push('   <Alignment ss:Horizontal="Left" ss:Vertical="Center" ss:WrapText="1"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s26">');
        xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('   <NumberFormat ss:Format="@"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s27">');
        xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s28">');
        xmlArray.push('   <Alignment ss:Horizontal="Right" ss:Vertical="Center" ss:WrapText="1"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('   <NumberFormat ss:Format="[$\\-411]#,##0_);[Red]\\([$\\-411]#,##0\\)"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s29">');
        xmlArray.push('   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s30">');
        xmlArray.push('   <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"');
        xmlArray.push('    ss:Color="#FF0000"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s31">');
        xmlArray.push('   <Alignment ss:Horizontal="Right" ss:Vertical="Center" ss:WrapText="1"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('   <NumberFormat ss:Format="&quot;\&quot;#,##0;&quot;\&quot;\-#,##0"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s32" ss:Parent="s16">');
        xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"');
        xmlArray.push('    ss:Color="#000000"/>');
        xmlArray.push('   <Interior ss:Color="#C5D9F1" ss:Pattern="Solid"/>');
        xmlArray.push('   <NumberFormat ss:Format="#,##0.00;[Red]\-#,##0.00"/>');
        xmlArray.push('   <Protection ss:Protected="0"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s33">');
        xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"');
        xmlArray.push('    ss:Color="#000000"/>');
        xmlArray.push('   <Interior ss:Color="#C5D9F1" ss:Pattern="Solid"/>');
        xmlArray.push('   <Protection ss:Protected="0"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s34">');
        xmlArray.push('   <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('   <Interior ss:Color="#C5D9F1" ss:Pattern="Solid"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s35">');
        xmlArray.push('   <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('   <Interior ss:Color="#C5D9F1" ss:Pattern="Solid"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s36">');
        xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"');
        xmlArray.push('    ss:Color="#000000"/>');
        xmlArray.push('   <Interior ss:Color="#C5D9F1" ss:Pattern="Solid"/>');
        xmlArray.push('   <Protection ss:Protected="0"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s37">');
        xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"');
        xmlArray.push('    ss:Color="#000000"/>');
        xmlArray.push('   <Interior ss:Color="#C5D9F1" ss:Pattern="Solid"/>');
        xmlArray.push('   <Protection ss:Protected="0"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s38">');
        xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Top" ss:WrapText="1"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Interior ss:Color="#BFBFBF" ss:Pattern="Solid"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s39">');
        xmlArray.push('   <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"');
        xmlArray.push('    ss:Color="#FF0000"/>');
        xmlArray.push('   <Interior ss:Color="#BFBFBF" ss:Pattern="Solid"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s40">');
        xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Top" ss:WrapText="1"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Interior ss:Color="#BFBFBF" ss:Pattern="Solid"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s41">');
        xmlArray.push('   <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"');
        xmlArray.push('    ss:Color="#FF0000"/>');
        xmlArray.push('   <Interior ss:Color="#BFBFBF" ss:Pattern="Solid"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s42">');
        xmlArray.push('   <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"');
        xmlArray.push('    ss:Color="#FF0000"/>');
        xmlArray.push('   <Interior ss:Color="#BFBFBF" ss:Pattern="Solid"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s43">');
        xmlArray.push('   <Alignment ss:Vertical="Top"/>');
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('   <NumberFormat ss:Format="Long Date"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s44">');
        xmlArray.push('   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>');
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s45">');
        xmlArray.push('   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>');
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s46">');
        xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Interior ss:Color="#C0C0C0" ss:Pattern="Solid"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s47">');
        xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('   <Interior ss:Color="#C0C0C0" ss:Pattern="Solid"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s48">');
        xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('   <Interior ss:Color="#C0C0C0" ss:Pattern="Solid"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s50">');
        xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('   <Interior ss:Color="#BFBFBF" ss:Pattern="Solid"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s51">');
        xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Interior ss:Color="#C0C0C0" ss:Pattern="Solid"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s52">');
        xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Interior ss:Color="#BFBFBF" ss:Pattern="Solid"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s53">');
        xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Interior ss:Color="#BFBFBF" ss:Pattern="Solid"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s54">');
        xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>');
        xmlArray.push('   <Borders>');
        xmlArray.push('    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
        xmlArray.push('   </Borders>');
        xmlArray.push('   <Interior ss:Color="#BFBFBF" ss:Pattern="Solid"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s58">');
        //CH739 20230718 by zzq start
//      xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Top"/>');
        xmlArray.push('   <Alignment ss:Horizontal="Right" ss:Vertical="Top"/>');
        //CH739 20230718 by zzq end
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('   <NumberFormat ss:Format="Long Date"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s60">');
        xmlArray.push('   <Alignment ss:Horizontal="Left" ss:Vertical="Center" ss:ShrinkToFit="1"/>');
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="9"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s74">');
        xmlArray.push('   <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"');
        xmlArray.push('    ss:Color="#FF0000"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('<Style ss:ID="s87">');
        xmlArray.push(' <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        xmlArray.push(' <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"');
        xmlArray.push('  ss:Color="#FF0000"/>');
        xmlArray.push('</Style>');
        xmlArray.push('<Style ss:ID="s88">');
        xmlArray.push(' <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        xmlArray.push('</Style>');
        xmlArray.push('<Style ss:ID="s90">');
        xmlArray.push(' <Alignment ss:Horizontal="Right" ss:Vertical="Top"/>');
        xmlArray.push(' <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('</Style>');
        xmlArray.push('<Style ss:ID="s91">');
        xmlArray.push(' <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        xmlArray.push(' <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"');
        xmlArray.push('  ss:Color="#3366FF"/>');
        xmlArray.push('</Style>');
        xmlArray.push('<Style ss:ID="s93">');
        xmlArray.push(' <Alignment ss:Horizontal="Right" ss:Vertical="Top"/>');
        xmlArray.push('</Style>');
        xmlArray.push('  <Style ss:ID="s102">');
        xmlArray.push('   <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s103">');
        xmlArray.push('   <Alignment ss:Horizontal="Right" ss:Vertical="Top"/>');
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s104">');
        xmlArray.push('   <Alignment ss:Horizontal="Left" ss:Vertical="Top"/>');
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"');
        xmlArray.push('    ss:Color="#3366FF"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s105">');
        xmlArray.push('   <Alignment ss:Horizontal="Right" ss:Vertical="Top"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s106">');
        xmlArray.push('   <Alignment ss:Horizontal="Center" ss:Vertical="Top"/>');
        xmlArray.push('   <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('   <NumberFormat ss:Format="[JPN][$-411]gggy&quot;�N&quot;m&quot;��&quot;d&quot;��&quot;"/>');
        xmlArray.push('  </Style>');
        xmlArray.push('  <Style ss:ID="s117">');
        //CH739 20230718 by zzq start
//      xmlArray.push('  <Alignment ss:Horizontal="Center" ss:Vertical="Top"/>');
        xmlArray.push('  <Alignment ss:Horizontal="Right" ss:Vertical="Top"/>');
        //CH739 20230718 by zzq end
        xmlArray.push('  <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"/>');
        xmlArray.push('  </Style>');

      // add by ycx 1110 
      xmlArray.push('  <Style ss:ID="s119" ss:Name="�n�C�p�[�����N">');
      xmlArray.push('  <Font ss:FontName="�l�r �o�S�V�b�N" x:CharSet="128" x:Family="Modern" ss:Size="11"');
      xmlArray.push('  ss:Color="#0563C1" ss:Underline="Single"/>');
      xmlArray.push('  </Style>');
      
      xmlArray.push('  <Style ss:ID="s120" ss:Parent="s119">');
      xmlArray.push('  <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>');
      xmlArray.push('  <Borders>');
      xmlArray.push('  <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>');
      xmlArray.push('  <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>');
      xmlArray.push('  <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>');
      xmlArray.push('  <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>');
      xmlArray.push('  </Borders>');
      xmlArray.push('  </Style>');
      // add end
        
        xmlArray.push(' </Styles>');
        var row = 12 + dataList.length + 11;
        xmlArray.push(' <Worksheet ss:Name="��{�{���i��ċL���ǉ��{�ǉ���]����(NBKK) RE">');
        xmlArray.push('  <Names>');
        xmlArray.push('   <NamedRange ss:Name="Print_Area"');
        xmlArray.push('    ss:RefersTo="=' + "'��{�{���i��ċL���ǉ��{�ǉ���]����(NBKK) RE'" + '!C1:C10"/>');
        xmlArray.push('   <NamedRange ss:Name="Print_Titles"');
        xmlArray.push('    ss:RefersTo="=' + "'��{�{���i��ċL���ǉ��{�ǉ���]����(NBKK) RE'" + '!R1:R12"/>');
        xmlArray.push('  </Names>');
//        xmlArray.push('  <Table ss:ExpandedColumnCount="41" ss:ExpandedRowCount="' + row + '" x:FullColumns="1"');
        xmlArray.push('  <Table x:FullColumns="1"');
        xmlArray.push('   x:FullRows="1" ss:StyleID="s18" ss:DefaultColumnWidth="54"');
        xmlArray.push('   ss:DefaultRowHeight="13.5">');
        xmlArray.push('   <Column ss:Index="2" ss:StyleID="s18" ss:AutoFitWidth="0" ss:Width="105"/>');
        xmlArray.push('   <Column ss:StyleID="s18" ss:AutoFitWidth="0" ss:Width="106.5"/>');
        xmlArray.push('   <Column ss:StyleID="s18" ss:AutoFitWidth="0" ss:Width="222"/>');
        xmlArray.push('   <Column ss:StyleID="s18" ss:AutoFitWidth="0" ss:Width="60"/>');
        xmlArray.push('   <Column ss:StyleID="s18" ss:AutoFitWidth="0" ss:Width="62.25"/>');
        xmlArray.push('   <Column ss:StyleID="s18" ss:AutoFitWidth="0" ss:Width="51.75"/>');
        xmlArray.push('   <Column ss:Index="9" ss:StyleID="s18" ss:AutoFitWidth="0" ss:Width="53.25"/>');
        xmlArray.push('   <Column ss:StyleID="s18" ss:AutoFitWidth="0" ss:Width="84.75" ss:Span="1"/>');
        xmlArray.push('   <Column ss:Index="12" ss:StyleID="s18" ss:AutoFitWidth="0" ss:Width="63"/>');
        xmlArray.push('   <Column ss:StyleID="s18" ss:AutoFitWidth="0" ss:Width="62.25" ss:Span="3"/>');
        xmlArray.push('   <Column ss:Index="17" ss:StyleID="s18" ss:AutoFitWidth="0" ss:Width="61.5"/>');
        xmlArray.push('   <Column ss:StyleID="s18" ss:AutoFitWidth="0" ss:Width="105"/>');
        xmlArray.push('   <Column ss:Index="20" ss:StyleID="s18" ss:AutoFitWidth="0" ss:Width="71.25"');
        xmlArray.push('    ss:Span="3"/>');
        xmlArray.push('   <Column ss:Index="24" ss:StyleID="s18" ss:AutoFitWidth="0" ss:Width="67.5"/>');
        xmlArray.push('   <Column ss:Index="26" ss:StyleID="s18" ss:Width="77.25" ss:Span="14"/>');
        xmlArray.push('   <Column ss:Index="41" ss:StyleID="s18" ss:AutoFitWidth="0" ss:Width="78.75"/>');
        xmlArray.push('   <Row>');
        //CH739 20230719 by zzq start
//      xmlArray.push('    <Cell ss:Index="8" ss:MergeAcross="1" ss:StyleID="s58"><Data ss:Type="DateTime">' + createdDateTime + '</Data><NamedCell');
        xmlArray.push('    <Cell ss:Index="9" ss:MergeAcross="1" ss:StyleID="s58"><Data ss:Type="DateTime">' + createdDateTime + '</Data><NamedCell');
        //CH739 20230719 by zzq end
        xmlArray.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s43"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="18" ss:StyleID="s19"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('   </Row>');

        xmlArray.push('   <Row>');
        //modify by lj  start CH374
        //CH739 20230719 by zzq start
//      xmlArray.push('    <Cell ss:Index="8" ss:MergeAcross="1" ss:StyleID="s117"><Data ss:Type="String">���Ϗ��ԍ��F' + conditionsObj.transactionnumber + '</Data><NamedCell');
        xmlArray.push('    <Cell ss:Index="9" ss:MergeAcross="1" ss:StyleID="s117"><Data ss:Type="String">���Ϗ��ԍ��F' + conditionsObj.transactionnumber + '</Data><NamedCell');
        //CH739 20230719 by zzq end
        //modify by lj  end CH374
        xmlArray.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="18" ss:StyleID="s106"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('   </Row>');

        xmlArray.push('   <Row ss:Height="24">');
        //CH739 20230719 by zzq start
//      xmlArray.push('    <Cell ss:MergeAcross="8" ss:StyleID="s20"><PhoneticText');
        xmlArray.push('    <Cell ss:MergeAcross="9" ss:StyleID="s20"><PhoneticText');
        //CH739 20230719 by zzq end
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�I�~�c�����V��</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">�䌩�Ϗ�</Data><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s43"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="18" ss:StyleID="s20"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('   </Row>');
        xmlArray.push('   <Row>');
        xmlArray.push('    <Cell ss:Index="10" ss:StyleID="s43"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="18" ss:StyleID="s21"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('   </Row>');
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

        
        xmlArray.push('   <Row ss:Height="18.75">');
        xmlArray.push('    <Cell ss:StyleID="s22"><Data ss:Type="String">' + entityText + '</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s22"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="10" ss:StyleID="s43"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="18" ss:StyleID="s23"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('   </Row>');
        xmlArray.push('   <Row ss:Height="18.75">');
        xmlArray.push('    <Cell ss:StyleID="s22"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s22"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="7" ss:StyleID="s44"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�j�`�t�c�{�E�G�L�J�u�V�L�J�C�V��</PhoneticText><Data');
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
        xmlArray.push('    <Cell ss:StyleID="s45"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="10" ss:StyleID="s43"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="18" ss:StyleID="s23"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('   </Row>');
        xmlArray.push('   <Row>');
        xmlArray.push('    <Cell ss:Index="7" ss:StyleID="s24"><Data ss:Type="String">��' + subsidiary.zip + '</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="10" ss:StyleID="s43"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="18" ss:StyleID="s23"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('   </Row>');
        xmlArray.push('   <Row>');
        xmlArray.push('    <Cell ss:Index="4" ss:StyleID="s45"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="7" ss:StyleID="s24"><Data ss:Type="String">'+subAddr+'</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="10" ss:StyleID="s43"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="18" ss:StyleID="s23"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('   </Row>');
        xmlArray.push('   <Row>');
        xmlArray.push('    <Cell ss:Index="7" ss:StyleID="s24"><Data ss:Type="String">TEL�F' + subsidiary.phone + '</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="10" ss:StyleID="s43"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('   </Row>');
        xmlArray.push('   <Row>');
        xmlArray.push('    <Cell ss:Index="7" ss:StyleID="s24"><Data ss:Type="String">FAX�F' + subsidiary.fax + '</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="10" ss:StyleID="s43"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="27" ss:StyleID="s30"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:Index="31" ss:StyleID="s30"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:Index="35" ss:StyleID="s30"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('   </Row>');
        xmlArray.push('   <Row>');
        xmlArray.push('    <Cell ss:Index="6" ss:StyleID="s24"><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:MergeAcross="2" ss:StyleID="s60"><Data ss:Type="String">�S���F' + resultDic.name + '</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:Index="27" ss:StyleID="s30"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:Index="31" ss:StyleID="s30"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:Index="35" ss:StyleID="s30"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('   </Row>');
        xmlArray.push('   <Row>');
        xmlArray.push('    <Cell ss:Index="11" ss:StyleID="s34"><Data ss:Type="String">��ԉ��i���ς�</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s35"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s35"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s36"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s36"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s36"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s36"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s37"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s34"><Data ss:Type="String">�������i���ς�</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s35"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s36"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s36"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s36"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s36"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s37"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s30"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s38"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�V���E�q��</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">���i�T�C�Y</Data><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s39"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s39"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s39"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s38"><Data ss:Type="String">�{�[���T�C�Y</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s39"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s39"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s39"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s40"><Data ss:Type="String">�P�[�X�T�C�Y</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s41"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s41"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s42"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s30"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s30"><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('   </Row>');
        xmlArray.push('   <Row ss:AutoFitHeight="0" ss:Height="38.25">');
        xmlArray.push('    <Cell ss:StyleID="s47"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�V���E�q��</PhoneticText><Data');
//        xmlArray.push('      ss:Type="String">���i&#10;�R�[�h</Data><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('      ss:Type="String">�J�^���O&#10;�R�[�h</Data><NamedCell ss:Name="Print_Titles"/></Cell>');//CH162
        xmlArray.push('    <Cell ss:StyleID="s48"><Data ss:Type="String">JAN�R�[�h</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s46"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�i</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">�u�����h��</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s48"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�V���E�q�����C</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">���i��</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s48"><Data ss:Type="String">�K�i</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s48"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�C�X�E</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">����</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s46"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�V���E�~�L�J���Z�C�]�E�S</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">�ܖ�����&#10;�i������j</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s50"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�[�C���c</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">�ŗ�</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s46"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�V�L�J�J�N�[�C�k</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">�d�؉��i(�Ŕ�)</Data><NamedCell ss:Name="Print_Titles"/><NamedCell');
        xmlArray.push('      ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s46"><Data ss:Type="String">��]�������i</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Titles"/><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s32"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�c�E�W���E�N���C</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">�ʏ탊�x�[�g&#10;�i�q�����x�[�g�j</Data><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s32"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�e�C�o���W���E�P���n���o�C�W�S</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">��ԏ���&#10;�i�̔�����j</Data><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s32"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�J�J�N</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">������&#10;�l�b�g���i</Data><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s32"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�e�C�A���Q���J</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">�����X����&#10;��Č���</Data><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s33"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�e�C�A���o�C�J�[�C�k</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">�����X����&#10;��Ĕ���(�Ŕ��j</Data><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s33"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�e�C�A���o�C�J�[�C�R</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">�����X����&#10;��Ĕ����i�ō��j</Data><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s33"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�l�C�����c</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">�����X����&#10;�l����</Data><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s33"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�l�C�����c</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">������&#10;�l����</Data><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s32"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�g�N�o�C�W���E�P���e�C�o���c�C�J�u��</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">��������&#10;�i��Ԃ����&#10;�ǉ����j</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s32"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�g�N�o�C�J�J�N</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">������&#10;����&#10;�l�b�g���i</Data><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s32"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�e�C�A���Q���J</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">�����X����&#10;��Č���</Data><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s33"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�e�C�A���o�C�J�[�C�k</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">�����X����&#10;��Ĕ���(�Ŕ��j</Data><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s33"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�e�C�A���o�C�J�[�C�R</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">�����X����&#10;��Ĕ����i�ō��j</Data><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s33"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�l�C�����c</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">�����X����&#10;�l����</Data><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s33"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�l�C�����c</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">������&#10;�l����</Data><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s53"><Data ss:Type="String">ITF�R�[�h</Data><NamedCell');
        xmlArray.push('      ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s52"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�n�o</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">���imm�j</Data><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s52"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�I�N���L</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">���s�imm�j</Data><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s52"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�^�J</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">�����imm�j</Data><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s52"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�W���E�����E</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">�d�ʁig�j</Data><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s52"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�n�o</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">���imm�j</Data><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s52"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�I�N���L</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">���s�imm�j</Data><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s52"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�^�J</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">�����imm�j</Data><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s52"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�W���E�����E</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">�d�ʁig�j</Data><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s53"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�n�o</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">���imm�j</Data><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s53"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�I�N���L</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">���s�imm�j</Data><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s53"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�^�J</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">�����imm�j</Data><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s53"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�W���E�����E</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">�d�ʁig�j</Data><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s54"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�V���E�q���Z�c���C</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">���i����</Data><NamedCell ss:Name="Print_Titles"/></Cell>');
        xmlArray.push('    <Cell ss:StyleID="s53"><PhoneticText');
        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�V���E�q���K�]�E</PhoneticText><Data');
        xmlArray.push('      ss:Type="String">���i�摜</Data><NamedCell ss:Name="Print_Titles"/></Cell>');
        // add by song  start CH162
//        xmlArray.push('    <Cell ss:StyleID="s53"><PhoneticText');
//        xmlArray.push('      xmlns="urn:schemas-microsoft-com:office:excel">�W���E�����E</PhoneticText><Data');
//        xmlArray.push('      ss:Type="String">DJ_���i�\����</Data><NamedCell ss:Name="Print_Titles"/></Cell>');
     // add by song  end CH162
        xmlArray.push('   </Row>');
        // ����
        for (var i = 0; i < dataList.length; i++) {

            var tempData = dataList[i];
            log.error('tempData', tempData);
            xmlArray.push('   <Row ss:AutoFitHeight="0" ss:Height="26.8125">');
            xmlArray.push('    <Cell ss:StyleID="s25"><Data ss:Type="String">' + tempData.item + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s26"><Data ss:Type="String">' + tempData.jancode + '</Data><NamedCell');
            xmlArray.push('      ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s25"><Data ss:Type="String">' + tempData.brand + '</Data><NamedCell');
            xmlArray.push('      ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s25"><Data ss:Type="String">' + tempData.productName + '</Data><NamedCell');
            xmlArray.push('      ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s27"><Data ss:Type="String">' + tempData.abbreviationName + '</Data><NamedCell');
            xmlArray.push('      ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s27"><Data ss:Type="Number">' + tempData.perunitquantity + '</Data><NamedCell');
            xmlArray.push('      ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s26"><Data ss:Type="String">' + tempData.tastePeriod + '</Data><NamedCell');
            xmlArray.push('      ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s26"><Data ss:Type="String">' + tempData.taxRate + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s28"><Data ss:Type="Number">' + tempData.shiPrice + '</Data><NamedCell');
            xmlArray.push('      ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s28"><Data ss:Type="Number">' + tempData.retailRrice + '</Data><NamedCell');
            xmlArray.push('      ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s29"/>');
            xmlArray.push('    <Cell ss:StyleID="s29"/>');
            xmlArray.push('    <Cell ss:StyleID="s29"/>');
            xmlArray.push('    <Cell ss:StyleID="s29"/>');
            xmlArray.push('    <Cell ss:StyleID="s29"/>');
            xmlArray.push('    <Cell ss:StyleID="s29"/>');
            xmlArray.push('    <Cell ss:StyleID="s29"/>');
            xmlArray.push('    <Cell ss:StyleID="s29"/>');
            xmlArray.push('    <Cell ss:StyleID="s29"/>');
            xmlArray.push('    <Cell ss:StyleID="s29"/>');
            xmlArray.push('    <Cell ss:StyleID="s29"/>');
            xmlArray.push('    <Cell ss:StyleID="s29"/>');
            xmlArray.push('    <Cell ss:StyleID="s29"/>');
            xmlArray.push('    <Cell ss:StyleID="s29"/>');
            xmlArray.push('    <Cell ss:StyleID="s29"/>');
            xmlArray.push('    <Cell ss:StyleID="s29"><Data ss:Type="String">' + tempData.itfCode + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s29"><Data ss:Type="String">' + tempData.itemWidth + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s29"><Data ss:Type="String">' + tempData.itemDepth + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s29"><Data ss:Type="String">' + tempData.itemHeight + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s29"><Data ss:Type="String">' + tempData.itemWeight + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s29"><Data ss:Type="String">' + tempData.ballWidth + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s29"><Data ss:Type="String">' + tempData.ballDepth + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s29"><Data ss:Type="String">' + tempData.ballHeight + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s29"><Data ss:Type="String">' + tempData.ballWeight + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s29"><Data ss:Type="String">' + tempData.caseWidth + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s29"><Data ss:Type="String">' + tempData.caseDepth + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s29"><Data ss:Type="String">' + tempData.caseHeight + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s29"><Data ss:Type="String">' + tempData.caseWeight + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
            xmlArray.push('    <Cell ss:StyleID="s29"><Data ss:Type="String">' + tempData.memo + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
            //xmlArray.push('    <Cell ss:StyleID="s29"><Data ss:Type="String">' + tempData.image + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
            //20230607 changed by zhou start CH639
            if(tempData.image != null){
            	 xmlArray.push('    <Cell ss:StyleID="s120" ss:HRef="' + tempData.image + '"><Data ss:Type="String">�N���b�N���ĉ摜��\��</Data></Cell>');
            }else{
            	 xmlArray.push('    <Cell ss:StyleID="s120" ss:HRef=""><Data ss:Type="String"></Data></Cell>');
            }
            //20230607 changed by zhou end
         // add by song  start CH162
//            xmlArray.push('    <Cell ss:StyleID="s29"><Data ss:Type="String">' + tempData.productName + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
         // add by song  end CH162
            xmlArray.push('   </Row>');
        }
        
        // CH162 zheng 20230213 start
        var forCnt = 0;
        if (dataList.length <= 12) {
            forCnt = getPrintPage1(dataList.length);
        } else {
            forCnt = getPrintPage2(dataList.length, 12);
        }
        for (var i = 0; i < forCnt; i++) {
            xmlArray.push('      <Row>');
            xmlArray.push('       <Cell ss:Index="13" ss:StyleID="s74"/>');
            xmlArray.push('       <Cell ss:StyleID="s74"/>');
            xmlArray.push('       <Cell ss:StyleID="s74"/>');
            xmlArray.push('       <Cell ss:StyleID="s74"/>');
            xmlArray.push('       <Cell ss:StyleID="s74"/>');
            xmlArray.push('      </Row>');
        }
//        xmlArray.push('      <Row>');
//        xmlArray.push('       <Cell ss:Index="13" ss:StyleID="s74"/>');
//        xmlArray.push('       <Cell ss:StyleID="s74"/>');
//        xmlArray.push('       <Cell ss:StyleID="s74"/>');
//        xmlArray.push('       <Cell ss:StyleID="s74"/>');
//        xmlArray.push('       <Cell ss:StyleID="s74"/>');
//        xmlArray.push('      </Row>');
//        xmlArray.push('      <Row>');
//        xmlArray.push('       <Cell ss:Index="10" ss:StyleID="s74"><NamedCell ss:Name="Print_Area"/></Cell>');
//        xmlArray.push('       <Cell ss:StyleID="s74"/>');
//        xmlArray.push('      </Row>');
//        xmlArray.push('      <Row>');
//        xmlArray.push('       <Cell ss:Index="12" ss:StyleID="s102"/>');
//        xmlArray.push('       <Cell ss:Index="17" ss:StyleID="s102"/>');
//        xmlArray.push('      </Row>');
//        xmlArray.push('      <Row>');
//        xmlArray.push('       <Cell ss:Index="10" ss:StyleID="s74"><NamedCell ss:Name="Print_Area"/></Cell>');
//        xmlArray.push('       <Cell ss:StyleID="s74"/>');
//        xmlArray.push('       <Cell ss:StyleID="s74"/>');
//        xmlArray.push('       <Cell ss:Index="17" ss:StyleID="s74"/>');
//        xmlArray.push('      </Row>');
        // CH162 zheng 20230213 end
        var showCon = '';
        var showText1 = '';
        var showText2 = '';
        var poConditonsList = conditionsObj.custbody_djkk_estimate_po_conditons;
        if (poConditonsList.length > 0) {
            var tmpValue = poConditonsList[0].value;
            if (tmpValue == '1') {
                showCon = 'A)�@1��̍Œᔭ������(�z�����b�g)';
                showText1 = '����';
                var conditonAList = conditionsObj.custbody_djkk_estimate_po_conditon_a;
                if (conditonAList.length > 0) {
                    showText2 = conditonAList[0].text;
                }
            }
            if (tmpValue == '2') {
                showCon = 'B)�@�z����';
                var conditonB2List = conditionsObj.custbody_djkk_estimate_po_conditon_b2;
                if (conditonB2List.length > 0) {
                    showText1 = conditonB2List[0].text;
                }
                var conditonB1List = conditionsObj.custbody_djkk_estimate_po_conditon_b1;
                if (conditonB1List.length > 0) {
                    showText2 = conditonB1List[0].text;
                }
            }
            if (tmpValue == '3') {
                showCon = 'C)�@�[�i�ꏊ';
                var conditonCList = conditionsObj.custbody_djkk_estimate_po_conditon_c;
                if (conditonCList.length > 0) {
                    showText1 = conditonCList[0].text;
                }
                showText2 = '';
            }
            if (tmpValue == '4') {
                showCon = 'D)�@�P�[�X�P��';
                showText1 = '';
                showText2 = '';
            }
            if (tmpValue == '5') {
                showCon = 'E)�@FAX�ɂĒ����i���ʂ̂ݎ󂯕t���܂��j';
                var conditonDList = conditionsObj.custbody_djkk_estimate_po_conditon_d;
                if (conditonDList.length > 0) {
                    showText1 = conditonDList[0].text;
                }
                showText2 = '';
            }
        }
        xmlArray.push('      <Row>');
        xmlArray.push('       <Cell ss:Index="2" ss:StyleID="s103"><Data ss:Type="String" x:Ticked="1">�P�D</Data><NamedCell');
        xmlArray.push('         ss:Name="Print_Area"/></Cell>');
        xmlArray.push('       <Cell ss:StyleID="s102"><PhoneticText');
        xmlArray.push('         xmlns="urn:schemas-microsoft-com:office:excel">�n�b�`���E�W���E�P��</PhoneticText><Data');
        xmlArray.push('         ss:Type="String">��������</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('       <Cell ss:Index="10" ss:StyleID="s74"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('       <Cell ss:StyleID="s74"/>');
        xmlArray.push('       <Cell ss:StyleID="s74"/>');
        xmlArray.push('       <Cell ss:Index="17" ss:StyleID="s74"/>');
        xmlArray.push('      </Row>');
        
        
//        xmlArray.push('      <Row>');
//        xmlArray.push('       <Cell ss:Index="3" ss:StyleID="s102"><PhoneticText');
//        xmlArray.push('         xmlns="urn:schemas-microsoft-com:office:excel">�n�C�\�E�����E</PhoneticText><Data');
//        xmlArray.push('         ss:Type="String">' + showCon + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
//        xmlArray.push('       <Cell ss:Index="5" ss:StyleID="s102"><Data ss:Type="String">' + showText1 + '</Data><NamedCell');
//        xmlArray.push('         ss:Name="Print_Area"/></Cell>');
//        xmlArray.push('       <Cell ss:Index="7" ss:StyleID="s102"><PhoneticText');
//        xmlArray.push('         xmlns="urn:schemas-microsoft-com:office:excel">�G���[�C�k</PhoneticText><Data');
//        xmlArray.push('         ss:Type="String">' + showText2 + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
//        xmlArray.push('       <Cell ss:Index="12" ss:StyleID="s74"/>');
//        xmlArray.push('       <Cell ss:StyleID="s74"/>');
//        xmlArray.push('       <Cell ss:StyleID="s74"/>');
//        xmlArray.push('       <Cell ss:StyleID="s74"/>');
//        xmlArray.push('       <Cell ss:StyleID="s74"/>');
//        xmlArray.push('       <Cell ss:StyleID="s74"/>');
//        xmlArray.push('       <Cell ss:StyleID="s74"/>');
//        xmlArray.push('      </Row>');
        
        var showObj = {};

        showObj['showCon_a'] = 'A)�@1��̍Œᔭ������(�z�����b�g)';
    	showObj['showText1_a'] = '����';
        var conditonAList = conditionsObj.custbody_djkk_estimate_po_conditon_a;
        showObj['showText2_a'] = conditonAList.length > 0 ? conditonAList[0].text : '';

//        showObj['showCon_b'] = 'b)�@�z����';
//        var conditonB2List = conditionsObj.custbody_djkk_estimate_po_conditon_b2;
//        showObj['showText1_b'] = conditonB2List.length > 0 ? conditonB2List[0].text : '';
//        var conditonB1List = conditionsObj.custbody_djkk_estimate_po_conditon_b1;
//        showObj['showText2_b'] = conditonB1List.length > 0 ? conditonB1List[0].text : '';
        
        showObj['showCon_b'] = 'B)�@�z����';
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
        xmlArray.push('   xmlns="urn:schemas-microsoft-com:office:excel">�n�C�\�E�����E</PhoneticText><Data');
        xmlArray.push('   ss:Type="String">' + showObj.showCon_a + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="5" ss:StyleID="s88"><Data ss:Type="String">' + showObj.showText1_a + '</Data><NamedCell');
        xmlArray.push('   ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="7" ss:StyleID="s88"><PhoneticText');
        xmlArray.push('   xmlns="urn:schemas-microsoft-com:office:excel">�G���[�C�k</PhoneticText><Data');
        xmlArray.push('   ss:Type="String">' + showObj.showText2_a + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="12" ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('</Row>');
        
        xmlArray.push('<Row ss:AutoFitHeight="0">');
        xmlArray.push('</Row>');
        
        xmlArray.push('<Row ss:AutoFitHeight="0">');
        xmlArray.push(' <Cell ss:Index="3" ss:StyleID="s88"><PhoneticText');
        xmlArray.push('   xmlns="urn:schemas-microsoft-com:office:excel">�n�C�\�E�����E</PhoneticText><Data');
        xmlArray.push('   ss:Type="String">' + showObj.showCon_b + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="5" ss:StyleID="s88"><Data ss:Type="String">' + showObj.showText1_b + '</Data><NamedCell');
        xmlArray.push('   ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="7" ss:StyleID="s88"><PhoneticText');
        xmlArray.push('   xmlns="urn:schemas-microsoft-com:office:excel">�G���[�C�k</PhoneticText><Data');
        xmlArray.push('   ss:Type="String">' + showObj.showText2_b + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="12" ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('</Row>');
        
        xmlArray.push('<Row ss:AutoFitHeight="0">');
        xmlArray.push(' <Cell ss:Index="3" ss:StyleID="s88"><PhoneticText');
        xmlArray.push('   xmlns="urn:schemas-microsoft-com:office:excel">�n�C�\�E�����E</PhoneticText><Data');
        xmlArray.push('   ss:Type="String">�i���b�g�����̏ꍇ�z�����𒸑Ղ������܂��B�j</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        //add by song  start CH250
        xmlArray.push('<Cell ss:Index="7" ss:StyleID="s88"><PhoneticText');
        xmlArray.push('  xmlns="urn:schemas-microsoft-com:office:excel">�G���[�C�k</PhoneticText><Data');
        xmlArray.push('  ss:Type="String">' + showObj.showText3_b + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
      //add by song  end CH250
        xmlArray.push('</Row>');
        
        xmlArray.push('<Row ss:AutoFitHeight="0">');
        xmlArray.push('</Row>');
        
        xmlArray.push('<Row ss:AutoFitHeight="0">');
        xmlArray.push(' <Cell ss:Index="3" ss:StyleID="s88"><PhoneticText');
        xmlArray.push('   xmlns="urn:schemas-microsoft-com:office:excel">�n�C�\�E�����E</PhoneticText><Data');
        xmlArray.push('   ss:Type="String">' + showObj.showCon_c + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="5" ss:StyleID="s104"><Data ss:Type="String">' + showObj.showText1_c + '</Data><NamedCell');
        xmlArray.push('   ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="7" ss:StyleID="s88"><PhoneticText');
        xmlArray.push('   xmlns="urn:schemas-microsoft-com:office:excel">�G���[�C�k</PhoneticText><Data');
        xmlArray.push('   ss:Type="String">' + showObj.showText2_c + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="12" ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('</Row>');
        
        xmlArray.push('<Row ss:AutoFitHeight="0">');
        xmlArray.push(' <Cell ss:Index="3" ss:StyleID="s88"><PhoneticText');
        xmlArray.push('   xmlns="urn:schemas-microsoft-com:office:excel">�n�C�\�E�����E</PhoneticText><Data');
        xmlArray.push('   ss:Type="String">' + showObj.showCon_d + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="5" ss:StyleID="s88"><Data ss:Type="String">' + showObj.showText1_d + '</Data><NamedCell');
        xmlArray.push('   ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="7" ss:StyleID="s88"><PhoneticText');
        xmlArray.push('   xmlns="urn:schemas-microsoft-com:office:excel">�G���[�C�k</PhoneticText><Data');
        xmlArray.push('   ss:Type="String">' + showObj.showText2_d + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="12" ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('</Row>');
        
        xmlArray.push('<Row ss:AutoFitHeight="0">');
        xmlArray.push(' <Cell ss:Index="3" ss:StyleID="s88"><PhoneticText');
        xmlArray.push('   xmlns="urn:schemas-microsoft-com:office:excel">�n�C�\�E�����E</PhoneticText><Data');
        xmlArray.push('   ss:Type="String">' + showObj.showCon_e + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="5" ss:StyleID="s88"><Data ss:Type="String">' + showObj.showText1_e + '</Data><NamedCell');
        xmlArray.push('   ss:Name="Print_Area"/></Cell>');
//        xmlArray.push(' <Cell ss:Index="7" ss:StyleID="s88"><PhoneticText');
//        xmlArray.push('   xmlns="urn:schemas-microsoft-com:office:excel">�G���[�C�k</PhoneticText><Data');
//        xmlArray.push('   ss:Type="String">' + showObj.showText2_e + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
//        xmlArray.push(' <Cell ss:Index="12" ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
//        xmlArray.push(' <Cell ss:StyleID="s87"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('</Row>');
        
        //add by song  start CH250
        xmlArray.push('   <Row>');
        xmlArray.push('<Cell ss:Index="3" ss:StyleID="s88"><PhoneticText');
        xmlArray.push('  xmlns="urn:schemas-microsoft-com:office:excel">�n�C�\�E�����E</PhoneticText><Data');
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
        xmlArray.push('      <Row>');
        xmlArray.push('       <Cell ss:Index="2" ss:StyleID="s103"><Data ss:Type="String" x:Ticked="1">�Q�D</Data><NamedCell');
        xmlArray.push('         ss:Name="Print_Area"/></Cell>');
        xmlArray.push('       <Cell ss:StyleID="s102"><PhoneticText');
        xmlArray.push('         xmlns="urn:schemas-microsoft-com:office:excel">�m�E�q���C���q</PhoneticText><Data');
        xmlArray.push('         ss:Type="String">�[�i��</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('       <Cell ss:Index="5" ss:StyleID="s104"><PhoneticText');
        xmlArray.push('         xmlns="urn:schemas-microsoft-com:office:excel">�W���`���E�S�j�`�S�m�E�q��</PhoneticText><Data');
        xmlArray.push('         ss:Type="String">' + nouhinDateText + '</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('       <Cell ss:StyleID="s104"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('       <Cell ss:StyleID="s104"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('       <Cell ss:StyleID="s104"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('       <Cell ss:Index="10" ss:StyleID="s74"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('       <Cell ss:StyleID="s74"/>');
        xmlArray.push('       <Cell ss:StyleID="s74"/>');
        xmlArray.push('       <Cell ss:StyleID="s74"/>');
        xmlArray.push('       <Cell ss:StyleID="s74"/>');
        xmlArray.push('       <Cell ss:StyleID="s74"/>');
        xmlArray.push('       <Cell ss:StyleID="s74"/>');
        xmlArray.push('       <Cell ss:StyleID="s74"/>');
        xmlArray.push('       <Cell ss:StyleID="s74"/>');
        xmlArray.push('      </Row>');
        
        xmlArray.push('<Row ss:AutoFitHeight="0">');
        xmlArray.push('</Row>');
        
        var payConditonsText = '';
        var payConditonsList = conditionsObj.custbody_djkk_estimate_pay_conditons;
        if (payConditonsList.length > 0) {
            payConditonsText = payConditonsList[0].text;
        }
        xmlArray.push('      <Row>');
        xmlArray.push('       <Cell ss:Index="2" ss:StyleID="s105"><Data ss:Type="String" x:Ticked="1">�R�D</Data><NamedCell');
        xmlArray.push('         ss:Name="Print_Area"/></Cell>');
        xmlArray.push('       <Cell><PhoneticText xmlns="urn:schemas-microsoft-com:office:excel">�V�n���C�W���E�P��</PhoneticText><Data');
        xmlArray.push('         ss:Type="String">�x������</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('       <Cell ss:Index="5" ss:StyleID="s104"><Data ss:Type="String">' + payConditonsText + '</Data><NamedCell');
        xmlArray.push('         ss:Name="Print_Area"/></Cell>');
//        xmlArray.push('       <Cell ss:StyleID="s104"><Data ss:Type="String"> </Data><NamedCell');
//        xmlArray.push('         ss:Name="Print_Area"/></Cell>');
//        xmlArray.push('       <Cell ss:Index="10" ss:StyleID="s74"><NamedCell ss:Name="Print_Area"/></Cell>');
//        xmlArray.push('       <Cell ss:StyleID="s74"/>');
//        xmlArray.push('       <Cell ss:StyleID="s74"/>');
//        xmlArray.push('       <Cell ss:StyleID="s74"/>');
//        xmlArray.push('       <Cell ss:StyleID="s74"/>');
//        xmlArray.push('       <Cell ss:StyleID="s74"/>');
//        xmlArray.push('       <Cell ss:StyleID="s74"/>');
//        xmlArray.push('       <Cell ss:StyleID="s74"/>');
//        xmlArray.push('       <Cell ss:StyleID="s74"/>');
        xmlArray.push('      </Row>');
        
        xmlArray.push('<Row ss:AutoFitHeight="0">');
        xmlArray.push(' <Cell ss:Index="2" ss:StyleID="s93"><Data ss:Type="String" x:Ticked="1"></Data><NamedCell');
        xmlArray.push('   ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell><PhoneticText xmlns="urn:schemas-microsoft-com:office:excel">�V�n���C�W���E�P��</PhoneticText><Data');
        xmlArray.push('   ss:Type="String"></Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push(' <Cell ss:Index="5" ss:StyleID="s88"><Data ss:Type="String">��s���@�F�@�O�HUFJ��s�@�R�ʎx�X�@����0568447</Data><NamedCell');
        xmlArray.push('   ss:Name="Print_Area"/></Cell>');
//        xmlArray.push(' <Cell ss:Index="7" ss:StyleID="s88"><PhoneticText');
//        xmlArray.push('   xmlns="urn:schemas-microsoft-com:office:excel">�G���[�C�k</PhoneticText><Data');
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
        xmlArray.push('      <Row>');
        xmlArray.push('       <Cell ss:Index="2" ss:StyleID="s105"><Data ss:Type="String" x:Ticked="1">�S�D</Data><NamedCell');
        xmlArray.push('         ss:Name="Print_Area"/></Cell>');
        xmlArray.push('       <Cell><PhoneticText xmlns="urn:schemas-microsoft-com:office:excel">�~�c�������E�R�E�L�Q��</PhoneticText><Data');
        xmlArray.push('         ss:Type="String">���ϗL������</Data><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('       <Cell ss:Index="5" ss:StyleID="s104"><Data ss:Type="String">' + yukouKikanText + '</Data><NamedCell');
        xmlArray.push('         ss:Name="Print_Area"/></Cell>');
        xmlArray.push('       <Cell ss:Index="10" ss:StyleID="s74"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('       <Cell ss:StyleID="s74"/>');
        xmlArray.push('       <Cell ss:StyleID="s74"/>');
        xmlArray.push('       <Cell ss:StyleID="s74"/>');
        xmlArray.push('       <Cell ss:StyleID="s74"/>');
        xmlArray.push('       <Cell ss:StyleID="s74"/>');
        xmlArray.push('       <Cell ss:StyleID="s74"/>');
        xmlArray.push('       <Cell ss:StyleID="s74"/>');
        xmlArray.push('       <Cell ss:StyleID="s74"/>');
        xmlArray.push('      </Row>');
        xmlArray.push('      <Row>');
        xmlArray.push('       <Cell ss:Index="10" ss:StyleID="s74"><NamedCell ss:Name="Print_Area"/></Cell>');
        xmlArray.push('       <Cell ss:StyleID="s74"/>');
        xmlArray.push('       <Cell ss:StyleID="s74"/>');
        xmlArray.push('       <Cell ss:StyleID="s74"/>');
        xmlArray.push('       <Cell ss:StyleID="s74"/>');
        xmlArray.push('       <Cell ss:StyleID="s74"/>');
        xmlArray.push('       <Cell ss:StyleID="s74"/>');
        xmlArray.push('       <Cell ss:StyleID="s74"/>');
        xmlArray.push('       <Cell ss:StyleID="s74"/>');
        xmlArray.push('   </Row>');
        xmlArray.push('  </Table>');
        xmlArray.push('  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">');
        xmlArray.push('   <PageSetup>');
        xmlArray.push('    <Layout x:Orientation="Landscape"/>');//heng
        xmlArray.push('    <Header x:Margin="0.51181102362204722"/>');
        xmlArray.push('    <Footer x:Margin="0.51181102362204722" x:Data="&amp;C&amp;P/&amp;N Page"/>');
        xmlArray.push('    <PageMargins x:Bottom="0.98425196850393704" x:Left="0.42" x:Right="0.26"');
        xmlArray.push('     x:Top="0.98425196850393704"/>');
        xmlArray.push('   </PageSetup>');
        // CH162 zheng 20230213 start
        xmlArray.push('   <Unsynced/>');
        // CH162 zheng 20230213 end
        xmlArray.push('  <FitToPage/>');//quan
        
        xmlArray.push('   <Print>');
        // CH162 zheng 20230213 start
        xmlArray.push('   <FitHeight>0</FitHeight>');
        // CH162 zheng 20230213 end
        xmlArray.push('    <ValidPrinterInfo/>');
        // CH162 zheng 20230213 start
        //xmlArray.push('   <Scale>66</Scale>');//quan
        // CH162 zheng 20230213 end
        xmlArray.push('    <PaperSizeIndex>9</PaperSizeIndex>');
        // CH162 zheng 20230213 start
        xmlArray.push('    <Scale>89</Scale>');
        // CH162 zheng 20230213 end
        xmlArray.push('    <HorizontalResolution>600</HorizontalResolution>');
        xmlArray.push('    <VerticalResolution>600</VerticalResolution>');
        xmlArray.push('   </Print>');
        xmlArray.push('   <TabColorIndex>13</TabColorIndex>');
        // CH162 zheng 20230213 start
        xmlArray.push('   <PageBreakZoom>100</PageBreakZoom>');
        // CH162 zheng 20230213 end
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
        // CH162 zheng 20230213 start
        xmlArray.push('     <ActiveRow>0</ActiveRow>');
        // CH162 zheng 20230213 end
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
     * ��{�{���i��ċL���ǉ��{�ǉ���]����(NBKK) RE�f�[�^���擾����
     */
    function getOutputData(estimateId) {

        var resultList = [];

        var searchType = 'estimate';

        var searchFilters = [["type", "anyof", "Estimate"], "AND", ["mainline", "is", "F"], "AND", ["taxline", "is", "F"], "AND", ["cogs", "is", "F"], "AND", ["shipping", "is", "F"], "AND", ["internalid", "anyof", estimateId]];

        var searchColumns = [search.createColumn({
        	//CH162 ���i�R�[�h���J�^���O�R�[�h�ɂ���
        	//�����@���@�A�C�e���}�X�^�� DJ_���萔(�����)
//			name : "itemid",
//          join : "item",
//          label : "���O"
            name : "custitem_djkk_product_code",
  	        join : "item",
  	        label : "�J�^���O�R�[�h"
        }), search.createColumn({
            name : "upccode",
            join : "item",
            label : "UPC�R�[�h"
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
            name : "custcol_djkk_perunitquantity", //changed by song  add 20230614 start CH638
            label : "DJ_����"
        }), search.createColumn({
            name : "custitem_djkk_shelf_life",
            join : "item",
            label : "DJ_�ܖ���������"
        }), search.createColumn({
            name : "rate",
            join : "taxItem",
            label : "�ŗ�"
        }), search.createColumn({
        	//changed by song  add 20230614 start CH638
            name : "rate",
            label : "�P��/��"
            //changed by song  add 20230614 end CH638
        }), search.createColumn({
            name : "custcol_djkk_suggested_retail_price", //changed by song  add 20230614 start CH638
            label : "DJ_��]�������i"
        }), search.createColumn({
            name : "custcol_djkk_estimate_itf_code",
            label : "DJ_ITF�R�[�h"
        }), search.createColumn({
            name : "custitem_djkk_width_mm",
            join : "item",
            label : "DJ_WIDTH (MM)"
        }), search.createColumn({
            name : "custitem_djkk_length_mm",
            join : "item",
            label : "DJ_LENGTH(MM)"
        }), search.createColumn({
            name : "custitem_djkk_height_mm",
            join : "item",
            label : "DJ_HEIGHT (MM)"
        }), search.createColumn({
            name : "custitem_djkk_gross_weight_kg",
            join : "item",
            label : "DJ_GROSS WEIGHT (KG)"
        }), search.createColumn({
            name : "custitem_djkk_ball_width_mm",
            join : "item",
            label : "DJ_�{�[��_���i?o�j"
        }), search.createColumn({
            name : "custitem_djkk_ball_length_mm",
            join : "item",
            label : "DJ_�{�[��_���s�i?o�j"
        }), search.createColumn({
            name : "custitem_djkk_ball_height_mm",
            join : "item",
            label : "DJ_�{�[��_�����i?o�j"
        }), search.createColumn({
            name : "custitem_djkk_ball_gross_weight_g",
            join : "item",
            label : "DJ_�{�[��_�d�ʁiG�j"
        }), search.createColumn({
            name : "custitem_djkk_out_width_mm",
            join : "item",
            label : "DJ_�O��WIDTH (MM)"
        }), search.createColumn({
            name : "custitem_djkk_out_length_mm",
            join : "item",
            label : "DJ_�O��LENGTH(MM)"
        }), search.createColumn({
            name : "custitem_djkk_out_height_mm",
            join : "item",
            label : "DJ_�O��HEIGHT (MM)"
        }), search.createColumn({
            name : "custitem_djkk_out_gross_weight_kg",
            join : "item",
            label : "DJ_�O��GROSS WEIGHT (KG)"
        }), search.createColumn({
            name : "memo",
            label : "���i����"
        }), search.createColumn({
            name : "custitem_djkk_itemphoto",
            join : "item",
            label : "DJ_���i�摜"
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
                // JAN�R�[�h
                var jancode = searchResult.getValue(searchColumns[1]);
                lineDataDic.jancode = jancode;
                // �u�����h��
                // CH162�@�u�����h�R�[�h���O��
//                var brand = searchResult.getText(searchColumns[2]);
                var brandAll = searchResult.getText(searchColumns[2]);
                var brandLength = brandAll.length; 
                var brand = brandAll.substring(6,brandLength);
                lineDataDic.brand = brand;
                // ���i��
                var itemText = searchResult.getValue(searchColumns[3]);
                lineDataDic.itemText = itemText;
                // �K�i
                var specifications = searchResult.getValue(searchColumns[4]);
                lineDataDic.specifications = specifications;
                // ����
                var perunitquantity = searchResult.getValue(searchColumns[5]);
                lineDataDic.perunitquantity = perunitquantity;
                // �ܖ����ԁi������j
                var tastePeriod = searchResult.getValue(searchColumns[6]);
                lineDataDic.tastePeriod = tastePeriod;
                // �ŗ�
                var taxRate = searchResult.getValue(searchColumns[7]);
                lineDataDic.taxRate = taxRate;
                // �d�؉��i(�Ŕ�)
                var shiPrice = searchResult.getValue(searchColumns[8]);
                lineDataDic.shiPrice = shiPrice;
                // ��]�������i
                var retailRrice = searchResult.getValue(searchColumns[9]);
                lineDataDic.retailRrice = retailRrice;
                // ITF�R�[�h
                var itfCode = searchResult.getValue(searchColumns[10]);
                lineDataDic.itfCode = itfCode;

                // ���i�T�C�Y.���i?�j
                var itemWidth = searchResult.getValue(searchColumns[11]);
                lineDataDic.itemWidth = itemWidth;

                // ���i�T�C�Y.���s�i?�j
                var itemDepth = searchResult.getValue(searchColumns[12]);
                lineDataDic.itemDepth = itemDepth;

                // ���i�T�C�Y.�����i?�j
                var itemHeight = searchResult.getValue(searchColumns[13]);
                lineDataDic.itemHeight = itemHeight;

                // ���i�T�C�Y.�d�ʁig�j
                var itemWeight = searchResult.getValue(searchColumns[14]);
                lineDataDic.itemWeight = itemWeight;

                // �{�[���T�C�Y.���i?�j
                var ballWidth = searchResult.getValue(searchColumns[15]);
                lineDataDic.ballWidth = ballWidth;

                // �{�[���T�C�Y.���s�i?�j
                var ballDepth = searchResult.getValue(searchColumns[16]);
                lineDataDic.ballDepth = ballDepth;

                // �{�[���T�C�Y.�����i?�j
                var ballHeight = searchResult.getValue(searchColumns[17]);
                lineDataDic.ballHeight = ballHeight;

                // �{�[���T�C�Y.�d�ʁig�j
                var ballWeight = searchResult.getValue(searchColumns[18]);
                lineDataDic.ballWeight = ballWeight;

                // �P�[�X�T�C�Y.���i?�j
                var caseWidth = searchResult.getValue(searchColumns[19]);
                lineDataDic.caseWidth = caseWidth;

                // �P�[�X�T�C�Y.���s�i?�j
                var caseDepth = searchResult.getValue(searchColumns[20]);
                lineDataDic.caseDepth = caseDepth;

                // �P�[�X�T�C�Y.�����i?�j
                var caseHeight = searchResult.getValue(searchColumns[21]);
                lineDataDic.caseHeight = caseHeight;

                // �P�[�X�T�C�Y.�d�ʁig�j
                var caseWeight = searchResult.getValue(searchColumns[22]);
                lineDataDic.caseWeight = caseWeight;

                // ���i����
                var memo = searchResult.getValue(searchColumns[23]);
                lineDataDic.memo = memo;

                // ���i�摜
                var image = searchResult.getText(searchColumns[24]);
               //20230607 changed by zhou start CH639
                if(image){
                	lineDataDic.image = 'https://' + cabinet.fileCabinetId('url_header') + '.app.netsuite.com'+image;
                }else{
                	lineDataDic.image = null;
                }
              //20230607 changed by zhou start end

                //DJ_���i�\����
                var productName = searchResult.getValue(searchColumns[25]);
                lineDataDic.productName = productName;
                
              //DJ_�K�i
                var abbreviationName = searchResult.getValue(searchColumns[26]);
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

    return {
        onRequest : onRequest
    };

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
    
    // CH162 zheng 20230213 start
    function getPrintPage1(dlSize) {
        
        var forCount = 0;
        
        forCount = 22 - (dlSize - 1) * 2;
        
        return forCount;
    }
    
    function getPrintPage2(dlSize, page1) {
        
        var forCount = 0;
        
        var tmpPage = dlSize - page1;
        
        forCount = 25 - (tmpPage % 13 - 1) * 2;
        
        return forCount;
    }
    // CH162 zheng 20230213 end
});
