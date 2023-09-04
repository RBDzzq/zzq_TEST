/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Sep 2022     rextec
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	var str = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'+
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
	'    <style type="text/css">'+
	'table { font-size: 9pt; table-layout: fixed; width: 100%; }* {'+
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
     '</style>'+
     '</head>'+
     '<body padding="0.5in 0.5in 0.5in 0.5in" size="Letter">';//A4-LANDSCAPE
	
	
	
				//���ɗ\��̂��ē�
//	 str+='<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
//		 '<tr>'+
//		 '<td width="110px"></td>'+
//		 '<td width="110px"></td>'+
//		 '<td width="110px"></td>'+
//		 '<td width="110px"></td>'+
//		 '<td width="110px"></td>'+
//		 '<td width="110px"></td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td style="border: 0;"></td>'+
//		 '<td style="border: 0;"></td>'+
//		 '<td colspan="2" align="center" corner-radius="1%" style="font-weight: bold;font-size: 20px;border: 2px solid black;">���ɗ\��̂��ē�</td>'+
//		 '<td style="border: 0;"></td>'+
//		 '<td style="border: 0;"></td>'+
//		 '</tr>'+
//		 '</table>'+
//		 '<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
//		 '<tr>'+
//		 '<td width="50px"></td>'+
//		 '<td width="83px"></td>'+
//		 '<td width="92.5px"></td>'+
//		 '<td width="92.5px"></td>'+
//		 '<td width="92.5px"></td>'+
//		 '<td width="84.5px"></td>'+
//		 '<td width="82.5px"></td>'+
//		 '<td width="82.5px"></td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td style="font-weight: bold;font-size:20px" colspan="5" >�i�i�q�Ɂi��)</td>'+
//		 '<td colspan="2" rowspan="2" align="right" style="vertical-align:middle">2022/8/3</td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td style="font-weight: bold;font-size:20px" colspan="4">�R���ȓ����ʃZ���^�[</td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td style="font-size: 12px;" colspan="4">Tel:045-681-1041&nbsp;Fax:045-681-1041</td>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr height="10px"></tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td colspan="7" style="font-size: 15px;">&nbsp;&nbsp;���������b�ɂȂ��Ă���܂��B</td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td colspan="7" style="font-size: 15px;">&nbsp;&nbsp;����ł����A���̉ݕ��̓��ɗ\��������Ă��������B</td>'+
//		 '</tr>'+
//		 '</table>'+
//		 '<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
//		 '<tr>'+
//		 '<td width="60px"></td>'+
//		 '<td width="50px"></td>'+
//		 '<td width="60px"></td>'+
//		 '<td width="70px"></td>'+
//		 '<td width="70px"></td>'+
//		 '<td width="130px"></td>'+
//		 '<td width="120px"></td>'+
//		 '<td width="100px"></td>'+
//		 '</tr>'+
//		 '<tr height="10px"></tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td colspan="7" style="font-weight: bold;font-size: 16px;">��ށFSILAB�Љ��ϕi����</td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td colspan="4" align="center" style="font-size: 15px;border: 1px solid black;vertical-align:middle">���i��</td>'+
//		 '<td align="center" style="font-size: 15px;border: 1px solid black;vertical-align:middle">Lot#</td>'+
//		 '<td align="center" style="font-size: 15px;border: 1px solid black;vertical-align:middle">���ɔԍ�</td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td colspan="4" align="left" style="font-size: 15px;vertical-align: top;font-weight: bold;border: 1px solid black;">INS-5/INSTENSYL</td>'+
//		 '<td align="left" style="vertical-align: top;font-weight: bold;font-size: 15px;border: 1px solid black;">220621-0632</td>'+
//		 '<td align="left" style="vertical-align: top;font-weight: bold;font-size: 15px;border: 1px solid black;">58221</td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;"><span>����</span><br/><span>(kg)</span></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;"><span>��</span><br/><span>(btl)</span></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;"><span>�J�[�g����</span><br/><span style="text-align:center;">(ctn)</span></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;"><span>���d��</span><br/><span>(kg)</span></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;">�ۏ؊���1</td>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td align="right" style="font-size: 15px; font-weight: bold;border: 1px solid black;">5</td>'+
//		 '<td align="right" style="font-size: 15px; font-weight: bold;border: 1px solid black;">4</td>'+
//		 '<td align="right" style="font-size: 15px; font-weight: bold;border: 1px solid black;">2</td>'+
//		 '<td align="right" style="font-size: 15px; font-weight: bold;border: 1px solid black;">40</td>'+
//		 '<td align="center" style="font-size: 15px; font-weight: bold;border: 1px solid black;">2023/12/21</td>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr height="10px"></tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td colspan="4" align="center" style="font-size: 15px;border: 1px solid black;">���i��</td>'+
//		 '<td align="center" style="font-size: 15px;border: 1px solid black;">Lot#</td>'+
//		 '<td align="center" style="font-size: 15px;border: 1px solid black;">���ɔԍ�</td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td colspan="4" align="left" style="font-size: 15px;vertical-align: top;font-weight: bold;border: 1px solid black;">FILM/FILMEXEL</td>'+
//		 '<td align="left" style="vertical-align: top;font-weight: bold;font-size: 15px;border: 1px solid black;">220620-0520</td>'+
//		 '<td align="left" style="vertical-align: top;font-weight: bold;font-size: 15px;border: 1px solid black;">58224</td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;"><span>����</span><br/><span>(kg)</span></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;"><span>��</span><br/><span>(btl)</span></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;"><span>�J�[�g����</span><br/><span>(ctn)</span></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;"><span>���d��</span><br/><span>(kg)</span></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;">�ۏ؊���1</td>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td align="right" style="font-size: 15px; font-weight: bold;border: 1px solid black;">0.25</td>'+
//		 '<td align="right" style="font-size: 15px; font-weight: bold;border: 1px solid black;">12</td>'+
//		 '<td align="right" style="font-size: 15px; font-weight: bold;border: 1px solid black;">1</td>'+
//		 '<td align="right" style="font-size: 15px; font-weight: bold;border: 1px solid black;">3</td>'+
//		 '<td align="center" style="font-size: 15px; font-weight: bold;border: 1px solid black;">2024/02/10</td>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr height="10px"></tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td colspan="4" align="center" style="font-size: 15px;border: 1px solid black;">���i��</td>'+
//		 '<td align="center" style="font-size: 15px;border: 1px solid black;">Lot#</td>'+
//		 '<td align="center" style="font-size: 15px;border: 1px solid black;">���ɔԍ�</td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td colspan="4" align="left" style="font-size: 15px;vertical-align: top;font-weight: bold;border: 1px solid black;">OSI/OSILIFT</td>'+
//		 '<td align="left" style="vertical-align: top;font-weight: bold;font-size: 15px;border: 1px solid black;">220706-0133</td>'+
//		 '<td align="left" style="vertical-align: top;font-weight: bold;font-size: 15px;border: 1px solid black;">58225</td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;"><span>����</span><br/><span>(kg)</span></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;"><span>��</span><br/><span>(btl)</span></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;"><span>�J�[�g����</span><br/><span>(ctn)</span></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;"><span>���d��</span><br/><span>(kg)</span></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;">�ۏ؊���1</td>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td align="right" style="font-size: 15px; font-weight: bold;border: 1px solid black;">1</td>'+
//		 '<td align="right" style="font-size: 15px; font-weight: bold;border: 1px solid black;">25</td>'+
//		 '<td align="right" style="font-size: 15px; font-weight: bold;border: 1px solid black;">2</td>'+
//		 '<td align="right" style="font-size: 15px; font-weight: bold;border: 1px solid black;">50</td>'+
//		 '<td align="center" style="font-size: 15px; font-weight: bold;border: 1px solid black;">2024/01/21</td>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr height="10px"></tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td colspan="4" align="center" style="font-size: 15px;border: 1px solid black;">���i��</td>'+
//		 '<td align="center" style="font-size: 15px;border: 1px solid black;">Lot#</td>'+
//		 '<td align="center" style="font-size: 15px;border: 1px solid black;">���ɔԍ�</td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td colspan="4" align="left" style="font-size: 15px;vertical-align: top;font-weight: bold;border: 1px solid black;">POL-EL/POLYLIFTEL</td>'+
//		 '<td align="left" style="vertical-align: top;font-weight: bold;font-size: 15px;border: 1px solid black;">220621-0632</td>'+
//		 '<td align="left" style="vertical-align: top;font-weight: bold;font-size: 15px;border: 1px solid black;">58221</td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;"><span>����</span><br/><span>(kg)</span></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;"><span>��</span><br/><span>(btl)</span></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;"><span>�J�[�g����</span><br/><span>(ctn)</span></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;"><span>���d��</span><br/><span>(kg)</span></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;">�ۏ؊���1</td>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td align="right" style="font-size: 15px; font-weight: bold;border: 1px solid black;">5</td>'+
//		 '<td align="right" style="font-size: 15px; font-weight: bold;border: 1px solid black;">4</td>'+
//		 '<td align="right" style="font-size: 15px; font-weight: bold;border: 1px solid black;">2</td>'+
//		 '<td align="right" style="font-size: 15px; font-weight: bold;border: 1px solid black;">40</td>'+
//		 '<td align="center" style="font-size: 15px; font-weight: bold;border: 1px solid black;">2023/12/21</td>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr height="10px"></tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td colspan="7" style="font-size: 13px; font-weight: bold;">���ɗ\���:2022/08/04</td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td colspan="7" style="font-size: 13px; font-weight: bold;vertical-align:bottom;">&nbsp;&nbsp;��Ɗ�����]��:</td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '<td align="right"><input type="checkbox" name="answer4" value="�݌ɕi" /></td>'+
//		 '<td style="font-size: 13px;font-weight: bold;">�݌ɕi</td>'+
//		 '<td align="right"><input type="checkbox" name="answer5" value="�o�ח\��L��" /></td>'+
//		 '<td style="font-size: 13px;font-weight: bold">�o�ח\��L��</td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr height="10px"></tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td colspan="7" style="font-size:13px">���Ɍ�A���ɕ񍐏����t�@�b�N�X�ő����Ă��������B</td>'+
//		 '</tr>'+
//		 '</table>'+
//		 '<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
//		 '<tr>'+
//		 '<td width="250px"></td>'+
//		 '<td width="100px"></td>'+
//		 '<td width="80px"></td>'+
//		 '<td width="100px"></td>'+
//		 '<td width="130px"></td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '<td  rowspan="2" style="font-size: 20px;font-weight: bold;">SCETI</td>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '<td  colspan="2" style="font-size: 12px;">������ЃZ�e�B</td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '<td  colspan="3" style="font-size: 12px;">�����s���c�������3-6-1</td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '<td colspan="3" style="font-size: 12px;">Tel:123456 &nbsp;&nbsp;&nbsp; FAX:123456123</td>'+
//		 '</tr>'+
//		 '<tr height="10px">'+
//		 ''+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '<td  style="font-weight: bold;font-size: 12px;">�S��:</td>'+
//		 '<td colspan="2" style="font-weight: bold;font-size: 12px;">test</td>'+
//		 '</tr>'+
//		 '</table>'; 

	
	
	
	
	
				//���w����Ǝw����
	
//	str+='<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
//	'<tr>'+
//	'<td width="132px"></td>'+
//	'<td width="132px"></td>'+
//	'<td width="132px"></td>'+
//	'<td width="132px"></td>'+
//	'<td width="132px"></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td align="center" style="border-bottom: 2px solid black;font-size: 13px;text-align: center;font-weight: bold;vertical-align:bottom">���x����Ǝw����</td>'+
//	'<td></td>'+
//	'<td align="center" style="font-size: 11px;text-align: center;">2022�N8��4��</td>'+
//	'</tr>'+
//	'<tr height="10px"></tr>'+
//	'<tr>'+
//	'<td colspan="5" style="font-size: 13px;font-weight: bold;">�P�C�q���q��(��)</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td colspan="5" style="font-size: 13px;font-weight: bold;">�R���u�����ʃZ���^�[&nbsp;&nbsp;����l</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td colspan="5" style="font-size: 13px;font-weight: bold;">TEL:045-681-1041&nbsp;&nbsp;&nbsp;&nbsp;FAX:045-681-1041</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td colspan="5" style="font-size: 13px;">���x�����b�ɂȂ��Ă���܂��B</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td colspan="5" style="font-size: 13px;">���x����\���Ƃ��s���Ă��������B</td>'+
//	'</tr>'+
//	'</table>'+
//	'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
//	'<tr height="20px">'+
//	'<td width="130px"></td>'+
//	'<td width="200px"></td>'+
//	'<td width="110px"></td>'+
//	'<td width="50px"></td>'+
//	'<td width="50px"></td>'+
//	'<td width="70"></td>'+
//	'<td width="50px"></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td align="center" style="text-align: center;font-size: 13px;font-weight: bold;">���ɗ\���:</td>'+
//	'<td align="left" style="text-align: left;font-size: 13px;font-weight: bold;">2022�N8��9��(��)AM</td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td colspan="2" style="font-size: 13px;font-weight: bold;margin-left: 35px;">PO#:&nbsp;&nbsp;8003157-1</td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td colspan="5" style="font-size: 13px;font-weight: bold;padding-left: 40px;vertical-align: top;"><div style="width: 8px;height: 8px;border: 1px solid black; background-color: black;display: inline-block;"></div>���͕\�͌�����[�����܂��B</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td align="center" style="font-size: 13px;text-align: center;vertical-align:middle; border-left: 1px solid black;border-right: 1px solid black;border-top: 1px solid black;">���i�R�[�h</td>'+
//	'<td align="center" style="font-size: 13px;text-align: center;vertical-align:middle; border-top: 1px solid black;border-right: 1px solid black;">�i��(�p��)</td>'+
//	'<td align="center" style="font-size: 13px;text-align: center;vertical-align:middle; border-top: 1px solid black;border-right: 1px solid black;">Lot#</td>'+
//	'<td align="center" style="font-size: 13px;text-align: center;vertical-align:middle; border-top: 1px solid black;border-right: 1px solid black;"><span style="text-align:center">����</span><br/><span style="text-align:center">(kg)</span></td>'+
//	'<td align="center" style="font-size: 13px;text-align: center;vertical-align:middle; border-top: 1px solid black;border-right: 1px solid black;"><span style="text-align:center">�ܐ�</span><br/><span style="text-align:center">(bag)</span></td>'+
//	'<td align="center" style="font-size: 13px;text-align: center;vertical-align:middle; border-top: 1px solid black;border-right: 1px solid black;"><span style="text-align:center">�J�[�g����</span><br/><span style="text-align:center">(ctn)</span></td>'+
//	'<td align="center" style="font-size: 13px;text-align: center;vertical-align:middle; border-top: 1px solid black;border-right: 1px solid black;"><span style="text-align:center">���d��</span><br/><span style="text-align:center">(kg)</span></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td align="left" style="font-size: 13px;text-align: left;font-weight: bold;border-left: 1px solid black;border-right: 1px solid black;border-top: 1px solid black;">10015-GR107A-20</td>'+
//	'<td align="left" style="font-size: 13px;text-align: left;font-weight: bold;border-top: 1px solid black;border-right: 1px solid black;">GTF CHROMIUM YEAST</td>'+
//	'<td align="left" style="font-size: 13px;text-align: left;font-weight: bold;border-top: 1px solid black;border-right: 1px solid black;">127000/69-258</td>'+
//	'<td align="right" style="font-size: 13px;text-align: right;font-weight: bold;border-top: 1px solid black;border-right: 1px solid black;">20</td>'+
//	'<td align="right" style="font-size: 13px;text-align: right;font-weight: bold;border-top: 1px solid black;border-right: 1px solid black;">1</td>'+
//	'<td align="right" style="font-size: 13px;text-align: right;font-weight: bold;border-top: 1px solid black;border-right: 1px solid black;">3</td>'+
//	'<td align="right" style="font-size: 13px;text-align: right;font-weight: bold;border-top: 1px solid black;border-right: 1px solid black;">60</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td align="center" style="font-size: 13px;text-align: center;border-left: 1px solid black;vertical-align:middle; border-right: 1px solid black;border-top: 1px solid black;">���ޗ���</td>'+
//	'<td align="center" style="font-size: 13px;text-align: center;border-top: 1px solid black;vertical-align:middle; border-right: 1px solid black;">�i��(�a��)</td>'+
//	'<td align="center" style="font-size: 13px;text-align: center;border-top: 1px solid black;vertical-align:middle; border-right: 1px solid black;">�ܖ�����</td>'+
//	'<td align="center" colspan="2" style="font-size: 13px;text-align: center;border-top: 1px solid black;vertical-align:middle; border-right: 1px solid black;">���܃��x��<br/>(��)</td>'+
//	'<td align="center" colspan="2" style="font-size: 13px;text-align: center;border-top: 1px solid black;vertical-align:middle; border-right: 1px solid black;">�O�����x��<br/>(��)</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td align="left" style="font-size: 13px;text-align: left;font-weight: bold;border-left: 1px solid black;border-right: 1px solid black;border-bottom: 1px solid black;border-top: 1px solid black;">�y��</td>'+
//	'<td align="left" style="font-size: 13px;text-align: left;font-weight: bold;border-top: 1px solid black;border-right: 1px solid black;border-bottom: 1px solid black;">�N�����ܗL�y��</td>'+
//	'<td align="left" style="font-size: 13px;text-align: left;font-weight: bold;border-top: 1px solid black;border-right: 1px solid black;border-bottom: 1px solid black;">2024.3.2</td>'+
//	'<td align="right" colspan="2" style="font-size: 13px;text-align: right;font-weight: bold;border-top: 1px solid black;border-right: 1px solid black;border-bottom: 1px solid black;">3</td>'+
//	'<td align="right" colspan="2" style="font-size: 13px;text-align: right;font-weight: bold;border-top: 1px solid black;border-right: 1px solid black;border-bottom: 1px solid black;">3</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td align="center" style="font-size: 13px;text-align: center;border-left: 1px solid black;vertical-align:middle; border-right: 1px solid black;border-bottom: 1px solid black;">����</td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td align="left" style="font-size: 13px;text-align: left;font-weight: bold;border-left: 1px solid black;border-right: 1px solid black;border-bottom: 1px solid black;">�y��</td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'</tr>'+
//	'<tr height="20px"></tr>'+
//	'</table>'+
//	'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
//	'<tr>'+
//	'<td width="25px"></td>'+
//	'<td width="280px"></td>'+
//	'<td width="10px"></td>'+
//	'<td width="300px"></td>'+
//	'<td width="45px"></td>'+
//	'</tr>'+
//	'<tr height="75">'+
//	'<td></td>'+
//	'<td align="center" style="font-size: 13px;font-weight: bold; text-align:center;vertical-align: bottom;border-top: 1px dotted black;border-left: 1px dotted black; border-right: 1px dotted black;">�����ɊO���p���{���w����</td>'+
//	'<td></td>'+
//	'<td align="center" style="font-size: 13px;font-weight: bold; text-align:center;vertical-align: bottom;border-top: 1px dotted black;border-left: 1px dotted black; border-right: 1px dotted black;">�����ɓ��ܗp���{���x����</td>'+
//	'<td></td>'+
//	'</tr>'+
//	'<tr height="75">'+
//	'<td></td>'+
//	'<td align="center" style="font-size: 13px;font-weight: bold; text-align:center;vertical-align: top;border-left: 1px dotted black; border-right: 1px dotted black;border-bottom: 1px dotted black;">�\�t���ĉ������B</td>'+
//	'<td></td>'+
//	'<td align="center" style="font-size: 13px;font-weight: bold; text-align:center;vertical-align: top;border-left: 1px dotted black; border-right: 1px dotted black;border-bottom: 1px dotted black;">�\�t���ĉ������B</td>'+
//	'<td></td>'+
//	'</tr>'+
//	'</table>'+
//	'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
//	'<tr height="20px">'+
//	'<td width="20px"></td>'+
//	'<td width="160px"></td>'+
//	'<td width="51px"></td>'+
//	'<td width="51px"></td>'+
//	'<td width="51px"></td>'+
//	'<td width="31px"></td>'+
//	'<td width="61px"></td>'+
//	'<td width="30px"></td>'+
//	'<td width="170px"></td>'+
//	'<td width="35px"></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td></td>'+
//	'<td style="vertical-align: top; font-size: 10px;text-align: center;font-weight: bold;">�Z�e�B�m�F��<br/>���x�����m�F���܂����̂�<br/>��Ƃ�i�߂ĉ������B</td>'+
//	'<td style="border: 1px solid black;"></td>'+
//	'<td style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
//	'<td style="border: 1px solid black;"></td>'+
//	'<td style="text-align: right;"><input type="checkbox" name="check1" id="check1" /></td>'+
//	'<td style="font-size: 10px;text-align: left;font-weight: bold;">�݌ɕi</td>'+
//	'<td style="text-align: right;"><input type="checkbox" name="check2" id="check2" /></td>'+
//	'<td style="font-size: 10px;text-align: left;font-weight: bold;">�o�ח\��L��</td>'+
//	'<td></td>'+
//	'</tr>'+
//	'</table>'+
//	'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
//	'<tr height="20px">'+
//	'<td width="25px"></td>'+
//	'<td width="280px"></td>'+
//	'<td width="30px"></td>'+
//	'<td width="100px"></td>'+
//	'<td width="180px"></td>'+
//	'<td width="45px"></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td style="font-size: 20px; font-weight: bold;vertical-align: text-bottom;padding-left: 10px;">SCETI</td>'+
//	'<td style="font-size: 11px; font-weight: bold;vertical-align: text-bottom;">�Z�e�B�������</td>'+
//	'<td></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td colspan="4" style="font-size: 11px; font-weight: bold;vertical-align: text-bottom;">�����s���c�������3-6-7</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td colspan="4" style="font-size: 11px; font-weight: bold;vertical-align: top;">TEL:03-5510-2668&nbsp;FAX:03-5510-0132</td>'+
//	'</tr>'+
//	'</table>';
	
	
					//�o�׈ē���(�T)
//	str+='<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
//	'<tr>'+
//	'<td width="80px"></td>'+
//	'<td width="37px"></td>'+
//	'<td width="140px"></td>'+
//	'<td width="86px"></td>'+
//	'<td width="75px"></td>'+
//	'<td width="75px"></td>'+
//	'<td width="92px"></td>'+
//	'<td width="75px"></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td colspan="8" align="center" style="font-size: 15px; font-weight: bold;color: #3E73DA;">�o&nbsp;��&nbsp;��&nbsp;��&nbsp;��&nbsp;(&nbsp;�T&nbsp;)</td>'+
//	'</tr>'+
//	'<tr height="10px"></tr>'+
//	'<tr>'+
//	'<td align="left" style="font-size: 10px;color: #3E73DA;font-weight: 600;vertical-align: bottom;">���͂���</td>'+
//	'<td align="left" style="font-size: 14px;color: #BEBDC3;vertical-align: bottom;" colspan="2">��812-8582</td>'+
//	'<td></td>'+
//	'<td align="center" style="font-size: 11px;color: #3E73DA;font-weight: 600;vertical-align: bottom;border-top:2px solid #3E73DA;border-left:2px solid #3E73DA;border-right:1px solid #3E73DA;">�󒍋敪</td>'+
//	'<td align="center" style="font-size: 11px;color: #3E73DA;font-weight: 600;vertical-align: bottom;border-top:2px solid #3E73DA;border-right:1px solid #3E73DA;">�o&nbsp;��&nbsp;��</td>'+
//	'<td align="center" style="font-size: 11px;color: #3E73DA;font-weight: 600;vertical-align: bottom;border-top:2px solid #3E73DA;border-right:1px solid #3E73DA;">�`&nbsp;�[&nbsp;No.</td>'+
//	'<td align="center" style="font-size: 11px;color: #3E73DA;font-weight: 600;vertical-align: bottom;border-top:2px solid #3E73DA;border-right:2px solid #3E73DA;">�\'�����</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td style="font-size: 11px;color: #BEBDC3;font-weight: 650;vertical-align: bottom;" colspan="4" >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;������<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;�����s����n�o3-1-1<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;�a�@�n�������</td>'+
//	'<td align="center" style="font-size: 13px;color: #BEBDC3;vertical-align: middle;border-top:1px solid #3E73DA;border-left:2px solid #3E73DA;border-bottom:2px solid #3E73DA;border-right:1px solid #3E73DA;">J</td>'+
//	'<td align="center" style="font-size: 13px;color: #BEBDC3;vertical-align: middle;border-top:1px solid #3E73DA;border-bottom:2px solid #3E73DA;border-right:1px solid #3E73DA;">21-06-14</td>'+
//	'<td align="center" style="font-size: 13px;color: #BEBDC3;vertical-align: middle;border-top:1px solid #3E73DA;border-bottom:2px solid #3E73DA;border-right:1px solid #3E73DA;">1000017439</td>'+
//	'<td align="center" style="font-size: 13px;color: #BEBDC3;vertical-align: middle;border-top:1px solid #3E73DA;border-bottom:2px solid #3E73DA;border-right:2px solid #3E73DA;">21-06-15</td>'+
//	'</tr>'+
//	'<tr height="10px"></tr>'+
//	'<tr>'+
//	'<td colspan="4" style="font-size: 11px; color: #BEBDC3;font-weight: 650;vertical-align: bottom;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;������w�@�l��B��w�A�C�\�g�[�v�����Z���^�[</td>'+
//	'<td style="font-size: 10px;color: #3E73DA;vertical-align: middle;"><span style="margin-left:30px">�̔���</span></td>'+
//	'<td colspan="3" style="color: #3E73DA; font-size: 13px;font-weight: bold;vertical-align: middle;"><span style="margin-left:15px">���v�Вc�@�l&nbsp;���{�A�C�\�g�[�v����</span></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td colspan="4" style="font-size: 11px; color: #BEBDC3;font-weight: 650;vertical-align: bottom;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;�|�p�H�w���f�U�C���l�ԉȊw����</td>'+
//	'<td style="font-size: 10px;color: #3E73DA;vertical-align: middle;" rowspan="2"><span style="margin-left:30px">������</span></td>'+
//	'<td colspan="3" style="color: #3E73DA; font-size: 13px;font-weight: bold;vertical-align: middle;" rowspan="2"><span style="margin-left:15px">DENIS�f�B�X�J�E���g</span></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td colspan="4" style="font-size: 11px; color: #BEBDC3;font-weight: 650;vertical-align: bottom;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;�A�� �d�a�@�l</td>'+
//	'</tr>'+
//	'</table>'+
//	'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
//	'<tr>'+
//	'<td width="428px"></td>'+
//	'<td width="116px"></td>'+
//	'<td width="116px"></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td></td>'+
//	'<td align="center" style="font-size: 12px; color: #3E73DA; vertical-align: middle;font-weight: bold;border-top:2px solid #3E73DA;border-left:2px solid #3E73DA;border-right:1px solid #3E73DA">�^&nbsp;&nbsp;��&nbsp;&nbsp;��&nbsp;&nbsp;��</td>'+
//	'<td align="center" style="font-size: 12px; color: #3E73DA; vertical-align: middle;font-weight: bold;border-top:2px solid #3E73DA;border-right:2px solid #3E73DA;">�A&nbsp;&nbsp;��&nbsp;&nbsp;��&nbsp;&nbsp;��</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td></td>'+
//	'<td align="center" style="font-size: 14px;vertical-align: middle;color: #BEBDC3;border-top:1px solid #3E73DA;border-left:2px solid #3E73DA;border-right:1px solid #3E73DA;border-bottom:2px solid #3E73DA;">���{�ʉ^</td>'+
//	'<td style="border-top:1px solid #3E73DA;border-right:2px solid #3E73DA;border-bottom:2px solid #3E73DA;"></td>'+
//	'</tr>'+
//	'</table>'+
//	'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
//	'<tr>'+
//	'<td width="90px"></td>'+
//	'<td width="330px"></td>'+
//	'<td width="20px"></td>'+
//	'<td width="20px"></td>'+
//	'<td width="30px"></td>'+
//	'<td width="170px"></td>'+
//	'</tr>'+
//	'<tr height="10px"></tr>'+
//	'<tr>'+
//	'<td align="center" style="font-size: 10px;vertical-align:middle; color: #3E73DA;border-top:2px solid #3E73DA;border-left:2px solid #3E73DA;border-right:1px solid #3E73DA;border-bottom:1px solid #3E73DA;">���ꏤ�i�R�[�h</td>'+
//	'<td align="center" style="font-size: 10px;vertical-align:middle; color: #3E73DA;border-top:2px solid #3E73DA;border-right:1px solid #3E73DA;border-bottom:1px solid #3E73DA;">�i&nbsp;��&nbsp;�K&nbsp;�i&nbsp;/&nbsp;���b�g&nbsp;No.</td>'+
//	'<td align="center" style="font-size: 10px;vertical-align:middle; color: #3E73DA;border-top:2px solid #3E73DA;border-bottom:1px solid #3E73DA;">��</td>'+
//	'<td align="center" style="font-size: 10px;vertical-align:middle; color: #3E73DA;border-top:2px solid #3E73DA;border-right:1px solid #3E73DA;border-bottom:1px solid #3E73DA;">��</td>'+
//	'<td align="center" style="font-size: 10px;vertical-align:middle; color: #3E73DA;border-top:2px solid #3E73DA;border-right:1px solid #3E73DA;border-bottom:1px solid #3E73DA;">�戵</td>'+
//	'<td align="center" style="font-size: 10px;vertical-align:middle; color: #3E73DA;border-top:2px solid #3E73DA;border-right:2px solid #3E73DA;border-bottom:1px solid #3E73DA;">���l</td>'+
//	'</tr>'+
//	'<tr height="10px">'+
//	'<td style="border-left:2px solid #3E73DA;border-right:1px solid #3E73DA;"></td>'+
//	'<td style="border-right:1px solid #3E73DA;"></td>'+
//	'<td style="border-right:1px dotted black;"></td>'+
//	'<td style="border-right:1px solid #3E73DA;"></td>'+
//	'<td style="border-right:1px solid #3E73DA;"></td>'+
//	'<td style="border-right:2px solid #3E73DA;"></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td align="center" style="border-left:2px solid #3E73DA;border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;">SM-2-U</td>'+
//	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"><span style="margin-left:10px">Saliva Melationin RIA KIT 200tests / 74kBq</span></td>'+
//	'<td style="border-right:1px dotted black;font-size:13px;color:#BEBDC3;">1</td>'+
//	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
//	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
//	'<td style="border-right:2px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td style="border-left:2px solid #3E73DA;border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
//	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"><span style="margin-left:15px">�����ԍ�:DQG70 / �����ԍ�:05</span></td>'+
//	'<td style="border-right:1px dotted black;font-size:13px;color:#BEBDC3;"></td>'+
//	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
//	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
//	'<td style="border-right:2px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td style="border-left:2px solid #3E73DA;border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
//	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"><span style="margin-left:20px">Lot.5234.17 &nbsp;&nbsp;&nbsp;&nbsp; �L������:21-07-20</span></td>'+
//	'<td style="border-right:1px dotted black;font-size:13px;color:#BEBDC3;"></td>'+
//	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;">1</td>'+
//	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
//	'<td style="border-right:2px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
//	'</tr>'+
//	'<tr height="200px">'+
//	'<td style="border-left:2px solid #3E73DA;border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
//	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
//	'<td style="border-right:1px dotted black;font-size:13px;color:#BEBDC3;"></td>'+
//	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
//	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
//	'<td style="border-right:2px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td style="border-bottom:2px solid #3E73DA;"></td>'+
//	'<td style="border-bottom:2px solid #3E73DA;"></td>'+
//	'<td style="border-bottom:2px solid #3E73DA;"></td>'+
//	'<td style="border-bottom:2px solid #3E73DA;"></td>'+
//	'<td style="border-bottom:2px solid #3E73DA;"></td>'+
//	'<td style="border-bottom:2px solid #3E73DA;"></td>'+
//	'</tr>'+
//	'</table>';
	
				//樓n��
	str+='<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
	'<tr>'+
	'<td width="200px"></td>'+
	'<td width="100px"></td>'+
	'<td width="50px"></td>'+
	'<td width="100px"></td>'+
	'<td width="100px"></td>'+
	'<td width="110px"></td>'+
	'</tr>'+
	'<tr>'+
	'<td align="center" colspan="6" style="font-size: 18px; font-weight: bold;">�&nbsp;&nbsp;&nbsp;&nbsp;�n&nbsp;&nbsp;&nbsp;&nbsp;��</td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td align="left" style="font-size: 13px;">樓n���ԍ�</td>'+
	'<td align="left" style="font-size: 13px;">1000017439</td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td align="left" style="font-size: 13px;">&nbsp;&nbsp;2021/06/14</td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'<tr>'+
	'<td align="left" style="font-size: 13px;vertical-align: middle;border-bottom: 2px solid black;" colspan="3">������w�@�l��B��w7.�C�\�b�v����</td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'</tr>'+
	'<tr height="7px"></tr>'+
	'<tr>'+
	'<td align="left" style="font-size: 13px;vertical-align: bottom;" colspan="3">���ː��戵��C��</td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'</tr>'+
	'<tr>'+
	'<td align="left" style="font-size: 13px;vertical-align: middle;border-bottom: 2px solid black;" colspan="2">�R�� ��O</td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'</tr>'+
	'</table>'+
	'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
	'<tr>'+
	'<td width="400px"></td>'+
	'<td width="200px"></td>'+
	'<td width="60px"></td>'+
	'</tr>'+
	'<tr height="7px"></tr>'+
	'<tr>'+
	'<td></td>'+
	'<td align="left" style="font-size: 13px;">DENIS�t�@�[�}�������</td>'+
	'<td></td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td align="left" style="font-size: 13px;">���ː��戵��C��</td>'+
	'<td></td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td align="left" style="font-size: 13px;">���V&nbsp;&nbsp;���I</td>'+
	'<td align="left" style="font-size: 13px;">��</td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td align="center" style="font-size: 13px;" colspan="2">(�̑�479 ��)</td>'+
	'</tr>'+
	'</table>'+
	'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
	'<tr>'+
	'<td width="100px"></td>'+
	'<td width="300px"></td>'+
	'<td width="200px"></td>'+
	'<td width="60px"></td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'<tr height="50px">'+
	'<td align="center" rowspan="2" style="font-size: 15px;vertical-align: middle;border:2px solid black;">�[�i��</td>'+
	'<td align="center" rowspan="2" style="font-size: 15px;vertical-align: middle;border-top:2px solid black;border-bottom:2px solid black;">�|�p�H�w���f�U�C���l�ԉȊw����</td>'+
	'<td align="center" rowspan="2" style="font-size: 15px;vertical-align: middle;border-top:2px solid black;border-bottom:2px solid black;">�Ɍ�&nbsp;&nbsp;�d�a</td>'+
	'<td align="center" rowspan="2" style="font-size: 15px;vertical-align: middle;border-top:2px solid black;border-bottom:2px solid black;border-right:2px solid black;">�搶</td>'+
	'</tr>'+
	'<tr height="10px">'+
	'</tr>'+
	'<tr height="8px"></tr>'+
	'<tr>'+
	'<td colspan="4" style="font-size: 13px;"><span style="margin-left:30px;">���̓x�A���L�̕��ː����ʌ��f�����n�������܂��̂ŁA</span><br/><span style="margin-left:30px;">�X���������v�炢�������܂��悤���肢�\���グ�܂��B</span><br/><span style="margin-left:30px;">�Ȃ��A���i�������̏�A���󏑂������艺�����܂��悤���肢�v���܂��B</span></td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'</table>'+
	'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
	'<tr>'+
	'<td width="100px"></td>'+
	'<td width="200px"></td>'+
	'<td width="100px"></td>'+
	'<td width="100px"></td>'+
	'<td width="160px"></td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'<tr height="30px">'+
	'<td width="100px" align="center" style="font-size: 13px;vertical-align: middle;border-top:2px solid black;border-left:2px solid black;border-bottom:2px solid black;">���i��</td>'+
	'<td width="200px" style="font-size: 13px;vertical-align: middle;border-top:2px solid black;border-right:2px solid black;border-bottom:2px solid black;"><span style="margin-left:150px;">�K�i</span></td>'+
	'<td width="100px" align="center" style="font-size: 13px;vertical-align: middle;border-top:2px solid black;border-bottom:2px solid black;">�j��</td>'+
	'<td width="100px" align="center" style="font-size: 13px;vertical-align: middle;border-top:2px solid black;border-bottom:2px solid black;">�e��</td>'+
	'<td width="160px" align="center" style="font-size: 13px;vertical-align: middle;border-top:2px solid black;border-right:2px solid black;border-bottom:2px solid black;">�����˔\��(��l)</td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'<tr>'+
	'<td colspan="2" style="font-size: 13px;vertical-align: middle;" align="left">Saliva Melatonin RIA KIT 200tests / 74kBq</td>'+
	'<td style="font-size: 13px;vertical-align: middle;" align="center">I-125</td>'+
	'<td colspan="2" style="font-size: 13px;vertical-align: middle;"><span style="margin-left:50px">74KBQ �~ 1 = 74KBQ</span></td>'+
	'</tr>'+
	'<tr height="200px"></tr>'+
	'</table>'+
	'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
	'<tr>'+
	'<td width="460px"></td>'+
	'<td width="100px"></td>'+
	'<td width="100px"></td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td align="center" style="font-size: 13px;vertical-align: middle;">�o�ח\���:</td>'+
	'<td align="center" style="font-size: 13px;vertical-align: middle;">2021/06/14</td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td></td>'+
	'<td align="center" style="font-size: 13px;vertical-align: middle;">�����</td>'+
	'</tr>'+
	'</table>';
	str+='<pbr/>';
	
	
	
	str+='<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
	'<tr>'+
	'<td width="200px"></td>'+
	'<td width="100px"></td>'+
	'<td width="50px"></td>'+
	'<td width="100px"></td>'+
	'<td width="100px"></td>'+
	'<td width="110px"></td>'+
	'</tr>'+
	'<tr>'+
	'<td align="center" colspan="6" style="font-size: 18px; font-weight: bold;">�&nbsp;&nbsp;&nbsp;&nbsp;�n&nbsp;&nbsp;&nbsp;&nbsp;��&nbsp;&nbsp;&nbsp;&nbsp;(�T)</td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td align="left" style="font-size: 13px;">樓n���ԍ�</td>'+
	'<td align="left" style="font-size: 13px;">1000017439</td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td align="left" style="font-size: 13px;">&nbsp;&nbsp;2021/06/14</td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'<tr>'+
	'<td align="left" style="font-size: 13px;vertical-align: middle;border-bottom: 2px solid black;" colspan="2">������w�@�l��B��w7.�C�\�b�v����</td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'</tr>'+
	'<tr height="7px"></tr>'+
	'<tr>'+
	'<td align="left" style="font-size: 13px;vertical-align: bottom;" colspan="3">���ː��戵��C��</td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'</tr>'+
	'<tr>'+
	'<td align="left" style="font-size: 13px;vertical-align: middle;border-bottom: 2px solid black;" colspan="2">�R�� ��O</td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'</tr>'+
	'</table>'+
	'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
	'<tr>'+
	'<td width="400px"></td>'+
	'<td width="200px"></td>'+
	'<td width="60px"></td>'+
	'</tr>'+
	'<tr height="7px"></tr>'+
	'<tr>'+
	'<td></td>'+
	'<td align="left" style="font-size: 13px;">DENIS�t�@�[�}�������</td>'+
	'<td></td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td align="left" style="font-size: 13px;">���ː��戵��C��</td>'+
	'<td></td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td align="left" style="font-size: 13px;">���V&nbsp;&nbsp;���I</td>'+
	'<td align="left" style="font-size: 13px;">��</td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td align="center" style="font-size: 13px;" colspan="2">(�̑�479 ��)</td>'+
	'</tr>'+
	'</table>'+
	'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
	'<tr>'+
	'<td width="100px"></td>'+
	'<td width="300px"></td>'+
	'<td width="200px"></td>'+
	'<td width="60px"></td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'<tr height="50px">'+
	'<td align="center" rowspan="2" style="font-size: 15px;vertical-align: middle;border:2px solid black;">�[�i��</td>'+
	'<td align="center" rowspan="2" style="font-size: 15px;vertical-align: middle;border-top:2px solid black;border-bottom:2px solid black;">�|�p�H�w���f�U�C���l�ԉȊw����</td>'+
	'<td align="center" rowspan="2" style="font-size: 15px;vertical-align: middle;border-top:2px solid black;border-bottom:2px solid black;">�Ɍ�&nbsp;&nbsp;�d�a</td>'+
	'<td align="center" rowspan="2" style="font-size: 15px;vertical-align: middle;border-top:2px solid black;border-bottom:2px solid black;border-right:2px solid black;">�搶</td>'+
	'</tr>'+
	'<tr height="10px">'+
	'</tr>'+
	'<tr height="8px"></tr>'+
	'<tr>'+
	'<td colspan="4" style="font-size: 13px;"><span style="margin-left:50px;">���̓x�A���L�̕��ː����ʌ��f�����n�������܂��̂ŁA</span><br/><span style="margin-left:50px;">�X���������v�炢�������܂��悤���肢�\���グ�܂��B</span><br/><span style="margin-left:50px;">�Ȃ��A���i�������̏�A���󏑂������艺�����܂��悤���肢�v���܂��B</span></td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'</table>'+
	'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
	'<tr>'+
	'<td width="100px"></td>'+
	'<td width="200px"></td>'+
	'<td width="100px"></td>'+
	'<td width="100px"></td>'+
	'<td width="160px"></td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'<tr height="30px">'+
	'<td width="100px" align="center" style="font-size: 13px;vertical-align: middle;border-top:2px solid black;border-left:2px solid black;border-bottom:2px solid black;">���i��</td>'+
	'<td width="200px" style="font-size: 13px;vertical-align: middle;border-top:2px solid black;border-right:2px solid black;border-bottom:2px solid black;"><span style="margin-left:150px;">�K�i</span></td>'+
	'<td width="100px" align="center" style="font-size: 13px;vertical-align: middle;border-top:2px solid black;border-bottom:2px solid black;">�j��</td>'+
	'<td width="100px" align="center" style="font-size: 13px;vertical-align: middle;border-top:2px solid black;border-bottom:2px solid black;">�e��</td>'+
	'<td width="160px" align="center" style="font-size: 13px;vertical-align: middle;border-top:2px solid black;border-right:2px solid black;border-bottom:2px solid black;">�����˔\��(��l)</td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'<tr>'+
	'<td colspan="2" style="font-size: 13px;vertical-align: middle;" align="left">Saliva Melatonin RIA KIT 200tests / 74kBq</td>'+
	'<td style="font-size: 13px;vertical-align: middle;" align="center">I-125</td>'+
	'<td colspan="2" style="font-size: 13px;vertical-align: middle;"><span style="margin-left:50px">74KBQ �~ 1 = 74KBQ</span></td>'+
	'</tr>'+
	'<tr height="200px"></tr>'+
	'</table>'+
	'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
	'<tr>'+
	'<td width="460px"></td>'+
	'<td width="100px"></td>'+
	'<td width="100px"></td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td align="center" style="font-size: 13px;vertical-align: middle;">�o�ח\���:</td>'+
	'<td align="right" style="font-size: 13px;vertical-align: middle;">2021/06/14</td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td></td>'+
	'<td align="right" style="font-size: 13px;vertical-align: middle;">���[�J�[�T��</td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td></td>'+
	'<td align="right" style="font-size: 13px;vertical-align: middle;">���{�ʉ^</td>'+
	'</tr>'+
	'</table>';
	str+='<pbr/>';
	
	
	
	str+='<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
	'<tr>'+
	'<td width="200px"></td>'+
	'<td width="100px"></td>'+
	'<td width="50px"></td>'+
	'<td width="100px"></td>'+
	'<td width="100px"></td>'+
	'<td width="110px"></td>'+
	'</tr>'+
	'<tr>'+
	'<td align="center" colspan="6" style="font-size: 18px; font-weight: bold;">�&nbsp;&nbsp;&nbsp;&nbsp;�� &nbsp;&nbsp;&nbsp;&nbsp;��&nbsp;&nbsp;&nbsp;&nbsp;(�T)</td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td align="left" style="font-size: 13px;">樓n���ԍ�</td>'+
	'<td align="left" style="font-size: 13px;">1000017439</td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td align="left" style="font-size: 13px;">&nbsp;&nbsp;2021/06/14</td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'<tr>'+
	'<td align="left" style="font-size: 13px;vertical-align: middle;" colspan="2">DENIS�t�@�[�}�������</td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'</tr>'+
	'<tr height="7px"></tr>'+
	'<tr>'+
	'<td align="left" style="font-size: 13px;vertical-align: bottom;" colspan="3">���ː��戵��C��&nbsp;&nbsp;&nbsp;&nbsp;���V���I</td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'</tr>'+
	'<tr>'+
	'<td align="left" style="font-size: 13px;vertical-align: middle;" colspan="2"></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'</tr>'+
	'</table>'+
	'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
	'<tr>'+
	'<td width="300px"></td>'+
	'<td width="280px"></td>'+
	'<td width="80px"></td>'+
	'</tr>'+
	'<tr height="7px"></tr>'+
	'<tr>'+
	'<td></td>'+
	'<td align="left" style="font-size: 13px;border-bottom: 2px solid black;" colspan="2">������w�@�l��B��w�A�C�\�g�[�v�����Z���^�[</td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td align="left" style="font-size: 13px;vertical-align:top;">���ː��戵��C��</td>'+
	'<td></td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td align="left" style="font-size: 13px;border-bottom: 2px solid black;">�R�� &nbsp;��O</td>'+
	'<td align="left" style="font-size: 13px;border-bottom: 2px solid black;">��</td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td align="center" style="font-size: 13px;" colspan="2"></td>'+
	'</tr>'+
	'</table>'+
	'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
	'<tr>'+
	'<td width="100px"></td>'+
	'<td width="300px"></td>'+
	'<td width="200px"></td>'+
	'<td width="60px"></td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'<tr height="50px">'+
	'<td align="center" rowspan="2" style="font-size: 15px;vertical-align: middle;border:2px solid black;">�[�i��</td>'+
	'<td align="center" rowspan="2" style="font-size: 15px;vertical-align: middle;border-top:2px solid black;border-bottom:2px solid black;">�|�p�H�w���f�U�C���l�ԉȊw����</td>'+
	'<td align="center" rowspan="2" style="font-size: 15px;vertical-align: middle;border-top:2px solid black;border-bottom:2px solid black;">�Ɍ�&nbsp;&nbsp;�d�a</td>'+
	'<td align="center" rowspan="2" style="font-size: 15px;vertical-align: middle;border-top:2px solid black;border-bottom:2px solid black;border-right:2px solid black;">�搶</td>'+
	'</tr>'+
	'<tr height="10px">'+
	'</tr>'+
	'<tr height="8px"></tr>'+
	'<tr>'+
	'<td colspan="4" style="font-size: 13px;"><span style="margin-left:50px;">���̓x�A�M�Ђ����n���ꂽ���L�̕��ː����ʌ��f����̂��܂����̂ŁA</span><br/><span style="margin-left:50px;">���m�点�v���܂��B</span></td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'</table>'+
	'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
	'<tr>'+
	'<td width="100px"></td>'+
	'<td width="200px"></td>'+
	'<td width="100px"></td>'+
	'<td width="100px"></td>'+
	'<td width="160px"></td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'<tr height="30px">'+
	'<td width="100px" align="center" style="font-size: 13px;vertical-align: middle;border-top:2px solid black;border-left:2px solid black;border-bottom:2px solid black;">���i��</td>'+
	'<td width="200px" style="font-size: 13px;vertical-align: middle;border-top:2px solid black;border-right:2px solid black;border-bottom:2px solid black;"><span style="margin-left:150px;">�K�i</span></td>'+
	'<td width="100px" align="center" style="font-size: 13px;vertical-align: middle;border-top:2px solid black;border-bottom:2px solid black;">�j��</td>'+
	'<td width="100px" align="center" style="font-size: 13px;vertical-align: middle;border-top:2px solid black;border-bottom:2px solid black;">�e��</td>'+
	'<td width="160px" align="center" style="font-size: 13px;vertical-align: middle;border-top:2px solid black;border-right:2px solid black;border-bottom:2px solid black;">�����˔\��(��l)</td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'<tr>'+
	'<td colspan="2" style="font-size: 13px;vertical-align: middle;" align="left">Saliva Melatonin RIA KIT 200tests / 74kBq</td>'+
	'<td style="font-size: 13px;vertical-align: middle;" align="center">I-125</td>'+
	'<td colspan="2" style="font-size: 13px;vertical-align: middle;"><span style="margin-left:50px">74KBQ �~ 1 = 74KBQ</span></td>'+
	'</tr>'+
	'<tr height="200px"></tr>'+
	'</table>'+
	'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
	'<tr>'+
	'<td width="360px"></td>'+
	'<td width="150px"></td>'+
	'<td width="150px"></td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td align="center" style="font-size: 13px;vertical-align: middle;">��̔N����:</td>'+
	'<td align="center" style="font-size: 13px;vertical-align: middle;border-bottom:2px solid black;">�N&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;��&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;��</td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'<tr>'+
	'<td></td>'+
	'<td></td>'+
	'<td align="center" style="font-size: 13px;vertical-align: middle;">����恨���[�J�[</td>'+
	'</tr>'+
	'</table>';
	str+='<pbr/>';
	
	
						//�ŕ��y�ь���樎�
	str+='<table border="1" cellspacing="0" cellpadding="1" width="660px" align="center">'+
	'<tr>'+
	'<td width="280px"></td>'+
	'<td width="50px"></td>'+
	'<td width="310px"></td>'+
	'<td width="50px"></td>'+
	'</tr>'+
	'<tr height="30px">'+
	'<td align="center" colspan="4" style="font-size: 18px;font-weight: bold;border-bottom:1px solid black;">�ŕ��y�ь���樎�</td>'+
	'</tr>'+
	'<tr height="35px">'+
	'<td align="left" colspan="2" style="font-size: 15px;vertical-align: middle;border-bottom:1px solid black;border-right:1px solid black;">���i����</td>'+
	'<td align="left" colspan="2" style="font-size: 15px;vertical-align: middle;border-bottom:1px solid black;">Rat TSH [1125]RIA kit</td>'+
	'</tr>'+
	'<tr height="35px">'+
	'<td align="left" colspan="2" style="font-size: 15px;vertical-align: middle;border-bottom:1px solid black;border-right:1px solid black;">���i�R�[�h</td>'+
	'<td align="left" colspan="2" style="font-size: 15px;vertical-align: middle;border-bottom:1px solid black;">03089-RK-554</td>'+
	'</tr>'+
	'<tr height="35px">'+
	'<td align="left" rowspan="2" style="font-size: 15px;vertical-align: middle;border-bottom:1px solid black;border-right:1px solid black;">�ŕ����͌����̎��</td>'+
	'<td align="left" style="font-size: 15px;vertical-align: middle;border-bottom:1px solid black;border-right:1px solid black;">����</td>'+
	'<td align="left" colspan="2" style="font-size: 15px;vertical-align: middle;border-bottom:1px solid black;">�A�W���i�g���E��</td>'+
	'</tr>'+
	'<tr height="35px">'+
	'<td align="left" style="font-size: 15px;vertical-align: middle;border-bottom:1px solid black;border-right:1px solid black;">����</td>'+
	'<td align="left" colspan="2" style="font-size: 15px;vertical-align: middle;border-bottom:1px solid black;">Assay Buffer 3�{(1%)</td>'+
	'</tr>'+
	'<tr height="35px">'+
	'<td align="left" colspan="2" style="font-size: 15px;vertical-align: middle;border-bottom:1px solid black;border-right:1px solid black;">�̔����͎��^�̔N����</td>'+
	'<td align="left" colspan="2" style="font-size: 15px;vertical-align: middle;border-bottom:1px solid black;">2021�N6��10��</td>'+
	'</tr>'+
	'<tr height="35px">'+
	'<td align="left" rowspan="3" style="font-size: 15px;vertical-align: middle;border-right:1px solid black;">樎�l(�@�l�ɂ����ẮA<br/>���̖��̋y�т܂���<br/>�������̏��ݒn)</td>'+
	'<td align="left" style="font-size: 15px;vertical-align: middle;border-bottom:1px solid black;border-right:1px solid black;">����</td>'+
	'<td align="left" style="font-size: 15px;vertical-align: middle;border-bottom:1px solid black;"></td>'+
	'<td align="center" style="font-size: 15px;vertical-align: middle;border-bottom:1px solid black;">��</td>'+
	'</tr>'+
	'<tr height="35px">'+
	'<td align="left" style="font-size: 15px;vertical-align: middle;border-bottom:1px solid black;border-right:1px solid black;">�E��</td>'+
	'<td align="left" colspan="2" style="font-size: 15px;vertical-align: middle;border-bottom:1px solid black;"></td>'+
	'</tr>'+
	'<tr height="35px">'+
	'<td align="left" style="font-size: 15px;vertical-align: middle;border-right:1px solid black;">�Z��</td>'+
	'<td align="left" colspan="2" style="font-size: 15px;vertical-align: middle;"></td>'+
	'</tr>'+
	'</table>';
	
	 str += '</body>'+
     '</pdf>';
	 var renderer = nlapiCreateTemplateRenderer();
		renderer.setTemplate(str);
		var xml = renderer.renderToString();
		var xlsFile = nlapiXMLToPDF(xml);
		
		// PDF�t�@�C������ݒ肷��
		xlsFile.setName('TestPDF�o��' + '_' + getFormatYmdHms() + '.pdf');
		xlsFile.setFolder(FILE_CABINET_ID_DJ_REPAIR_GOODS_PDF);
		xlsFile.setIsOnline(true);
		
		// save file
		var fileID = nlapiSubmitFile(xlsFile);
		var fl = nlapiLoadFile(fileID);
		
		var url= URL_HEAD +'/'+fl.getURL();
		nlapiSetRedirectURL('EXTERNAL', url, null, null, null);
		nlapiLogExecution('debug', '��    �� pdf end');
}
