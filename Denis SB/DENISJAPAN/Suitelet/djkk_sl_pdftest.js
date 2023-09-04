/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       06 Sep 2022     rextec
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	if(request.getMethod() == 'GET'){
		
	}
	
	var form = nlapiCreateForm('�����X�e�[�^�X', false);
//    var a = parseInt(saveDetailPdf());
//    nlapiLogExecution('debug','a',a)
//    var detailpdfId = nlapiLoadFile(a);
//	 var detailpdfLink= detailpdfId.getURL();
//	 var detailpdfUrl = "window.open('" + detailpdfLink + "', '_blank');";
//	 form.addButton('btn_createCsv', '���׈ē����׏�PDF�v���r���[',detailpdfUrl);
	
	
	 var a = parseInt(saveDetailPdf());
	 nlapiLogExecution('debug','a',a)
	 var detailpdfId = nlapiLoadFile(a);
	 var detailpdfLink= detailpdfId.getURL();
	 var detailpdfUrl = "window.open('" + detailpdfLink + "', '_blank');";
	 form.addButton('btn_createCsv', 'L�^���ː��A�����\����PDF�v���r���[',detailpdfUrl);
	 response.writePage(form);
}
function detailPdf(detailData){

	var str = '';
    str += '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'+
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
	'    <style type="text/css">table { font-size: 9pt; table-layout: fixed; width: 100%; }* {'+
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
	'td{'+
	'font-size: 9px;'+
	'}'+
	'</style>'+
	'</head>';
	str += '<body padding="0.5in 1.9in 0.5in 0.29in" size="A4-LANDSCAPE">'+
	'<table  cellspacing="0" border="0" cellpadding="0" style="word-break:break-all;">'+
	'<tr>'+
	'<td align="center" width = "35px" style="height: 0px;"></td>'+
	'<td align="center" width = "90px"></td>'+
	'<td align="center" width = "270px"></td>'+
	'<td align="center" width = "90px"></td>'+
	'<td align="center" width = "45px"></td>'+
	'<td align="center" width = "50px"></td>'+
	'<td align="center" width = "50px"></td>'+
	'<td align="center" width = "150px"></td>'+
	'<td align="center" width = "140px"></td>'+
	'<td align="center" width = "35px"></td>'+
	'</tr>'+
	'<tr>'+
	'<td colspan="10" style="height: 14px;"></td>'+
	'</tr>'+
	'<tr>'+
	'<td align="left" colspan="10" style="height: 14px;">�P�C�q��������ЎR���u�����ʃZ���^�[����l</td>'+
	'</tr>'+
	'<tr>'+
	'<td colspan="10" style="height: 14px;"></td>'+
	'</tr>'+
	'<tr>'+
	'<td colspan="2" style="height: 14px;"> 555555</td>'+
	'<td align="center" style="font-size: 12px;text-decoration:underline;font-weight: bold; ">2022�N6��28���i�΁j���ɗ\��</td>'+
	'<td colspan="5" > </td>'+
	'<td colspan="2" align="left" style="font-size: 11px;text-decoration:underline;">�Z�e�B�������</td>'+
	'</tr>'+
	'<tr>'+
	'<td align="center" style="height: 14px;font-size:10px;font-weight: bold;border:1px solid black;background-color: #D8D8D8;">No.</td>'+
	'<td align="center" style="font-size:9px;font-weight: bold;border:1px solid black;border-left:none;background-color: #D8D8D8;vertical-align: bottom;">���ɔԍ�</td>'+
	'<td align="center" style="font-size:9px;font-weight: bold;border:1px solid black;border-left:none;background-color: #D8D8D8;vertical-align: bottom;">���i��</td>'+
	'<td align="center" style="font-size:9px;font-weight: bold;border:1px solid black;border-left:none;background-color: #D8D8D8;vertical-align: bottom;">�����/��</td>'+
	'<td align="center" colspan="3" style="font-size:9px;font-weight: bold;border:1px solid black;border-left:none;background-color: #D8D8D8;vertical-align: bottom;">���ɐ���</td>'+
	'<td align="center" style="font-size:9px;font-weight: bold;border:1px solid black;border-left:none;background-color: #D8D8D8;vertical-align: bottom;">���b�g�ԍ�</td>'+
	'<td align="center" style="font-size:9px;font-weight: bold;border:1px solid black;border-left:none;background-color: #D8D8D8;vertical-align: bottom;">�ܖ�����</td>'+
	'<td align="center" style="font-size:9px;font-weight: bold;border:1px solid black;border-left:none;background-color: #D8D8D8;vertical-align: bottom;"></td>'+
	'</tr>'+
	'<tr>'+
	'<td align="center"  style="height: 18px;border:1px solid black;border-top:none;vertical-align: middle;">55</td>'+
	'<td align="center"  style="border:1px solid black;border-left:none;border-top:none;vertical-align: middle;">55</td>'+
	'<td align="center"  style="border:1px solid black;border-left:none;border-top:none;vertical-align: middle;">55</td>'+
	'<td align="center"  style="border:1px solid black;border-left:none;border-top:none;vertical-align: middle;">55</td>'+
	'<td align="center"  style="border:1px solid black;border-left:none;border-top:none;vertical-align: middle;">55</td>'+
	'<td align="center"  style="border:1px solid black;border-left:none;border-top:none;vertical-align: middle;">55</td>'+
	'<td align="center"  style="border:1px solid black;border-left:none;border-top:none;vertical-align: middle;">55</td>'+
	'<td align="center"  style="border:1px solid black;border-left:none;border-top:none;vertical-align: middle;">55</td>'+
	'<td align="center"  style="border:1px solid black;border-left:none;border-top:none;vertical-align: middle;">55</td>'+
	'<td align="center"  style="border:1px solid black;border-left:none;border-top:none;vertical-align: middle;">55</td>'+
	'</tr>'+
	'<tr>'+
	'<td align="right" colspan="4" style="font-size: 7px;vertical-align: middle">Total:</td>'+
	'<td align="center" style="font-size: 7px;vertical-align: middle">32 box</td>'+
	'<td align="right" style="font-size: 7px;vertical-align: middle">314.4kg</td>'+
	'<td colspan="4" style="font-size: 7px;vertical-align: middle"></td>'+
	'</tr>'+
	'</table>'+
	'<table cellspacing="0" border="0" cellpadding="0" style="word-break:break-all;">'+
	'<tr>'+
	'<td align="left" style="line-height:100%;height: 14px; width: 185px;"> </td>'+
	'<td align="left" style="line-height:100%;height: 14px;font-size: 10px;font-weight: bold; "> </td>'+
	'</tr>'+
	'<tr>'+
	'<td align="left" style="line-height:100%;height: 14px;"> </td>'+
	'<td align="left" style="line-height:100%;height: 14px;font-size: 10px;font-weight: bold; "> </td>'+
	'</tr>'+
	'<tr>'+
	'<td align="left" style="line-height:100%;height: 14px;"> </td>'+
	'<td align="left" style="line-height:100%;height: 14px;font-size: 10px;font-weight: bold; ">���艷�ۊǂł����������܂��B</td>'+
	'</tr>'+
	'<tr>'+
	'<td align="left" style="line-height:100%;height: 14px;"> </td>'+
	'<td align="left" style="line-height:100%;height: 14px;font-size: 10px;font-weight: bold; "> </td>'+
	'</tr>'+
	'<tr>'+
	'<td align="left" style="line-height:100%;height: 14px;"> </td>'+
	'<td align="left" style="line-height:100%;height: 14px;font-size: 10px;font-weight: bold; ">�����Ƃ̃��b�g�E�ܖ����ۂ̏ƍ������肢�������܂��B</td>'+
	'</tr>'+
	'<tr>'+
	'<td align="left" style="line-height:100%;height: 14px;"> </td>'+
	'<td align="left" style="line-height:100%;height: 14px;font-size: 10px;font-weight: bold; "> </td>'+
	'</tr>'+
	'<tr>'+
	'<td align="left" style="line-height:100%;height: 14px;"> </td>'+
	'<td align="left" style="line-height:100%;height: 14px;font-size: 10px;font-weight: bold; ">�����{���׃��\�t��f���肢�������܂��B</td>'+
	'</tr>'+
	'<tr>'+
	'<td align="left" style="line-height:100%;height: 14px;"> </td>'+
	'<td align="left" style="line-height:100%;height: 14px;font-size: 10px;font-weight: bold; "> </td>'+
	'</tr>'+
	'<tr>'+
	'<td align="left" style="line-height:100%;height: 14px;"> </td>'+
	'<td align="left" style="line-height:100%;height: 14px;font-size: 10px;font-weight: bold; ">�����������d�ꁜ��C���蓙�̃_���[�W������܂����瑜�ƂƂ��ɂ��񍐂����肢�������܂��B</td>'+
	'</tr>'+
	'<tr>'+
	'<td align="left" style="line-height:100%;height: 14px;"> </td>'+
	'<td align="left" style="line-height:100%;height: 14px;font-size: 10px;font-weight: bold; "> </td>'+
	'</tr>'+
	'<tr>'+
	'<td align="left" style="line-height:100%;height: 14px;"> </td>'+
	'<td align="left" style="line-height:100%;height: 14px;font-size: 10px;font-weight: bold; ">�����n���׃������̔�������܂�����AA���n���x���L��̎ʐ^�ƕ��ׂ���r�ʐ^�A</td>'+
	'</tr>'+
	'<tr>'+
	'<td align="left" style="line-height:100%;height: 14px;"> </td>'+
	'<td align="left" style="line-height:100%;height: 14px;font-size: 10px;font-weight: bold; ">B�̌��n���x�������̔��������Ă����O�̎ʐ^(Lot�����x���̋L����e���킩�����)�̑��t�������������܂��B</td>'+
	'</tr>'+
	'<tr>'+
	'<td align="left" style="line-height:100%;height: 14px;"> </td>'+
	'<td align="left" style="line-height:100%;height: 14px;font-size: 10px;font-weight: bold; "> </td>'+
	'</tr>'+
	'<tr>'+
	'<td align="left" style="line-height:100%;height: 14px;"> </td>'+
	'<td align="left" style="line-height:100%;height: 14px;font-size: 10px;font-weight: bold; ">���Z�e�B�o�גS���F���</td>'+
	'</tr>'+
	'<tr>'+
	'<td align="left" style="line-height:100%;height: 14px;"> </td>'+
	'<td align="left" style="line-height:100%;height: 14px;font-size: 10px;font-weight: bold; "> </td>'+
	'</tr>'+
	'<tr>'+
	'<td align="left" style="line-height:100%;height: 14px;"> </td>'+
	'<td align="left" style="line-height:100%;height: 14px;font-size: 10px;font-weight: bold; color: red;">���T���v����1(No10-17��8�A�C�e��)�J����Ă��܂��B�T���v���͓��{���׃��\��t���s�v�ł�</td>'+
	'</tr>'+
	'<tr>'+
	'<td align="left" style="line-height:100%;height: 14px;"> </td>'+
	'<td align="left" style="line-height:100%;height: 14px;font-size: 10px;font-weight: bold; color: red;">�A�����ƂȂ�܂�����A�Z�e�B�m�[���y�Ăɓ]�������ʂ��������܂��B</td>'+
	'</tr>'+
	'</table>';
	str += 
	'</body>'+
	'</pdf>';
	return str;
}
function radiationPdf(){
	
	var str = '';
	str += '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'+
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
	'    <style type="text/css">table { font-size: 9pt; table-layout: fixed; width: 100%; }* {'+
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
	'td{'+
	'font-size: 8px;'+
	'}'+
	'</style>'+
	'</head>';
	str+='<body  padding="0.5in 1.2in 0.5in 0.9in" size="Letter">';
	str+= '<table cellspacing="0" border="0" cellpadding="0" style="width: 600px;word-break:break-all;">'+
	'<tr>'+
	'<td>'+
	'<table cellspacing="0" border="0" cellpadding="0" style="width: 600px;word-break:break-all;">'+
	'<tr>'+
	'<td align="center" style="width: 600px;height: 20px;">'+
	'<span style="font-size: 22px;font-weight: bold;">L</span>'+
	'<span style="font-size: 18px;font-weight: 300;letter-spacing: 1.5px;">&nbsp;�^���ː��A�����\����</span>'+
	'<span style="font-size: 10px;font-weight: bold;letter-spacing: 1.5px;vertical-align: middle;">&nbsp;&nbsp;&nbsp;(������`�F�b�N���X�g)</span>'+
	'</td>'+
	'</tr>'+
	'<tr>'+
	'<td style="width: 355px;height: 36px;border: 1px solid black;border-right: none;border-bottom: 1px dotted black;">'+
	'<table cellspacing="0" border="0" cellpadding="0">'+
	'<tr>'+
//	'<td style="width: 14px;"></td>'+
	'<td align="left" style="font-size: 10px;width: 155px;margin-top: 4px;margin-left: 4px;"><span>O</span></td>'+
	'<td align="left" style="font-size: 10px;width: 186px;vertical-align: bottom;margin-left:-110px;margin-top:8px;letter-spacing: 2.7px;">��t�����q�s���꒚��8��5</td>'+
	'</tr>'+
	'<tr>'+
//	'<td style="width: 14px;"></td>'+
	'<td align="left" style="vertical-align: top;margin-top: -2px"><span style="margin-left:14px;">�ב��l(���)�Z�� �D����</span></td>'+
	'<td align="left" style="font-size: 15px;margin-left:-110px;font-weight: bold;">DENIS�t�@�[�}�������</td>'+
	'</tr>'+
	'</table>'+
	'</td>'+
	
	'<td style="width: 160px;font-size: 14px;color: #9C9B9C;border-top: 1px solid black;border-bottom: 1px dotted black;margin-left:-160px;">'+
	'<table cellspacing="0" border="0" cellpadding="0" style="width: 160px;height: 36px;"><tr>'+
	'<td align="center" style ="width: 154px;height: 36px;border-left: 1px solid black;border-right: 1px solid black;border-top: 2px solid white;border-bottom: 2px solid white;letter-spacing: 10px;font-size:10px;vertical-align: middle; border-radius: 5px;" corner-radius="20%"><span >���{�ʉ^</span></td>'+
	'<td style="width: 6px;border-right: 1px solid black;">'+
	'</td>'+
	'</tr></table>'+
	'</td>'+
	'<td style="width: 6px;border-top: 1px solid black;border-right: 1px solid black;border-bottom: 1px dotted black;">'+
	'</td>'+
	'</tr>'+
	'<tr>'+
	'<td style="width: 600px;border-left: 1px solid black;border-right: 1px solid black;height:4px;"></td>'+
	'</tr>'+
	'<tr><td>'+
	'<table cellspacing="0" border="0" cellpadding="0">'+
	'<tr>'+
	'<td style="width: 14px;border-left: 1px solid black;"></td>'+
	'<td align="left" style="vertical-align: middle;width: 120px;">�ב��l�A���ӔC�Җ��A�E���B</td>'+
	'<td style="width: 6px;"></td>'+
	'<td align="left" style="width: 310px;font-size: 12px;color: #9C9B9C;margin-left:-20px;">�܏\�����</td>'+
	'<td align="left" style="width: 150px;border-right: 1px solid black;margin-left:-20px;">�쐬��<span>&nbsp;</span></td>'+
	'</tr>'+
	'</table>'+
	'<table cellspacing="0" border="0" cellpadding="0">'+
	'<tr>'+
	'<td style="width: 34px;border-left: 1px solid black;border-bottom: 1px solid black">'+
	'</td>'+
	'<td align="left" style="width: 136px;border-bottom: 1px solid black;">���A�y�ѓd���ԍ�</td>'+
	'<td align="left" style="width: 170px;border-bottom: 1px solid black;margin-left:-40px;">�d�b043 (498) 2031</td>'+
	'<td align="left" style="width: 54px;border-bottom: 1px solid black;margin-left:-40px;">���  �d�b</td>'+
	'<td align="left" style="width: 115px;font-size: 12px;color: #9C9B9C;border-bottom: 1px solid black;margin-left:-40px;"> 011-0001-0001</td>'+
	'<td align="left" style="width: 91px;font-size: 12px;color: #9C9B9C;border-right: 1px solid black;border-bottom: 1px solid black;margin-left:-40px;"> 2021/0614</td>'+
	'</tr>'+
	'</table>'+
	'</td></tr>'+
	
	'</table>'+
	'</td>'+
	'</tr>'+
	'</table>';
	
	
	str +='<table cellspacing="0" border="0" cellpadding="0" style="height: 34px;width: 600px;word-break:break-all;">'+
	'<tr>'+
	'<td style="line-height:100%;letter-spacing: 1px;margin-top:3px;">&nbsp;&nbsp;&nbsp;�{�ݕ��̉��L���e�i��L�^���ː��A�����A���Ɋւ���S�Ă̖@�ߋK���y�эq���Ђ̋K���ɏ]���A���̖��ׂ͐��m�ɋL�ڂ���K�؂ɕ�</td>'+
	'</tr>'+
	'<tr>'+
	'<td style="line-height:100%;letter-spacing: 1px;margin-top:3px;">������A�K�؂Ƀ}�[�N�y�у��x�����t����A���A�q��A���ɓK������Ԃɂ��邱�Ƃ�ۏ؂��܂��B</td>'+
	'</tr>'+
	'<tr>'+
	'<td style="line-height:100%;letter-spacing: 1px;margin-top:3px;">&nbsp;&nbsp;&nbsp;&nbsp;�{�ݕ��͑��q�@�ɓ��ڂ�����͈͂̂��̂ł���A���̐�������������̂ł͂���܂��B</td>'+
	'</tr>'+
	'</table>';
	
	str+= '<table cellspacing="0" border="0" cellpadding="0" style="width: 600px;word-break:break-all;">'+
	'<tr>'+
	'<td style="border: 1px solid black;border-right: none;border-bottom: 1px solid black;width:102px;height:27px;">'+
	'<table cellspacing="0" border="0" cellpadding="0" style="width: 102px;">'+
	'<tr>'+
	'<td rowspan="2" align="center" style="width: inherit;">'+
	'<table cellspacing="0" border="0" cellpadding="0">'+
	'<tr>'+
	'<td align="left" style="width:141px;vertical-align: middle;">'+
	'&nbsp;O'+
	'</td>'+
	'</tr>'+
	'<tr>'+
	'<td align="center" style="width:141px;vertical-align: top;">'+
	'���ː�������'+
	'</td>'+
	'</tr>'+
	'</table>'+
	'</td>'+
	'</tr>'+
	'</table>'+
	'</td>'+
	
	
	'<td style="width:141px;border: 1px solid black;border-right: none;border-bottom: 1px solid black;">'+
	'<table cellspacing="0" border="0" cellpadding="0" style="height: 27px;width:141px;" >'+
	'<tr>'+
	'<td align="center" style="height: 15px;width:141px; border-bottom: 1px solid black;vertical-align: middle;">�`��'+
	'</td>'+
	'</tr>'+
	'<tr>'+
	'<td style="height: 12px;width:141px;">'+
	'<table cellspacing="0" border="0" cellpadding="0">'+
	'<tr>'+
	'<td align="center" style="width: 86.5px;height: 12px; border-right: 1px dotted black;vertical-align: middle;">O���ʌ`����ʌ`</td>'+
	'<td align="center" style="width: 54.5px;vertical-align: middle;">O�����I����</td>'+
	'</tr>'+
	'</table>'+
	'</td>'+
	'</tr>'+
	'</table>'+
	'</td>'+
	
	
	'<td style="border: 1px solid black;border-right: none;border-bottom: 1px solid black;width:90px;">'+
	'<table cellspacing="0" border="0" cellpadding="0" style="width: 90px;">'+
	'<tr>'+
	'<td align="left" style="width: 20px;line-height: 100%;">&nbsp;O'+
	'</td>'+
	'<td align="center" style="width: 50px;line-height: 100%;">'+
	'<table cellspacing="0" border="0" cellpadding="0">'+
	'<tr>'+
	'<td align="center" style="height:13.5px;width:67px;vertical-align: bottom;">'+
	'1�����'+
	'</td>'+
	'</tr>'+
	'<tr>'+
	'<td align="center" style="height:13.5px;width:67px;vertical-align: top;letter-spacing: 4px;">'+
	'���˔\��'+
	'</td>'+
	'</tr>'+
	'</table>'+
	'</td>'+
	'<td align="center" style="width: 20px;line-height: 100%;">'+
	'</td>'+
	'</tr>'+
	'</table>'+
	'</td>'+
	'<td align="center" style="border: 1px solid black;border-right: none;border-bottom: 1px solid black;width:57px;vertical-align: middle;">�A��������</td>'+
	'<td align="center" style="border: 1px solid black;border-right: none;border-bottom: 1px solid black;width:67px;">'+
	'<table cellspacing="0" border="0" cellpadding="0">'+
	'<tr>'+
	'<td align="center" style="height:13.5px;width:67px;vertical-align: bottom;">'+
	'1�����'+
	'</td>'+
	'</tr>'+
	'<tr>'+
	'<td align="center" style="height:13.5px;width:67px;vertical-align: top;letter-spacing: 4px;">'+
	'�A���w��'+
	'</td>'+
	'</tr>'+
	'</table>'+
	'</td>'+
	'<td align="center" style="border: 1px solid black;border-right: none;border-bottom: 1px solid black;width:79px;">'+
	'<table cellspacing="0" border="0" cellpadding="0">'+
	'<tr>'+
	'<td align="left" style="width:79px;vertical-align: middle;">'+
	'&nbsp;O'+
	'</td>'+
	'</tr>'+
	'<tr>'+
	'<td align="center" style="width:79px;vertical-align: middle;">'+
	'���e���˔\��'+
	'</td>'+
	'</tr>'+
	'</table>'+
	'</td>'+
	'<td align="center" style="border: 1px solid black;border-bottom: 1px solid black;width:65px;">	'+
	'<table cellspacing="0" border="0" cellpadding="0">'+
	'<tr>'+
	'<td align="left" style="width:65px;vertical-align: middle;">'+
	'&nbsp;O'+
	'</td>'+
	'</tr>'+
	'<tr>'+
	'<td align="center" style="width:65px;vertical-align: middle;">'+
	'����A������'+
	'</td>'+
	'</tr>'+
	'</table>'+
	'</td>'+
	'</tr>'+
	'<tr>'+
	'<td style="border-left: 1px solid black;height: 420px;border-bottom: 1px solid black;"></td>'+
	'<td style="border-left: 1px solid black;border-bottom: 1px solid black;">'+
	'<table cellspacing="0" border="0" cellpadding="0">'+
	'<tr>'+
	'<td style="height: 420px; width: 90px;border-right: 1px dotted black;"></td>'+
	'<td style="width: 57px;"></td>'+
	'</tr>'+
	'</table>'+
	'</td>'+
	'<td style="border-left: 1px solid black;border-bottom: 1px solid black;"></td>'+
	'<td style="border-left: 1px solid black;border-bottom: 1px solid black;"></td>'+
	'<td style="border-left: 1px solid black;border-bottom: 1px solid black;"></td>'+
	'<td style="border-left: 1px solid black;border-bottom: 1px solid black;"></td>'+
	'<td style="border-left: 1px solid black;border-bottom: 1px solid black; border-right: 1px solid black;;">'+
	'</td>'+
	'</tr>'+
	'</table>';
	str+='<table cellspacing="0" border="0" cellpadding="0" style="width: 600px;word-break:break-all;">'+
	'<tr>'+
	'<td style="height: 5px;"></td>'+
	'</tr>'+
	'</table>'+
	
	'<table cellspacing="0" border="0" cellpadding="0" style=" width: 600px;word-break:break-all;">'+
	'<tr>'+
	'<td style="height: 2px;width: 100px;border-left: 1px solid black;border-top: 1px solid black;"></td>'+
	'<td align="center" rowspan="4" style="height: 27px;width: 100px;vertical-align: middle;border-top: 1px solid black;"></td>'+
	'<td style="width: 50px;border-left: 1px solid black;border-top: 1px solid black;"></td>'+
	'<td align="center" rowspan="4" style="width: 66px;vertical-align: middle;font-size:11px;font-weight: bold;letter-spacing: 22px;border-top: 1px solid black;">����</td>'+
	'<td style="width: 60px;border-left: 1px solid black;border-top: 1px solid black;"></td>'+
	'<td align="center" rowspan="4" style="width: 65px;vertical-align: middle;font-size:11px;font-weight: bold;letter-spacing: 22px;border-top: 1px solid black;"></td>'+
	'<td style="width: 50px;border-left: 1px solid black;border-top: 1px solid black;"></td>'+
	'<td align="center" rowspan="4" style="width: 75px;border-right: 1px solid black;vertical-align: middle;font-size:11px;font-weight: bold;letter-spacing: 22px;border-top: 1px solid black;color :#9C9B9C;">����</td>'+
	'</tr>'+
	'<tr>'+
	'<td align="left" rowspan="3" style="height: 18px;width: 100px;border-left: 1px solid black;vertical-align: middle;">'+
	'<table cellspacing="0" border="0" cellpadding="0">'+
	'<tr>'+
	'<td align="left" style="height:13.5px;width:100px;vertical-align: bottom;">'+
	'&nbsp;&nbsp;&nbsp;�^����ԍ�'+
	'</td>'+
	'</tr>'+
	'<tr>'+
	'<td align="left" style="height:13.5px;width:100px;vertical-align: top;">'+
	'&nbsp;&nbsp;&nbsp;AWB Number'+
	'</td>'+
	'</tr>'+
	'</table>'+
	'</td>'+
	'<td align="left" style="height: 9px;width: 50px;border-left: 1px solid black;line-height: 100%;vertical-align: bottom;">&nbsp;&nbsp;&nbsp;�o���n</td>'+
	'<td align="left" style="height: 9px;width: 60px;border-left: 1px solid black;ine-height: 100%;vertical-align: bottom;">&nbsp;&nbsp;&nbsp;�p�z�n</td>'+
	'<td align="left" style="height: 9px;width: 50px;border-left: 1px solid black;ine-height: 100%;vertical-align: bottom;">&nbsp;&nbsp;&nbsp;�����n</td>'+
	'</tr>'+
	'<tr>'+
	'<td align="left" style="height: 9px;border-left: 1px solid black;ine-height: 100%;vertical-align: bottom;">&nbsp;&nbsp;&nbsp;Airport of</td>'+
	'<td align="left" style="height: 9px;border-left: 1px solid black;ine-height: 100%;vertical-align: bottom;">&nbsp;&nbsp;&nbsp;Airport of</td>'+
	'<td align="left" style="height: 9px;border-left: 1px solid black;ine-height: 100%;vertical-align: bottom;">&nbsp;&nbsp;&nbsp;Airport of</td>'+
	'</tr>'+
	'<tr>'+
//	'<td align="left" text-align = "top" style="height: 9px;border-left: 1px solid black;ine-height: 100%;vertical-align: top;">&nbsp;&nbsp;&nbsp;AWB Number</td>'+
	'<td align="left" style="height: 9px;border-left: 1px solid black;ine-height: 100%;vertical-align: bottom;">&nbsp;&nbsp;&nbsp;Departure</td>'+
	'<td align="left" style="height: 9px;border-left: 1px solid black;ine-height: 100%;vertical-align: bottom;">&nbsp;&nbsp;&nbsp;Transhipment</td>'+
	'<td align="left" style="height: 9px;border-left: 1px solid black;line-height: 100%;vertical-align: bottom;">&nbsp;&nbsp;&nbsp;Arrival</td>'+
	'</tr>'+
	'</table>';
	str+= '<table cellspacing="0" border="0" cellpadding="0" style="width: 600px;word-break:break-all;">'+
	'<tr>'+
	'<td style="height: 5px; border-top: 1px solid black;"></td>'+
	'</tr>'+
	'</table>'+
	
	'<table cellspacing="0" border="0" cellpadding="0" style=" width: 600px;word-break:break-all;">'+
	'<tr>'+
	'<td style="width: 110px;height:none;"></td>'+
	'<td style="width: 130px;"></td>'+
	'<td style="width: 210px;"></td>'+
	'<td style="width: 25px;"></td>'+
	'<td style="width: 25px;"></td>'+
	'<td style="width: 100px;"></td>'+
	'</tr>'+
	'<tr>'+
	'<td align="center" colspan="2" style="height:23.33px;border-top: 1px solid black;border: 1px solid black;border-bottom: none;border-right: none;vertical-align: middle;">�q���Ўg�p For airline use only</td>'+
	'<td align="left" colspan="4" style="border-top: 1px solid black;border-bottom: none;font-size: 11px;border-right: 1px solid black;text-decoration:underline;vertical-align: middle;font-weight: bold;">����`�F�b�N���X�g</td>'+
	'</tr>'+
	'<tr>'+
	'<td colspan="3" style="height:23.33px;border-left: 1px solid black;"></td>'+
	'<td colspan="2" align="center" style="vertical-align: middle;">YES&nbsp;&nbsp;&nbsp;NO</td>'+
	'<td style="border-right: 1px solid black;"></td>'+
	'</tr>'+
	'<tr>'+
	'<td style="height:23.33px;border-left: 1px solid black;"></td>'+
	'<td align="left" colspan="2">(1)�^����̕i�����ɕ��ː������ł���|�L�ڂ���Ă��邩?</td>'+
	'<td align="center" style="vertical-align: top;"><input type="checkbox" name="item" value="0"/></td>'+
	'<td align="center" style="vertical-align: top;"><input type="checkbox" name="item" value="0"/></td>'+
	'<td style="border-right: 1px solid black;"></td>'+
	'</tr>'+
	'<tr>'+
	'<td style="height:23.33px;border-left: 1px solid black;"></td>'+
	'<td align="left" colspan="2">(2)�A���ӔC�҂̏����܂��͎C��O�ɂ��邩? </td>'+
	'<td align="center" style="vertical-align: top;"><input type="checkbox" name="item" value="0"/></td>'+
	'<td align="center" style="vertical-align: top;"><input type="checkbox" name="item" value="0"/></td>'+
	'<td style="border-right: 1px solid black;"></td>'+
	'</tr>'+
	'<tr>'+
	'<td style="height:23.33px;border-left: 1px solid black;"></td>'+
	'<td align="left" colspan="2">(3)OO�͑S�ċL�ڂ���Ă��邩? </td>'+
	'<td align="center" style="vertical-align: top;"><input type="checkbox" name="item" value="0"/></td>'+
	'<td align="center" style="vertical-align: top;"><input type="checkbox" name="item" value="0"/></td>'+
	'<td style="border-right: 1px solid black;"></td>'+
	'</tr>'+
	'<tr>'+
	'<td style="height:23.33px;border-left: 1px solid black;"></td>'+
	'<td align="left" colspan="2">(4)����Ɉُ󂪖����A�܂��u���ː��v������ �uR A D I O A C T I V E�v�̕\�������邩?</td>'+
	'<td align="center" style="vertical-align: top;"><input type="checkbox" name="item" value="0"/></td>'+
	'<td align="center" style="vertical-align: top;"><input type="checkbox" name="item" value="0"/></td>'+
	'<td style="border-right: 1px solid black;"></td>'+
	'</tr>'+
	'<tr>'+
	'<td colspan="6" style="height:23.33px;border-left: 1px solid black;border-right: 1px solid black;height: 13px;">'+
	'</td>'+
	'</tr>'+
	'<tr>'+
	'<td colspan="6" style="vertical-align: bottom;height:23.33px;border-left: 1px solid black;border-right: 1px solid black;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;���ׂĂ�YES�̏ꍇ�͓��Y�ݕ���������A�ꊇ�t�@�C���ɂ�蔭�n�ŕۊǂ���BNO������ꍇ�́A�{�l����COPY1����Y���ĉݕ����ב��l�܂��͑㗝�X��'+
	'</td>'+
	'</tr>'+
	'<tr>'+
	'<td colspan="6" style="vertical-align: middle;height:23.33px;border: 1px solid black;border-top: none;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;�ԋp���AORIGINAL COPY�͈ꊇ�t�@�C���ɂ��ۊǂ���B'+
	'</td>'+
	'</tr>'+
	'</table>';
	str+='<table cellspacing="0" border="0" cellpadding="0" style="width: 600px;word-break:break-all;">'+
	'<tr>'+
	'<td style="height: 5px;"></td>'+
	'</tr>'+
	'</table>';
	str+='<table cellspacing="0" border="0" cellpadding="0" style="width: 600px;height: 39px;word-break:break-all;">'+
	'<tr>'+
	'<td style="height: 13px;width: 300px;border: 1px solid black; border-right:none;border-bottom:none;vertical-align: middle;"><span style="margin-left: 30px;line-height: 100%;letter-spacing: 10px;margin-left:22px">�������</span>'+
	'</td>'+
	'<td style="width: 300px;border: 1px solid black;border-bottom:none;vertical-align: middle;"><span style="margin-left:6px;">�댯�i�戵�S����(�����A�C��܂��͏���)/���� STATION</span></td>'+
	'</tr>'+
	'<tr>'+
	'<td style="height: 13px;border-left: 1px solid black;height: 13px;width: 300px;line-height: 100%;vertical-align: middle;">'+
	'<table cellspacing="0" border="0" cellpadding="0" style=" width: 300px;word-break:break-all;">'+
	'<tr>'+
	'<td align="right" style="width:97px;"><span></span>�N</td>'+
	'<td align="right" style="width:37.5pxpx;"><span></span>��</td>'+
	'<td align="right" style="width:37.5pxpx;"><span></span>��</td>'+
	'<td align="right" style="width:37.5pxpx;"><span></span>��</td>'+
	'<td align="right" style="width:37.5pxpx;"><span></span>��</td>'+
	'<td align="left" style="width:53px;"></td>'+
	'</tr>'+
	'</table>'+
	'</td>'+
	'<td rowspan="2" style="border: 1px solid black;border-top:none;"></td>'+
	'</tr>'+
	'<tr>'+
	'<td style="height: 13px;border-left: 1px solid black;border-bottom: 1px solid black;width: 300px;"></td>'+
	'</tr>'+
	'</table>';
		
	str += '</body></pdf>';
	return str;
}
function saveDetailPdf(detail){

	    var renderer = nlapiCreateTemplateRenderer();
//	    renderer.setTemplate(detailPdf(detail));
	    renderer.setTemplate(radiationPdf(detail));
	    var xml = renderer.renderToString();
	    var xlsFile = nlapiXMLToPDF(xml);
	    
		xlsFile.setFolder(FILE_CABINET_ID_INCOMING_PDF);
//		xlsFile.setName('���׈ē����׏�' + '_' + getFormatYmdHms() + '.pdf');
		xlsFile.setName('L�^���ː��A�����\����' + '_' + getFormatYmdHms() + '.pdf');
		// save file
		return nlapiSubmitFile(xlsFile);
}